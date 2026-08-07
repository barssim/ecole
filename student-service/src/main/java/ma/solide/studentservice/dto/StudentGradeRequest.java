package ma.solide.studentservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class StudentGradeRequest {

    private String studentId;
    private String studentName;
    private String subject;
    private BigDecimal grade;
    private BigDecimal maxGrade;
    private LocalDate date;
    private String classId;
    private String className;
    private String teacherName;
}

