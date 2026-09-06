package ma.solide.teacherservice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class TeacherCourseRequest {

    private String name;
    private String description;
    private String teacherId;
    private String teacherName;
    private String classId;
    private String className;
    private List<TeacherCourseFileRequest> files = new ArrayList<>();
}
