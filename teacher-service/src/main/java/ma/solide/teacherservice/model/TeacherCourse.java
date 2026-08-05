package ma.solide.teacherservice.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "teacher_courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(name = "teacher_id", nullable = false)
    private String teacherId;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @JsonManagedReference
    private List<TeacherCourseFile> files = new ArrayList<>();
}

