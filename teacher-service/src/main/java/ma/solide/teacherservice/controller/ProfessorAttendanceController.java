package ma.solide.teacherservice.controller;

import java.time.LocalDate;
import java.util.List;

import ma.solide.teacherservice.dto.ProfessorAttendanceRequestDTO;
import ma.solide.teacherservice.model.ProfessorAttendance;
import ma.solide.teacherservice.service.ProfessorAttendanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/presence/professors")
public class ProfessorAttendanceController {

    private final ProfessorAttendanceService service;

    public ProfessorAttendanceController(ProfessorAttendanceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ProfessorAttendance>> getAttendanceForDate(
            @RequestParam(required = false) LocalDate date,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        if (!hasAnyRole(userRolesHeader, "secretary", "admin", "manager")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only secretary, admin and manager can view all attendance");
        }
        return ResponseEntity.ok(service.getAttendanceForDate(date));
    }

    @GetMapping("/{teacherId}")
    public ResponseEntity<ProfessorAttendance> getTeacherAttendance(
            @PathVariable Integer teacherId,
            @RequestParam(required = false) LocalDate date,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        if (!hasAnyRole(userRolesHeader, "teacher", "secretary", "admin", "manager")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only teacher, secretary, admin and manager can access attendance details");
        }
        return ResponseEntity.ok(service.getTeacherAttendance(teacherId, date));
    }

    @PostMapping
    public ResponseEntity<ProfessorAttendance> saveAttendance(
            @RequestBody ProfessorAttendanceRequestDTO dto,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        if (!hasAnyRole(userRolesHeader, "teacher", "secretary", "admin", "manager")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only teacher, secretary, admin and manager can submit attendance");
        }
        return ResponseEntity.ok(service.saveAttendance(dto));
    }

    private boolean hasAnyRole(String rolesHeader, String... expectedRoles) {
        if (rolesHeader == null || rolesHeader.isBlank()) {
            return false;
        }

        String normalizedRoles = rolesHeader.toLowerCase();
        for (String expectedRole : expectedRoles) {
            if (normalizedRoles.contains(expectedRole.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
}

