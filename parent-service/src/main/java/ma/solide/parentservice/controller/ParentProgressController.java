package ma.solide.parentservice.controller;

import java.util.List;

import ma.solide.parentservice.model.ParentProgressRecord;
import ma.solide.parentservice.service.ParentProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents/progress")
public class ParentProgressController {

    private final ParentProgressService service;

    public ParentProgressController(ParentProgressService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ParentProgressRecord>> list(@RequestParam(required = false, name = "student") String studentName) {
        return ResponseEntity.ok(service.list(studentName));
    }
}

