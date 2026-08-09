package ma.solide.parentservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import ma.solide.parentservice.dto.AttestationRequestCreateRequest;
import ma.solide.parentservice.model.AttestationRequestRecord;
import ma.solide.parentservice.repository.AttestationRequestRepository;
import ma.solide.parentservice.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AttestationRequestServiceTest {

    private static final String TENANT = "gardinia";

    @Mock
    private AttestationRequestRepository repository;

    @InjectMocks
    private AttestationRequestService service;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void createShouldPersistWithPendingStatus() {
        AttestationRequestCreateRequest request = new AttestationRequestCreateRequest();
        request.setStudentName("Ali Ben Youssef");
        request.setType("enrollment");
        request.setUserId(7);

        AttestationRequestRecord saved = AttestationRequestRecord.builder()
                .id(1L)
                .tenantId(TENANT)
                .userId(7)
                .studentName("Ali Ben Youssef")
                .type("enrollment")
                .status("pending")
                .createdAt(LocalDateTime.now())
                .build();

        when(repository.save(any())).thenReturn(saved);

        AttestationRequestRecord result = service.create(request);

        assertThat(result.getStatus()).isEqualTo("pending");
        assertThat(result.getTenantId()).isEqualTo(TENANT);
        verify(repository).save(any());
    }

    @Test
    void createShouldRejectMissingStudentName() {
        AttestationRequestCreateRequest request = new AttestationRequestCreateRequest();
        request.setType("enrollment");

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void createShouldRejectMissingType() {
        AttestationRequestCreateRequest request = new AttestationRequestCreateRequest();
        request.setStudentName("Ali");

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void getByIdShouldReturnRecord() {
        AttestationRequestRecord record = AttestationRequestRecord.builder()
                .id(5L).tenantId(TENANT).status("pending").studentName("Sara").type("attendance")
                .createdAt(LocalDateTime.now()).build();

        when(repository.findByIdAndTenantId(5L, TENANT)).thenReturn(Optional.of(record));

        AttestationRequestRecord result = service.getById(5L);

        assertThat(result.getId()).isEqualTo(5L);
    }

    @Test
    void getByIdShouldThrowNotFoundWhenMissing() {
        when(repository.findByIdAndTenantId(99L, TENANT)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void cancelShouldSetStatusCancelled() {
        AttestationRequestRecord record = AttestationRequestRecord.builder()
                .id(3L).tenantId(TENANT).status("pending").studentName("Hassan").type("enrollment")
                .createdAt(LocalDateTime.now()).build();

        when(repository.findByIdAndTenantId(3L, TENANT)).thenReturn(Optional.of(record));
        when(repository.save(record)).thenReturn(record);

        service.cancel(3L);

        assertThat(record.getStatus()).isEqualTo("cancelled");
        verify(repository).save(record);
    }

    @Test
    void cancelShouldRejectAlreadyApprovedRequest() {
        AttestationRequestRecord record = AttestationRequestRecord.builder()
                .id(4L).tenantId(TENANT).status("approved").studentName("Nadia").type("enrollment")
                .createdAt(LocalDateTime.now()).build();

        when(repository.findByIdAndTenantId(4L, TENANT)).thenReturn(Optional.of(record));

        assertThatThrownBy(() -> service.cancel(4L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void listShouldFilterByUserId() {
        AttestationRequestRecord r = AttestationRequestRecord.builder()
                .id(1L).tenantId(TENANT).userId(5).status("pending").studentName("Youssef").type("enrollment")
                .createdAt(LocalDateTime.now()).build();

        when(repository.findAllByTenantIdAndUserIdOrderByCreatedAtDesc(TENANT, 5)).thenReturn(List.of(r));

        List<AttestationRequestRecord> results = service.list(5);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getUserId()).isEqualTo(5);
    }
}
