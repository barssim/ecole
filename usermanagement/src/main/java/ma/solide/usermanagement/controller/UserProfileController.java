package ma.solide.usermanagement.controller;

import ma.solide.usermanagement.model.PasswordChangeRequest;
import ma.solide.usermanagement.model.ManagerUserUpdateRequest;
import ma.solide.usermanagement.model.TeacherSummaryDTO;
import ma.solide.usermanagement.model.StudentSummaryDTO;
import ma.solide.usermanagement.model.User;
import ma.solide.usermanagement.model.UserProfileDTO;
import ma.solide.usermanagement.model.UserProfileUpdateRequest;
import ma.solide.usermanagement.service.UserService;
import ma.solide.usermanagement.security.JwtPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.List;
import java.time.Instant;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserService userService;

    public UserProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getUsers() {
        return ResponseEntity.ok(userService.findAllUserProfiles());
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> getProfile(
            @PathVariable Integer id,
            @AuthenticationPrincipal JwtPrincipal principal,
            Authentication authentication) {
        ensureSelfOrManager(id, principal, authentication);
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
            @AuthenticationPrincipal JwtPrincipal principal,
            Authentication authentication,
            @RequestBody UserProfileUpdateRequest request) {
        ensureSelfOrManager(id, principal, authentication);
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
            @AuthenticationPrincipal JwtPrincipal principal,
            Authentication authentication,
            @RequestBody PasswordChangeRequest request) {
        ensureSelfOrManager(id, principal, authentication);
        userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PatchMapping("/{id}/cgu-acceptance")
    public ResponseEntity<UserProfileDTO> acceptCgu(
            @PathVariable Integer id,
            @AuthenticationPrincipal JwtPrincipal principal,
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        ensureSelfOrManager(id, principal, authentication);
        String version = request == null ? null : request.get("version");
        if (version == null || version.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CGU version is required");
        }
        User user = userService.acceptCgu(id, version.trim(), Instant.now());
        return ResponseEntity.ok(UserProfileDTO.fromUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDTO> updateUserByManager(
            @PathVariable Integer id,
            @RequestBody ManagerUserUpdateRequest request) {
        User updated = userService.updateUserByManager(
                id,
                request.getCivilite(),
                request.getSurname(),
                request.getFirstname(),
                request.getEmail(),
                request.getAdresse(),
                request.getRole()
        );
        return ResponseEntity.ok(UserProfileDTO.fromUser(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserByManager(@PathVariable Integer id) {
        userService.deleteUserByManager(id);
        return ResponseEntity.noContent().build();
    }

    private void ensureSelfOrManager(Integer requestedUserId, JwtPrincipal principal, Authentication authentication) {
        boolean manager = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_MANAGER".equals(authority.getAuthority()));
        if (!manager && (principal == null || !requestedUserId.equals(principal.userId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Users may only access their own account");
        }
    }
}
