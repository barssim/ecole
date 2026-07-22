package ma.solide.secretaryoffice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfessorAttendanceResponseDTO {
    private Integer id;
    private Integer teacherId;
    private String teacherName;
    private LocalDate attendanceDate;
    private LocalTime scheduledTime;
    private LocalTime checkInTime;
    private String status;
    private String notes;
    private LocalDateTime updatedAt;
}

