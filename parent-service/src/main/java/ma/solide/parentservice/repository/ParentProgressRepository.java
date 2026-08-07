package ma.solide.parentservice.repository;

import java.util.List;

import ma.solide.parentservice.model.ParentProgressRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentProgressRepository extends JpaRepository<ParentProgressRecord, Long> {

    List<ParentProgressRecord> findAllByTenantIdAndStudentNameOrderByDateDesc(String tenantId, String studentName);

    List<ParentProgressRecord> findAllByTenantIdOrderByDateDesc(String tenantId);
}

