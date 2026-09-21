package ma.solide.parentservice.repository;

import java.util.List;

import ma.solide.parentservice.model.ParentProgressRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentProgressRepository extends JpaRepository<ParentProgressRecord, Long> {

    List<ParentProgressRecord> findAllBySchoolIdAndStudentNameOrderByDateDesc(String schoolId, String studentName);

    List<ParentProgressRecord> findAllBySchoolIdOrderByDateDesc(String schoolId);
}
