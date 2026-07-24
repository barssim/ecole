package ma.solide.secretaryoffice.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "tb_class",
    uniqueConstraints = @UniqueConstraint(name = "uk_class_tenant_name", columnNames = {"tenant_id", "name"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(nullable = false)
    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tb_class_student", joinColumns = @JoinColumn(name = "class_id"))
    @Column(name = "student_name")
    @Builder.Default
    private List<String> students = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tb_class_teacher", joinColumns = @JoinColumn(name = "class_id"))
    @Column(name = "teacher_name")
    @Builder.Default
    private List<String> teachers = new ArrayList<>();
}

