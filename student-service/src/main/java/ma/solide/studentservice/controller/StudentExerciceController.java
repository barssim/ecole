package ma.solide.studentservice.controller;

import java.util.List;

import ma.solide.studentservice.dto.StudentExerciceRequest;
import ma.solide.studentservice.model.StudentExercice;
import ma.solide.studentservice.service.StudentExerciceService;
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
@RequestMapping("/api/student/exercises")
public class StudentExerciceController {

    private final StudentExerciceService studentExerciceService;

    public StudentExerciceController(StudentExerciceService studentExerciceService) {
        this.studentExerciceService = studentExerciceService;
    }

    @GetMapping
    public ResponseEntity<List<StudentExercice>> list(
            @RequestParam(required = false, name = "user") String studentId,
            @RequestParam(required = false) String classId
    ) {
        return ResponseEntity.ok(studentExerciceService.listExercises(studentId, classId));
    }

    @PostMapping
    public ResponseEntity<StudentExercice> create(@RequestBody StudentExerciceRequest request) {
        return ResponseEntity.ok(studentExerciceService.createExercise(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentExerciceService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }
}



