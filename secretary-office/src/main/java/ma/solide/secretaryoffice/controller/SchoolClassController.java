package ma.solide.secretaryoffice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ma.solide.secretaryoffice.dto.SchoolClassResponse;
import ma.solide.secretaryoffice.service.SchoolClassService;

@RestController
@RequestMapping("/api/classes")
public class SchoolClassController {

    private final SchoolClassService schoolClassService;

    public SchoolClassController(SchoolClassService schoolClassService) {
        this.schoolClassService = schoolClassService;
    }

    @GetMapping
    public ResponseEntity<List<SchoolClassResponse>> getClasses() {
        return ResponseEntity.ok(schoolClassService.getClasses());
    }
}

