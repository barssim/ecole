package ma.solide.usermanagement.controller;

import ma.solide.usermanagement.service.SchoolCustomizationService;
import ma.solide.usermanagement.school.SchoolContext;
import ma.solide.usermanagement.util.RoleHeaderAuthorization;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
            @RequestBody Map<String, Object> customization,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {

        if (!RoleHeaderAuthorization.hasAnyRole(userRolesHeader, "manager")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only manager role can update school customization");
        }

        String schoolId = SchoolContext.getRequiredSchoolId();
        return ResponseEntity.ok(schoolCustomizationService.saveCustomization(schoolId, customization));
    }
}

