package ma.solide.finance_manager.repository;

import ma.solide.finance_manager.entity.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Integer> {
    List<Facture> findByTenantIdOrderByGeneratedDateDescIdDesc(String tenantId);

    List<Facture> findByTenantId(String tenantId);
}

