package ma.solide.teacherservice.controller;

import java.util.List;

import ma.solide.teacherservice.dto.SharedDocumentRequest;
import ma.solide.teacherservice.model.SharedDocument;
import ma.solide.teacherservice.service.SharedDocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher/shared-documents")
public class SharedDocumentController {

    private final SharedDocumentService service;

    public SharedDocumentController(SharedDocumentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<SharedDocument>> list() {
        return ResponseEntity.ok(service.list());
    }

    @PostMapping
    public ResponseEntity<SharedDocument> create(@RequestBody SharedDocumentRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

