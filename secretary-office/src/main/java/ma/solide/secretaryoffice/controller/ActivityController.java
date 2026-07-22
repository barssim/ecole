package ma.solide.secretaryoffice.controller;

import java.util.List;

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

import ma.solide.secretaryoffice.dto.ActivityRequestDTO;
import ma.solide.secretaryoffice.dto.ActivityResponseDTO;
import ma.solide.secretaryoffice.service.ActivityService;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponseDTO>> getActivities(
            @RequestParam(required = false) String type,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userNameHeader) {
        return ResponseEntity.ok(activityService.getActivities(type, rolesHeader, userNameHeader));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ActivityResponseDTO createActivity(
            @RequestBody ActivityRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader,
            @RequestHeader(value = "X-User-Name", required = false) String userNameHeader) {
        requireSecretary(rolesHeader);
        return activityService.createActivity(dto, userNameHeader);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponseDTO> updateActivity(
            @PathVariable Integer id,
            @RequestBody ActivityRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        requireSecretary(rolesHeader);
        return ResponseEntity.ok(activityService.updateActivity(id, dto));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteActivity(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String rolesHeader) {
        requireSecretary(rolesHeader);
        activityService.deleteActivity(id);
    }

    private void requireSecretary(String rolesHeader) {
        if (rolesHeader == null || rolesHeader.isBlank() || !rolesHeader.toLowerCase().contains("secretary")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only secretary can add and schedule activities");
        }
    }
}

