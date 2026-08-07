package ma.solide.parentservice.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ParentAttendanceRequest {

    private String studentName;
    private String className;
    private LocalDate date;
    private String status;
    private Integer minutesLate;
    private String comment;
}

