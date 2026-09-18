package ma.solide.secretaryoffice.dto;

import java.util.Map;

public record TenantCustomizationResponseDTO(
        Map<String, String> name,
        String logo,
        String image,
        Map<String, String> about,
        Map<String, String> adresse,
        String primaryColor,
        String accentColor,
        String softColor,
        String customerVersion,
        String phone,
        String mail,
        String footerText) {
}
