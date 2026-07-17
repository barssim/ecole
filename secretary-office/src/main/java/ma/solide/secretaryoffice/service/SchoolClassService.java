package ma.solide.secretaryoffice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import ma.solide.secretaryoffice.dto.SchoolClassResponse;
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
                .map(sc -> SchoolClassResponse.builder()
                        .id(sc.getId())
                        .name(sc.getName())
                        .students(sc.getStudents())
                        .build())
                .toList();
    }
}
