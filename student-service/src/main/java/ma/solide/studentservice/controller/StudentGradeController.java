package ma.solide.studentservice.controller;

import java.util.List;

import ma.solide.studentservice.dto.StudentGradeRequest;
import ma.solide.studentservice.model.StudentGrade;
import ma.solide.studentservice.service.StudentGradeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/student/grades", "/api/student/notes"})
public class StudentGradeController {

    private final StudentGradeService studentGradeService;

    public StudentGradeController(StudentGradeService studentGradeService) {
        this.studentGradeService = studentGradeService;
    }

    @GetMapping
    public ResponseEntity<List<StudentGrade>> list(
            @RequestParam(required = false, name = "user") String studentId,
            @RequestParam(required = false) String classId
    ) {
        return ResponseEntity.ok(studentGradeService.listGrades(studentId, classId));
    }

    @PostMapping
    public ResponseEntity<StudentGrade> create(@RequestBody StudentGradeRequest request) {
        return ResponseEntity.ok(studentGradeService.createGrade(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentGradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }
}

