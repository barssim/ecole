package ma.solide.teacherservice.service;

import java.time.LocalDateTime;
import java.util.List;

import ma.solide.teacherservice.dto.TeacherCourseFileRequest;
import ma.solide.teacherservice.dto.TeacherCourseRequest;
import ma.solide.teacherservice.model.TeacherCourse;
import ma.solide.teacherservice.model.TeacherCourseFile;
import ma.solide.teacherservice.repository.TeacherCourseRepository;
import ma.solide.teacherservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TeacherCourseService {

    private final TeacherCourseRepository teacherCourseRepository;

    public TeacherCourseService(TeacherCourseRepository teacherCourseRepository) {
        this.teacherCourseRepository = teacherCourseRepository;
    }

    public List<TeacherCourse> listCourses(String teacherId) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (StringUtils.hasText(teacherId)) {
            return teacherCourseRepository.findAllByTenantIdAndTeacherIdOrderByUploadedAtDesc(tenantId, teacherId.trim());
        }
        return teacherCourseRepository.findAllByTenantIdOrderByUploadedAtDesc(tenantId);
    }

    public TeacherCourse createCourse(TeacherCourseRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (!StringUtils.hasText(request.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherId is required");
        }
        if (!StringUtils.hasText(request.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }

        TeacherCourse course = TeacherCourse.builder()
                .tenantId(tenantId)
                .teacherId(request.getTeacherId().trim())
                .name(request.getName().trim())
                .description(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null)
                .uploadedAt(LocalDateTime.now())
                .build();

        if (request.getFiles() != null) {
            for (TeacherCourseFileRequest fileRequest : request.getFiles()) {
                if (!StringUtils.hasText(fileRequest.getFilename()) || !StringUtils.hasText(fileRequest.getUrl())) {
                    continue;
                }
                TeacherCourseFile file = TeacherCourseFile.builder()
                        .course(course)
                        .filename(fileRequest.getFilename().trim())
                        .url(fileRequest.getUrl().trim())
                        .build();
                course.getFiles().add(file);
            }
        }

        return teacherCourseRepository.save(course);
    }

    public void deleteCourse(Long courseId) {
        String tenantId = TenantContext.getRequiredTenantId();
        TeacherCourse course = teacherCourseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!tenantId.equals(course.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }

        teacherCourseRepository.delete(course);
    }
}

