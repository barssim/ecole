package ma.solide.secretaryoffice.model;

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
@Table(name = "class_schedule_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassScheduleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "class_id", nullable = false)
    private Integer classId;

    @Column(name = "day_name", nullable = false)
    private String day;

    @Column(name = "slot_order", nullable = false)
    private Integer slotOrder;

    @Column(name = "slot_text", nullable = false, length = 500)
    private String slotText;
}

