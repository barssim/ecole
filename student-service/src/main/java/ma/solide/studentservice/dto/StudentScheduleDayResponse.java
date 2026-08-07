package ma.solide.studentservice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentScheduleDayResponse {

    private String day;

    @Builder.Default
    private List<String> slots = new ArrayList<>();
}

