package ma.solide.parentservice.dto;

import lombok.Data;

@Data
public class ParentRegistrationRequest {

    private String parentName;
    private String studentName;
    private String className;
    private String notes;
}

