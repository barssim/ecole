package ma.solide.finance_manager.dto;

public class InvoiceItemDTO {
    private String label;
    private Double amount;

    public InvoiceItemDTO() {}

    public InvoiceItemDTO(String label, Double amount) {
        this.label = label;
        this.amount = amount;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}

