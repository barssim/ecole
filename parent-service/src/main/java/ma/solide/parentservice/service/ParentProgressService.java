package ma.solide.parentservice.service;

import java.util.List;

import ma.solide.parentservice.model.ParentProgressRecord;
import ma.solide.parentservice.repository.ParentProgressRepository;
import ma.solide.parentservice.school.SchoolContext;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ParentProgressService {

    private final ParentProgressRepository repository;

    public ParentProgressService(ParentProgressRepository repository) {
        this.repository = repository;
    }

    public List<ParentProgressRecord> list(String studentName) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        if (StringUtils.hasText(studentName)) {
            return repository.findAllBySchoolIdAndStudentNameOrderByDateDesc(schoolId, studentName.trim());
        }
        return repository.findAllBySchoolIdOrderByDateDesc(schoolId);
    }
}
