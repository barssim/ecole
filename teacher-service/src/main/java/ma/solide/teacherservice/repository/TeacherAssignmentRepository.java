package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {

    List<TeacherAssignment> findAllBySchoolIdOrderByCreatedAtDesc(String schoolId);

    List<TeacherAssignment> findAllBySchoolIdAndTeacherIdOrderByCreatedAtDesc(String schoolId, String teacherId);

    List<TeacherAssignment> findAllBySchoolIdAndClassIdOrderByCreatedAtDesc(String schoolId, String classId);

    List<TeacherAssignment> findAllBySchoolIdAndTeacherIdAndClassIdOrderByCreatedAtDesc(
            String schoolId,
            String teacherId,
            String classId
    );
}

