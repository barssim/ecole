package ma.solide.teacherservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import ma.solide.teacherservice.dto.SecretaryClassDTO;
import ma.solide.teacherservice.dto.TeacherCourseFileRequest;
import ma.solide.teacherservice.dto.TeacherCourseRequest;
import ma.solide.teacherservice.model.TeacherCourse;
import ma.solide.teacherservice.repository.TeacherCourseRepository;
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
class TeacherCourseServiceTest {

    private static final String TENANT = "gardinia";

    @Mock
    private TeacherCourseRepository teacherCourseRepository;

    @Mock
    private SecretaryOfficeClassService secretaryOfficeClassService;

    @InjectMocks
    private TeacherCourseService service;

    @BeforeEach
    void setTenant() {
        TenantContext.setTenantId(TENANT);
    }

    @AfterEach
    void clearTenant() {
        TenantContext.clear();
    }

    @Test
    void listShouldScopeToTeacherAndClassWhenProvided() {
        TeacherCourse course = TeacherCourse.builder()
                .id(1L)
                .tenantId(TENANT)
                .teacherId("8")
                .classId("2")
                .name("Math")
                .uploadedAt(LocalDateTime.now())
                .build();

        when(secretaryOfficeClassService.getAssignedClass(2, "teacher.one")).thenReturn(new SecretaryClassDTO());
        when(teacherCourseRepository.findAllByTenantIdAndTeacherIdAndClassIdOrderByUploadedAtDesc(TENANT, "8", "2"))
                .thenReturn(List.of(course));

        List<TeacherCourse> result = service.listCourses("8", "teacher.one", "2");

        assertThat(result).containsExactly(course);
    }

    @Test
    void createShouldRejectMissingClassId() {
        TeacherCourseRequest request = validRequest();
        request.setClassId(" ");

        assertThatThrownBy(() -> service.createCourse(request))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void createShouldRejectUnauthorizedClass() {
        TeacherCourseRequest request = validRequest();
        request.setTeacherName("teacher.two");

        when(secretaryOfficeClassService.getAssignedClass(2, "teacher.two")).thenReturn(null);

        assertThatThrownBy(() -> service.createCourse(request))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void updateShouldPersistEditedCourse() {
        TeacherCourse existing = TeacherCourse.builder()
                .id(1L)
                .tenantId(TENANT)
                .teacherId("8")
                .classId("2")
                .className("2A")
                .name("Old")
                .uploadedAt(LocalDateTime.now())
                .build();

        TeacherCourseRequest request = validRequest();
        request.setName("Updated");

        SecretaryClassDTO assignedClass = new SecretaryClassDTO();
        assignedClass.setName("2A Updated");

        when(secretaryOfficeClassService.getAssignedClass(2, "teacher.one")).thenReturn(assignedClass);
        when(teacherCourseRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(teacherCourseRepository.save(any(TeacherCourse.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TeacherCourse result = service.updateCourse(1L, request);

        assertThat(result.getName()).isEqualTo("Updated");
        assertThat(result.getClassName()).isEqualTo("2A Updated");
        verify(teacherCourseRepository).save(existing);
    }

    @Test
    void deleteShouldRejectDifferentTeacherContent() {
        TeacherCourse existing = TeacherCourse.builder()
                .id(1L)
                .tenantId(TENANT)
                .teacherId("8")
                .classId("2")
                .name("Math")
                .uploadedAt(LocalDateTime.now())
                .build();

        when(teacherCourseRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.deleteCourse(1L, "10", "teacher.one"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(error -> ((ResponseStatusException) error).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    private TeacherCourseRequest validRequest() {
        TeacherCourseRequest request = new TeacherCourseRequest();
        request.setTeacherId("8");
        request.setTeacherName("teacher.one");
        request.setClassId("2");
        request.setClassName("2A");
        request.setName("Math Chapter 1");
        request.setDescription("Basic algebra");

        TeacherCourseFileRequest file = new TeacherCourseFileRequest();
        file.setFilename("chapter1.pdf");
        file.setUrl("http://localhost/files/chapter1.pdf");
        request.setFiles(List.of(file));
        return request;
    }
}
