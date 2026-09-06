package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.TeacherCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherCourseRepository extends JpaRepository<TeacherCourse, Long> {

    List<TeacherCourse> findAllByTenantIdOrderByUploadedAtDesc(String tenantId);

    List<TeacherCourse> findAllByTenantIdAndTeacherIdOrderByUploadedAtDesc(String tenantId, String teacherId);

    List<TeacherCourse> findAllByTenantIdAndClassIdOrderByUploadedAtDesc(String tenantId, String classId);

    List<TeacherCourse> findAllByTenantIdAndTeacherIdAndClassIdOrderByUploadedAtDesc(
            String tenantId,
            String teacherId,
            String classId
    );
}
