package ma.solide.parentservice.dto;

import lombok.Data;

@Data
public class AttestationRequestCreateRequest {

    private Integer userId;
    private String studentName;
    private String className;
    private String type;
    private String reason;
}

