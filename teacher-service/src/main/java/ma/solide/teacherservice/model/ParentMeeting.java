package ma.solide.teacherservice.model;

import java.time.LocalDate;
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
@Table(name = "teacher_parent_meetings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentMeeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private String title;

    @Column(name = "meeting_date", nullable = false)
    private LocalDate meetingDate;

    @Column(nullable = false)
    private String location;

    @Column(length = 3000)
    private String details;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

