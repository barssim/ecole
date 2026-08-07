package ma.solide.studentservice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class StudentScheduleRequest {

    private String studentId;
    private String day;
    private List<String> slots = new ArrayList<>();
}

