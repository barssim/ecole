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

        assertThatThrownBy(() -> attestationController.requestAttestation(dto, "student,admin", null))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void requestAttestationShouldAllowParentRole() {
        AttestationRequestDTO dto = new AttestationRequestDTO();
        AttestationResponse response = AttestationResponse.builder().id(1).status("pending").build();
        when(attestationService.requestAttestation(dto)).thenReturn(response);

        AttestationResponse result = attestationController.requestAttestation(dto, "parent", null);

        assertThat(result.getId()).isEqualTo(1);
        verify(attestationService).requestAttestation(dto);
    }

    @Test
    void requestAttestationShouldRejectStudentRole() {
        AttestationRequestDTO dto = new AttestationRequestDTO();

        assertThatThrownBy(() -> attestationController.requestAttestation(dto, "student", null))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void updateStatusShouldRejectNonAdmin() {
        AttestationStatusUpdateDTO dto = new AttestationStatusUpdateDTO();
        dto.setStatus("approved");

        assertThatThrownBy(() -> attestationController.updateStatus(1, dto, "student", "student-user"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void getAttestationsShouldRequireUserIdForParent() {
        assertThatThrownBy(() -> attestationController.getAttestations(null, null, "parent", null))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void getAttestationsShouldRejectParentWhenQueryUserIdDoesNotMatchHeaderUserId() {
        assertThatThrownBy(() -> attestationController.getAttestations(9, null, "parent", "5"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void getAttestationsShouldUseHeaderUserIdForParent() {
        attestationController.getAttestations(null, null, "parent", "5");

        verify(attestationService).getAttestations(5, null);
    }

    @Test
    void getAttestationsShouldAllowSecretaryWithoutUserId() {
        attestationController.getAttestations(null, null, "secretary", null);

        verify(attestationService).getAttestations(null, null);
    }

    @Test
    void approveShouldAllowSecretary() {
        AttestationResponse response = AttestationResponse.builder().id(1).status("approved").build();
        when(attestationService.approve(1, "sec-1")).thenReturn(response);

        AttestationResponse result = attestationController.approve(1, "secretary", "sec-1").getBody();

        assertThat(result.getStatus()).isEqualTo("approved");
        verify(attestationService).approve(1, "sec-1");
    }

    @Test
    void cancelShouldAllowSecretary() {
        AttestationResponse response = AttestationResponse.builder().id(1).status("rejected").build();
        when(attestationService.cancel(1, "sec-2")).thenReturn(response);

        AttestationResponse result = attestationController.cancel(1, "role_secretary", "sec-2").getBody();

        assertThat(result.getStatus()).isEqualTo("rejected");
        verify(attestationService).cancel(1, "sec-2");
    }

    @Test
    void deleteShouldRejectParent() {
        assertThatThrownBy(() -> attestationController.delete(1, "parent"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void deleteShouldAllowSecretary() {
        attestationController.delete(1, "manager,secretary");

        verify(attestationService).delete(1);
    }
}
