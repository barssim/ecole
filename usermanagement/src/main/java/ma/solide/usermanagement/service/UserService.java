package ma.solide.usermanagement.service;

import java.util.List;
import java.util.Optional;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import ma.solide.usermanagement.model.TeacherSummaryDTO;
import ma.solide.usermanagement.model.StudentSummaryDTO;
import ma.solide.usermanagement.model.User;
import ma.solide.usermanagement.model.UserProfileDTO;
import ma.solide.usermanagement.repository.UserRepository;
import ma.solide.usermanagement.school.SchoolContext;

@Service
public class UserService {


	private final UserRepository userRepository;
	private final SchoolCustomizationService schoolCustomizationService;
	private final CustomerVersionPolicy customerVersionPolicy;
	private final WelcomeEmailService welcomeEmailService;
	private final PasswordEncoder passwordEncoder;

	public UserService(
			UserRepository userRepository,
			SchoolCustomizationService schoolCustomizationService,
			CustomerVersionPolicy customerVersionPolicy,
			WelcomeEmailService welcomeEmailService,
			PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.schoolCustomizationService = schoolCustomizationService;
		this.customerVersionPolicy = customerVersionPolicy;
		this.welcomeEmailService = welcomeEmailService;
		this.passwordEncoder = passwordEncoder;
	}

	public Optional<User> getUser(Integer userNo) {
		if (userNo == null) {
			throw new IllegalArgumentException("User number cannot be null");
		}
		String schoolId = SchoolContext.getRequiredSchoolId();
		return userRepository.findBySchoolIdAndUserno(schoolId, userNo);
	}

	public User authenticate(String username, String password) {
		if (username == null || username.isBlank() || password == null) {
			return null;
		}
		String schoolId = SchoolContext.getRequiredSchoolId();
		return userRepository.findAllBySchoolIdAndSurname(schoolId, username).stream()
				.filter(user -> passwordMatches(password, user.getPassword()))
				.findFirst()
				.map(user -> upgradeLegacyPassword(user, password))
				.orElse(null);
	}

	public List<User> findAllUsers() {
		String schoolId = SchoolContext.getRequiredSchoolId();
		return userRepository.findBySchoolId(schoolId);
	}

	public List<UserProfileDTO> findAllUserProfiles() {
		return findAllUsers().stream().map(UserProfileDTO::fromUser).toList();
	}

	public List<TeacherSummaryDTO> findAllTeachers() {
		String schoolId = SchoolContext.getRequiredSchoolId();
		return userRepository.findBySchoolId(schoolId)
				.stream()
				.filter(this::isTeacher)
				.map(this::toTeacherSummary)
				.toList();
	}

	public List<StudentSummaryDTO> findAllStudents() {
		String schoolId = SchoolContext.getRequiredSchoolId();
		return userRepository.findBySchoolId(schoolId)
				.stream()
				.filter(this::isStudent)
				.map(this::toStudentSummary)
				.toList();
	}

	public User createUser(User user) {
		String schoolId = SchoolContext.getRequiredSchoolId();
		enforceSchoolUserLimit(schoolId);
		user.setSchoolId(schoolId);
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		User savedUser = userRepository.save(user); // Inserts or updates the user
		welcomeEmailService.sendWelcomeEmail(savedUser);
		return savedUser;
	}

