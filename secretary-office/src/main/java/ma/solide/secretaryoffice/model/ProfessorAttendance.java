package ma.solide.secretaryoffice.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_professor_attendance")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, name = "teacher_id")
    private Integer teacherId;

    @Column(nullable = false, name = "teacher_name")
    private String teacherName;

    @Column(nullable = false, name = "attendance_date")
    private LocalDate attendanceDate;

    @Column(nullable = false, name = "scheduled_time")
    private LocalTime scheduledTime;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(nullable = false)
    private String status;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt;
}

