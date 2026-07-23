package ma.solide.finance_manager.service;

import ma.solide.finance_manager.dto.PaymentDTO;
import ma.solide.finance_manager.entity.Payment;
import ma.solide.finance_manager.repository.PaymentRepository;
import ma.solide.finance_manager.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /**
     * Get all payments for a specific student
     */
    public List<PaymentDTO> getPaymentsByStudent(String studentName) {
        String tenantId = TenantContext.getRequiredTenantId();
        List<Payment> payments = paymentRepository.findByTenantIdAndStudentName(tenantId, studentName);
        return payments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all payments for a specific class
     */
    public List<PaymentDTO> getPaymentsByClass(String className) {
        String tenantId = TenantContext.getRequiredTenantId();
        List<Payment> payments = paymentRepository.findByTenantIdAndClassName(tenantId, className);
        return payments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all payments
     */
    public List<PaymentDTO> getAllPayments() {
        String tenantId = TenantContext.getRequiredTenantId();
        List<Payment> payments = paymentRepository.findByTenantId(tenantId);
        return payments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Record a new payment
     */
    public PaymentDTO recordPayment(PaymentDTO paymentDTO) {
        String tenantId = TenantContext.getRequiredTenantId();
        if (paymentDTO.getStudentName() == null || paymentDTO.getStudentName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de l'élève requis");
        }
        if (paymentDTO.getAmount() == null || paymentDTO.getAmount() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Montant invalide");
        }

        Payment payment = new Payment();
        payment.setTenantId(tenantId);
        payment.setStudentName(paymentDTO.getStudentName().trim());
        payment.setClassName(paymentDTO.getClassName() != null ? paymentDTO.getClassName() : "-");
        payment.setAmount(paymentDTO.getAmount());
        payment.setCurrency(paymentDTO.getCurrency() != null ? paymentDTO.getCurrency() : "MAD");
        payment.setMethod(paymentDTO.getMethod() != null ? paymentDTO.getMethod() : "unknown");
        payment.setPaymentDate(paymentDTO.getPaymentDate() != null ? paymentDTO.getPaymentDate() : LocalDate.now());
        payment.setReference(paymentDTO.getReference());
        payment.setNotes(paymentDTO.getNotes());

        Payment saved = paymentRepository.save(payment);
        return toDTO(saved);
    }

    /**
     * Get payment by ID
     */
    public PaymentDTO getPaymentById(Integer id) {
        String tenantId = TenantContext.getRequiredTenantId();
        Payment payment = paymentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement non trouvé"));
        return toDTO(payment);
    }

    /**
     * Update payment
     */
    public PaymentDTO updatePayment(Integer id, PaymentDTO paymentDTO) {
        String tenantId = TenantContext.getRequiredTenantId();
        Payment payment = paymentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement non trouvé"));

        if (paymentDTO.getStudentName() != null && !paymentDTO.getStudentName().trim().isEmpty()) {
            payment.setStudentName(paymentDTO.getStudentName().trim());
        }
        if (paymentDTO.getClassName() != null) {
            payment.setClassName(paymentDTO.getClassName());
        }
        if (paymentDTO.getAmount() != null && paymentDTO.getAmount() > 0) {
            payment.setAmount(paymentDTO.getAmount());
        }
        if (paymentDTO.getCurrency() != null) {
            payment.setCurrency(paymentDTO.getCurrency());
        }
        if (paymentDTO.getMethod() != null) {
            payment.setMethod(paymentDTO.getMethod());
        }
        if (paymentDTO.getPaymentDate() != null) {
            payment.setPaymentDate(paymentDTO.getPaymentDate());
        }
        if (paymentDTO.getReference() != null) {
            payment.setReference(paymentDTO.getReference());
        }
        if (paymentDTO.getNotes() != null) {
            payment.setNotes(paymentDTO.getNotes());
        }

        Payment updated = paymentRepository.save(payment);
        return toDTO(updated);
    }

    /**
     * Delete payment
     */
    public void deletePayment(Integer id) {
        String tenantId = TenantContext.getRequiredTenantId();
        Payment payment = paymentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paiement non trouvé"));
        paymentRepository.delete(payment);
    }

    private PaymentDTO toDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO(
                payment.getId(),
                payment.getStudentName(),
                payment.getClassName(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getMethod(),
                payment.getPaymentDate()
        );
        dto.setReference(payment.getReference());
        dto.setNotes(payment.getNotes());
        return dto;
    }
}