	private void enforceSchoolUserLimit(String schoolId) {
		long currentUserCount = userRepository.countBySchoolId(schoolId);
		String customerVersion = schoolCustomizationService.resolveCustomerVersion(schoolId);
		long maxUsers = customerVersionPolicy.resolveMaxUsers(customerVersion);

		if (currentUserCount >= maxUsers) {
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"Maximum users reached for version '" + customerVersion + "' (" + maxUsers + ")."
			);
		}
	}

	public User getUserOrThrow(Integer userNo) {
		if (userNo == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
		}
		String schoolId = SchoolContext.getRequiredSchoolId();
		return userRepository.findBySchoolIdAndUserno(schoolId, userNo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
	}

	public User updateProfile(Integer userNo, String firstname, String surname, String email, String adresse) {
		User user = getUserOrThrow(userNo);

		if (firstname != null && !firstname.trim().isEmpty()) {
			user.setFirstname(firstname.trim());
		}
		if (surname != null && !surname.trim().isEmpty()) {
			user.setSurname(surname.trim());
		}
		if (email != null && !email.trim().isEmpty()) {
			user.setEmail(email.trim());
		}
		if (adresse != null) {
			user.setAdresse(adresse.trim());
		}

		return userRepository.save(user);
	}

	public void changePassword(Integer userNo, String currentPassword, String newPassword) {
		User user = getUserOrThrow(userNo);

		if (currentPassword == null || currentPassword.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required");
		}
		if (newPassword == null || newPassword.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
		}
		if (newPassword.length() < 6) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters");
		}
		if (!passwordMatches(currentPassword, user.getPassword())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
		}

		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}

	private boolean passwordMatches(String rawPassword, String storedPassword) {
		if (storedPassword == null) {
			return false;
		}
		if (storedPassword.startsWith("$2a$")
				|| storedPassword.startsWith("$2b$")
				|| storedPassword.startsWith("$2y$")) {
			return passwordEncoder.matches(rawPassword, storedPassword);
		}
		return storedPassword.equals(rawPassword);
	}

	private User upgradeLegacyPassword(User user, String rawPassword) {
		String storedPassword = user.getPassword();
		if (storedPassword != null && !storedPassword.startsWith("$2")) {
			user.setPassword(passwordEncoder.encode(rawPassword));
			return userRepository.save(user);
		}
		return user;
	}

	public User acceptCgu(Integer userNo, String version, Instant acceptedAt) {
		User user = getUserOrThrow(userNo);
		user.setCguAccepted(true);
		user.setCguVersion(version);
		user.setCguAcceptedAt(acceptedAt);
		return userRepository.save(user);
	}

	public User updateUserByManager(Integer userNo, String civilite, String surname, String firstname, String email, String adresse, String role) {
		User user = getUserOrThrow(userNo);

		if (civilite != null) {
			user.setCivilite(civilite.trim());
		}
		if (surname != null && !surname.trim().isEmpty()) {
			user.setSurname(surname.trim());
		}
		if (firstname != null && !firstname.trim().isEmpty()) {
			user.setFirstname(firstname.trim());
		}
		if (email != null && !email.trim().isEmpty()) {
			user.setEmail(email.trim());
		}
		if (adresse != null) {
			user.setAdresse(adresse.trim());
		}
		if (role != null && !role.trim().isEmpty()) {
			user.setRole(normalizeRole(role));
		}

		return userRepository.save(user);
	}

	public void deleteUserByManager(Integer userNo) {
		User user = getUserOrThrow(userNo);
		userRepository.delete(user);
	}

	private String normalizeRole(String roleCsv) {
		String normalized = Arrays.stream(String.valueOf(roleCsv).split(","))
				.map(value -> value == null ? "" : value.trim().toLowerCase())
				.filter(value -> !value.isBlank())
				.distinct()
				.collect(Collectors.joining(","));

		if (normalized.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
		}

		return normalized;
	}

	private boolean isTeacher(User user) {
		if (user == null || user.getRole() == null) {
			return false;
		}

		return Arrays.stream(user.getRole().split(","))
				.map(role -> role == null ? "" : role.trim().toLowerCase())
				.anyMatch(role -> role.equals("teacher") || role.equals("role_teacher") || role.endsWith("_teacher"));
	}

	private boolean isStudent(User user) {
		if (user == null || user.getRole() == null) {
			return false;
		}

		return Arrays.stream(user.getRole().split(","))
				.map(role -> role == null ? "" : role.trim().toLowerCase())
				.anyMatch(role -> role.equals("student") || role.equals("role_student") || role.endsWith("_student"));
	}

	private TeacherSummaryDTO toTeacherSummary(User user) {
		String firstName = user.getFirstname() == null ? "" : user.getFirstname().trim();
		String lastName = user.getSurname() == null ? "" : user.getSurname().trim();
		String fullName = (firstName + " " + lastName).trim();
		if (fullName.isEmpty()) {
			fullName = lastName.isEmpty() ? "Teacher #" + user.getUserno() : lastName;
		}

		return new TeacherSummaryDTO(user.getUserno(), fullName, lastName);
	}

	private StudentSummaryDTO toStudentSummary(User user) {
		String firstName = user.getFirstname() == null ? "" : user.getFirstname().trim();
		String lastName = user.getSurname() == null ? "" : user.getSurname().trim();
		String fullName = (firstName + " " + lastName).trim();
		if (fullName.isEmpty()) {
			fullName = lastName.isEmpty() ? "Student #" + user.getUserno() : lastName;
		}

		return new StudentSummaryDTO(user.getUserno(), fullName, lastName, user.getEmail());
	}
}