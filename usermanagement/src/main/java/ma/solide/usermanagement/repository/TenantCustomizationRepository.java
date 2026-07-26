package ma.solide.usermanagement.repository;

import ma.solide.usermanagement.model.TenantCustomization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantCustomizationRepository extends JpaRepository<TenantCustomization, String> {
}

