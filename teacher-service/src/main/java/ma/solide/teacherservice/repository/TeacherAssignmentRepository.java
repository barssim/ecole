package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {

    List<TeacherAssignment> findAllByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<TeacherAssignment> findAllByTenantIdAndTeacherIdOrderByCreatedAtDesc(String tenantId, String teacherId);

    List<TeacherAssignment> findAllByTenantIdAndClassIdOrderByCreatedAtDesc(String tenantId, String classId);

    List<TeacherAssignment> findAllByTenantIdAndTeacherIdAndClassIdOrderByCreatedAtDesc(
            String tenantId,
            String teacherId,
            String classId
    );
}

