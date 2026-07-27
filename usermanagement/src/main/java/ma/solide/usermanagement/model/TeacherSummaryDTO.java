package ma.solide.usermanagement.model;

public class TeacherSummaryDTO {
    private Integer id;
    private String name;
    private String username;

    public TeacherSummaryDTO(Integer id, String name, String username) {
        this.id = id;
        this.name = name;
        this.username = username;
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
}

