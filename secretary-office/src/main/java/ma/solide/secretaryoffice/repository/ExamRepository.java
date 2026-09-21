package ma.solide.secretaryoffice.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Exam;

public interface ExamRepository extends JpaRepository<Exam, Integer> {
    List<Exam> findAllBySchoolIdOrderByDateAscStartTimeAsc(String schoolId);
    List<Exam> findBySchoolIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(String schoolId, LocalDate from);
    List<Exam> findBySchoolIdAndClassNameOrderByDateAscStartTimeAsc(String schoolId, String className);
    java.util.Optional<Exam> findByIdAndSchoolId(Integer id, String schoolId);
    boolean existsByIdAndSchoolId(Integer id, String schoolId);
}


