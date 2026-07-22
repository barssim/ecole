package ma.solide.secretaryoffice.service;

import java.util.HashSet;
import java.util.List;
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

@Service
public class ActivityService {

    private static final Set<String> ALLOWED_TYPES = Set.of("sorties", "fetes", "reunions");

    private final ActivityRepository activityRepository;
    private final SchoolClassRepository schoolClassRepository;

    public ActivityService(ActivityRepository activityRepository,
                           SchoolClassRepository schoolClassRepository) {
        this.activityRepository = activityRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    public List<ActivityResponseDTO> getActivities(String type, String rolesHeader, String userNameHeader) {
        String normalizedType = normalizeType(type);
        Set<String> roles = parseRoles(rolesHeader);

        List<Activity> activities;
        if (hasAnyRole(roles, "secretary", "admin", "manager")) {
            activities = normalizedType == null
                    ? activityRepository.findAllByOrderByDateAscIdAsc()
                    : activityRepository.findByTypeOrderByDateAscIdAsc(normalizedType);
        } else {
            if (!StringUtils.hasText(userNameHeader)) {
                return List.of();
            }
            List<String> classNames = resolveUserClasses(roles, userNameHeader.trim());
            if (classNames.isEmpty()) {
                return List.of();
            }

            activities = normalizedType == null
                    ? activityRepository.findByClassNameInOrderByDateAscIdAsc(classNames)
                    : activityRepository.findByTypeAndClassNameInOrderByDateAscIdAsc(normalizedType, classNames);
        }

        return activities.stream().map(this::toResponse).toList();
    }

    public ActivityResponseDTO createActivity(ActivityRequestDTO dto, String createdBy) {
        validate(dto);

        if (!schoolClassRepository.existsByNameIgnoreCase(dto.getClassName().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Class not found");
        }

        Activity activity = Activity.builder()
                .type(dto.getType().trim().toLowerCase())
                .title(dto.getTitle().trim())
                .date(dto.getDate())
                .className(dto.getClassName().trim())
                .destination(dto.getDestination().trim())
                .description(StringUtils.hasText(dto.getDescription()) ? dto.getDescription().trim() : null)
                .createdBy(StringUtils.hasText(createdBy) ? createdBy.trim() : "secretary")
                .build();

        return toResponse(activityRepository.save(activity));
    }

    public ActivityResponseDTO updateActivity(Integer id, ActivityRequestDTO dto) {
        validate(dto);
        Activity activity = findById(id);

        if (!schoolClassRepository.existsByNameIgnoreCase(dto.getClassName().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Class not found");
        }

        activity.setType(dto.getType().trim().toLowerCase());
        activity.setTitle(dto.getTitle().trim());
        activity.setDate(dto.getDate());
        activity.setClassName(dto.getClassName().trim());
        activity.setDestination(dto.getDestination().trim());
        activity.setDescription(StringUtils.hasText(dto.getDescription()) ? dto.getDescription().trim() : null);

        return toResponse(activityRepository.save(activity));
    }

    public void deleteActivity(Integer id) {
        findById(id);
        activityRepository.deleteById(id);
    }

    private Activity findById(Integer id) {
        return activityRepository.findById(id)
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
        for (String role : expected) {
            if (roles.contains(role)) {
                return true;
            }
        }
        return false;
    }

    private List<String> resolveUserClasses(Set<String> roles, String userName) {
        List<SchoolClass> classes = schoolClassRepository.findAll();
        Set<String> classNames = new HashSet<>();

        if (roles.contains("student")) {
            classes.stream()
                    .filter(c -> c.getStudents().stream().anyMatch(s -> s.equalsIgnoreCase(userName)))
                    .map(SchoolClass::getName)
                    .forEach(classNames::add);
        }
        if (roles.contains("teacher")) {
            classes.stream()
                    .filter(c -> c.getTeachers().stream().anyMatch(t -> t.equalsIgnoreCase(userName)))
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
}

