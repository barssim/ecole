package ma.solide.schoolactivity.repository;

import java.util.List;
import java.util.Optional;

import ma.solide.schoolactivity.model.SchoolActivity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolActivityRepository extends JpaRepository<SchoolActivity, Integer> {

    List<SchoolActivity> findAllByTenantIdOrderByDateAscIdAsc(String tenantId);

    List<SchoolActivity> findByTenantIdAndTypeOrderByDateAscIdAsc(String tenantId, String type);

    Optional<SchoolActivity> findByIdAndTenantId(Integer id, String tenantId);
}

