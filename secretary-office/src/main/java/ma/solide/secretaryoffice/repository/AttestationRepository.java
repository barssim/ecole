package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Attestation;

public interface AttestationRepository extends JpaRepository<Attestation, Integer> {

    List<Attestation> findAllByTenantIdOrderByDateDesc(String tenantId);

    List<Attestation> findByTenantIdAndTitleContainingIgnoreCaseOrderByDateDesc(String tenantId, String search);

    List<Attestation> findByTenantIdAndUserIdOrderByDateDesc(String tenantId, Integer userId);

    List<Attestation> findByTenantIdAndUserIdAndTitleContainingIgnoreCaseOrderByDateDesc(String tenantId, Integer userId, String search);

    boolean existsByTenantIdAndUserIdAndTypeAndStatus(String tenantId, Integer userId, String type, String status);

    java.util.Optional<Attestation> findByIdAndTenantId(Integer id, String tenantId);
}

