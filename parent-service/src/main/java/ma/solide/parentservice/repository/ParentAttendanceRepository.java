package ma.solide.parentservice.repository;

import java.util.List;

import ma.solide.parentservice.model.ParentAttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentAttendanceRepository extends JpaRepository<ParentAttendanceRecord, Long> {

    List<ParentAttendanceRecord> findAllBySchoolIdAndStudentNameOrderByDateDesc(String schoolId, String studentName);

    List<ParentAttendanceRecord> findAllBySchoolIdOrderByDateDesc(String schoolId);
}
