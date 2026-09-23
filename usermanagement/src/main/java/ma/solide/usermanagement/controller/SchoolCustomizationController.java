package ma.solide.usermanagement.controller;

import ma.solide.usermanagement.service.SchoolCustomizationService;
import ma.solide.usermanagement.school.SchoolContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/school-customization")
public class SchoolCustomizationController {

    private final SchoolCustomizationService schoolCustomizationService;

    public SchoolCustomizationController(SchoolCustomizationService schoolCustomizationService) {
        this.schoolCustomizationService = schoolCustomizationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCustomization() {
        String schoolId = SchoolContext.getRequiredSchoolId();
        return ResponseEntity.ok(schoolCustomizationService.getCustomization(schoolId));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> saveCustomization(
            @RequestBody Map<String, Object> customization) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        return ResponseEntity.ok(schoolCustomizationService.saveCustomization(schoolId, customization));
    }
}
