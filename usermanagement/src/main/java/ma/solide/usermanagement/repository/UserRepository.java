package ma.solide.usermanagement.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.usermanagement.model.User;


public interface UserRepository extends JpaRepository<User, Integer> {
	Optional<User> findById(Integer id);
	List<User> findBySchoolId(String schoolId);
	long countBySchoolId(String schoolId);
	boolean existsBySchoolIdAndSurnameAndPassword(String schoolId, String username, String password);
	List<User> findAllBySchoolIdAndSurnameAndPassword(String schoolId, String username, String password);
	Optional<User> findBySchoolIdAndUserno(String schoolId, Integer id);

}
