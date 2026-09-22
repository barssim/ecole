package ma.solide.usermanagement.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserDTO {

	String civilite;
	String surname;
	String firstname;
	String email;
	String adresse;
	String password;
	List<String> roles;  // Accept roles as a list from the frontend
	Boolean cguAccepted;
	String cguVersion;
	java.time.Instant cguAcceptedAt;
	Boolean cguDeliveredByAdmin;
	java.time.Instant cguDeliveredAt;

}
