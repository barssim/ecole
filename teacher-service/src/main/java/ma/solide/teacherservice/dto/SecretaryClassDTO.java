package ma.solide.teacherservice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class SecretaryClassDTO {

    private Integer id;
    private String name;
    private List<String> students = new ArrayList<>();
    private List<String> teachers = new ArrayList<>();
}

