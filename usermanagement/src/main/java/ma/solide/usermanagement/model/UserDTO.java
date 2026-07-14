package ma.solide.usermanagement.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserDTO {

	String surname;
	String firstname;
	String email;
	String adresse;
	String password;
	List<String> roles;  // Accept roles as a list from the frontend

}
