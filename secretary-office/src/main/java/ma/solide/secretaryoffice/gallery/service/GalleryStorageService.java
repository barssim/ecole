package ma.solide.secretaryoffice.gallery.service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import ma.solide.secretaryoffice.school.SchoolContext;

@Service
public class GalleryStorageService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final String SCHOOL_SCOPE_PREFIX = "schools/";
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif");
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    private final Path baseDir;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;
    private final long urlDurationMinutes;

    public GalleryStorageService(
            @Value("${gallery.uploads.directory}") String baseDir,
            @Value("${gallery.uploads.s3.bucket}") String bucket,
            @Value("${gallery.uploads.s3.url-duration-minutes}") long urlDurationMinutes,
            S3Client s3Client,
            S3Presigner s3Presigner) {
        this.baseDir = Paths.get(baseDir).toAbsolutePath().normalize();
        this.bucket = bucket.trim();
        this.urlDurationMinutes = urlDurationMinutes;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    public boolean usesS3() {
        return StringUtils.hasText(bucket);
    }

    public Map<String, String> store(MultipartFile multipartFile) {
        validateImage(multipartFile);

        String schoolId = SchoolContext.getRequiredSchoolId();
        String safeOriginal = safeImageFilename(multipartFile.getOriginalFilename());
        String objectKey = schoolPrefix(schoolId) + TS.format(LocalDateTime.now()) + "-" + UUID.randomUUID() + "-" + safeOriginal;

        try {
            if (StringUtils.hasText(bucket)) {
                ensureBucket();
                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucket)
                                .key(objectKey)
                                .contentType(multipartFile.getContentType())
                                .contentDisposition("inline; filename=\"" + safeOriginal + "\"")
                                .build(),
                        RequestBody.fromInputStream(multipartFile.getInputStream(), multipartFile.getSize()));
                return Map.of(
                        "objectKey", objectKey,
                        "url", "/api/gallery/uploads?key=" + URLEncoder.encode(objectKey, StandardCharsets.UTF_8));
            }

            Path schoolDir = baseDir.resolve(schoolId);
            Files.createDirectories(schoolDir);
            String localName = objectKey.substring(objectKey.lastIndexOf('/') + 1);
            Files.copy(multipartFile.getInputStream(), schoolDir.resolve(localName), StandardCopyOption.REPLACE_EXISTING);
            return Map.of(
                    "objectKey", objectKey,
                    "url", "/api/gallery/uploads/" + URLEncoder.encode(localName, StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
        }
    }

    public Resource load(String encodedFilename) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        String filename = java.net.URLDecoder.decode(encodedFilename, StandardCharsets.UTF_8);
        if (filename.contains("..") || filename.contains("\\")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename");
        }

        if (StringUtils.hasText(bucket)) {
            try {
                byte[] bytes = s3Client.getObjectAsBytes(GetObjectRequest.builder()
                        .bucket(bucket)
                        .key(requireSchoolKey(schoolId, filename))
                        .build()).asByteArray();
                return new ByteArrayResource(bytes);
            } catch (NoSuchKeyException e) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }
        }

        Path filePath = baseDir.resolve(schoolId).resolve(filename).normalize();
        if (!filePath.startsWith(baseDir.resolve(schoolId)) || !Files.isReadable(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
        return new org.springframework.core.io.FileSystemResource(filePath);
    }

    public String presignedUrl(String encodedKey) {
        String key = java.net.URLDecoder.decode(encodedKey, StandardCharsets.UTF_8);
        String schoolId = SchoolContext.getRequiredSchoolId();
        String objectKey = requireSchoolKey(schoolId, key);
        var request = GetObjectRequest.builder().bucket(bucket).key(objectKey).build();
        var presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(urlDurationMinutes))
                .getObjectRequest(request)
                .build();
        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    public void delete(String objectKey) {
        if (!StringUtils.hasText(objectKey)) {
            return;
        }
        try {
            if (StringUtils.hasText(bucket)) {
                s3Client.deleteObject(builder -> builder.bucket(bucket).key(objectKey));
            } else {
                String localName = objectKey.substring(objectKey.lastIndexOf('/') + 1);
                String schoolId = SchoolContext.getRequiredSchoolId();
                Files.deleteIfExists(baseDir.resolve(schoolId).resolve(localName));
            }
        } catch (Exception e) {
            // best-effort cleanup; ignore failures when removing the underlying object
        }
    }

    private String requireSchoolKey(String schoolId, String key) {
        if (key.contains("..") || key.contains("\\")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file key");
        }
        if (key.startsWith(schoolPrefix(schoolId))) {
            return key;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file key");
    }

    private void ensureBucket() {
        try {
            s3Client.headBucket(builder -> builder.bucket(bucket));
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
        }
        String contentType = String.valueOf(file.getContentType()).toLowerCase();
        String filename = String.valueOf(file.getOriginalFilename()).toLowerCase();
        boolean validType = ALLOWED_CONTENT_TYPES.contains(contentType);
        boolean validExtension = ALLOWED_EXTENSIONS.stream().anyMatch(filename::endsWith);
        if (!validType && !validExtension) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files (jpg, png, webp, gif) are allowed");
        }
    }

    private String safeImageFilename(String originalFilename) {
        String input = StringUtils.hasText(originalFilename) ? originalFilename : "photo.jpg";
        return input.replaceAll("[^a-zA-Z0-9._-]", "_").toLowerCase();
    }

    private String schoolPrefix(String schoolId) {
        return SCHOOL_SCOPE_PREFIX + schoolId + "/gallery/";
    }
}
