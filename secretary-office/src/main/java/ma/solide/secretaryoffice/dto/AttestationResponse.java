package ma.solide.secretaryoffice.dto;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttestationResponse {
    private Integer id;
    private Integer userId;
    private String studentName;
    private String className;
    private String title;
    private String type;
    private LocalDate date;
    private String status;
    private String documentUrl;
    private String viewUrl;
    private String issuedBy;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private String reference;
}

