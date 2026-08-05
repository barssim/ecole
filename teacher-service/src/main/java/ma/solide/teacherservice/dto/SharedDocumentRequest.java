package ma.solide.teacherservice.dto;

import lombok.Data;

@Data
public class SharedDocumentRequest {

    private String title;
    private String type;
    private String link;
    private String uploadedBy;
}

