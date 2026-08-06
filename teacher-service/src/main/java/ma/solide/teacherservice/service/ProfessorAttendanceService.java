package ma.solide.teacherservice.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import ma.solide.teacherservice.dto.ProfessorAttendanceRequestDTO;
import ma.solide.teacherservice.model.ProfessorAttendance;
import ma.solide.teacherservice.repository.ProfessorAttendanceRepository;
import ma.solide.teacherservice.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfessorAttendanceService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("present", "late", "absent");
    private static final LocalTime DEFAULT_SCHEDULED_TIME = LocalTime.of(8, 0);

    private final ProfessorAttendanceRepository repository;
    private final int defaultHistoryDays;
    private final int maxHistoryDays;

    public ProfessorAttendanceService(
            ProfessorAttendanceRepository repository,
            @Value("${teacher.attendance.history.default-days:7}") int defaultHistoryDays,
            @Value("${teacher.attendance.history.max-days:365}") int maxHistoryDays) {
        this.repository = repository;
        int sanitizedMaxHistoryDays = maxHistoryDays > 0 ? maxHistoryDays : 365;
        this.maxHistoryDays = sanitizedMaxHistoryDays;
        this.defaultHistoryDays = defaultHistoryDays > 0
                ? Math.min(defaultHistoryDays, sanitizedMaxHistoryDays)
                : 7;
    }

    public List<ProfessorAttendance> getAttendanceForDate(LocalDate attendanceDate) {
        String tenantId = TenantContext.getRequiredTenantId();
        LocalDate effectiveDate = attendanceDate != null ? attendanceDate : LocalDate.now();
        return repository.findAllByTenantIdAndAttendanceDateOrderByTeacherNameAsc(tenantId, effectiveDate);
    }

    public ProfessorAttendance getTeacherAttendance(Integer teacherId, LocalDate attendanceDate) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (teacherId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherId is required");
        }

        LocalDate effectiveDate = attendanceDate != null ? attendanceDate : LocalDate.now();
        return repository.findByTenantIdAndTeacherIdAndAttendanceDate(tenantId, teacherId, effectiveDate)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance not found"));
    }

    public List<ProfessorAttendance> getTeacherAttendanceHistory(Integer teacherId, LocalDate endDate, Integer days) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (teacherId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherId is required");
        }

        int effectiveDays = (days == null || days < 1)
                ? defaultHistoryDays
                : Math.min(days, maxHistoryDays);
        LocalDate effectiveEndDate = endDate != null ? endDate : LocalDate.now();
        LocalDate startDate = effectiveEndDate.minusDays(effectiveDays - 1L);

        return repository.findAllByTenantIdAndTeacherIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                tenantId,
                teacherId,
                startDate,
                effectiveEndDate
        );
    }

    public ProfessorAttendance saveAttendance(ProfessorAttendanceRequestDTO dto) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (dto.getTeacherId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherId is required");
        }
        if (!StringUtils.hasText(dto.getTeacherName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teacherName is required");
        }
        if (!StringUtils.hasText(dto.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }

        String normalizedStatus = dto.getStatus().trim().toLowerCase();
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status. Allowed values: " + ALLOWED_STATUSES);
        }

        LocalDate effectiveDate = dto.getAttendanceDate() != null ? dto.getAttendanceDate() : LocalDate.now();
        ProfessorAttendance attendance = repository
                .findByTenantIdAndTeacherIdAndAttendanceDate(tenantId, dto.getTeacherId(), effectiveDate)
                .orElseGet(() -> ProfessorAttendance.builder()
                        .tenantId(tenantId)
                        .teacherId(dto.getTeacherId())
                        .attendanceDate(effectiveDate)
                        .build());

        attendance.setTeacherName(dto.getTeacherName().trim());
        attendance.setScheduledTime(dto.getScheduledTime() != null ? dto.getScheduledTime() : DEFAULT_SCHEDULED_TIME);
        attendance.setStatus(normalizedStatus);
        attendance.setNotes(StringUtils.hasText(dto.getNotes()) ? dto.getNotes().trim() : null);
        attendance.setCheckInTime(resolveCheckInTime(normalizedStatus, dto.getCheckInTime(), attendance.getCheckInTime()));
        attendance.setUpdatedAt(LocalDateTime.now());

        return repository.save(attendance);
    }

    private LocalTime resolveCheckInTime(String status, LocalTime providedCheckInTime, LocalTime existingCheckInTime) {
        if ("absent".equals(status)) {
            return null;
        }
        if (providedCheckInTime != null) {
            return providedCheckInTime;
        }
        if (existingCheckInTime != null) {
            return existingCheckInTime;
        }
        return LocalTime.now().withSecond(0).withNano(0);
    }
}

