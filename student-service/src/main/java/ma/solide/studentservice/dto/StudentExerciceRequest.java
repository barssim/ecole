package ma.solide.studentservice.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class StudentExerciceRequest {

    private String studentId;
    private String title;
    private String description;
    private String subject;
    private String classId;
    private String className;
    private LocalDate dueDate;
    private String attachmentUrl;
    private String attachmentName;
    private String createdBy;
    private String status;
}


