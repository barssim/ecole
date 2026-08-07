package ma.solide.parentservice.controller;

import java.util.List;

import ma.solide.parentservice.dto.AttestationRequestCreateRequest;
import ma.solide.parentservice.model.AttestationRequestRecord;
import ma.solide.parentservice.service.AttestationRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents/attestation-requests")
public class AttestationRequestController {

    private final AttestationRequestService service;

    public AttestationRequestController(AttestationRequestService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AttestationRequestRecord>> list(@RequestParam(required = false) Integer userId) {
        return ResponseEntity.ok(service.list(userId));
    }

    @PostMapping
    public ResponseEntity<AttestationRequestRecord> create(@RequestBody AttestationRequestCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }
}

