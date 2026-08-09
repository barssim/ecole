package ma.solide.secretaryoffice.controller;

import java.io.ByteArrayInputStream;
import java.util.Arrays;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.AttestationRequestDTO;
import ma.solide.secretaryoffice.dto.AttestationResponse;
import ma.solide.secretaryoffice.dto.AttestationStatusUpdateDTO;
import ma.solide.secretaryoffice.model.Attestation;
import ma.solide.secretaryoffice.service.AttestationPdfService;
import ma.solide.secretaryoffice.service.AttestationService;

@RestController
@RequestMapping({"/api/attestations", "/api/attestationsproduction"})
public class AttestationController {

    private final AttestationService attestationService;
    private final AttestationPdfService attestationPdfService;

    public AttestationController(AttestationService attestationService, AttestationPdfService attestationPdfService) {
        this.attestationService = attestationService;
        this.attestationPdfService = attestationPdfService;
    }

    @GetMapping
    public ResponseEntity<List<AttestationResponse>> getAttestations(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String search,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (hasManagementRole(userRolesHeader)) {
            return ResponseEntity.ok(attestationService.getAttestations(userId, search));
        }
        if (!hasRole(userRolesHeader, "parent")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seuls les parents et le secrétariat peuvent consulter les attestations");
        }
        Integer authenticatedUserId = parseUserId(userIdHeader);
        Integer effectiveUserId = authenticatedUserId != null ? authenticatedUserId : userId;
        if (authenticatedUserId != null && userId != null && !authenticatedUserId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Un parent ne peut consulter que ses propres attestations");
        }
        if (effectiveUserId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le paramètre userId est requis pour consulter les attestations parent");
        }
        return ResponseEntity.ok(attestationService.getAttestations(effectiveUserId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttestationResponse> getAttestation(@PathVariable Integer id) {
        return ResponseEntity.ok(attestationService.getAttestation(id));
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<InputStreamResource> viewAttestation(@PathVariable Integer id) {
        return buildPdfResponse(id, true);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> downloadAttestation(@PathVariable Integer id) {
        return buildPdfResponse(id, false);
    }

    @PostMapping("/request")
    @ResponseStatus(HttpStatus.CREATED)
    public AttestationResponse requestAttestation(
            @RequestBody AttestationRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (hasManagementRole(userRolesHeader)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Le secrétariat et l'administration ne peuvent pas demander une attestation");
        }
        if (!hasRole(userRolesHeader, "parent")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seuls les parents peuvent demander une attestation");
        }
        Integer authenticatedUserId = parseUserId(userIdHeader);
        if (authenticatedUserId != null) {
            if (dto.getUserId() != null && !authenticatedUserId.equals(dto.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Un parent ne peut demander une attestation que pour son propre compte");
            }
            dto.setUserId(authenticatedUserId);
        }
        return attestationService.requestAttestation(dto);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<AttestationResponse> approve(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userNameHeader) {
        requireManagementRole(userRolesHeader);
        return ResponseEntity.ok(attestationService.approve(id, userNameHeader));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AttestationResponse> cancel(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userNameHeader) {
        requireManagementRole(userRolesHeader);
        return ResponseEntity.ok(attestationService.cancel(id, userNameHeader));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AttestationResponse> updateStatus(
            @PathVariable Integer id,
            @RequestBody AttestationStatusUpdateDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userNameHeader) {
        requireManagementRole(userRolesHeader);
        return ResponseEntity.ok(attestationService.updateStatus(id, dto.getStatus(), userNameHeader));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        requireManagementRole(userRolesHeader);
        attestationService.delete(id);
    }

    private void requireManagementRole(String rolesHeader) {
        if (!hasManagementRole(rolesHeader)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seuls le secrétariat et l'administration peuvent gérer les attestations");
        }
    }

    private boolean hasManagementRole(String rolesHeader) {
        return hasRole(rolesHeader, "secretary")
                || hasRole(rolesHeader, "admin")
                || hasRole(rolesHeader, "manager");
    }

    private boolean hasRole(String rolesHeader, String expectedRole) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return false;
        }

        String normalizedExpectedRole = expectedRole == null ? "" : expectedRole.trim().toLowerCase();
        if (normalizedExpectedRole.isEmpty()) {
            return false;
        }

        return Arrays.stream(rolesHeader.toLowerCase().split(","))
                .map(String::trim)
                .anyMatch(role -> role.equals(normalizedExpectedRole)
                        || role.equals("role_" + normalizedExpectedRole)
                        || role.endsWith("_" + normalizedExpectedRole));
    }

    private ResponseEntity<InputStreamResource> buildPdfResponse(Integer id, boolean inline) {
        Attestation attestation = attestationService.findEntity(id);
        ByteArrayInputStream pdf = attestationPdfService.generatePdf(attestation);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION,
                (inline ? "inline" : "attachment") + "; filename=attestation-" + attestation.getId() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdf));
    }

    private Integer parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(userIdHeader.trim());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-User-Id invalide");
        }
    }
}
