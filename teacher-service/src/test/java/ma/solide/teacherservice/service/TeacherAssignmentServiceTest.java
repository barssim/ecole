package ma.solide.teacherservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import ma.solide.teacherservice.dto.SecretaryClassDTO;
import ma.solide.teacherservice.dto.TeacherAssignmentRequest;
import ma.solide.teacherservice.model.TeacherAssignment;
import ma.solide.teacherservice.repository.TeacherAssignmentRepository;
import ma.solide.teacherservice.tenant.TenantContext;
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
class TeacherAssignmentServiceTest {

    private static final String TENANT = "gardinia";

    @Mock
    private TeacherAssignmentRepository repository;

    @Mock
    private SecretaryOfficeClassService secretaryOfficeClassService;

    @InjectMocks
    private TeacherAssignmentService service;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void listShouldScopeToTeacherAndClassAfterAuthorization() {
        TeacherAssignment assignment = TeacherAssignment.builder()
                .id(1L)
                .tenantId(TENANT)
                .teacherId("8")
                .classId("2")
                .title("Ex 1")
                .dueDate(LocalDate.now())
                .createdBy("teacher.one")
                .createdAt(LocalDateTime.now())
                .build();

        when(secretaryOfficeClassService.getAssignedClass(2, "teacher.one")).thenReturn(new SecretaryClassDTO());
        when(repository.findAllByTenantIdAndTeacherIdAndClassIdOrderByCreatedAtDesc(TENANT, "8", "2"))
                .thenReturn(List.of(assignment));

        List<TeacherAssignment> result = service.list("8", "2", "teacher.one");

        assertThat(result).containsExactly(assignment);
    }

    @Test
    void createShouldRejectWhenTeacherNotAssignedToClass() {
        TeacherAssignmentRequest request = validRequest();
        request.setTeacherName("teacher.two");

        when(secretaryOfficeClassService.getAssignedClass(2, "teacher.two")).thenReturn(null);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void createShouldRejectMissingTeacherName() {
        TeacherAssignmentRequest request = validRequest();
        request.setTeacherName("   ");

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void listShouldRejectMissingTeacherNameWhenClassFilterIsProvided() {
        assertThatThrownBy(() -> service.list("8", "2", " "))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void updateShouldPersistUpdatedAssignment() {
        TeacherAssignment existing = TeacherAssignment.builder()
                .id(1L)
                .tenantId(TENANT)
                .teacherId("8")
                .classId("2")
                .className("2A")
                .title("Old")
                .dueDate(LocalDate.now())
                .createdBy("teacher.one")
                .createdAt(LocalDateTime.now())
                .build();

        TeacherAssignmentRequest request = validRequest();
        request.setTitle("Updated title");

        SecretaryClassDTO assignedClass = new SecretaryClassDTO();
        assignedClass.setName("2A Updated");

        when(secretaryOfficeClassService.getAssignedClass(2, "teacher.one")).thenReturn(assignedClass);
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(TeacherAssignment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TeacherAssignment updated = service.update(1L, request);

        assertThat(updated.getTitle()).isEqualTo("Updated title");
        assertThat(updated.getClassName()).isEqualTo("2A Updated");
        verify(repository).save(existing);
    }

    @Test
    void deleteShouldRejectDifferentTeacherContent() {
        TeacherAssignment existing = TeacherAssignment.builder()
                .id(1L)
                .tenantId(TENANT)
                .teacherId("8")
                .classId("2")
                .title("Ex 1")
                .dueDate(LocalDate.now())
                .createdBy("teacher.one")
                .createdAt(LocalDateTime.now())
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.delete(1L, "10", "teacher.one"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void deleteShouldRejectMissingTeacherName() {
        TeacherAssignment existing = TeacherAssignment.builder()
                .id(1L)
                .tenantId(TENANT)
                .teacherId("8")
                .classId("2")
                .title("Ex 1")
                .dueDate(LocalDate.now())
                .createdBy("teacher.one")
                .createdAt(LocalDateTime.now())
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.delete(1L, "8", " "))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    private TeacherAssignmentRequest validRequest() {
        TeacherAssignmentRequest request = new TeacherAssignmentRequest();
        request.setTeacherId("8");
        request.setTeacherName("teacher.one");
        request.setClassId("2");
        request.setClassName("2A");
        request.setTitle("Exercise 1");
        request.setDescription("Read chapter 1");
        request.setDueDate(LocalDate.now().toString());
        request.setCreatedBy("teacher.one");
        return request;
    }
}
