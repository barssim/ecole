package ma.solide.teacherservice.dto;

import lombok.Data;

@Data
public class ParentMeetingRequest {

    private String title;
    private String date;
    private String location;
    private String details;
    private String createdBy;
}

