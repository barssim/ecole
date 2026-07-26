package ma.solide.usermanagement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.solide.usermanagement.model.TenantCustomization;
import ma.solide.usermanagement.repository.TenantCustomizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TenantCustomizationServiceTest {

    @Mock
    private TenantCustomizationRepository tenantCustomizationRepository;

    private TenantCustomizationService tenantCustomizationService;

    @BeforeEach
    void setUp() {
        tenantCustomizationService = new TenantCustomizationService(tenantCustomizationRepository, new ObjectMapper());
    }

    @Test
    void shouldReturnEmptyMapWhenNoCustomizationExists() {
        when(tenantCustomizationRepository.findById("qods")).thenReturn(Optional.empty());

        Map<String, Object> result = tenantCustomizationService.getCustomization("qods");

        assertTrue(result.isEmpty());
    }

    @Test
    void shouldSaveCustomizationAsJson() {
        Map<String, Object> payload = Map.of("primaryColor", "#112233", "phone", "+123");

        tenantCustomizationService.saveCustomization("qods", payload);

        ArgumentCaptor<TenantCustomization> captor = ArgumentCaptor.forClass(TenantCustomization.class);
        verify(tenantCustomizationRepository).save(captor.capture());

        TenantCustomization savedEntity = captor.getValue();
        assertEquals("qods", savedEntity.getTenantId());
        assertTrue(savedEntity.getCustomizationJson().contains("primaryColor"));
        assertTrue(savedEntity.getCustomizationJson().contains("#112233"));
    }

    @Test
    void shouldDeserializeStoredCustomizationJson() {
        TenantCustomization stored = TenantCustomization.builder()
                .tenantId("qods")
                .customizationJson("{\"mail\":\"manager@qods.test\"}")
                .build();
        when(tenantCustomizationRepository.findById("qods")).thenReturn(Optional.of(stored));

        Map<String, Object> result = tenantCustomizationService.getCustomization("qods");

        assertEquals("manager@qods.test", result.get("mail"));
    }
}

