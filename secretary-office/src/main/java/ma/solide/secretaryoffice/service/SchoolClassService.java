package ma.solide.secretaryoffice.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.SchoolClassRequestDTO;
import ma.solide.secretaryoffice.dto.SchoolClassResponse;
import ma.solide.secretaryoffice.model.SchoolClass;
import ma.solide.secretaryoffice.repository.SchoolClassRepository;

@Service
public class SchoolClassService {

    private final SchoolClassRepository schoolClassRepository;

    public SchoolClassService(SchoolClassRepository schoolClassRepository) {
        this.schoolClassRepository = schoolClassRepository;
    }

    public List<SchoolClassResponse> getClasses() {
        return schoolClassRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SchoolClassResponse createClass(SchoolClassRequestDTO dto) {
        if (dto == null || !StringUtils.hasText(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la classe est requis");
        }

        String className = dto.getName().trim();
        if (schoolClassRepository.existsByNameIgnoreCase(className)) {
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
                .name(className)
                .students(new ArrayList<>(students))
                .build();

        return toResponse(schoolClassRepository.save(schoolClass));
    }

    public SchoolClassResponse updateClassName(Integer id, SchoolClassRequestDTO dto) {
        if (dto == null || !StringUtils.hasText(dto.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la classe est requis");
        }

        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Classe introuvable pour l'id " + id));

        String newName = dto.getName().trim();
        if (!schoolClass.getName().equalsIgnoreCase(newName)
                && schoolClassRepository.existsByNameIgnoreCase(newName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Une classe avec ce nom existe déjà");
        }

        schoolClass.setName(newName);
        return toResponse(schoolClassRepository.save(schoolClass));
    }

    public void deleteClass(Integer id) {
        if (!schoolClassRepository.existsById(id)) {
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
                .build();
    }
}
