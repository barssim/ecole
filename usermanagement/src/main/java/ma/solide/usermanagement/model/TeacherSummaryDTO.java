package ma.solide.usermanagement.model;

import java.util.Map;

public class TeacherSummaryDTO {
    private Integer id;
    private String name;
    private Map<String, String> names;
    private String username;

    public TeacherSummaryDTO(Integer id, String name, Map<String, String> names, String username) {
        this.id = id;
        this.name = name;
        this.names = names;
        this.username = username;
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
}
