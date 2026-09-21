package ma.solide.studentservice.repository;

import java.util.List;

import ma.solide.studentservice.model.StudentGrade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentGradeRepository extends JpaRepository<StudentGrade, Long> {

    List<StudentGrade> findAllBySchoolIdAndStudentIdOrderByDateDesc(String schoolId, String studentId);

    List<StudentGrade> findAllBySchoolIdAndStudentIdAndClassIdOrderByDateDesc(String schoolId, String studentId, String classId);

    List<StudentGrade> findAllBySchoolIdOrderByDateDesc(String schoolId);
}


