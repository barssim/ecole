package ma.solide.usermanagement.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

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
}