package ma.solide.teacherservice.service;

import java.time.LocalDateTime;
import java.util.List;

import ma.solide.teacherservice.dto.SecretaryClassDTO;
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
    private final SecretaryOfficeClassService secretaryOfficeClassService;

    public TeacherCourseService(TeacherCourseRepository teacherCourseRepository,
                                SecretaryOfficeClassService secretaryOfficeClassService) {
        this.teacherCourseRepository = teacherCourseRepository;
        this.secretaryOfficeClassService = secretaryOfficeClassService;
    }

    public List<TeacherCourse> listCourses(String teacherId, String teacherName, String classId) {
        String tenantId = TenantContext.getRequiredTenantId();
        boolean hasTeacher = StringUtils.hasText(teacherId);
        boolean hasClass = StringUtils.hasText(classId);

        if (hasClass) {
            if (!StringUtils.hasText(teacherName)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherName is required");
            }
            validateTeacherAssignment(classId, teacherName);
        }

        if (hasTeacher && hasClass) {
            return teacherCourseRepository.findAllByTenantIdAndTeacherIdAndClassIdOrderByUploadedAtDesc(
                    tenantId,
                    teacherId.trim(),
                    classId.trim()
            );
        }
        if (hasClass) {
            return teacherCourseRepository.findAllByTenantIdAndClassIdOrderByUploadedAtDesc(tenantId, classId.trim());
        }
        if (StringUtils.hasText(teacherId)) {
            return teacherCourseRepository.findAllByTenantIdAndTeacherIdOrderByUploadedAtDesc(tenantId, teacherId.trim());
        }
        return teacherCourseRepository.findAllByTenantIdOrderByUploadedAtDesc(tenantId);
    }

    public TeacherCourse createCourse(TeacherCourseRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        validateRequest(request);
        SecretaryClassDTO assignedClass = validateTeacherAssignment(request.getClassId(), request.getTeacherName());

        TeacherCourse course = TeacherCourse.builder()
                .tenantId(tenantId)
                .teacherId(request.getTeacherId().trim())
                .classId(request.getClassId().trim())
                .className(resolveClassName(request.getClassName(), assignedClass))
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

    public TeacherCourse updateCourse(Long courseId, TeacherCourseRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        validateRequest(request);
        SecretaryClassDTO assignedClass = validateTeacherAssignment(request.getClassId(), request.getTeacherName());

        TeacherCourse course = teacherCourseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        if (!tenantId.equals(course.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }

        course.setTeacherId(request.getTeacherId().trim());
        course.setClassId(request.getClassId().trim());
        course.setClassName(resolveClassName(request.getClassName(), assignedClass));
        course.setName(request.getName().trim());
        course.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null);
        course.getFiles().clear();
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

    public void deleteCourse(Long courseId, String teacherId, String teacherName) {
        String tenantId = TenantContext.getRequiredTenantId();
        TeacherCourse course = teacherCourseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!tenantId.equals(course.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        if (StringUtils.hasText(teacherId) && !course.getTeacherId().equals(teacherId.trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own courses");
        }
        if (!StringUtils.hasText(teacherName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherName is required");
        }
        validateTeacherAssignment(course.getClassId(), teacherName);

        teacherCourseRepository.delete(course);
    }

    private void validateRequest(TeacherCourseRequest request) {
        if (!StringUtils.hasText(request.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherId is required");
        }
        if (!StringUtils.hasText(request.getTeacherName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherName is required");
        }
        if (!StringUtils.hasText(request.getClassId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId is required");
        }
        if (!StringUtils.hasText(request.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
    }

    private SecretaryClassDTO validateTeacherAssignment(String classId, String teacherName) {
        Integer classIdValue = parseClassId(classId);
        SecretaryClassDTO assignedClass = secretaryOfficeClassService.getAssignedClass(classIdValue, teacherName);
        if (assignedClass == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can manage courses only for your assigned classes");
        }
        return assignedClass;
    }

    private Integer parseClassId(String classId) {
        try {
            return Integer.valueOf(classId.trim());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId must be numeric");
        }
    }

    private String resolveClassName(String className, SecretaryClassDTO assignedClass) {
        if (assignedClass != null && StringUtils.hasText(assignedClass.getName())) {
            return assignedClass.getName().trim();
        }
        return StringUtils.hasText(className) ? className.trim() : null;
    }
}
