package ma.solide.secretaryoffice.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActivityResponseDTO {
    private Integer id;
    private String type;
    private String title;
    private LocalDate date;
    private String className;
    private String destination;
    private String description;
    private String createdBy;
}

