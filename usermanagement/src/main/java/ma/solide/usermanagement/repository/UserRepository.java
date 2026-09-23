package ma.solide.usermanagement.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.usermanagement.model.User;


public interface UserRepository extends JpaRepository<User, Integer> {
	Optional<User> findById(Integer id);
	List<User> findBySchoolId(String schoolId);
	long countBySchoolId(String schoolId);
	List<User> findAllBySchoolIdAndSurname(String schoolId, String username);
	List<User> findAllBySchoolIdAndEmailIn(String schoolId, List<String> emails);
	Optional<User> findBySchoolIdAndUserno(String schoolId, Integer id);

}
