package ma.solide.usermanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tb_user")
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Integer userno;
	
	@Column(length = 255)  // Allow multiple comma-separated roles
	String role;

	@Column(name = "school_id", nullable = false, length = 64)
	String schoolId;

	@Column(length = 20)
	String civilite;

	String surname;
	String firstname;
	String email;
	String adresse;
	String password;

	@Column(name = "cgu_accepted")
	boolean cguAccepted;

	@Column(name = "cgu_version", length = 32)
	String cguVersion;

	@Column(name = "cgu_accepted_at")
	java.time.Instant cguAcceptedAt;

	@Column(name = "cgu_delivered_by_admin")
	boolean cguDeliveredByAdmin;

	@Column(name = "cgu_delivered_at")
	java.time.Instant cguDeliveredAt;
	
}
