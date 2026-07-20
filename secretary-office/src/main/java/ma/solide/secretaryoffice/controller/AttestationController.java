
package ma.solide.secretaryoffice.controller;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(attestationService.getAttestations(userId, search));
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
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        if (isAdminOrManager(userRolesHeader)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Les administrateurs et managers ne peuvent pas demander une attestation");
        }
        return attestationService.requestAttestation(dto);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AttestationResponse> updateStatus(
            @PathVariable Integer id,
            @RequestBody AttestationStatusUpdateDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        if (!isAdminOrManager(userRolesHeader)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seuls les administrateurs et managers peuvent gérer les attestations");
        }
        return ResponseEntity.ok(attestationService.updateStatus(id, dto.getStatus()));
    }

    private boolean isAdminOrManager(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return false;
        }
        String normalized = rolesHeader.toLowerCase();
        return normalized.contains("admin") || normalized.contains("manager");
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
}

