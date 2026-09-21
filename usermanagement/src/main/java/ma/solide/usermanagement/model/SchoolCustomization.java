package ma.solide.usermanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tb_school_customization")
public class SchoolCustomization {

    @Id
    @Column(name = "school_id", nullable = false, length = 64)
    private String schoolId;

    @Column(name = "customization_json", nullable = false, columnDefinition = "TEXT")
    private String customizationJson;
}

