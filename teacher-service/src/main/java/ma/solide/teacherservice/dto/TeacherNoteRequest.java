package ma.solide.teacherservice.dto;

import lombok.Data;

@Data
public class TeacherNoteRequest {

    private String teacherId;
    private String teacherName;
    private String classId;
    private String className;
    private String studentName;
    private String subject;
    private String grade;
    private String date;
}

