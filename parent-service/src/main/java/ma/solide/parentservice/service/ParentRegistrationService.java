package ma.solide.parentservice.service;

import java.time.LocalDateTime;
import java.util.List;

import ma.solide.parentservice.dto.ParentRegistrationRequest;
import ma.solide.parentservice.model.ParentRegistration;
import ma.solide.parentservice.repository.ParentRegistrationRepository;
import ma.solide.parentservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ParentRegistrationService {

    private final ParentRegistrationRepository repository;

    public ParentRegistrationService(ParentRegistrationRepository repository) {
        this.repository = repository;
    }

    public List<ParentRegistration> list() {
        return repository.findAllByTenantIdOrderByCreatedAtDesc(TenantContext.getRequiredTenantId());
    }

    public ParentRegistration create(ParentRegistrationRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request body is required");
        }
        if (!StringUtils.hasText(request.getParentName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "parentName is required");
        }
        if (!StringUtils.hasText(request.getStudentName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentName is required");
        }

        ParentRegistration registration = ParentRegistration.builder()
                .tenantId(TenantContext.getRequiredTenantId())
                .parentName(request.getParentName().trim())
                .studentName(request.getStudentName().trim())
                .className(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null)
                .notes(StringUtils.hasText(request.getNotes()) ? request.getNotes().trim() : null)
                .status("pending")
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(registration);
    }
}

