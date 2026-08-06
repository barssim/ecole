package ma.solide.teacherservice.controller;

import java.util.List;

import ma.solide.teacherservice.dto.SecretaryClassDTO;
import ma.solide.teacherservice.service.SecretaryOfficeClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher/classes")
public class TeacherClassController {

    private final SecretaryOfficeClassService secretaryOfficeClassService;

    public TeacherClassController(SecretaryOfficeClassService secretaryOfficeClassService) {
        this.secretaryOfficeClassService = secretaryOfficeClassService;
    }

    @GetMapping
    public ResponseEntity<List<SecretaryClassDTO>> listClasses(@RequestParam(required = false) String teacherName) {
        return ResponseEntity.ok(secretaryOfficeClassService.getClasses(teacherName));
    }

    @GetMapping("/{classId}/students")
    public ResponseEntity<List<String>> listStudents(
            @PathVariable Integer classId,
            @RequestParam(required = false) String teacherName) {
        return ResponseEntity.ok(secretaryOfficeClassService.getStudentsByClassId(classId, teacherName));
    }
}

