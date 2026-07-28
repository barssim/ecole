package ma.solide.usermanagement.service;

import java.util.List;
import java.util.Optional;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import ma.solide.usermanagement.model.TeacherSummaryDTO;
import ma.solide.usermanagement.model.StudentSummaryDTO;
import ma.solide.usermanagement.model.User;
import ma.solide.usermanagement.model.UserProfileDTO;
import ma.solide.usermanagement.repository.UserRepository;
import ma.solide.usermanagement.tenant.TenantContext;

@Service
public class UserService {


	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public Optional<User> getUser(Integer userNo) {
		if (userNo == null) {
			throw new IllegalArgumentException("User number cannot be null");
		}
		String tenantId = TenantContext.getRequiredTenantId();
		return userRepository.findByTenantIdAndUserno(tenantId, userNo);
	}

	public boolean existsBySurnameAndPassword(String username, String password)
	{
		String tenantId = TenantContext.getRequiredTenantId();
		return userRepository.existsByTenantIdAndSurnameAndPassword(tenantId, username, password);
		
	}

	public User findBySurname(String surname) {
		String tenantId = TenantContext.getRequiredTenantId();
		return userRepository.findByTenantIdAndSurname(tenantId, surname).orElse(null);
	}

	public List<User> findAllUsers() {
		String tenantId = TenantContext.getRequiredTenantId();
		return userRepository.findByTenantId(tenantId);
	}

	public List<UserProfileDTO> findAllUserProfiles() {
		return findAllUsers().stream().map(UserProfileDTO::fromUser).toList();
	}

	public List<TeacherSummaryDTO> findAllTeachers() {
		String tenantId = TenantContext.getRequiredTenantId();
		return userRepository.findByTenantId(tenantId)
				.stream()
				.filter(this::isTeacher)
				.map(this::toTeacherSummary)
				.toList();
	}

	public List<StudentSummaryDTO> findAllStudents() {
		String tenantId = TenantContext.getRequiredTenantId();
		return userRepository.findByTenantId(tenantId)
				.stream()
				.filter(this::isStudent)
				.map(this::toStudentSummary)
				.toList();
	}

	public User createUser(User user) {
		user.setTenantId(TenantContext.getRequiredTenantId());
		return userRepository.save(user); // Inserts or updates the user
	}

	public User getUserOrThrow(Integer userNo) {
		if (userNo == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
		}
		String tenantId = TenantContext.getRequiredTenantId();
		return userRepository.findByTenantIdAndUserno(tenantId, userNo)
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
		if (!currentPassword.equals(user.getPassword())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
		}

		user.setPassword(newPassword);
		userRepository.save(user);
	}

	public User updateUserByManager(Integer userNo, String surname, String firstname, String email, String adresse, String role) {
		User user = getUserOrThrow(userNo);

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

		return new StudentSummaryDTO(user.getUserno(), fullName, lastName);
	}
}