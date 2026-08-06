package ma.solide.teacherservice.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import ma.solide.teacherservice.dto.SecretaryClassDTO;
import ma.solide.teacherservice.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SecretaryOfficeClassService {

    private final RestTemplate restTemplate;
    private final String secretaryOfficeBaseUrl;

    public SecretaryOfficeClassService(
            RestTemplate restTemplate,
            @Value("${secretary-office.base-url:http://secretary-office:8095}") String secretaryOfficeBaseUrl
    ) {
        this.restTemplate = restTemplate;
        this.secretaryOfficeBaseUrl = secretaryOfficeBaseUrl;
    }

    public List<SecretaryClassDTO> getClasses(String teacherName) {
        return fetchClasses(teacherName);
    }

    public List<String> getStudentsByClassId(Integer classId, String teacherName) {
        if (classId == null) {
            return Collections.emptyList();
        }
        for (SecretaryClassDTO schoolClass : getClasses(teacherName)) {
            if (Objects.equals(schoolClass.getId(), classId)) {
                return schoolClass.getStudents() == null ? Collections.emptyList() : schoolClass.getStudents();
            }
        }
        return Collections.emptyList();
    }

    public SecretaryClassDTO getAssignedClass(Integer classId, String teacherName) {
        if (classId == null || teacherName == null || teacherName.isBlank()) {
            return null;
        }

        for (SecretaryClassDTO schoolClass : getClasses(teacherName)) {
            if (Objects.equals(schoolClass.getId(), classId)) {
                return schoolClass;
            }
        }
        return null;
    }

    private List<SecretaryClassDTO> fetchClasses(String teacherName) {
        String tenantId = TenantContext.getRequiredTenantId();
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Tenant-Id", tenantId);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        String targetUrl = secretaryOfficeBaseUrl + "/api/classes";
        if (teacherName != null && !teacherName.isBlank()) {
            String encodedTeacherName = URLEncoder.encode(teacherName.trim(), StandardCharsets.UTF_8);
            targetUrl = targetUrl + "?teacherName=" + encodedTeacherName;
        }

        ResponseEntity<List<SecretaryClassDTO>> response = restTemplate.exchange(
                targetUrl,
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<>() {
                }
        );

        List<SecretaryClassDTO> body = response.getBody();
        return body == null ? Collections.emptyList() : body;
    }
}

