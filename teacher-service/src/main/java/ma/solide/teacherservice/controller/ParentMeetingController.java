package ma.solide.teacherservice.controller;

import java.util.List;

import ma.solide.teacherservice.dto.ParentMeetingRequest;
import ma.solide.teacherservice.model.ParentMeeting;
import ma.solide.teacherservice.service.ParentMeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher/parent-meetings")
public class ParentMeetingController {

    private final ParentMeetingService service;

    public ParentMeetingController(ParentMeetingService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ParentMeeting>> list() {
        return ResponseEntity.ok(service.list());
    }

    @PostMapping
    public ResponseEntity<ParentMeeting> create(@RequestBody ParentMeetingRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParentMeeting> update(@PathVariable Long id, @RequestBody ParentMeetingRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

