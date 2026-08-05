package ma.solide.teacherservice.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import ma.solide.teacherservice.dto.TeacherNoteRequest;
import ma.solide.teacherservice.model.TeacherNote;
import ma.solide.teacherservice.repository.TeacherNoteRepository;
import ma.solide.teacherservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TeacherNoteService {

    private final TeacherNoteRepository repository;

    public TeacherNoteService(TeacherNoteRepository repository) {
        this.repository = repository;
    }

    public List<TeacherNote> list(String teacherId, String classId) {
        String tenantId = TenantContext.getRequiredTenantId();
        boolean hasTeacher = StringUtils.hasText(teacherId);
        boolean hasClass = StringUtils.hasText(classId);

        if (hasTeacher && hasClass) {
            return repository.findAllByTenantIdAndTeacherIdAndClassIdOrderByDateDescIdDesc(
                    tenantId,
                    teacherId.trim(),
                    classId.trim()
            );
        }
        if (hasTeacher) {
            return repository.findAllByTenantIdAndTeacherIdOrderByDateDescIdDesc(tenantId, teacherId.trim());
        }
        if (hasClass) {
            return repository.findAllByTenantIdAndClassIdOrderByDateDescIdDesc(tenantId, classId.trim());
        }
        return repository.findAllByTenantIdOrderByDateDescIdDesc(tenantId);
    }

    public TeacherNote create(TeacherNoteRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        validateRequest(request);

        TeacherNote note = TeacherNote.builder()
                .tenantId(tenantId)
                .teacherId(request.getTeacherId().trim())
                .classId(request.getClassId().trim())
                .className(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null)
                .studentName(request.getStudentName().trim())
                .subject(request.getSubject().trim())
                .grade(toGrade(request.getGrade()))
                .date(parseDateOrToday(request.getDate()))
                .build();

        return repository.save(note);
    }

    public TeacherNote update(Long id, TeacherNoteRequest request) {
        String tenantId = TenantContext.getRequiredTenantId();
        validateRequest(request);

        TeacherNote note = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));
        if (!tenantId.equals(note.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found");
        }

        note.setTeacherId(request.getTeacherId().trim());
        note.setClassId(request.getClassId().trim());
        note.setClassName(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null);
        note.setStudentName(request.getStudentName().trim());
        note.setSubject(request.getSubject().trim());
        note.setGrade(toGrade(request.getGrade()));
        note.setDate(parseDateOrToday(request.getDate()));

        return repository.save(note);
    }

    public void delete(Long id) {
        String tenantId = TenantContext.getRequiredTenantId();
        TeacherNote note = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));
        if (!tenantId.equals(note.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found");
        }
        repository.delete(note);
    }

    private void validateRequest(TeacherNoteRequest request) {
        if (!StringUtils.hasText(request.getTeacherId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherId is required");
        }
        if (!StringUtils.hasText(request.getClassId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classId is required");
        }
        if (!StringUtils.hasText(request.getStudentName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentName is required");
        }
        if (!StringUtils.hasText(request.getSubject())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subject is required");
        }
        if (!StringUtils.hasText(request.getGrade())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "grade is required");
        }
    }

    private BigDecimal toGrade(String gradeInput) {
        try {
            BigDecimal value = new BigDecimal(gradeInput.trim());
            if (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(new BigDecimal("20")) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "grade must be between 0 and 20");
            }
            return value;
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "grade must be numeric");
        }
    }

    private LocalDate parseDateOrToday(String value) {
        if (!StringUtils.hasText(value)) {
            return LocalDate.now();
        }
        return LocalDate.parse(value.trim());
    }
}

