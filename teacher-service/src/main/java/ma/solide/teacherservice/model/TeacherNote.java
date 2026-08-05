package ma.solide.teacherservice.model;

import java.math.BigDecimal;
import java.time.LocalDate;

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
@Table(name = "teacher_notes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "teacher_id", nullable = false)
    private String teacherId;

    @Column(name = "class_id", nullable = false)
    private String classId;

    @Column(name = "class_name")
    private String className;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal grade;

    @Column(name = "entry_date", nullable = false)
    private LocalDate date;
}

