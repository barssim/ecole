package ma.solide.parentservice.service;

import java.time.LocalDateTime;
import java.util.List;

import ma.solide.parentservice.dto.AttestationRequestCreateRequest;
import ma.solide.parentservice.model.AttestationRequestRecord;
import ma.solide.parentservice.repository.AttestationRequestRepository;
import ma.solide.parentservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AttestationRequestService {

    private final AttestationRequestRepository repository;

    public AttestationRequestService(AttestationRequestRepository repository) {
        this.repository = repository;
    }

    public List<AttestationRequestRecord> list(Integer userId) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (userId != null) {
            return repository.findAllByTenantIdAndUserIdOrderByCreatedAtDesc(tenantId, userId);
        }
        return repository.findAllByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    public AttestationRequestRecord create(AttestationRequestCreateRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request body is required");
        }
        if (!StringUtils.hasText(request.getStudentName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentName is required");
        }
        if (!StringUtils.hasText(request.getType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type is required");
        }

        AttestationRequestRecord record = AttestationRequestRecord.builder()
                .tenantId(TenantContext.getRequiredTenantId())
                .userId(request.getUserId())
                .studentName(request.getStudentName().trim())
                .className(StringUtils.hasText(request.getClassName()) ? request.getClassName().trim() : null)
                .type(request.getType().trim())
                .reason(StringUtils.hasText(request.getReason()) ? request.getReason().trim() : null)
                .status("pending")
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(record);
    }
}

