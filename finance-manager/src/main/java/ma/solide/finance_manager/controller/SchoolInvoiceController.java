package ma.solide.finance_manager.controller;

import ma.solide.finance_manager.dto.PaymentDTO;
import ma.solide.finance_manager.dto.PaymentNoticeDTO;
import ma.solide.finance_manager.dto.InvoiceItemDTO;
import ma.solide.finance_manager.service.SchoolInvoicePdfService;
import ma.solide.finance_manager.service.PaymentService;
import ma.solide.finance_manager.service.PaymentNoticeService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SchoolInvoiceController {

    private final SchoolInvoicePdfService pdfService;
    private final PaymentService paymentService;
    private final PaymentNoticeService paymentNoticeService;

    public SchoolInvoiceController(SchoolInvoicePdfService pdfService,
                                   PaymentService paymentService,
                                   PaymentNoticeService paymentNoticeService) {
        this.pdfService = pdfService;
        this.paymentService = paymentService;
        this.paymentNoticeService = paymentNoticeService;
    }

    /**
     * Get current payment notice for a student
     * Returns the most recent pending/unpaid invoice
     */
    @GetMapping("/paymentNotice")
    public ResponseEntity<PaymentNoticeDTO> getPaymentNotice(
            @RequestParam(value = "studentName", required = false) String studentName) {
        if (studentName == null || studentName.trim().isEmpty()) {
            // Return a sample notice if no student specified
            PaymentNoticeDTO sample = new PaymentNoticeDTO(
                    1,
                    "INV-2025-07-001",
                    java.time.LocalDate.of(2025, 7, 6),
                    java.time.LocalDate.of(2025, 7, 15),
                    "Yasmine El Idrissi",
                    "5ème année",
                    1500.0,
                    "MAD",
                    "pending"
            );
            return ResponseEntity.ok(sample);
        }

        PaymentNoticeDTO notice = paymentNoticeService.getCurrentNotice(studentName);
        if (notice != null) {
            return ResponseEntity.ok(notice);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get all payment notices for a student
     */
    @GetMapping("/paymentNotices")
    public ResponseEntity<List<PaymentNoticeDTO>> getPaymentNotices(
            @RequestParam(value = "studentName", required = false) String studentName) {
        if (studentName == null || studentName.trim().isEmpty()) {
            return ResponseEntity.ok(paymentNoticeService.getAllNotices());
        }
        return ResponseEntity.ok(paymentNoticeService.getNoticesByStudent(studentName));
    }

    /**
     * Get all payments history
     */
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentDTO>> getPayments(
            @RequestParam(value = "studentName", required = false) String studentName,
            @RequestParam(value = "className", required = false) String className) {
        if (studentName != null && !studentName.trim().isEmpty()) {
            return ResponseEntity.ok(paymentService.getPaymentsByStudent(studentName));
        }
        if (className != null && !className.trim().isEmpty()) {
            return ResponseEntity.ok(paymentService.getPaymentsByClass(className));
        }
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    /**
     * Get a single payment by ID
     */
    @GetMapping("/payments/{id}")
    public ResponseEntity<PaymentDTO> getPaymentById(@PathVariable Integer id) {
        PaymentDTO payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }

    /**
     * Record a new payment
     * Only finance, admin, and manager roles are allowed
     */
    @PostMapping("/payments")
    public ResponseEntity<PaymentDTO> recordPayment(
            @RequestBody PaymentDTO paymentDTO,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        
        // Check if user has permission to create payments
        if (!isAuthorizedToCreatePayment(userRolesHeader)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Only finance, admin, and manager roles can create payments");
        }
        
        PaymentDTO saved = paymentService.recordPayment(paymentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Update an existing payment
     * Only finance, admin, and manager roles are allowed
     */
    @PutMapping("/payments/{id}")
    public ResponseEntity<PaymentDTO> updatePayment(
            @PathVariable Integer id,
            @RequestBody PaymentDTO paymentDTO,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        
        // Check if user has permission to update payments
        if (!isAuthorizedToCreatePayment(userRolesHeader)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Only finance, admin, and manager roles can update payments");
        }
        
        PaymentDTO updated = paymentService.updatePayment(id, paymentDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a payment
     * Only finance, admin, and manager roles are allowed
     */
    @DeleteMapping("/payments/{id}")
    public ResponseEntity<Void> deletePayment(
            @PathVariable Integer id,
            @RequestHeader(value = "X-User-Roles", required = false) String userRolesHeader) {
        
        // Check if user has permission to delete payments
        if (!isAuthorizedToCreatePayment(userRolesHeader)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Only finance, admin, and manager roles can delete payments");
        }
        
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Check if user has permission to create payments
     */
    private boolean isAuthorizedToCreatePayment(String userRolesHeader) {
        if (userRolesHeader == null || userRolesHeader.trim().isEmpty()) {
            return false;
        }
        
        String[] roles = userRolesHeader.split(",");
        for (String role : roles) {
            String trimmedRole = role.trim().toLowerCase();
            if ("finance".equals(trimmedRole) || 
                "admin".equals(trimmedRole) || 
                "manager".equals(trimmedRole)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create a new payment notice
     */
    @PostMapping("/paymentNotices")
    public ResponseEntity<PaymentNoticeDTO> createPaymentNotice(@RequestBody PaymentNoticeDTO noticeDTO) {
        PaymentNoticeDTO created = paymentNoticeService.createNotice(noticeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update payment notice status (mark as paid, pending, etc.)
     */
    @PatchMapping("/paymentNotices/{id}/status")
    public ResponseEntity<PaymentNoticeDTO> updatePaymentNoticeStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        PaymentNoticeDTO updated = paymentNoticeService.updateNoticeStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Generate PDF invoice
     */
    @PostMapping("/facture/generate")
    public ResponseEntity<InputStreamResource> generate(@RequestBody InvoiceRequest request) {
        var pdf = pdfService.generateInvoice(request.getStudentName(), request.getClassName(), request.getItems());

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=facture.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(pdf));
    }

    public static class InvoiceRequest {
        private String studentName;
        private String className;
        private List<Map<String, Object>> items;

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

        public List<Map<String, Object>> getItems() {
            return items;
        }

        public void setItems(List<Map<String, Object>> items) {
            this.items = items;
        }
    }
}
