package ma.solide.secretaryoffice.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExamResponseDTO {
    private Integer id;
    private String subject;
    private String className;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    private String notes;
}

