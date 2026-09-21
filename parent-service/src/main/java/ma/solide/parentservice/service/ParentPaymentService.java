package ma.solide.parentservice.service;

import java.util.List;

import ma.solide.parentservice.model.ParentPaymentView;
import ma.solide.parentservice.repository.ParentPaymentRepository;
import ma.solide.parentservice.school.SchoolContext;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ParentPaymentService {

    private final ParentPaymentRepository repository;

    public ParentPaymentService(ParentPaymentRepository repository) {
        this.repository = repository;
    }

    public List<ParentPaymentView> list(String studentName) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        if (StringUtils.hasText(studentName)) {
            return repository.findAllBySchoolIdAndStudentNameOrderByPaymentDateDesc(schoolId, studentName.trim());
        }
        return repository.findAllBySchoolIdOrderByPaymentDateDesc(schoolId);
    }
}
