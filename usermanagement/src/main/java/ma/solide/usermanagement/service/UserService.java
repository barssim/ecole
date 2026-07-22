package ma.solide.usermanagement.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import ma.solide.usermanagement.model.User;
import ma.solide.usermanagement.repository.UserRepository;

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
		return userRepository.findById(userNo);
	}

	public boolean existsBySurnameAndPassword(String username, String password)
	{
		return userRepository.existsBySurnameAndPassword(username, password);
		
	}

	public User findBySurname(String surname) {
		return userRepository.findBySurname(surname).orElse(null);
	}

	public List<User> findAllUsers() {
		return userRepository.findAll();
	}

	public User createUser(User user) {

		return userRepository.save(user); // Inserts or updates the user
	}

	public User getUserOrThrow(Integer userNo) {
		if (userNo == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
		}
		return userRepository.findById(userNo)
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
}