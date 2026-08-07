package ma.solide.parentservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "parent_attestation_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttestationRequestRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "class_name")
    private String className;

    @Column(nullable = false)
    private String type;

    @Column(length = 2000)
    private String reason;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

