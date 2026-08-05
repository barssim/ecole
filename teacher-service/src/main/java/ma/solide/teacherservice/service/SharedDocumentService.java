package ma.solide.teacherservice.service;

import java.time.LocalDateTime;
import java.util.List;

import ma.solide.teacherservice.dto.SharedDocumentRequest;
import ma.solide.teacherservice.model.SharedDocument;
import ma.solide.teacherservice.repository.SharedDocumentRepository;
import ma.solide.teacherservice.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SharedDocumentService {

    private final SharedDocumentRepository repository;

    public SharedDocumentService(SharedDocumentRepository repository) {
        this.repository = repository;
    }

    public List<SharedDocument> list() {
        return repository.findAllByTenantIdOrderByUploadedAtDesc(TenantContext.getRequiredTenantId());
    }

    public SharedDocument create(SharedDocumentRequest request) {
        if (!StringUtils.hasText(request.getTitle()) || !StringUtils.hasText(request.getType()) || !StringUtils.hasText(request.getLink())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title, type and link are required");
        }

        SharedDocument doc = SharedDocument.builder()
                .tenantId(TenantContext.getRequiredTenantId())
                .title(request.getTitle().trim())
                .type(request.getType().trim())
                .link(request.getLink().trim())
                .uploadedBy(StringUtils.hasText(request.getUploadedBy()) ? request.getUploadedBy().trim() : "teacher")
                .uploadedAt(LocalDateTime.now())
                .build();
        return repository.save(doc);
    }

    public void delete(Long id) {
        String tenantId = TenantContext.getRequiredTenantId();
        SharedDocument doc = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        if (!tenantId.equals(doc.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }
        repository.delete(doc);
    }
}

