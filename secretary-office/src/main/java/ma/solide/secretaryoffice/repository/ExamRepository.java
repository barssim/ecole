package ma.solide.secretaryoffice.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Exam;

public interface ExamRepository extends JpaRepository<Exam, Integer> {
    List<Exam> findAllByOrderByDateAscStartTimeAsc();
    List<Exam> findByDateGreaterThanEqualOrderByDateAscStartTimeAsc(LocalDate from);
    List<Exam> findByClassNameOrderByDateAscStartTimeAsc(String className);
}

