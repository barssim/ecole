package ma.solide.finance_manager.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ma.solide.finance_manager.dto.FactureDTO;
import ma.solide.finance_manager.entity.Facture;
import ma.solide.finance_manager.repository.FactureRepository;
import ma.solide.finance_manager.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FactureService {

    private final FactureRepository factureRepository;
    private final ObjectMapper objectMapper;

    public FactureService(FactureRepository factureRepository, ObjectMapper objectMapper) {
        this.factureRepository = factureRepository;
        this.objectMapper = objectMapper;
    }

    public FactureDTO saveGeneratedFacture(String studentName, String className, List<Map<String, Object>> items) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (studentName == null || studentName.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de l'eleve requis");
        }
        if (items == null || items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La facture doit contenir au moins une ligne");
        }

        List<FactureDTO.FactureItemDTO> normalizedItems = normalizeItems(items);
        double totalAmount = normalizedItems.stream()
                .mapToDouble(item -> item.getAmount() == null ? 0.0 : item.getAmount())
                .sum();

        Facture facture = new Facture();
        facture.setTenantId(tenantId);
        facture.setInvoiceNumber(generateInvoiceNumber(tenantId));
        facture.setStudentName(studentName.trim());
        facture.setClassName(className == null || className.trim().isEmpty() ? "-" : className.trim());
        facture.setCurrency("MAD");
        facture.setGeneratedDate(LocalDate.now());
        facture.setTotalAmount(totalAmount);
        facture.setItemsJson(writeItemsJson(normalizedItems));

        return toDTO(factureRepository.save(facture));
    }

    public List<FactureDTO> getAllFactures() {
        String tenantId = TenantContext.getRequiredTenantId();
        return factureRepository.findByTenantIdOrderByGeneratedDateDescIdDesc(tenantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private List<FactureDTO.FactureItemDTO> normalizeItems(List<Map<String, Object>> items) {
        List<FactureDTO.FactureItemDTO> normalized = new ArrayList<>();

        for (Map<String, Object> item : items) {
            String description = "";
            if (item.get("description") instanceof String value) {
                description = value.trim();
            }

            double amount = 0.0;
            Object amountValue = item.get("amount");
            if (amountValue instanceof Number number) {
                amount = number.doubleValue();
            }

            if (!description.isEmpty() && amount > 0) {
                normalized.add(new FactureDTO.FactureItemDTO(description, amount));
            }
        }

        if (normalized.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucune ligne de facture valide");
        }

        return normalized;
    }

    private String writeItemsJson(List<FactureDTO.FactureItemDTO> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible d'enregistrer les lignes de facture");
        }
    }

    private List<FactureDTO.FactureItemDTO> readItemsJson(String itemsJson) {
        try {
            return objectMapper.readValue(itemsJson, new TypeReference<List<FactureDTO.FactureItemDTO>>() {});
        } catch (Exception exception) {
            return new ArrayList<>();
        }
    }

    private String generateInvoiceNumber(String tenantId) {
        YearMonth now = YearMonth.now();
        long count = factureRepository.findByTenantId(tenantId).stream()
                .filter(f -> f.getGeneratedDate() != null
                        && f.getGeneratedDate().getYear() == now.getYear()
                        && f.getGeneratedDate().getMonthValue() == now.getMonthValue())
                .count();
        return String.format("FAC-%d%02d-%04d", now.getYear(), now.getMonthValue(), count + 1);
    }

    private FactureDTO toDTO(Facture facture) {
        FactureDTO dto = new FactureDTO();
        dto.setId(facture.getId());
        dto.setInvoiceNumber(facture.getInvoiceNumber());
        dto.setStudentName(facture.getStudentName());
        dto.setClassName(facture.getClassName());
        dto.setTotalAmount(facture.getTotalAmount());
        dto.setCurrency(facture.getCurrency());
        dto.setGeneratedDate(facture.getGeneratedDate());
        dto.setItems(readItemsJson(facture.getItemsJson()));
        return dto;
    }
}

