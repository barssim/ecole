package ma.solide.finance_manager.controller;

import ma.solide.finance_manager.service.SchoolInvoicePdfService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facture")
public class SchoolInvoiceController {

    private final SchoolInvoicePdfService pdfService;

    public SchoolInvoiceController(SchoolInvoicePdfService pdfService) {
        this.pdfService = pdfService;
    }

    @PostMapping("/generate")
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
