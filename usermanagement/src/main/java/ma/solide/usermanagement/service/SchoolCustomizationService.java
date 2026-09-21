package ma.solide.usermanagement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.solide.usermanagement.model.SchoolCustomization;
import ma.solide.usermanagement.repository.SchoolCustomizationRepository;
import ma.solide.usermanagement.repository.UserRepository;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Collections;
import java.util.Map;

@Service
public class SchoolCustomizationService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() { };

    private final SchoolCustomizationRepository schoolCustomizationRepository;
    private final UserRepository userRepository;
    private final CustomerVersionPolicy customerVersionPolicy;
    private final Environment environment;
    private final ObjectMapper objectMapper;

    public SchoolCustomizationService(
            SchoolCustomizationRepository schoolCustomizationRepository,
            UserRepository userRepository,
            CustomerVersionPolicy customerVersionPolicy,
            Environment environment,
            ObjectMapper objectMapper) {
        this.schoolCustomizationRepository = schoolCustomizationRepository;
        this.userRepository = userRepository;
        this.customerVersionPolicy = customerVersionPolicy;
        this.environment = environment;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getCustomization(String schoolId) {
        Map<String, Object> customization = schoolCustomizationRepository.findById(schoolId)
                .map(SchoolCustomization::getCustomizationJson)
                .map(this::readMap)
                .orElse(Collections.emptyMap());
        return enrichWithCustomerVersion(schoolId, customization);
    }

    public Map<String, Object> saveCustomization(String schoolId, Map<String, Object> customization) {
        Map<String, Object> safeCustomization = customization != null ? customization : Collections.emptyMap();
        validateCustomerVersionIfPresent(safeCustomization);
        Map<String, Object> enrichedCustomization = enrichWithCustomerVersion(schoolId, safeCustomization);
        String json;
        try {
            json = objectMapper.writeValueAsString(enrichedCustomization);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customization payload");
        }

        SchoolCustomization schoolCustomization = SchoolCustomization.builder()
                .schoolId(schoolId)
                .customizationJson(json)
                .build();
        schoolCustomizationRepository.save(schoolCustomization);
        return enrichedCustomization;
    }

    public String resolveCustomerVersion(String schoolId) {
        Map<String, Object> customization = schoolCustomizationRepository.findById(schoolId)
                .map(SchoolCustomization::getCustomizationJson)
                .map(this::readMap)
                .orElse(Collections.emptyMap());

        long userCount = userRepository.countBySchoolId(schoolId);
        return resolveEffectiveVersion(schoolId, customization, userCount);
    }

    private Map<String, Object> enrichWithCustomerVersion(String schoolId, Map<String, Object> customization) {
        Map<String, Object> enrichedCustomization = new HashMap<>(customization);
        long userCount = userRepository.countBySchoolId(schoolId);
        enrichedCustomization.put("userCount", userCount);
        enrichedCustomization.put("customerVersion", resolveEffectiveVersion(schoolId, customization, userCount));
        return enrichedCustomization;
    }

    private String resolveEffectiveVersion(String schoolId, Map<String, Object> customization, long userCount) {
        String configuredVersion = extractConfiguredVersion(customization);
        if (configuredVersion != null && customerVersionPolicy.isKnownVersion(configuredVersion)) {
            return customerVersionPolicy.normalizeVersion(configuredVersion);
        }

        String configuredDefault = environment.getProperty("customer-version.default-by-school." + schoolId);
        if (configuredDefault != null && customerVersionPolicy.isKnownVersion(configuredDefault)) {
            return customerVersionPolicy.normalizeVersion(configuredDefault);
        }

        return customerVersionPolicy.resolveVersion(userCount);
    }

    private void validateCustomerVersionIfPresent(Map<String, Object> customization) {
        String configuredVersion = extractConfiguredVersion(customization);
        if (configuredVersion == null) {
            return;
        }
        if (!customerVersionPolicy.isKnownVersion(configuredVersion)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customerVersion. Allowed: testversion, bronzversion, silber, gold");
        }
    }

    private String extractConfiguredVersion(Map<String, Object> customization) {
        if (customization == null) {
            return null;
        }
        Object value = customization.get("customerVersion");
        if (value == null) {
            return null;
        }
        String version = String.valueOf(value).trim();
        return version.isEmpty() ? null : version;
    }

    private Map<String, Object> readMap(String json) {
        try {
            return objectMapper.readValue(json, MAP_TYPE);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored customization is invalid");
        }
    }
}

