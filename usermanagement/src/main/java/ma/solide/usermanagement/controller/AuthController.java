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
            User user = userService.findBySurname(loginRequest.getUsername());
            String token = jwtUtil.generateToken(loginRequest.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, user));
        } else
            return ResponseEntity.status(401).body("Invalid username or password");

    }

    @PostMapping("/register")
    public ResponseEntity<User> createUser(@RequestBody UserDTO userDTO) {
        User user = User.builder()
                .surname(userDTO.getSurname())
                .firstname(userDTO.getFirstname())
                .email(userDTO.getEmail())
                .adresse(userDTO.getAdresse())
                .password(userDTO.getPassword())
                .build();

        User createdUser = userService.createUser(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
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
        private final String firstname;
        private final String email;
        private final java.util.List<String> roles;

        public UserResponse(User user) {
            this.id = user.getUserno();
            this.username = user.getSurname();
            this.firstname = user.getFirstname();
            this.email = user.getEmail();
            // Convert single role to list of roles
            this.roles = user.getRole() != null ? 
                java.util.Arrays.asList(user.getRole().split(",")) : 
                java.util.Collections.emptyList();
        }

        public Integer getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getFirstname() {
            return firstname;
        }

        public String getEmail() {
            return email;
        }

        public java.util.List<String> getRoles() {
            return roles;
        }
    }
}
