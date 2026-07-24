package ma.solide.secretaryoffice.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Exam;

public interface ExamRepository extends JpaRepository<Exam, Integer> {
    List<Exam> findAllByTenantIdOrderByDateAscStartTimeAsc(String tenantId);
    List<Exam> findByTenantIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(String tenantId, LocalDate from);
    List<Exam> findByTenantIdAndClassNameOrderByDateAscStartTimeAsc(String tenantId, String className);
    java.util.Optional<Exam> findByIdAndTenantId(Integer id, String tenantId);
    boolean existsByIdAndTenantId(Integer id, String tenantId);
}

