package ma.solide.usermanagement.model;

import java.util.Map;

public class StudentSummaryDTO {
    private Integer id;
    private String name;
    private Map<String, String> names;
    private String username;
    private String email;

    public StudentSummaryDTO(Integer id, String name, String username) {
        this(id, name, null, username, null);
    }

    public StudentSummaryDTO(Integer id, String name, Map<String, String> names, String username, String email) {
        this.id = id;
        this.name = name;
        this.names = names;
        this.username = username;
        this.email = email;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Map<String, String> getNames() {
        return names;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}
