package ma.solide.teacherservice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class TeacherCourseRequest {

    private String name;
    private String description;
    private String teacherId;
    private List<TeacherCourseFileRequest> files = new ArrayList<>();
}

