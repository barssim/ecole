package ma.solide.schoolactivity.service;

import java.util.List;
import java.util.Locale;
import java.util.Set;

import ma.solide.schoolactivity.dto.ActivityRequestDTO;
import ma.solide.schoolactivity.dto.ActivityResponseDTO;
import ma.solide.schoolactivity.model.SchoolActivity;
import ma.solide.schoolactivity.repository.SchoolActivityRepository;
import ma.solide.schoolactivity.tenant.TenantContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SchoolActivityService {

    /**
     * All supported activity types.
     * Legacy aliases (sorties / fetes / reunions) kept for backward-compat with existing frontend.
     */
    public static final Set<String> ALLOWED_TYPES = Set.of(
            "library", "cantine", "transport", "sport",
            "outings", "parties", "meetings",
            // legacy aliases
            "sorties", "fetes", "reunions"
    );

    private final SchoolActivityRepository repository;

    public SchoolActivityService(SchoolActivityRepository repository) {
        this.repository = repository;
    }

    // -------------------------------------------------------------------------
    // Read
    // -------------------------------------------------------------------------

    /** Returns all activities for the tenant, optionally filtered by type. */
    public List<ActivityResponseDTO> getAll(String type) {
        String tenantId = TenantContext.getRequiredTenantId();
        String normalized = normalizeType(type);
        List<SchoolActivity> rows = normalized == null
                ? repository.findAllByTenantIdOrderByDateAscIdAsc(tenantId)
                : repository.findByTenantIdAndTypeOrderByDateAscIdAsc(tenantId, normalized);
        return rows.stream().map(this::toResponse).toList();
    }

    /** Returns activities for a fixed type (used by package-specific services). */
    public List<ActivityResponseDTO> getByType(String fixedType) {
        String tenantId = TenantContext.getRequiredTenantId();
        return repository.findByTenantIdAndTypeOrderByDateAscIdAsc(tenantId, fixedType)
                .stream().map(this::toResponse).toList();
    }

    // -------------------------------------------------------------------------
    // Write
    // -------------------------------------------------------------------------

    public ActivityResponseDTO create(ActivityRequestDTO dto, String createdBy) {
        validate(dto);
        SchoolActivity activity = SchoolActivity.builder()
                .tenantId(TenantContext.getRequiredTenantId())
                .type(normalizeType(dto.getType()))
                .title(dto.getTitle().trim())
                .date(dto.getDate())
                .className(dto.getClassName().trim())
                .destination(dto.getDestination().trim())
                .description(StringUtils.hasText(dto.getDescription()) ? dto.getDescription().trim() : null)
                .createdBy(StringUtils.hasText(createdBy) ? createdBy.trim() : "system")
                .build();
        return toResponse(repository.save(activity));
    }

    /** Used by package-specific services that inject the type automatically. */
    public ActivityResponseDTO createWithType(String fixedType, ActivityRequestDTO dto, String createdBy) {
        dto.setType(fixedType);
        return create(dto, createdBy);
    }

    public ActivityResponseDTO update(Integer id, ActivityRequestDTO dto) {
        validate(dto);
        String tenantId = TenantContext.getRequiredTenantId();
        SchoolActivity activity = findOrThrow(id, tenantId);
        activity.setType(normalizeType(dto.getType()));
        activity.setTitle(dto.getTitle().trim());
        activity.setDate(dto.getDate());
        activity.setClassName(dto.getClassName().trim());
        activity.setDestination(dto.getDestination().trim());
        activity.setDescription(StringUtils.hasText(dto.getDescription()) ? dto.getDescription().trim() : null);
        return toResponse(repository.save(activity));
    }

    public void delete(Integer id) {
        SchoolActivity activity = findOrThrow(id, TenantContext.getRequiredTenantId());
        repository.delete(activity);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private SchoolActivity findOrThrow(Integer id, String tenantId) {
        return repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
    }

    public String normalizeType(String type) {
        if (!StringUtils.hasText(type)) {
            return null;
        }
        String n = type.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(n)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid activity type '" + type + "'. Allowed: " + ALLOWED_TYPES);
        }
        return n;
    }

    private void validate(ActivityRequestDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(dto.getType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type is required");
        }
        normalizeType(dto.getType());
        if (!StringUtils.hasText(dto.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (dto.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }
        if (!StringUtils.hasText(dto.getClassName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "className is required");
        }
        if (!StringUtils.hasText(dto.getDestination())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "destination is required");
        }
    }

    public ActivityResponseDTO toResponse(SchoolActivity a) {
        return ActivityResponseDTO.builder()
                .id(a.getId())
                .type(a.getType())
                .title(a.getTitle())
                .date(a.getDate())
                .className(a.getClassName())
                .destination(a.getDestination())
                .description(a.getDescription())
                .createdBy(a.getCreatedBy())
                .build();
    }
}

