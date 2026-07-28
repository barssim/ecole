package ma.solide.usermanagement.controller;

import ma.solide.usermanagement.model.PasswordChangeRequest;
import ma.solide.usermanagement.model.ManagerUserUpdateRequest;
import ma.solide.usermanagement.model.TeacherSummaryDTO;
import ma.solide.usermanagement.model.StudentSummaryDTO;
import ma.solide.usermanagement.model.User;
import ma.solide.usermanagement.model.UserProfileDTO;
import ma.solide.usermanagement.model.UserProfileUpdateRequest;
import ma.solide.usermanagement.service.UserService;
import ma.solide.usermanagement.util.RoleHeaderAuthorization;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserService userService;

    public UserProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getUsers(
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        ensureManagerRole(userRolesHeader);
        return ResponseEntity.ok(userService.findAllUserProfiles());
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Integer id) {
        User user = userService.getUserOrThrow(id);
        return ResponseEntity.ok(UserProfileDTO.fromUser(user));
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherSummaryDTO>> getTeachers() {
        return ResponseEntity.ok(userService.findAllTeachers());
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentSummaryDTO>> getStudents() {
        return ResponseEntity.ok(userService.findAllStudents());
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(
            @PathVariable Integer id,
            @RequestBody UserProfileUpdateRequest request) {
        User user = userService.updateProfile(
                id,
                request.getFirstname(),
                request.getUsername(),
                request.getEmail(),
                request.getAdresse()
        );
        return ResponseEntity.ok(UserProfileDTO.fromUser(user));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable Integer id,
            @RequestBody PasswordChangeRequest request) {
        userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDTO> updateUserByManager(
            @PathVariable Integer id,
            @RequestBody ManagerUserUpdateRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        ensureManagerRole(userRolesHeader);
        User updated = userService.updateUserByManager(
                id,
                request.getSurname(),
                request.getFirstname(),
                request.getEmail(),
                request.getAdresse(),
                request.getRole()
        );
        return ResponseEntity.ok(UserProfileDTO.fromUser(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserByManager(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        ensureManagerRole(userRolesHeader);
        userService.deleteUserByManager(id);
        return ResponseEntity.noContent().build();
    }

    private void ensureManagerRole(String userRolesHeader) {
        if (!RoleHeaderAuthorization.hasAnyRole(userRolesHeader, "manager")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only manager role can manage tenant users");
        }
    }
}

