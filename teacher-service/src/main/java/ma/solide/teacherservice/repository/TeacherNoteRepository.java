package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.TeacherNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherNoteRepository extends JpaRepository<TeacherNote, Long> {

    List<TeacherNote> findAllBySchoolIdOrderByDateDescIdDesc(String schoolId);

    List<TeacherNote> findAllBySchoolIdAndTeacherIdOrderByDateDescIdDesc(String schoolId, String teacherId);

    List<TeacherNote> findAllBySchoolIdAndClassIdOrderByDateDescIdDesc(String schoolId, String classId);

    List<TeacherNote> findAllBySchoolIdAndTeacherIdAndClassIdOrderByDateDescIdDesc(
            String schoolId,
            String teacherId,
            String classId
    );
}

