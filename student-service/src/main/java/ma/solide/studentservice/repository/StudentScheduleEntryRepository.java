package ma.solide.studentservice.repository;

import java.util.List;

import ma.solide.studentservice.model.StudentScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentScheduleEntryRepository extends JpaRepository<StudentScheduleEntry, Long> {

    List<StudentScheduleEntry> findAllBySchoolIdAndStudentIdOrderByDayAscSlotOrderAsc(String schoolId, String studentId);

    List<StudentScheduleEntry> findAllBySchoolIdOrderByStudentIdAscDayAscSlotOrderAsc(String schoolId);
}


