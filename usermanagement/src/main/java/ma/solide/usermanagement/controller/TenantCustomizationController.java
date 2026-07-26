package ma.solide.usermanagement.controller;

import ma.solide.usermanagement.service.TenantCustomizationService;
import ma.solide.usermanagement.tenant.TenantContext;
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
@RequestMapping("/api/tenant-customization")
public class TenantCustomizationController {

    private final TenantCustomizationService tenantCustomizationService;

    public TenantCustomizationController(TenantCustomizationService tenantCustomizationService) {
        this.tenantCustomizationService = tenantCustomizationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCustomization() {
        String tenantId = TenantContext.getRequiredTenantId();
        return ResponseEntity.ok(tenantCustomizationService.getCustomization(tenantId));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> saveCustomization(
            @RequestBody Map<String, Object> customization,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {

        if (!RoleHeaderAuthorization.hasAnyRole(userRolesHeader, "manager")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only manager role can update tenant customization");
        }

        String tenantId = TenantContext.getRequiredTenantId();
        return ResponseEntity.ok(tenantCustomizationService.saveCustomization(tenantId, customization));
    }
}

