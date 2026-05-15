package ma.solide.usermanagement.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.usermanagement.model.User;


public interface UserRepository extends JpaRepository<User, Integer> {
	Optional<User> findById(Integer id);
	List<User> findAll();
	boolean existsBySurnameAndPassword(String username, String password);

}
