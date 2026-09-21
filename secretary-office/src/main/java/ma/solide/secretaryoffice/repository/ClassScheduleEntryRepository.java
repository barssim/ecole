package ma.solide.secretaryoffice.repository;

import java.util.List;

import ma.solide.secretaryoffice.model.ClassScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassScheduleEntryRepository extends JpaRepository<ClassScheduleEntry, Long> {

    List<ClassScheduleEntry> findAllBySchoolIdAndClassIdOrderByDayAscSlotOrderAsc(String schoolId, Integer classId);

    java.util.Optional<ClassScheduleEntry> findByIdAndSchoolId(Long id, String schoolId);
}


