package ma.solide.attestation_service.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attestation")
@CrossOrigin(origins = "*")
public class AttestationController {

    @GetMapping("/health")
    public String health() {
        return "attestation-service is running";
    }

}
