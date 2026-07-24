package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.SchoolClass;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Integer> {

    List<SchoolClass> findAllByTenantIdOrderByNameAsc(String tenantId);

    boolean existsByTenantIdAndNameIgnoreCase(String tenantId, String name);

    java.util.Optional<SchoolClass> findByIdAndTenantId(Integer id, String tenantId);

    boolean existsByIdAndTenantId(Integer id, String tenantId);
}

