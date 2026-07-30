package ma.solide.usermanagement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.solide.usermanagement.model.TenantCustomization;
import ma.solide.usermanagement.repository.TenantCustomizationRepository;
import ma.solide.usermanagement.repository.UserRepository;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Collections;
import java.util.Map;

@Service
public class TenantCustomizationService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() { };

    private final TenantCustomizationRepository tenantCustomizationRepository;
    private final UserRepository userRepository;
    private final CustomerVersionPolicy customerVersionPolicy;
    private final Environment environment;
    private final ObjectMapper objectMapper;

    public TenantCustomizationService(
            TenantCustomizationRepository tenantCustomizationRepository,
            UserRepository userRepository,
            CustomerVersionPolicy customerVersionPolicy,
            Environment environment,
            ObjectMapper objectMapper) {
        this.tenantCustomizationRepository = tenantCustomizationRepository;
        this.userRepository = userRepository;
        this.customerVersionPolicy = customerVersionPolicy;
        this.environment = environment;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getCustomization(String tenantId) {
        Map<String, Object> customization = tenantCustomizationRepository.findById(tenantId)
                .map(TenantCustomization::getCustomizationJson)
                .map(this::readMap)
                .orElse(Collections.emptyMap());
        return enrichWithCustomerVersion(tenantId, customization);
    }

    public Map<String, Object> saveCustomization(String tenantId, Map<String, Object> customization) {
        Map<String, Object> safeCustomization = customization != null ? customization : Collections.emptyMap();
        validateCustomerVersionIfPresent(safeCustomization);
        Map<String, Object> enrichedCustomization = enrichWithCustomerVersion(tenantId, safeCustomization);
        String json;
        try {
            json = objectMapper.writeValueAsString(enrichedCustomization);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customization payload");
        }

        TenantCustomization tenantCustomization = TenantCustomization.builder()
                .tenantId(tenantId)
                .customizationJson(json)
                .build();
        tenantCustomizationRepository.save(tenantCustomization);
        return enrichedCustomization;
    }

    public String resolveCustomerVersion(String tenantId) {
        Map<String, Object> customization = tenantCustomizationRepository.findById(tenantId)
                .map(TenantCustomization::getCustomizationJson)
                .map(this::readMap)
                .orElse(Collections.emptyMap());

        long userCount = userRepository.countByTenantId(tenantId);
        return resolveEffectiveVersion(tenantId, customization, userCount);
    }

    private Map<String, Object> enrichWithCustomerVersion(String tenantId, Map<String, Object> customization) {
        Map<String, Object> enrichedCustomization = new HashMap<>(customization);
        long userCount = userRepository.countByTenantId(tenantId);
        enrichedCustomization.put("userCount", userCount);
        enrichedCustomization.put("customerVersion", resolveEffectiveVersion(tenantId, customization, userCount));
        return enrichedCustomization;
    }

    private String resolveEffectiveVersion(String tenantId, Map<String, Object> customization, long userCount) {
        String configuredVersion = extractConfiguredVersion(customization);
        if (configuredVersion != null && customerVersionPolicy.isKnownVersion(configuredVersion)) {
            return customerVersionPolicy.normalizeVersion(configuredVersion);
        }

        String configuredDefault = environment.getProperty("customer-version.default-by-tenant." + tenantId);
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

