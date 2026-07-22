package ma.solide.secretaryoffice.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class ExamRequestDTO {
    private String subject;
    private String className;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
    private String notes;
}

