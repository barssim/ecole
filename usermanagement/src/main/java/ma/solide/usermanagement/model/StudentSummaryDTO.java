package ma.solide.usermanagement.model;

public class StudentSummaryDTO {
    private Integer id;
    private String name;
    private String username;
    private String email;

    public StudentSummaryDTO(Integer id, String name, String username) {
        this(id, name, username, null);
    }

    public StudentSummaryDTO(Integer id, String name, String username, String email) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}

