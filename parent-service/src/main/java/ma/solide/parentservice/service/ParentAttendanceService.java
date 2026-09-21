package ma.solide.parentservice.service;

import java.util.List;

import ma.solide.parentservice.model.ParentAttendanceRecord;
import ma.solide.parentservice.repository.ParentAttendanceRepository;
import ma.solide.parentservice.school.SchoolContext;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ParentAttendanceService {

    private final ParentAttendanceRepository repository;

    public ParentAttendanceService(ParentAttendanceRepository repository) {
        this.repository = repository;
    }

    public List<ParentAttendanceRecord> list(String studentName) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        if (StringUtils.hasText(studentName)) {
            return repository.findAllBySchoolIdAndStudentNameOrderByDateDesc(schoolId, studentName.trim());
        }
        return repository.findAllBySchoolIdOrderByDateDesc(schoolId);
    }
}
