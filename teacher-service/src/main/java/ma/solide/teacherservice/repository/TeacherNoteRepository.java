package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.TeacherNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherNoteRepository extends JpaRepository<TeacherNote, Long> {

    List<TeacherNote> findAllByTenantIdOrderByDateDescIdDesc(String tenantId);

    List<TeacherNote> findAllByTenantIdAndTeacherIdOrderByDateDescIdDesc(String tenantId, String teacherId);

    List<TeacherNote> findAllByTenantIdAndClassIdOrderByDateDescIdDesc(String tenantId, String classId);

    List<TeacherNote> findAllByTenantIdAndTeacherIdAndClassIdOrderByDateDescIdDesc(
            String tenantId,
            String teacherId,
            String classId
    );
}

