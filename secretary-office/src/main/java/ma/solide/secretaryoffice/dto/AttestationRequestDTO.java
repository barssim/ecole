package ma.solide.secretaryoffice.dto;

import lombok.Data;

@Data
public class AttestationRequestDTO {
    private Integer userId;
    private String studentName;
    private String className;
    private String type;
    private String reason;
}

