package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.TeacherCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherCourseRepository extends JpaRepository<TeacherCourse, Long> {

    List<TeacherCourse> findAllByTenantIdAndTeacherIdOrderByUploadedAtDesc(String tenantId, String teacherId);

    List<TeacherCourse> findAllByTenantIdOrderByUploadedAtDesc(String tenantId);
}

