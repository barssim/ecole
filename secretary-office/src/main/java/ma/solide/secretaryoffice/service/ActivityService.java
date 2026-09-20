package ma.solide.secretaryoffice.service;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.ActivityRequestDTO;
import ma.solide.secretaryoffice.dto.ActivityResponseDTO;
import ma.solide.secretaryoffice.model.Activity;
import ma.solide.secretaryoffice.model.SchoolClass;
import ma.solide.secretaryoffice.repository.ActivityRepository;
import ma.solide.secretaryoffice.repository.SchoolClassRepository;
import ma.solide.secretaryoffice.tenant.TenantContext;

@Service
public class ActivityService {

    private static final Set<String> ALLOWED_TYPES = Set.of("sorties", "fetes", "reunions", "announcements");
    private static final Set<String> TYPES_WITHOUT_CLASS_DESTINATION = Set.of("announcements");
    /** Types visible to every role regardless of class membership (e.g. school-wide announcements/parties). */
    private static final Set<String> GLOBALLY_VISIBLE_TYPES = Set.of("announcements", "fetes");

    private final ActivityRepository activityRepository;
    private final SchoolClassRepository schoolClassRepository;

    public ActivityService(ActivityRepository activityRepository,
                           SchoolClassRepository schoolClassRepository) {
        this.activityRepository = activityRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    public List<ActivityResponseDTO> getActivities(String type, String rolesHeader, String userNameHeader) {
        String tenantId = TenantContext.getRequiredTenantId();
        String normalizedType = normalizeType(type);
        Set<String> roles = parseRoles(rolesHeader);

        List<Activity> activities;
        if (hasAnyRole(roles, "secretary", "admin", "manager")) {
            activities = normalizedType == null
                    ? activityRepository.findAllByTenantIdOrderByDateAscIdAsc(tenantId)
                    : activityRepository.findByTenantIdAndTypeOrderByDateAscIdAsc(tenantId, normalizedType);
        } else if (normalizedType != null && GLOBALLY_VISIBLE_TYPES.contains(normalizedType)) {
            // Announcements/Fêtes are not restricted to a class; visible to every authenticated user/role.
            activities = activityRepository.findByTenantIdAndTypeOrderByDateAscIdAsc(tenantId, normalizedType);
        } else {
            if (!StringUtils.hasText(userNameHeader)) {
                return List.of();
            }
            List<String> classNames = resolveUserClasses(tenantId, roles, userNameHeader.trim());

            List<Activity> classActivities = classNames.isEmpty()
                    ? List.of()
                    : (normalizedType == null
                        ? activityRepository.findByTenantIdAndClassNameInOrderByDateAscIdAsc(tenantId, classNames)
                        : activityRepository.findByTenantIdAndTypeAndClassNameInOrderByDateAscIdAsc(tenantId, normalizedType, classNames));

            if (normalizedType == null) {
                // Also include globally-visible types (announcements/fêtes), which have no class restriction.
                List<Activity> globalActivities = new java.util.ArrayList<>();
                for (String globalType : GLOBALLY_VISIBLE_TYPES) {
                    globalActivities.addAll(activityRepository.findByTenantIdAndTypeOrderByDateAscIdAsc(tenantId, globalType));
                }
                activities = new java.util.ArrayList<>(classActivities);
                activities.addAll(globalActivities);
                activities.sort(java.util.Comparator.comparing(Activity::getDate).thenComparing(Activity::getId));
            } else {
                activities = classActivities;
            }
        }

        return activities.stream().map(this::toResponse).toList();
    }

    public ActivityResponseDTO createActivity(ActivityRequestDTO dto, String createdBy) {
        String tenantId = TenantContext.getRequiredTenantId();
        validate(dto);
        String normalizedType = dto.getType().trim().toLowerCase();

        if (!TYPES_WITHOUT_CLASS_DESTINATION.contains(normalizedType)
                && !schoolClassRepository.existsByTenantIdAndNameIgnoreCase(tenantId, dto.getClassName().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Class not found");
        }

        Activity activity = Activity.builder()
                .tenantId(tenantId)
                .type(normalizedType)
                .title(dto.getTitle().trim())
                .date(dto.getDate())
                .className(StringUtils.hasText(dto.getClassName()) ? dto.getClassName().trim() : null)
                .destination(StringUtils.hasText(dto.getDestination()) ? dto.getDestination().trim() : null)
                .description(StringUtils.hasText(dto.getDescription()) ? dto.getDescription().trim() : null)
                .createdBy(StringUtils.hasText(createdBy) ? createdBy.trim() : "secretary")
                .build();

        return toResponse(activityRepository.save(activity));
    }

    public ActivityResponseDTO updateActivity(Integer id, ActivityRequestDTO dto) {
        String tenantId = TenantContext.getRequiredTenantId();
        validate(dto);
        Activity activity = findById(tenantId, id);
        String normalizedType = dto.getType().trim().toLowerCase();

        if (!TYPES_WITHOUT_CLASS_DESTINATION.contains(normalizedType)
                && !schoolClassRepository.existsByTenantIdAndNameIgnoreCase(tenantId, dto.getClassName().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Class not found");
        }

        activity.setType(normalizedType);
        activity.setTitle(dto.getTitle().trim());
        activity.setDate(dto.getDate());
        activity.setClassName(StringUtils.hasText(dto.getClassName()) ? dto.getClassName().trim() : null);
        activity.setDestination(StringUtils.hasText(dto.getDestination()) ? dto.getDestination().trim() : null);
        activity.setDescription(StringUtils.hasText(dto.getDescription()) ? dto.getDescription().trim() : null);

        return toResponse(activityRepository.save(activity));
    }

    public void deleteActivity(Integer id) {
        String tenantId = TenantContext.getRequiredTenantId();
        findById(tenantId, id);
        activityRepository.deleteById(id);
    }

    private Activity findById(String tenantId, Integer id) {
        return activityRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
    }

    private String normalizeType(String type) {
        if (!StringUtils.hasText(type)) {
            return null;
        }
        String normalized = type.trim().toLowerCase();
        if (!ALLOWED_TYPES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid activity type");
        }
        return normalized;
    }

    private void validate(ActivityRequestDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(dto.getType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type is required");
        }
        String normalizedType = normalizeType(dto.getType());
        if (!StringUtils.hasText(dto.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (dto.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }
        if (!TYPES_WITHOUT_CLASS_DESTINATION.contains(normalizedType)) {
            if (!StringUtils.hasText(dto.getClassName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "className is required");
            }
            if (!StringUtils.hasText(dto.getDestination())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "destination is required");
            }
        }
    }

    private Set<String> parseRoles(String rolesHeader) {
        if (!StringUtils.hasText(rolesHeader)) {
            return Set.of();
        }
        return List.of(rolesHeader.toLowerCase().split(",")).stream()
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
    }

    private boolean hasAnyRole(Set<String> roles, String... expected) {
        for (String assignedRole : roles) {
            for (String expectedRole : expected) {
                String normalizedExpected = expectedRole.toLowerCase(Locale.ROOT);
                if (assignedRole.equals(normalizedExpected)
                        || assignedRole.equals("role_" + normalizedExpected)
                        || assignedRole.endsWith("_" + normalizedExpected)) {
                    return true;
                }
            }
        }
        return false;
    }

    private List<String> resolveUserClasses(String tenantId, Set<String> roles, String userName) {
        List<SchoolClass> classes = schoolClassRepository.findAllByTenantIdOrderByNameAsc(tenantId);
        Set<String> classNames = new HashSet<>();

        if (roles.contains("student")) {
            classes.stream()
                    .filter(c -> c.getStudents().stream().anyMatch(s -> s.equalsIgnoreCase(userName)))
                    .map(SchoolClass::getName)
                    .forEach(classNames::add);
        }
        if (roles.contains("teacher")) {
            classes.stream()
                    .filter(c -> c.getTeachers().stream().anyMatch(t -> namesMatch(t, userName)))
                    .map(SchoolClass::getName)
                    .forEach(classNames::add);
        }

        return classNames.stream().toList();
    }

    private ActivityResponseDTO toResponse(Activity activity) {
        return ActivityResponseDTO.builder()
                .id(activity.getId())
                .type(activity.getType())
                .title(activity.getTitle())
                .date(activity.getDate())
                .className(activity.getClassName())
                .destination(activity.getDestination())
                .description(activity.getDescription())
                .createdBy(activity.getCreatedBy())
                .build();
    }

    private boolean namesMatch(String storedName, String userName) {
        if (!StringUtils.hasText(storedName) || !StringUtils.hasText(userName)) {
            return false;
        }

        String normalizedStored = normalizePersonName(storedName);
        String normalizedUser = normalizePersonName(userName);

        return normalizedStored.equals(normalizedUser)
                || normalizedStored.contains(normalizedUser)
                || normalizedUser.contains(normalizedStored);
    }

    private String normalizePersonName(String value) {
        String normalized = value.toLowerCase(Locale.ROOT)
                .replace("mme", "")
                .replace("m.", "")
                .replace("mr", "")
                .replace("mrs", "")
                .replace("ms", "")
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return normalized;
    }
}

