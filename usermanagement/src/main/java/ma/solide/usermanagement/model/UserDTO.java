package ma.solide.usermanagement.model;

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

}
