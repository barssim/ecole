package ma.solide.studentservice.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import ma.solide.studentservice.dto.StudentGradeRequest;
import ma.solide.studentservice.model.StudentGrade;
import ma.solide.studentservice.repository.StudentGradeRepository;
import ma.solide.studentservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudentGradeService {

    private static final BigDecimal DEFAULT_MAX_GRADE = BigDecimal.valueOf(20);

    private final StudentGradeRepository studentGradeRepository;

    public StudentGradeService(StudentGradeRepository studentGradeRepository) {
        this.studentGradeRepository = studentGradeRepository;
    }

    public List<StudentGrade> listGrades(String studentId, String classId) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (StringUtils.hasText(studentId) && StringUtils.hasText(classId)) {
            return studentGradeRepository.findAllByTenantIdAndStudentIdAndClassIdOrderByDateDesc(
                    tenantId,
                    studentId.trim(),
                    classId.trim()
            );
        }
        if (StringUtils.hasText(studentId)) {
            return studentGradeRepository.findAllByTenantIdAndStudentIdOrderByDateDesc(tenantId, studentId.trim());
        }
        return studentGradeRepository.findAllByTenantIdOrderByDateDesc(tenantId);
    }

    public StudentGrade createGrade(StudentGradeRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request body is required");
        }
        if (!StringUtils.hasText(request.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is required");
        }
        if (!StringUtils.hasText(request.getSubject())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subject is required");
        }
        if (request.getGrade() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "grade is required");
        }

        StudentGrade grade = StudentGrade.builder()
                .tenantId(tenantId)
                .studentId(request.getStudentId().trim())
                .studentName(StringUtils.hasText(request.getStudentName()) ? request.getStudentName().trim() : null)
                .subject(request.getSubject().trim())
                .grade(request.getGrade())
                .maxGrade(request.getMaxGrade() == null ? DEFAULT_MAX_GRADE : request.getMaxGrade())
                .date(request.getDate() == null ? LocalDate.now() : request.getDate())
                .classId(StringUtils.hasText(request.getClassId()) ? request.getClassId().trim() : null)
                .className(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null)
                .teacherName(StringUtils.hasText(request.getTeacherName()) ? request.getTeacherName().trim() : null)
                .build();

        return studentGradeRepository.save(grade);
    }

    public void deleteGrade(Long gradeId) {
        String tenantId = TenantContext.getRequiredTenantId();
        StudentGrade grade = studentGradeRepository.findById(gradeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Grade not found"));

        if (!tenantId.equals(grade.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Grade not found");
        }

        studentGradeRepository.delete(grade);
    }
}

