package ma.solide.schoolactivity.controller;

import java.util.List;
import java.util.Locale;

import ma.solide.schoolactivity.dto.ActivityRequestDTO;
import ma.solide.schoolactivity.dto.ActivityResponseDTO;
import ma.solide.schoolactivity.service.SchoolActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Generic /api/activities endpoint — accepts ?type= filter.
 * All activity types are handled here: library, cantine, transport,
 * sport, outings, parties, meetings (plus legacy sorties/fetes/reunions).
 *
 * Dedicated per-type shortcuts also exist under /api/activities/{type}/.
 */
@RestController
@RequestMapping({"/api/activities", "/api/school-activities"})
public class SchoolActivityController {

    private final SchoolActivityService service;

    public SchoolActivityController(SchoolActivityService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponseDTO>> list(@RequestParam(required = false) String type) {
        return ResponseEntity.ok(service.getAll(type));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ActivityResponseDTO create(
            @RequestBody ActivityRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String roles,
            @RequestHeader(value = "X-User-Name", required = false) String userName) {
        requireManager(roles);
        return service.create(dto, userName);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponseDTO> update(
            @PathVariable Integer id,
            @RequestBody ActivityRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireManager(roles);
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        requireManager(roles);
        service.delete(id);
    }

    private void requireManager(String roles) {
        if (!hasAnyRole(roles, "secretary", "admin", "manager")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only secretary, admin, or manager can manage activities");
        }
    }

    private boolean hasAnyRole(String rolesHeader, String... expected) {
        if (rolesHeader == null || rolesHeader.isBlank()) return false;
        for (String raw : rolesHeader.split(",")) {
            String r = raw.trim().toLowerCase(Locale.ROOT);
            for (String e : expected) {
                String ne = e.trim().toLowerCase(Locale.ROOT);
                if (r.equals(ne) || r.equals("role_" + ne) || r.endsWith("_" + ne)) return true;
            }
        }
        return false;
    }
}

