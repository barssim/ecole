package ma.solide.usermanagement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.solide.usermanagement.model.TenantCustomization;
import ma.solide.usermanagement.repository.TenantCustomizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.Map;

@Service
public class TenantCustomizationService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() { };

    private final TenantCustomizationRepository tenantCustomizationRepository;
    private final ObjectMapper objectMapper;

    public TenantCustomizationService(TenantCustomizationRepository tenantCustomizationRepository, ObjectMapper objectMapper) {
        this.tenantCustomizationRepository = tenantCustomizationRepository;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getCustomization(String tenantId) {
        return tenantCustomizationRepository.findById(tenantId)
                .map(TenantCustomization::getCustomizationJson)
                .map(this::readMap)
                .orElse(Collections.emptyMap());
    }

    public Map<String, Object> saveCustomization(String tenantId, Map<String, Object> customization) {
        Map<String, Object> safeCustomization = customization != null ? customization : Collections.emptyMap();
        String json;
        try {
            json = objectMapper.writeValueAsString(safeCustomization);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid customization payload");
        }

        TenantCustomization tenantCustomization = TenantCustomization.builder()
                .tenantId(tenantId)
                .customizationJson(json)
                .build();
        tenantCustomizationRepository.save(tenantCustomization);
        return safeCustomization;
    }

    private Map<String, Object> readMap(String json) {
        try {
            return objectMapper.readValue(json, MAP_TYPE);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored customization is invalid");
        }
    }
}

