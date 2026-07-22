package ma.solide.usermanagement.controller;

import ma.solide.usermanagement.model.PasswordChangeRequest;
import ma.solide.usermanagement.model.User;
import ma.solide.usermanagement.model.UserProfileDTO;
import ma.solide.usermanagement.model.UserProfileUpdateRequest;
import ma.solide.usermanagement.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserService userService;

    public UserProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Integer id) {
        User user = userService.getUserOrThrow(id);
        return ResponseEntity.ok(UserProfileDTO.fromUser(user));
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
}

