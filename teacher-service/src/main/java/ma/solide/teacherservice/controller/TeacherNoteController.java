package ma.solide.teacherservice.controller;

import java.util.List;

import ma.solide.teacherservice.dto.TeacherNoteRequest;
import ma.solide.teacherservice.model.TeacherNote;
import ma.solide.teacherservice.service.TeacherNoteService;
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
@RequestMapping("/api/teacher/notes")
public class TeacherNoteController {

    private final TeacherNoteService service;

    public TeacherNoteController(TeacherNoteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TeacherNote>> list(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String classId
    ) {
        return ResponseEntity.ok(service.list(teacherId, classId));
    }

    @PostMapping
    public ResponseEntity<TeacherNote> create(@RequestBody TeacherNoteRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherNote> update(@PathVariable Long id, @RequestBody TeacherNoteRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

