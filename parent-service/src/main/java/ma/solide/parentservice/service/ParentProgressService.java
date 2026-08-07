package ma.solide.parentservice.service;

import java.util.List;

import ma.solide.parentservice.model.ParentProgressRecord;
import ma.solide.parentservice.repository.ParentProgressRepository;
import ma.solide.parentservice.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ParentProgressService {

    private final ParentProgressRepository repository;

    public ParentProgressService(ParentProgressRepository repository) {
        this.repository = repository;
    }

    public List<ParentProgressRecord> list(String studentName) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (StringUtils.hasText(studentName)) {
            return repository.findAllByTenantIdAndStudentNameOrderByDateDesc(tenantId, studentName.trim());
        }
        return repository.findAllByTenantIdOrderByDateDesc(tenantId);
    }
}

