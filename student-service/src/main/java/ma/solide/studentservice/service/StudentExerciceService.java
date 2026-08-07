package ma.solide.studentservice.service;

import java.time.LocalDateTime;
import java.util.List;

import ma.solide.studentservice.dto.StudentExerciceRequest;
import ma.solide.studentservice.model.StudentExercice;
import ma.solide.studentservice.repository.StudentExerciceRepository;
import ma.solide.studentservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudentExerciceService {

    private static final String DEFAULT_STATUS = "pending";

    private final StudentExerciceRepository studentExerciceRepository;

    public StudentExerciceService(StudentExerciceRepository studentExerciceRepository) {
        this.studentExerciceRepository = studentExerciceRepository;
    }

    public List<StudentExercice> listExercises(String studentId, String classId) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (StringUtils.hasText(studentId) && StringUtils.hasText(classId)) {
            return studentExerciceRepository.findAllByTenantIdAndStudentIdAndClassIdOrderByDueDateAscCreatedAtDesc(
                    tenantId,
                    studentId.trim(),
                    classId.trim()
            );
        }
        if (StringUtils.hasText(studentId)) {
            return studentExerciceRepository.findAllByTenantIdAndStudentIdOrderByDueDateAscCreatedAtDesc(
                    tenantId,
                    studentId.trim()
            );
        }
        return studentExerciceRepository.findAllByTenantIdOrderByDueDateAscCreatedAtDesc(tenantId);
    }

    public StudentExercice createExercise(StudentExerciceRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request body is required");
        }
        if (!StringUtils.hasText(request.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is required");
        }
        if (!StringUtils.hasText(request.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (!StringUtils.hasText(request.getSubject())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subject is required");
        }

        StudentExercice exercise = StudentExercice.builder()
                .tenantId(tenantId)
                .studentId(request.getStudentId().trim())
                .title(request.getTitle().trim())
                .description(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null)
                .subject(request.getSubject().trim())
                .classId(StringUtils.hasText(request.getClassId()) ? request.getClassId().trim() : null)
                .className(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null)
                .dueDate(request.getDueDate())
                .attachmentUrl(StringUtils.hasText(request.getAttachmentUrl()) ? request.getAttachmentUrl().trim() : null)
                .attachmentName(StringUtils.hasText(request.getAttachmentName()) ? request.getAttachmentName().trim() : null)
                .createdBy(StringUtils.hasText(request.getCreatedBy()) ? request.getCreatedBy().trim() : null)
                .status(StringUtils.hasText(request.getStatus()) ? request.getStatus().trim().toLowerCase() : DEFAULT_STATUS)
                .createdAt(LocalDateTime.now())
                .build();

        return studentExerciceRepository.save(exercise);
    }

    public void deleteExercise(Long exerciseId) {
        String tenantId = TenantContext.getRequiredTenantId();
        StudentExercice exercise = studentExerciceRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        if (!tenantId.equals(exercise.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found");
        }

        studentExerciceRepository.delete(exercise);
    }
}


