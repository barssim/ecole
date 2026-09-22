package ma.solide.usermanagement.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ma.solide.usermanagement.model.LoginRequest;
import ma.solide.usermanagement.model.User;
import ma.solide.usermanagement.model.UserDTO;
import ma.solide.usermanagement.service.UserService;
import ma.solide.usermanagement.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;

    UserService userService;


    public AuthController(JwtUtil jwtUtil, UserService userService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest loginRequest) {
        // Mock authentication logic (replace with database/user service in production)
        if (userService.existsBySurnameAndPassword(loginRequest.getUsername(), loginRequest.getPassword())) {
            User user = userService.findBySurnameAndPassword(loginRequest.getUsername(), loginRequest.getPassword());
            String token = jwtUtil.generateToken(loginRequest.getUsername(), user.getSchoolId(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(token, user));
        } else
            return ResponseEntity.status(401).body("Invalid username or password");
    }

    @PostMapping("/register")
    public ResponseEntity<Object> createUser(@RequestBody UserDTO userDTO) {
        // Validate required fields
        if (userDTO.getSurname() == null || userDTO.getSurname().isEmpty() ||
            userDTO.getFirstname() == null || userDTO.getFirstname().isEmpty() ||
            userDTO.getEmail() == null || userDTO.getEmail().isEmpty() ||
            userDTO.getPassword() == null || userDTO.getPassword().isEmpty()) {
            return ResponseEntity.status(400).body("Missing required fields");
        }

        // Convert roles list to CSV string (comma-separated values)
        String roleString = "";
        if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
            roleString = String.join(",", userDTO.getRoles());
        } else {
            roleString = "student"; // Default role is now 'student' if none provided
        }

        boolean cguAccepted = Boolean.TRUE.equals(userDTO.getCguAccepted());
        boolean cguDeliveredByAdmin = Boolean.TRUE.equals(userDTO.getCguDeliveredByAdmin()) || !cguAccepted;

        User user = User.builder()
                .civilite(userDTO.getCivilite())
                .surname(userDTO.getSurname())
                .firstname(userDTO.getFirstname())
                .email(userDTO.getEmail())
                .adresse(userDTO.getAdresse())
                .password(userDTO.getPassword())
                .role(roleString)  // Store roles as CSV string
                .cguAccepted(cguAccepted)
                .cguVersion(userDTO.getCguVersion())
                .cguAcceptedAt(userDTO.getCguAcceptedAt())
                .cguDeliveredByAdmin(cguDeliveredByAdmin)
                .cguDeliveredAt(cguDeliveredByAdmin
                        ? (userDTO.getCguDeliveredAt() != null ? userDTO.getCguDeliveredAt() : java.time.Instant.now())
                        : null)
                .build();

        User createdUser = userService.createUser(user);
        
        // Return response with user and roles
        return new ResponseEntity<>(new AuthResponse(
                jwtUtil.generateToken(createdUser.getSurname(), createdUser.getSchoolId(), createdUser.getRole()),
                createdUser),
                HttpStatus.CREATED);
    }

    // DTO for the authentication response
    public static class AuthResponse {
        private final String token;
        private final UserResponse user;

        public AuthResponse(String token, User user) {
            this.token = token;
            this.user = user != null ? new UserResponse(user) : null;
        }

        public String getToken() {
            return token;
        }

        public UserResponse getUser() {
            return user;
        }
    }

    // DTO for user information in response
    public static class UserResponse {
        private final Integer id;
        private final String username;
        private final String civilite;
        private final String firstname;
        private final String email;
        private final String schoolId;
        private final java.util.List<String> roles;
        private final boolean cguAccepted;
        private final String cguVersion;
        private final boolean cguDeliveredByAdmin;

        public UserResponse(User user) {
            this.id = user.getUserno();
            this.username = user.getSurname();
            this.civilite = user.getCivilite();
            this.firstname = user.getFirstname();
            this.email = user.getEmail();
            this.schoolId = user.getSchoolId();
            // Convert single role to list of roles
            this.roles = user.getRole() != null ? 
                java.util.Arrays.asList(user.getRole().split(",")) : 
                java.util.Collections.emptyList();
            this.cguAccepted = user.isCguAccepted();
            this.cguVersion = user.getCguVersion();
            this.cguDeliveredByAdmin = user.isCguDeliveredByAdmin();
        }

        public Integer getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getCivilite() {
            return civilite;
        }

        public String getFirstname() {
            return firstname;
        }

        public String getEmail() {
            return email;
        }

        public String getSchoolId() {
            return schoolId;
        }

        public java.util.List<String> getRoles() {
            return roles;
        }

        public boolean isCguAccepted() {
            return cguAccepted;
        }

        public String getCguVersion() {
            return cguVersion;
        }

        public boolean isCguDeliveredByAdmin() {
            return cguDeliveredByAdmin;
        }
    }
}
