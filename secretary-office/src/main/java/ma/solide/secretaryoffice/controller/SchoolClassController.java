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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import ma.solide.secretaryoffice.dto.SchoolClassRequestDTO;
import ma.solide.secretaryoffice.dto.SchoolClassResponse;
import ma.solide.secretaryoffice.dto.StudentRequestDTO;
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SchoolClassResponse createClass(@RequestBody SchoolClassRequestDTO dto) {
        return schoolClassService.createClass(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolClassResponse> updateClass(@PathVariable Integer id,
                                                           @RequestBody SchoolClassRequestDTO dto) {
        return ResponseEntity.ok(schoolClassService.updateClassName(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteClass(@PathVariable Integer id) {
        schoolClassService.deleteClass(id);
    }

    @PostMapping("/{id}/students")
    public ResponseEntity<SchoolClassResponse> addStudent(@PathVariable Integer id,
                                                          @RequestBody StudentRequestDTO dto) {
        return ResponseEntity.ok(schoolClassService.addStudent(id, dto));
    }

    @DeleteMapping("/{id}/students/{studentName}")
    public ResponseEntity<SchoolClassResponse> removeStudent(@PathVariable Integer id,
                                                             @PathVariable String studentName) {
        return ResponseEntity.ok(schoolClassService.removeStudent(id, studentName));
    }
}

