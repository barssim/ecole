package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.TeacherCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherCourseRepository extends JpaRepository<TeacherCourse, Long> {

    List<TeacherCourse> findAllBySchoolIdAndTeacherIdOrderByUploadedAtDesc(String schoolId, String teacherId);

    List<TeacherCourse> findAllBySchoolIdAndClassIdOrderByUploadedAtDesc(String schoolId, String classId);

    List<TeacherCourse> findAllBySchoolIdAndTeacherIdAndClassIdOrderByUploadedAtDesc(
            String schoolId, String teacherId, String classId);

    List<TeacherCourse> findAllBySchoolIdOrderByUploadedAtDesc(String schoolId);
}

