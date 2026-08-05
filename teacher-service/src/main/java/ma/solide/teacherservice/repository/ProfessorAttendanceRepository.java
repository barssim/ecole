package ma.solide.teacherservice.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import ma.solide.teacherservice.model.ProfessorAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorAttendanceRepository extends JpaRepository<ProfessorAttendance, Long> {

    List<ProfessorAttendance> findAllByTenantIdAndAttendanceDateOrderByTeacherNameAsc(String tenantId, LocalDate date);

    Optional<ProfessorAttendance> findByTenantIdAndTeacherIdAndAttendanceDate(
            String tenantId,
            Integer teacherId,
            LocalDate date
    );
}

