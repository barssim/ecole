package ma.solide.teacherservice.repository;

import java.util.List;

import ma.solide.teacherservice.model.SharedDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SharedDocumentRepository extends JpaRepository<SharedDocument, Long> {

    List<SharedDocument> findAllByTenantIdOrderByUploadedAtDesc(String tenantId);
}

