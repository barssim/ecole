package ma.solide.secretaryoffice.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchoolClassResponse {
    private Integer id;
    private String name;
    private List<String> students;
}

