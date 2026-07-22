package ma.solide.finance_manager.dto;

import java.time.LocalDate;
import java.util.List;

public class FactureDTO {
    private Integer id;
    private String invoiceNumber;
    private String studentName;
    private String className;
    private Double totalAmount;
    private String currency;
    private LocalDate generatedDate;
    private List<FactureItemDTO> items;

    public static class FactureItemDTO {
        private String description;
        private Double amount;

        public FactureItemDTO() {
        }

        public FactureItemDTO(String description, Double amount) {
            this.description = description;
            this.amount = amount;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
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

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDate getGeneratedDate() {
        return generatedDate;
    }

    public void setGeneratedDate(LocalDate generatedDate) {
        this.generatedDate = generatedDate;
    }

    public List<FactureItemDTO> getItems() {
        return items;
    }

    public void setItems(List<FactureItemDTO> items) {
        this.items = items;
    }
}

