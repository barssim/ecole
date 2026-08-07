package ma.solide.parentservice.repository;

import java.util.List;

import ma.solide.parentservice.model.ParentAttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentAttendanceRepository extends JpaRepository<ParentAttendanceRecord, Long> {

    List<ParentAttendanceRecord> findAllByTenantIdAndStudentNameOrderByDateDesc(String tenantId, String studentName);

    List<ParentAttendanceRecord> findAllByTenantIdOrderByDateDesc(String tenantId);
}

