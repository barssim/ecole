package ma.solide.parentservice.service;

import java.util.List;

import ma.solide.parentservice.model.ParentAttendanceRecord;
import ma.solide.parentservice.repository.ParentAttendanceRepository;
import ma.solide.parentservice.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ParentAttendanceService {

    private final ParentAttendanceRepository repository;

    public ParentAttendanceService(ParentAttendanceRepository repository) {
        this.repository = repository;
    }

    public List<ParentAttendanceRecord> list(String studentName) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (StringUtils.hasText(studentName)) {
            return repository.findAllByTenantIdAndStudentNameOrderByDateDesc(tenantId, studentName.trim());
        }
        return repository.findAllByTenantIdOrderByDateDesc(tenantId);
    }
}

