package ma.solide.studentservice.repository;

import java.util.List;

import ma.solide.studentservice.model.StudentExercice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentExerciceRepository extends JpaRepository<StudentExercice, Long> {

    List<StudentExercice> findAllByTenantIdAndStudentIdOrderByDueDateAscCreatedAtDesc(String tenantId, String studentId);

    List<StudentExercice> findAllByTenantIdOrderByDueDateAscCreatedAtDesc(String tenantId);

    List<StudentExercice> findAllByTenantIdAndStudentIdAndClassIdOrderByDueDateAscCreatedAtDesc(
            String tenantId,
            String studentId,
            String classId
    );
}



