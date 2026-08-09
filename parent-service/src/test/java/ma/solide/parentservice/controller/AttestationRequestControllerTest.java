package ma.solide.parentservice.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import ma.solide.parentservice.dto.AttestationRequestCreateRequest;
import ma.solide.parentservice.model.AttestationRequestRecord;
import ma.solide.parentservice.service.AttestationRequestService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AttestationRequestControllerTest {

    @Mock
    private AttestationRequestService service;

    @InjectMocks
    private AttestationRequestController controller;

    @Test
    void getByIdShouldReturnRecord() {
        AttestationRequestRecord record = AttestationRequestRecord.builder()
                .id(1L).tenantId("gardinia").status("pending").studentName("Ali").type("enrollment")
                .createdAt(LocalDateTime.now()).build();

        when(service.getById(1L)).thenReturn(record);

        ResponseEntity<AttestationRequestRecord> response = controller.getById(1L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    void getByIdShouldPropagate404() {
        when(service.getById(99L)).thenThrow(
                new ResponseStatusException(HttpStatus.NOT_FOUND, "not found"));

        assertThatThrownBy(() -> controller.getById(99L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void createShouldReturn201() {
        AttestationRequestCreateRequest request = new AttestationRequestCreateRequest();
        request.setStudentName("Sara");
        request.setType("enrollment");

        AttestationRequestRecord saved = AttestationRequestRecord.builder()
                .id(2L).tenantId("gardinia").status("pending").studentName("Sara").type("enrollment")
                .createdAt(LocalDateTime.now()).build();

        when(service.create(request)).thenReturn(saved);

        ResponseEntity<AttestationRequestRecord> response = controller.create(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStudentName()).isEqualTo("Sara");
    }

    @Test
    void cancelShouldReturn204() {
        doNothing().when(service).cancel(3L);

        ResponseEntity<Void> response = controller.cancel(3L);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(service).cancel(3L);
    }

    @Test
    void cancelShouldPropagate409WhenNotPending() {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "not pending"))
                .when(service).cancel(4L);

        assertThatThrownBy(() -> controller.cancel(4L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }
}
