package ma.solide.parentservice.repository;

import java.util.List;

import ma.solide.parentservice.model.AttestationRequestRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttestationRequestRepository extends JpaRepository<AttestationRequestRecord, Long> {

    List<AttestationRequestRecord> findAllByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<AttestationRequestRecord> findAllByTenantIdAndUserIdOrderByCreatedAtDesc(String tenantId, Integer userId);
}

