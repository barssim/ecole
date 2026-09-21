package ma.solide.studentservice.model;

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
@Table(name = "student_schedule_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentScheduleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "school_id", nullable = false)
    private String schoolId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "day_name", nullable = false)
    private String day;

    @Column(name = "slot_order", nullable = false)
    private Integer slotOrder;

    @Column(name = "slot_text", nullable = false, length = 500)
    private String slotText;
}


