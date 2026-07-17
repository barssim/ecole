package ma.solide.secretaryoffice.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.AttestationRequestDTO;
import ma.solide.secretaryoffice.dto.AttestationResponse;
import ma.solide.secretaryoffice.model.Attestation;
import ma.solide.secretaryoffice.repository.AttestationRepository;

@Service
public class AttestationService {

    private static final Map<String, String> TYPE_TITLES = Map.of(
        "enrollment",    "Attestation de scolarité",
        "attendance",    "Attestation de présence",
        "conduct",       "Attestation de bonne conduite",
        "academic",      "Attestation de résultats académiques",
        "registration",  "Attestation d'inscription"
    );

    private final AttestationRepository attestationRepository;

    public AttestationService(AttestationRepository attestationRepository) {
        this.attestationRepository = attestationRepository;
    }

    public List<AttestationResponse> getAttestations(Integer userId, String search) {
        List<Attestation> attestations;
        boolean hasSearch = StringUtils.hasText(search);

        if (userId != null && hasSearch) {
            attestations = attestationRepository.findByUserIdAndTitleContainingIgnoreCaseOrderByDateDesc(userId, search.trim());
        } else if (userId != null) {
            attestations = attestationRepository.findByUserIdOrderByDateDesc(userId);
        } else if (hasSearch) {
            attestations = attestationRepository.findByTitleContainingIgnoreCaseOrderByDateDesc(search.trim());
        } else {
            attestations = attestationRepository.findAllByOrderByDateDesc();
        }

        return attestations.stream().map(this::toResponse).toList();
    }

    public AttestationResponse getAttestation(Integer id) {
        return toResponse(findEntity(id));
    }

    public Attestation findEntity(Integer id) {
        return attestationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Attestation introuvable pour l'id " + id));
    }

    private AttestationResponse toResponse(Attestation attestation) {
        return AttestationResponse.builder()
                .id(attestation.getId())
                .userId(attestation.getUserId())
                .studentName(attestation.getStudentName())
                .className(attestation.getClassName())
                .title(attestation.getTitle())
                .type(attestation.getType())
                .date(attestation.getDate())
                .status(attestation.getStatus())
                .documentUrl(resolveDocumentUrl(attestation.getId(), "download"))
                .viewUrl(resolveDocumentUrl(attestation.getId(), "view"))
                .issuedBy(attestation.getIssuedBy())
                .validFrom(attestation.getValidFrom())
                .validUntil(attestation.getValidUntil())
                .reference(attestation.getReference())
                .build();
    }

    private String resolveDocumentUrl(Integer id, String action) {
        return "/api/attestations/" + id + "/" + action;
    }

    public AttestationResponse requestAttestation(AttestationRequestDTO dto) {
        if (dto.getUserId() == null || !StringUtils.hasText(dto.getType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId et type sont requis");
        }

        String type = dto.getType().toLowerCase().trim();
        if (!TYPE_TITLES.containsKey(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Type invalide. Valeurs acceptées : " + TYPE_TITLES.keySet());
        }

        if (attestationRepository.existsByUserIdAndTypeAndStatus(dto.getUserId(), type, "pending")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une demande de type '" + type + "' est déjà en attente pour cet utilisateur");
        }

        LocalDate today = LocalDate.now();
        String reference = "REQ-" + today.format(DateTimeFormatter.BASIC_ISO_DATE)
                + "-" + dto.getUserId() + "-" + type.substring(0, 3).toUpperCase();

        Attestation attestation = Attestation.builder()
                .userId(dto.getUserId())
                .studentName(StringUtils.hasText(dto.getStudentName()) ? dto.getStudentName() : "Étudiant " + dto.getUserId())
                .className(StringUtils.hasText(dto.getClassName()) ? dto.getClassName() : "-")
                .title(TYPE_TITLES.get(type))
                .type(type)
                .date(today)
                .status("pending")
                .issuedBy("En attente de validation")
                .validFrom(today)
                .validUntil(today.plusYears(1))
                .reference(reference)
                .build();

        Attestation saved = attestationRepository.save(attestation);
        return toResponse(saved);
    }
}

