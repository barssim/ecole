package ma.solide.parentservice.controller;

import java.util.List;

import ma.solide.parentservice.dto.ParentRegistrationRequest;
import ma.solide.parentservice.model.ParentRegistration;
import ma.solide.parentservice.service.ParentRegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents/registration")
public class ParentRegistrationController {

    private final ParentRegistrationService service;

    public ParentRegistrationController(ParentRegistrationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ParentRegistration>> list() {
        return ResponseEntity.ok(service.list());
    }

    @PostMapping
    public ResponseEntity<ParentRegistration> create(@RequestBody ParentRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }
}

