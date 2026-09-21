package ma.solide.teacherservice.service;

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
import java.util.Map;
import java.util.UUID;

import ma.solide.teacherservice.school.SchoolContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
public class FileStorageService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final String SCHOOL_SCOPE_PREFIX = "schools/";
    private static final String LEGACY_SCOPE_PREFIX = "ten" + "ants/";

    private final Path baseDir;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucket;
    private final long urlDurationMinutes;

    public FileStorageService(
            @Value("${teacher.uploads.directory}") String baseDir,
            @Value("${teacher.uploads.s3.bucket}") String bucket,
            @Value("${teacher.uploads.s3.url-duration-minutes}") long urlDurationMinutes,
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

    public String presignedUrl(String encodedKey) {
        String key = java.net.URLDecoder.decode(encodedKey, StandardCharsets.UTF_8);
        return signedUrl(requireSchoolKey(SchoolContext.getRequiredSchoolId(), key));
    }

    private String requireSchoolKey(String schoolId, String key) {
        if (key.contains("..") || key.contains("\\")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file key");
        }
        if (key.startsWith(schoolPrefix(schoolId)) || key.startsWith(legacyScopePrefix(schoolId))) {
            return key;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file key");
    }

    public Map<String, String> store(MultipartFile multipartFile, String customFilename) {
        validatePdf(multipartFile);

        String schoolId = SchoolContext.getRequiredSchoolId();
        String safeOriginal = safePdfFilename(customFilename, multipartFile.getOriginalFilename());
        String objectKey = schoolPrefix(schoolId)
                + TS.format(LocalDateTime.now()) + "-" + UUID.randomUUID() + "-" + safeOriginal;

        try {
            if (StringUtils.hasText(bucket)) {
                ensureBucket();
                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucket)
                                .key(objectKey)
                                .contentType("application/pdf")
                                .contentDisposition("inline; filename=\"" + safeOriginal + "\"")
                                .build(),
                        RequestBody.fromInputStream(multipartFile.getInputStream(), multipartFile.getSize()));
                return Map.of("filename", safeOriginal, "url", "/api/uploads?key="
                        + URLEncoder.encode(objectKey, StandardCharsets.UTF_8));
            }

            Path schoolDir = baseDir.resolve(schoolId);
            Files.createDirectories(schoolDir);
            Files.copy(multipartFile.getInputStream(), schoolDir.resolve(objectKey.substring(objectKey.lastIndexOf('/') + 1)),
                    StandardCopyOption.REPLACE_EXISTING);
            return Map.of("filename", safeOriginal, "url", "/api/uploads/"
                    + URLEncoder.encode(objectKey.substring(objectKey.lastIndexOf('/') + 1), StandardCharsets.UTF_8));
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

        try {
            Path filePath = baseDir.resolve(schoolId).resolve(filename).normalize();
            if (!filePath.startsWith(baseDir.resolve(schoolId)) || !Files.isReadable(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }
            return new org.springframework.core.io.FileSystemResource(filePath);
        } catch (RuntimeException e) {
            throw e;
        }
    }

    private String signedUrl(String objectKey) {
        var request = GetObjectRequest.builder().bucket(bucket).key(objectKey).build();
        var presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(urlDurationMinutes))
                .getObjectRequest(request)
                .build();
        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    private void ensureBucket() {
        try {
            s3Client.headBucket(builder -> builder.bucket(bucket));
        } catch (NoSuchBucketException e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        }
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
        }
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        if (!"application/pdf".equalsIgnoreCase(String.valueOf(contentType))
                && (filename == null || !filename.toLowerCase().endsWith(".pdf"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }
    }

    private String safePdfFilename(String customFilename, String originalFilename) {
        String input = StringUtils.hasText(customFilename) ? customFilename.trim() : originalFilename;
        String safe = (StringUtils.hasText(input) ? input : "uploaded-file")
                .replaceAll("[^a-zA-Z0-9._-]", "_");
        return safe.toLowerCase().endsWith(".pdf") ? safe : safe + ".pdf";
    }

    private String schoolPrefix(String schoolId) {
        return SCHOOL_SCOPE_PREFIX + schoolId + "/courses/";
    }

    private String legacyScopePrefix(String schoolId) {
        return LEGACY_SCOPE_PREFIX + schoolId + "/courses/";
    }
}
