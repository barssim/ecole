package ma.solide.parentservice.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ParentPaymentRequest {

    private String studentName;
    private String className;
    private Double amount;
    private String currency;
    private String method;
    private LocalDate paymentDate;
    private String reference;
    private String notes;
}

