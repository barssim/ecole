package ma.solide.secretaryoffice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.AttestationResponse;
import ma.solide.secretaryoffice.model.Attestation;
import ma.solide.secretaryoffice.repository.AttestationRepository;

@ExtendWith(MockitoExtension.class)
class AttestationServiceTest {

    @Mock
    private AttestationRepository attestationRepository;

    @InjectMocks
    private AttestationService attestationService;

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

        when(attestationRepository.findById(10)).thenReturn(Optional.of(attestation));
        when(attestationRepository.save(attestation)).thenReturn(attestation);

        AttestationResponse response = attestationService.updateStatus(10, "approved");

        assertThat(response.getStatus()).isEqualTo("approved");
        assertThat(response.getIssuedBy()).isEqualTo("Traitée par administration");
        verify(attestationRepository).save(attestation);
    }

    @Test
    void updateStatusShouldRejectInvalidValue() {
        assertThatThrownBy(() -> attestationService.updateStatus(1, "unknown"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }
}

