package ma.solide.secretaryoffice.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ActivityRequestDTO {
    private String type;
    private String title;
    private LocalDate date;
    private String className;
    private String destination;
    private String description;
}

