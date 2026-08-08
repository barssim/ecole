package ma.solide.secretaryoffice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassScheduleEntryResponse {

    private Long id;
    private Integer slotOrder;
    private String slotText;
}

