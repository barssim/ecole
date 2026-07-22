package ma.solide.secretaryoffice.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class ProfessorAttendanceRequestDTO {
    private Integer teacherId;
    private String teacherName;
    private LocalDate attendanceDate;
    private LocalTime scheduledTime;
    private LocalTime checkInTime;
    private String status;
    private String notes;
}

