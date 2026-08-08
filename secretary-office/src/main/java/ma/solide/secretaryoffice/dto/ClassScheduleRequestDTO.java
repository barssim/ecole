package ma.solide.secretaryoffice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ClassScheduleRequestDTO {

    private String day;
    private List<String> slots = new ArrayList<>();
}

