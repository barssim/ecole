package ma.solide.parentservice.repository;

import java.util.List;

import ma.solide.parentservice.model.ParentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentRegistrationRepository extends JpaRepository<ParentRegistration, Long> {

    List<ParentRegistration> findAllByTenantIdOrderByCreatedAtDesc(String tenantId);
}

