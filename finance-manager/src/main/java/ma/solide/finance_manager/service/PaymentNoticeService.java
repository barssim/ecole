package ma.solide.finance_manager.service;

import ma.solide.finance_manager.dto.PaymentNoticeDTO;
import ma.solide.finance_manager.entity.PaymentNotice;
import ma.solide.finance_manager.repository.PaymentNoticeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentNoticeService {

    private final PaymentNoticeRepository paymentNoticeRepository;

    public PaymentNoticeService(PaymentNoticeRepository paymentNoticeRepository) {
        this.paymentNoticeRepository = paymentNoticeRepository;
    }

    /**
     * Get all payment notices
     */
    public List<PaymentNoticeDTO> getAllNotices() {
        List<PaymentNotice> notices = paymentNoticeRepository.findAll();
        return notices.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get payment notice by ID
     */
    public PaymentNoticeDTO getNoticeById(Integer id) {
        PaymentNotice notice = paymentNoticeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture non trouvée"));
        return toDTO(notice);
    }

    /**
     * Get payment notices for a specific student
     */
    public List<PaymentNoticeDTO> getNoticesByStudent(String studentName) {
        List<PaymentNotice> notices = paymentNoticeRepository.findByStudentName(studentName);
        return notices.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get payment notice for current month/student (the "current" invoice)
     */
    public PaymentNoticeDTO getCurrentNotice(String studentName) {
        List<PaymentNotice> notices = paymentNoticeRepository.findByStudentName(studentName);
        
        // Return the most recent pending or unpaid notice
        return notices.stream()
                .filter(n -> "pending".equals(n.getStatus()) || "unpaid".equals(n.getStatus()))
                .sorted((a, b) -> b.getInvoiceDate().compareTo(a.getInvoiceDate()))
                .findFirst()
                .map(this::toDTO)
                .orElse(null);
    }

    /**
     * Create a new payment notice
     */
    public PaymentNoticeDTO createNotice(PaymentNoticeDTO noticeDTO) {
        if (noticeDTO.getStudentName() == null || noticeDTO.getStudentName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de l'élève requis");
        }
        if (noticeDTO.getTotalAmount() == null || noticeDTO.getTotalAmount() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Montant total invalide");
        }

        PaymentNotice notice = new PaymentNotice();
        notice.setInvoiceNumber(generateInvoiceNumber());
        notice.setInvoiceDate(noticeDTO.getInvoiceDate() != null ? noticeDTO.getInvoiceDate() : LocalDate.now());
        notice.setDueDate(noticeDTO.getDueDate() != null ? noticeDTO.getDueDate() : LocalDate.now().plusDays(15));
        notice.setStudentName(noticeDTO.getStudentName().trim());
        notice.setClassName(noticeDTO.getClassName() != null ? noticeDTO.getClassName() : "-");
        notice.setTotalAmount(noticeDTO.getTotalAmount());
        notice.setCurrency(noticeDTO.getCurrency() != null ? noticeDTO.getCurrency() : "MAD");
        notice.setStatus("pending");
        notice.setDescription(noticeDTO.getDescription());

        PaymentNotice saved = paymentNoticeRepository.save(notice);
        return toDTO(saved);
    }

    /**
     * Update payment notice status
     */
    public PaymentNoticeDTO updateNoticeStatus(Integer id, String status) {
        PaymentNotice notice = paymentNoticeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facture non trouvée"));

        if (status == null || status.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut requis");
        }

        String validStatus = status.trim().toLowerCase();
        if (!List.of("pending", "paid", "unpaid", "overdue").contains(validStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide");
        }

        notice.setStatus(validStatus);
        if ("paid".equals(validStatus)) {
            notice.setPaidDate(LocalDate.now());
        }

        PaymentNotice updated = paymentNoticeRepository.save(notice);
        return toDTO(updated);
    }

    /**
     * Get notices by status
     */
    public List<PaymentNoticeDTO> getNoticesByStatus(String status) {
        List<PaymentNotice> notices = paymentNoticeRepository.findByStatus(status);
        return notices.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Generate unique invoice number
     */
    private String generateInvoiceNumber() {
        YearMonth now = YearMonth.now();
        long count = paymentNoticeRepository.findAll().stream()
                .filter(n -> n.getInvoiceDate().getYear() == now.getYear() &&
                            n.getInvoiceDate().getMonthValue() == now.getMonthValue())
                .count();
        return String.format("INV-%d%02d-%04d", now.getYear(), now.getMonthValue(), count + 1);
    }

    private PaymentNoticeDTO toDTO(PaymentNotice notice) {
        PaymentNoticeDTO dto = new PaymentNoticeDTO(
                notice.getId(),
                notice.getInvoiceNumber(),
                notice.getInvoiceDate(),
                notice.getDueDate(),
                notice.getStudentName(),
                notice.getClassName(),
                notice.getTotalAmount(),
                notice.getCurrency(),
                notice.getStatus()
        );
        dto.setPaidDate(notice.getPaidDate());
        return dto;
    }
}

