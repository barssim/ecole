package ma.solide.secretaryoffice.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.AttestationRequestDTO;
import ma.solide.secretaryoffice.dto.AttestationResponse;
import ma.solide.secretaryoffice.dto.AttestationStatusUpdateDTO;
import ma.solide.secretaryoffice.service.AttestationPdfService;
import ma.solide.secretaryoffice.service.AttestationService;

@ExtendWith(MockitoExtension.class)
class AttestationControllerTest {

    @Mock
    private AttestationService attestationService;

    @Mock
    private AttestationPdfService attestationPdfService;

    @InjectMocks
    private AttestationController attestationController;

    @Test
    void requestAttestationShouldRejectAdminRole() {
        AttestationRequestDTO dto = new AttestationRequestDTO();

        assertThatThrownBy(() -> attestationController.requestAttestation(dto, "student,admin"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void requestAttestationShouldAllowStudentRole() {
        AttestationRequestDTO dto = new AttestationRequestDTO();
        AttestationResponse response = AttestationResponse.builder().id(1).status("pending").build();
        when(attestationService.requestAttestation(dto)).thenReturn(response);

        AttestationResponse result = attestationController.requestAttestation(dto, "student");

        assertThat(result.getId()).isEqualTo(1);
        verify(attestationService).requestAttestation(dto);
    }

    @Test
    void updateStatusShouldRejectNonAdmin() {
        AttestationStatusUpdateDTO dto = new AttestationStatusUpdateDTO();
        dto.setStatus("approved");

        assertThatThrownBy(() -> attestationController.updateStatus(1, dto, "student"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }
}

