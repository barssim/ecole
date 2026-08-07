package ma.solide.studentservice.repository;

import java.util.List;

import ma.solide.studentservice.model.StudentGrade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentGradeRepository extends JpaRepository<StudentGrade, Long> {

    List<StudentGrade> findAllByTenantIdAndStudentIdOrderByDateDesc(String tenantId, String studentId);

    List<StudentGrade> findAllByTenantIdAndStudentIdAndClassIdOrderByDateDesc(String tenantId, String studentId, String classId);

    List<StudentGrade> findAllByTenantIdOrderByDateDesc(String tenantId);
}

