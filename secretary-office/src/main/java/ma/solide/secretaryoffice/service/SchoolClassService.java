package ma.solide.secretaryoffice.service;

import java.util.ArrayList;
import java.util.List;

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
        String tenantId = TenantContext.getRequiredTenantId();
        return schoolClassRepository.findAllByTenantIdOrderByNameAsc(tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
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
