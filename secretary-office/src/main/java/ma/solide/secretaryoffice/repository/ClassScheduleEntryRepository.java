package ma.solide.secretaryoffice.repository;

import java.util.List;

import ma.solide.secretaryoffice.model.ClassScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassScheduleEntryRepository extends JpaRepository<ClassScheduleEntry, Long> {

    List<ClassScheduleEntry> findAllByTenantIdAndClassIdOrderByDayAscSlotOrderAsc(String tenantId, Integer classId);

    java.util.Optional<ClassScheduleEntry> findByIdAndTenantId(Long id, String tenantId);
}

