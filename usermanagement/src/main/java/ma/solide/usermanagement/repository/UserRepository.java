package ma.solide.usermanagement.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ma.solide.usermanagement.model.User;


public interface UserRepository extends JpaRepository<User, Integer> {
	Optional<User> findById(Integer id);
	List<User> findByTenantId(String tenantId);
	boolean existsByTenantIdAndSurnameAndPassword(String tenantId, String username, String password);
	Optional<User> findByTenantIdAndSurname(String tenantId, String surname);
	Optional<User> findByTenantIdAndUserno(String tenantId, Integer id);

}
