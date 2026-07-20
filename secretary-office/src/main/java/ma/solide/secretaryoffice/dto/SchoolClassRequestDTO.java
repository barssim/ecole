package ma.solide.secretaryoffice.dto;

import java.util.List;

import lombok.Data;

@Data
public class SchoolClassRequestDTO {
    private String name;
    private List<String> students;
}

