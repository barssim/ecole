package ma.solide.secretaryoffice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.AttestationRequestDTO;
import ma.solide.secretaryoffice.dto.AttestationResponse;
import ma.solide.secretaryoffice.model.Attestation;
import ma.solide.secretaryoffice.repository.AttestationRepository;
import ma.solide.secretaryoffice.tenant.TenantContext;

@ExtendWith(MockitoExtension.class)
class AttestationServiceTest {

    private static final String TENANT = "gardinia";

    @Mock
    private AttestationRepository attestationRepository;

    @InjectMocks
    private AttestationService attestationService;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void updateStatusShouldSetApprovedAndPersist() {
        Attestation attestation = Attestation.builder()
                .id(10)
                .userId(5)
                .studentName("Ali")
                .className("3e A")
                .title("Attestation")
                .type("enrollment")
                .date(LocalDate.now())
                .status("pending")
                .issuedBy("En attente")
                .validFrom(LocalDate.now())
                .validUntil(LocalDate.now().plusYears(1))
                .reference("REF-1")
                .build();

        when(attestationRepository.findByIdAndTenantId(10, TENANT)).thenReturn(Optional.of(attestation));
        when(attestationRepository.save(any(Attestation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttestationResponse response = attestationService.approve(10);

        assertThat(response.getStatus()).isEqualTo("approved");
        assertThat(response.getIssuedBy()).isEqualTo("Traitée par Secrétariat");
        verify(attestationRepository).save(attestation);
    }

    @Test
    void requestAttestationShouldPersistPendingRequestInTenant() {
        AttestationRequestDTO request = new AttestationRequestDTO();
        request.setUserId(9);
        request.setStudentName("Salma");
        request.setClassName("4ème A");
        request.setType("registration");

        when(attestationRepository.existsByTenantIdAndUserIdAndTypeAndStatus(TENANT, 9, "registration", "pending"))
                .thenReturn(false);
        when(attestationRepository.save(any(Attestation.class))).thenAnswer(invocation -> {
            Attestation saved = invocation.getArgument(0);
            saved.setId(99);
            return saved;
        });

        AttestationResponse response = attestationService.requestAttestation(request);

        assertThat(response.getId()).isEqualTo(99);
        assertThat(response.getStatus()).isEqualTo("pending");
        assertThat(response.getUserId()).isEqualTo(9);
        verify(attestationRepository).existsByTenantIdAndUserIdAndTypeAndStatus(TENANT, 9, "registration", "pending");
        verify(attestationRepository).save(any(Attestation.class));
    }

    @Test
    void cancelShouldSetRejected() {
        Attestation attestation = Attestation.builder()
                .id(11)
                .userId(5)
                .studentName("Ali")
                .className("3e A")
                .title("Attestation")
                .type("enrollment")
                .date(LocalDate.now())
                .status("pending")
                .issuedBy("En attente")
                .validFrom(LocalDate.now())
                .validUntil(LocalDate.now().plusYears(1))
                .reference("REF-2")
                .build();

        when(attestationRepository.findByIdAndTenantId(11, TENANT)).thenReturn(Optional.of(attestation));
        when(attestationRepository.save(any(Attestation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttestationResponse response = attestationService.cancel(11);

        assertThat(response.getStatus()).isEqualTo("rejected");
        verify(attestationRepository).save(attestation);
    }

    @Test
    void updateStatusShouldRejectInvalidValue() {
        assertThatThrownBy(() -> attestationService.updateStatus(1, "unknown"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void updateStatusShouldRejectNonPendingTransition() {
        Attestation attestation = Attestation.builder()
                .id(12)
                .userId(5)
                .studentName("Ali")
                .className("3e A")
                .title("Attestation")
                .type("enrollment")
                .date(LocalDate.now())
                .status("approved")
                .issuedBy("Traitée")
                .validFrom(LocalDate.now())
                .validUntil(LocalDate.now().plusYears(1))
                .reference("REF-3")
                .build();

        when(attestationRepository.findByIdAndTenantId(12, TENANT)).thenReturn(Optional.of(attestation));

        assertThatThrownBy(() -> attestationService.cancel(12))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void deleteShouldRemoveAttestationInAnyStatus() {
        Attestation attestation = Attestation.builder()
                .id(13)
                .userId(5)
                .studentName("Ali")
                .className("3e A")
                .title("Attestation")
                .type("enrollment")
                .date(LocalDate.now())
                .status("approved")
                .issuedBy("Traitée")
                .validFrom(LocalDate.now())
                .validUntil(LocalDate.now().plusYears(1))
                .reference("REF-4")
                .build();

        when(attestationRepository.findByIdAndTenantId(13, TENANT)).thenReturn(Optional.of(attestation));

        attestationService.delete(13);

        verify(attestationRepository).delete(attestation);
    }

    @Test
    void updateStatusShouldIncludeSecretaryNameWhenProvided() {
        Attestation attestation = Attestation.builder()
                .id(14)
                .userId(5)
                .studentName("Ali")
                .className("3e A")
                .title("Attestation")
                .type("enrollment")
                .date(LocalDate.now())
                .status("pending")
                .issuedBy("En attente")
                .validFrom(LocalDate.now())
                .validUntil(LocalDate.now().plusYears(1))
                .reference("REF-5")
                .build();

        when(attestationRepository.findByIdAndTenantId(14, TENANT)).thenReturn(Optional.of(attestation));
        when(attestationRepository.save(any(Attestation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AttestationResponse response = attestationService.updateStatus(14, "approved", "Mme Rahmani");

        assertThat(response.getStatus()).isEqualTo("approved");
        assertThat(response.getIssuedBy()).isEqualTo("Traitée par Mme Rahmani");
        verify(attestationRepository).save(attestation);
    }
}
