package ma.solide.secretaryoffice.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import ma.solide.secretaryoffice.dto.ExamRequestDTO;
import ma.solide.secretaryoffice.dto.ExamResponseDTO;
import ma.solide.secretaryoffice.service.ExamService;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public ResponseEntity<List<ExamResponseDTO>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResponseDTO> getExam(@PathVariable Integer id) {
        return ResponseEntity.ok(examService.getExam(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExamResponseDTO createExam(
            @RequestBody ExamRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        requireSecretaryOrAbove(rolesHeader);
        return examService.createExam(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamResponseDTO> updateExam(
            @PathVariable Integer id,
            @RequestBody ExamRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        requireSecretaryOrAbove(rolesHeader);
        return ResponseEntity.ok(examService.updateExam(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExam(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        requireSecretaryOrAbove(rolesHeader);
        examService.deleteExam(id);
    }

    private void requireSecretaryOrAbove(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Authentication required");
        }
        String normalized = rolesHeader.toLowerCase();
        if (!normalized.contains("secretary") && !normalized.contains("admin") && !normalized.contains("manager")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only secretary, admin and manager can manage exams");
        }
    }
}

