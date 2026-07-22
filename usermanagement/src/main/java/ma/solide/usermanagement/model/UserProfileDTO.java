package ma.solide.usermanagement.model;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class UserProfileDTO {
    private Integer id;
    private String username;
    private String firstname;
    private String email;
    private String adresse;
    private List<String> roles;

    public static UserProfileDTO fromUser(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getUserno());
        dto.setUsername(user.getSurname());
        dto.setFirstname(user.getFirstname());
        dto.setEmail(user.getEmail());
        dto.setAdresse(user.getAdresse());
        dto.setRoles(user.getRole() != null && !user.getRole().isBlank()
                ? Arrays.asList(user.getRole().split(","))
                : Collections.emptyList());
        return dto;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}

