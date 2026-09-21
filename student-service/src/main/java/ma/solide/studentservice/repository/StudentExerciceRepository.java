package ma.solide.studentservice.repository;

import java.util.List;

import ma.solide.studentservice.model.StudentExercice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentExerciceRepository extends JpaRepository<StudentExercice, Long> {

    List<StudentExercice> findAllBySchoolIdAndStudentIdOrderByDueDateAscCreatedAtDesc(String schoolId, String studentId);

    List<StudentExercice> findAllBySchoolIdOrderByDueDateAscCreatedAtDesc(String schoolId);

    List<StudentExercice> findAllBySchoolIdAndStudentIdAndClassIdOrderByDueDateAscCreatedAtDesc(
            String schoolId,
            String studentId,
            String classId
    );
}




