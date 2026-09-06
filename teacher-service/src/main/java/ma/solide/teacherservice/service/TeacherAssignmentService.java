package ma.solide.teacherservice.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import ma.solide.teacherservice.dto.SecretaryClassDTO;
import ma.solide.teacherservice.dto.TeacherAssignmentRequest;
import ma.solide.teacherservice.model.TeacherAssignment;
import ma.solide.teacherservice.repository.TeacherAssignmentRepository;
import ma.solide.teacherservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TeacherAssignmentService {

    private final TeacherAssignmentRepository repository;
    private final SecretaryOfficeClassService secretaryOfficeClassService;

    public TeacherAssignmentService(TeacherAssignmentRepository repository,
                                    SecretaryOfficeClassService secretaryOfficeClassService) {
        this.repository = repository;
        this.secretaryOfficeClassService = secretaryOfficeClassService;
    }

    public List<TeacherAssignment> list(String teacherId, String classId, String teacherName) {
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
            return repository.findAllByTenantIdAndTeacherIdAndClassIdOrderByCreatedAtDesc(
                    tenantId,
                    teacherId.trim(),
                    classId.trim()
            );
        }
        if (hasTeacher) {
            return repository.findAllByTenantIdAndTeacherIdOrderByCreatedAtDesc(tenantId, teacherId.trim());
        }
        if (hasClass) {
            return repository.findAllByTenantIdAndClassIdOrderByCreatedAtDesc(tenantId, classId.trim());
        }
        return repository.findAllByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    public TeacherAssignment create(TeacherAssignmentRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        validateRequest(request);
        SecretaryClassDTO assignedClass = validateTeacherAssignment(request.getClassId(), request.getTeacherName());

        TeacherAssignment entity = TeacherAssignment.builder()
                .tenantId(tenantId)
                .teacherId(request.getTeacherId().trim())
                .classId(request.getClassId().trim())
                .className(resolveClassName(request.getClassName(), assignedClass))
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
        String tenantId = TenantContext.getRequiredTenantId();
        validateRequest(request);
        SecretaryClassDTO assignedClass = validateTeacherAssignment(request.getClassId(), request.getTeacherName());

        TeacherAssignment entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (!tenantId.equals(entity.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found");
        }

        entity.setTeacherId(request.getTeacherId().trim());
        entity.setClassId(request.getClassId().trim());
        entity.setClassName(resolveClassName(request.getClassName(), assignedClass));
        entity.setTitle(request.getTitle().trim());
        entity.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null);
        entity.setAttachmentName(StringUtils.hasText(request.getAttachmentName()) ? request.getAttachmentName().trim() : null);
        entity.setAttachmentUrl(StringUtils.hasText(request.getAttachmentUrl()) ? request.getAttachmentUrl().trim() : null);
        entity.setDueDate(LocalDate.parse(request.getDueDate().trim()));

        return repository.save(entity);
    }

    public void delete(Long id, String teacherId, String teacherName) {
        String tenantId = TenantContext.getRequiredTenantId();
        TeacherAssignment entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (!tenantId.equals(entity.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found");
        }
        if (StringUtils.hasText(teacherId) && !entity.getTeacherId().equals(teacherId.trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own assignments");
        }
        if (!StringUtils.hasText(teacherName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherName is required");
        }
        validateTeacherAssignment(entity.getClassId(), teacherName);
        repository.delete(entity);
    }

    private void validateRequest(TeacherAssignmentRequest request) {
        if (!StringUtils.hasText(request.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherId is required");
        }
        if (!StringUtils.hasText(request.getClassId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId is required");
        }
        if (!StringUtils.hasText(request.getTeacherName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherName is required");
        }
        if (!StringUtils.hasText(request.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (!StringUtils.hasText(request.getDueDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dueDate is required");
        }
    }

    private SecretaryClassDTO validateTeacherAssignment(String classId, String teacherName) {
        Integer classIdValue = parseClassId(classId);
        SecretaryClassDTO assignedClass = secretaryOfficeClassService.getAssignedClass(classIdValue, teacherName);
        if (assignedClass == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can manage exercises only for your assigned classes");
        }
        return assignedClass;
    }

    private Integer parseClassId(String classId) {
        if (!StringUtils.hasText(classId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId is required");
        }
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
