package ma.solide.teacherservice.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import ma.solide.teacherservice.dto.TeacherAssignmentRequest;
import ma.solide.teacherservice.model.TeacherAssignment;
import ma.solide.teacherservice.repository.TeacherAssignmentRepository;
import ma.solide.teacherservice.school.SchoolContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TeacherAssignmentService {

    private final TeacherAssignmentRepository repository;
    private final SecretaryOfficeClassService secretaryOfficeClassService;

    public TeacherAssignmentService(TeacherAssignmentRepository repository, SecretaryOfficeClassService secretaryOfficeClassService) {
        this.repository = repository;
        this.secretaryOfficeClassService = secretaryOfficeClassService;
    }

    public List<TeacherAssignment> list(String teacherId, String classId) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        boolean hasTeacher = StringUtils.hasText(teacherId);
        boolean hasClass = StringUtils.hasText(classId);

        if (hasTeacher && hasClass) {
            return repository.findAllBySchoolIdAndTeacherIdAndClassIdOrderByCreatedAtDesc(
                    schoolId,
                    teacherId.trim(),
                    classId.trim()
            );
        }
        if (hasTeacher) {
            return repository.findAllBySchoolIdAndTeacherIdOrderByCreatedAtDesc(schoolId, teacherId.trim());
        }
        if (hasClass) {
            return repository.findAllBySchoolIdAndClassIdOrderByCreatedAtDesc(schoolId, classId.trim());
        }
        return repository.findAllBySchoolIdOrderByCreatedAtDesc(schoolId);
    }

    public TeacherAssignment create(TeacherAssignmentRequest request) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        validateRequest(request);
        validateClassAssignment(request);

        TeacherAssignment entity = TeacherAssignment.builder()
                .schoolId(schoolId)
                .teacherId(request.getTeacherId().trim())
                .classId(request.getClassId().trim())
                .className(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null)
                .title(request.getTitle().trim())
                .description(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null)
                .attachmentName(StringUtils.hasText(request.getAttachmentName()) ? request.getAttachmentName().trim() : null)
                .attachmentUrl(StringUtils.hasText(request.getAttachmentUrl()) ? request.getAttachmentUrl().trim() : null)
                .dueDate(LocalDate.parse(request.getDueDate().trim()))
                .createdBy(StringUtils.hasText(request.getCreatedBy()) ? request.getCreatedBy().trim() : "teacher")
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(entity);
    }

    public TeacherAssignment update(Long id, TeacherAssignmentRequest request) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        validateRequest(request);
        validateClassAssignment(request);

        TeacherAssignment entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (!schoolId.equals(entity.getSchoolId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found");
        }

        entity.setTeacherId(request.getTeacherId().trim());
        entity.setClassId(request.getClassId().trim());
        entity.setClassName(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null);
        entity.setTitle(request.getTitle().trim());
        entity.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null);
        entity.setAttachmentName(StringUtils.hasText(request.getAttachmentName()) ? request.getAttachmentName().trim() : null);
        entity.setAttachmentUrl(StringUtils.hasText(request.getAttachmentUrl()) ? request.getAttachmentUrl().trim() : null);
        entity.setDueDate(LocalDate.parse(request.getDueDate().trim()));

        return repository.save(entity);
    }

    public void delete(Long id) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        TeacherAssignment entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (!schoolId.equals(entity.getSchoolId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found");
        }
        repository.delete(entity);
    }

    private void validateRequest(TeacherAssignmentRequest request) {
        if (!StringUtils.hasText(request.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherId is required");
        }
        if (!StringUtils.hasText(request.getClassId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId is required");
        }
        if (!StringUtils.hasText(request.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (!StringUtils.hasText(request.getDueDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dueDate is required");
        }
    }

    private void validateClassAssignment(TeacherAssignmentRequest request) {
        String teacherName = request.getCreatedBy();
        if (!StringUtils.hasText(teacherName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "createdBy (teacher name) is required");
        }

        Integer classId;
        try {
            classId = Integer.valueOf(request.getClassId().trim());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId must be numeric");
        }

        if (secretaryOfficeClassService.getAssignedClass(classId, teacherName) == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this class");
        }
    }
}

