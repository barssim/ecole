package ma.solide.secretaryoffice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.secretaryoffice.model.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findAllByTenantIdOrderByDateAscIdAsc(String tenantId);
    List<Activity> findByTenantIdAndTypeOrderByDateAscIdAsc(String tenantId, String type);
    List<Activity> findByTenantIdAndTypeAndClassNameInOrderByDateAscIdAsc(String tenantId, String type, List<String> classNames);
    List<Activity> findByTenantIdAndClassNameInOrderByDateAscIdAsc(String tenantId, List<String> classNames);
    java.util.Optional<Activity> findByIdAndTenantId(Integer id, String tenantId);
    boolean existsByIdAndTenantId(Integer id, String tenantId);
}

