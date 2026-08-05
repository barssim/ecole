package ma.solide.teacherservice.controller;

import java.util.List;

import ma.solide.teacherservice.dto.TeacherAssignmentRequest;
import ma.solide.teacherservice.model.TeacherAssignment;
import ma.solide.teacherservice.service.TeacherAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher/assignments")
public class TeacherAssignmentController {

    private final TeacherAssignmentService service;

    public TeacherAssignmentController(TeacherAssignmentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TeacherAssignment>> list(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String classId
    ) {
        return ResponseEntity.ok(service.list(teacherId, classId));
    }

    @PostMapping
    public ResponseEntity<TeacherAssignment> create(@RequestBody TeacherAssignmentRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherAssignment> update(@PathVariable Long id, @RequestBody TeacherAssignmentRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

