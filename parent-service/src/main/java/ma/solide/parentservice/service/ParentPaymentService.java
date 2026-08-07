package ma.solide.parentservice.service;

import java.util.List;

import ma.solide.parentservice.model.ParentPaymentView;
import ma.solide.parentservice.repository.ParentPaymentRepository;
import ma.solide.parentservice.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ParentPaymentService {

    private final ParentPaymentRepository repository;

    public ParentPaymentService(ParentPaymentRepository repository) {
        this.repository = repository;
    }

    public List<ParentPaymentView> list(String studentName) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (StringUtils.hasText(studentName)) {
            return repository.findAllByTenantIdAndStudentNameOrderByPaymentDateDesc(tenantId, studentName.trim());
        }
        return repository.findAllByTenantIdOrderByPaymentDateDesc(tenantId);
    }
}

