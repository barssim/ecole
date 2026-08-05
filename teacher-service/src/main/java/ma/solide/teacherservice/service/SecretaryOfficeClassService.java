package ma.solide.teacherservice.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
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
        List<SecretaryClassDTO> classes = fetchClasses();
        if (teacherName == null || teacherName.isBlank()) {
            return classes;
        }

        String normalized = teacherName.trim().toLowerCase(Locale.ROOT);
        List<SecretaryClassDTO> filtered = new ArrayList<>();
        for (SecretaryClassDTO schoolClass : classes) {
            boolean match = schoolClass.getTeachers() != null
                    && schoolClass.getTeachers().stream()
                    .filter(Objects::nonNull)
                    .map(value -> value.trim().toLowerCase(Locale.ROOT))
                    .anyMatch(normalized::equals);
            if (match) {
                filtered.add(schoolClass);
            }
        }
        return filtered;
    }

    public List<String> getStudentsByClassId(Integer classId) {
        if (classId == null) {
            return Collections.emptyList();
        }
        for (SecretaryClassDTO schoolClass : fetchClasses()) {
            if (Objects.equals(schoolClass.getId(), classId)) {
                return schoolClass.getStudents() == null ? Collections.emptyList() : schoolClass.getStudents();
            }
        }
        return Collections.emptyList();
    }

    private List<SecretaryClassDTO> fetchClasses() {
        String tenantId = TenantContext.getRequiredTenantId();
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Tenant-Id", tenantId);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<List<SecretaryClassDTO>> response = restTemplate.exchange(
                secretaryOfficeBaseUrl + "/api/classes",
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<>() {
                }
        );

        List<SecretaryClassDTO> body = response.getBody();
        return body == null ? Collections.emptyList() : body;
    }
}

