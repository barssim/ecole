package ma.solide.parentservice.controller;

import java.util.List;

import ma.solide.parentservice.model.ParentPaymentView;
import ma.solide.parentservice.service.ParentPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents/payments")
public class ParentPaymentController {

    private final ParentPaymentService service;

    public ParentPaymentController(ParentPaymentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ParentPaymentView>> list(@RequestParam(required = false, name = "student") String studentName) {
        return ResponseEntity.ok(service.list(studentName));
    }
}

