package ma.solide.parentservice.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ParentProgressRequest {

    private String studentName;
    private String className;
    private String subject;
    private Double score;
    private Double maxScore;
    private String status;
    private LocalDate date;
}

