package ma.solide.finance_manager.dto;

import java.time.LocalDate;

public class PaymentDTO {
    private Integer id;
    private String studentName;
    private String className;
    private Double amount;
    private String currency;
    private String method;
    private LocalDate paymentDate;
    private String reference;
    private String notes;

    public PaymentDTO() {}

    public PaymentDTO(Integer id, String studentName, String className, Double amount,
                     String currency, String method, LocalDate paymentDate) {
        this.id = id;
        this.studentName = studentName;
        this.className = className;
        this.amount = amount;
        this.currency = currency;
        this.method = method;
        this.paymentDate = paymentDate;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

