package ma.solide.teacherservice.service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

import ma.solide.teacherservice.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FileStorageService {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final Path baseDir;

    public FileStorageService(@Value("${teacher.uploads.directory}") String baseDir) {
        this.baseDir = Paths.get(baseDir).toAbsolutePath().normalize();
    }

    public Map<String, String> store(MultipartFile multipartFile, String customFilename) {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file is required");
        }

        String tenantId = TenantContext.getRequiredTenantId();
        String originalName = StringUtils.hasText(customFilename)
                ? customFilename.trim()
                : multipartFile.getOriginalFilename();
        if (!StringUtils.hasText(originalName)) {
            originalName = "uploaded-file";
        }

        String safeOriginal = sanitizeFilename(originalName);
        String storedName = TS.format(LocalDateTime.now()) + "-" + UUID.randomUUID() + "-" + safeOriginal;

        try {
            Path tenantDir = baseDir.resolve(tenantId);
            Files.createDirectories(tenantDir);
            Files.copy(multipartFile.getInputStream(), tenantDir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
        }

        String encoded = URLEncoder.encode(storedName, StandardCharsets.UTF_8);
        return Map.of(
                "filename", safeOriginal,
                "url", "/api/uploads/" + encoded
        );
    }

    public Resource load(String encodedFilename) {
        String tenantId = TenantContext.getRequiredTenantId();
        String filename = java.net.URLDecoder.decode(encodedFilename, StandardCharsets.UTF_8);

        if (filename.contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename");
        }

        try {
            Path filePath = baseDir.resolve(tenantId).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }
            return resource;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
    }

    private String sanitizeFilename(String input) {
        return input.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}

