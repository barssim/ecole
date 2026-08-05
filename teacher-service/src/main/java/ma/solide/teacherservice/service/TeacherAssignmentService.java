package ma.solide.teacherservice.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    public TeacherAssignmentService(TeacherAssignmentRepository repository) {
        this.repository = repository;
    }

    public List<TeacherAssignment> list(String teacherId, String classId) {
        String tenantId = TenantContext.getRequiredTenantId();
        boolean hasTeacher = StringUtils.hasText(teacherId);
        boolean hasClass = StringUtils.hasText(classId);

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

        TeacherAssignment entity = TeacherAssignment.builder()
                .tenantId(tenantId)
                .teacherId(request.getTeacherId().trim())
                .classId(request.getClassId().trim())
                .className(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null)
                .title(request.getTitle().trim())
                .description(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null)
                .dueDate(LocalDate.parse(request.getDueDate().trim()))
                .createdBy(StringUtils.hasText(request.getCreatedBy()) ? request.getCreatedBy().trim() : "teacher")
                .createdAt(LocalDateTime.now())
                .build();

        return repository.save(entity);
    }

    public TeacherAssignment update(Long id, TeacherAssignmentRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        validateRequest(request);

        TeacherAssignment entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (!tenantId.equals(entity.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found");
        }

        entity.setTeacherId(request.getTeacherId().trim());
        entity.setClassId(request.getClassId().trim());
        entity.setClassName(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null);
        entity.setTitle(request.getTitle().trim());
        entity.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null);
        entity.setDueDate(LocalDate.parse(request.getDueDate().trim()));

        return repository.save(entity);
    }

    public void delete(Long id) {
        String tenantId = TenantContext.getRequiredTenantId();
        TeacherAssignment entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (!tenantId.equals(entity.getTenantId())) {
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
}

