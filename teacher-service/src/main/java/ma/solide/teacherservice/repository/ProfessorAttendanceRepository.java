package ma.solide.teacherservice.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import ma.solide.teacherservice.model.ProfessorAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfessorAttendanceRepository extends JpaRepository<ProfessorAttendance, Long> {

    List<ProfessorAttendance> findAllBySchoolIdAndAttendanceDateOrderByTeacherNameAsc(String schoolId, LocalDate date);

    Optional<ProfessorAttendance> findBySchoolIdAndTeacherIdAndAttendanceDate(
            String schoolId,
            Integer teacherId,
            LocalDate date
    );

    List<ProfessorAttendance> findAllBySchoolIdAndTeacherIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
            String schoolId,
            Integer teacherId,
            LocalDate startDate,
            LocalDate endDate
    );
}

