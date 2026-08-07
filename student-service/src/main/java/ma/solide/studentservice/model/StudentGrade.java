package ma.solide.studentservice.model;

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
@Table(name = "student_grades")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "student_name")
    private String studentName;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal grade;

    @Column(name = "max_grade", nullable = false, precision = 5, scale = 2)
    private BigDecimal maxGrade;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "class_id")
    private String classId;

    @Column(name = "class_name")
    private String className;

    @Column(name = "teacher_name")
    private String teacherName;
}

