package ma.solide.secretaryoffice.service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.SchoolClassRequestDTO;
import ma.solide.secretaryoffice.dto.SchoolClassResponse;
import ma.solide.secretaryoffice.dto.StudentRequestDTO;
import ma.solide.secretaryoffice.model.SchoolClass;
import ma.solide.secretaryoffice.repository.SchoolClassRepository;
import ma.solide.secretaryoffice.tenant.TenantContext;

@Service
public class SchoolClassService {

    private final SchoolClassRepository schoolClassRepository;

    public SchoolClassService(SchoolClassRepository schoolClassRepository) {
        this.schoolClassRepository = schoolClassRepository;
    }

    public List<SchoolClassResponse> getClasses() {
        return getClasses(null);
    }

    public List<SchoolClassResponse> getClasses(String teacherName) {
        String tenantId = TenantContext.getRequiredTenantId();
        List<SchoolClass> classes;
        if (!StringUtils.hasText(teacherName)) {
            classes = schoolClassRepository.findAllByTenantIdOrderByNameAsc(tenantId);
        } else {
            String teacherFilter = teacherName.trim();
            classes = schoolClassRepository.findAllByTenantIdAndTeacherNameOrderByNameAsc(tenantId, teacherFilter);
            if (classes.isEmpty()) {
                Set<String> teacherKeys = buildTeacherKeys(teacherFilter);
                classes = schoolClassRepository.findAllByTenantIdOrderByNameAsc(tenantId)
                        .stream()
                        .filter(schoolClass -> schoolClass.getTeachers() != null && schoolClass.getTeachers().stream()
                                .anyMatch(storedTeacher -> matchesTeacher(storedTeacher, teacherKeys)))
                        .toList();
            }
        }
        return classes
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Set<String> buildTeacherKeys(String teacherName) {
        Set<String> keys = new HashSet<>();
        String trimmed = StringUtils.hasText(teacherName) ? teacherName.trim() : "";
        if (trimmed.isEmpty()) {
            return keys;
        }

        keys.add(normalizeTeacherKey(trimmed));

        int atIndex = trimmed.indexOf('@');
        if (atIndex > 0) {
            keys.add(normalizeTeacherKey(trimmed.substring(0, atIndex)));
        }

        String withoutSeparators = trimmed.replace('.', ' ').replace('_', ' ').replace('-', ' ');
        keys.add(normalizeTeacherKey(withoutSeparators));
        for (String token : withoutSeparators.split("\\s+")) {
            String normalizedToken = normalizeTeacherKey(token);
            if (normalizedToken.length() >= 3) {
                keys.add(normalizedToken);
            }
        }

        keys.removeIf(String::isEmpty);
        return keys;
    }

    private boolean matchesTeacher(String storedTeacherName, Set<String> teacherKeys) {
        if (!StringUtils.hasText(storedTeacherName) || teacherKeys.isEmpty()) {
            return false;
        }

        String normalizedStored = normalizeTeacherKey(storedTeacherName);
        if (normalizedStored.isEmpty()) {
            return false;
        }

        if (teacherKeys.contains(normalizedStored)) {
            return true;
        }

        for (String key : teacherKeys) {
            if (key.length() < 4) {
                continue;
            }
            if (normalizedStored.endsWith(key) || key.endsWith(normalizedStored)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeTeacherKey(String input) {
        if (!StringUtils.hasText(input)) {
            return "";
        }

        String withoutAccents = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        String lower = withoutAccents.toLowerCase(Locale.ROOT).trim();
        lower = lower.replaceAll("\\b(mme|madame|monsieur|mr|m|prof|professeur|teacher)\\b", " ");
        return lower.replaceAll("[^a-z0-9]", "");
    }

    public SchoolClassResponse createClass(SchoolClassRequestDTO dto) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (dto == null || !StringUtils.hasText(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la classe est requis");
        }

        String className = dto.getName().trim();
        if (schoolClassRepository.existsByTenantIdAndNameIgnoreCase(tenantId, className)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une classe avec ce nom existe déjà");
        }

        List<String> students = dto.getStudents() == null
                ? new ArrayList<>()
                : dto.getStudents().stream()
                        .filter(StringUtils::hasText)
                        .map(String::trim)
                        .distinct()
                        .toList();

        SchoolClass schoolClass = SchoolClass.builder()
                .tenantId(tenantId)
                .name(className)
                .students(new ArrayList<>(students))
                .build();

        return toResponse(schoolClassRepository.save(schoolClass));
    }

    public SchoolClassResponse updateClassName(Integer id, SchoolClassRequestDTO dto) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (dto == null || !StringUtils.hasText(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la classe est requis");
        }

        SchoolClass schoolClass = schoolClassRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Classe introuvable pour l'id " + id));

        String newName = dto.getName().trim();
        if (!schoolClass.getName().equalsIgnoreCase(newName)
                && schoolClassRepository.existsByTenantIdAndNameIgnoreCase(tenantId, newName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une classe avec ce nom existe déjà");
        }

        schoolClass.setName(newName);
        return toResponse(schoolClassRepository.save(schoolClass));
    }

    public SchoolClassResponse addStudent(Integer classId, StudentRequestDTO dto) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (dto == null || !StringUtils.hasText(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de l'élève est requis");
        }
        SchoolClass schoolClass = schoolClassRepository.findByIdAndTenantId(classId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Classe introuvable pour l'id " + classId));

        String studentName = dto.getName().trim();
        if (schoolClass.getStudents().stream().anyMatch(s -> s.equalsIgnoreCase(studentName))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "L'élève '" + studentName + "' est déjà dans cette classe");
        }
        schoolClass.getStudents().add(studentName);
        return toResponse(schoolClassRepository.save(schoolClass));
    }

    public SchoolClassResponse removeStudent(Integer classId, String studentName) {
        String tenantId = TenantContext.getRequiredTenantId();
        SchoolClass schoolClass = schoolClassRepository.findByIdAndTenantId(classId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Classe introuvable pour l'id " + classId));

        boolean removed = schoolClass.getStudents()
                .removeIf(s -> s.equalsIgnoreCase(studentName));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Élève '" + studentName + "' introuvable dans cette classe");
        }
        return toResponse(schoolClassRepository.save(schoolClass));
    }

    public SchoolClassResponse addTeacher(Integer classId, StudentRequestDTO dto) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (dto == null || !StringUtils.hasText(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de l'enseignant est requis");
        }
        SchoolClass schoolClass = schoolClassRepository.findByIdAndTenantId(classId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Classe introuvable pour l'id " + classId));

        String teacherName = dto.getName().trim();
        if (schoolClass.getTeachers().stream().anyMatch(t -> t.equalsIgnoreCase(teacherName))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "L'enseignant '" + teacherName + "' est déjà dans cette classe");
        }
        schoolClass.getTeachers().add(teacherName);
        return toResponse(schoolClassRepository.save(schoolClass));
    }

    public SchoolClassResponse removeTeacher(Integer classId, String teacherName) {
        String tenantId = TenantContext.getRequiredTenantId();
        SchoolClass schoolClass = schoolClassRepository.findByIdAndTenantId(classId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Classe introuvable pour l'id " + classId));

        boolean removed = schoolClass.getTeachers()
                .removeIf(t -> t.equalsIgnoreCase(teacherName));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Enseignant '" + teacherName + "' introuvable dans cette classe");
        }
        return toResponse(schoolClassRepository.save(schoolClass));
    }

    public void deleteClass(Integer id) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (!schoolClassRepository.existsByIdAndTenantId(id, tenantId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Classe introuvable pour l'id " + id);
        }
        schoolClassRepository.deleteById(id);
    }

    private SchoolClassResponse toResponse(SchoolClass schoolClass) {
        return SchoolClassResponse.builder()
                .id(schoolClass.getId())
                .name(schoolClass.getName())
                .students(schoolClass.getStudents())
                .teachers(schoolClass.getTeachers())
                .build();
    }
}
