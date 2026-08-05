package ma.solide.teacherservice.dto;

import lombok.Data;

@Data
public class TeacherAssignmentRequest {

    private String teacherId;
    private String classId;
    private String className;
    private String title;
    private String description;
    private String dueDate;
    private String createdBy;
}

