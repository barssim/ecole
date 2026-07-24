package ma.solide.secretaryoffice.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.ProfessorAttendance;

public interface ProfessorAttendanceRepository extends JpaRepository<ProfessorAttendance, Integer> {
    List<ProfessorAttendance> findAllByTenantIdAndAttendanceDateOrderByTeacherNameAsc(String tenantId, LocalDate attendanceDate);
    Optional<ProfessorAttendance> findByTenantIdAndTeacherIdAndAttendanceDate(String tenantId, Integer teacherId, LocalDate attendanceDate);
}

