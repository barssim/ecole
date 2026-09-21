package ma.solide.teacherservice.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import ma.solide.teacherservice.dto.ParentMeetingRequest;
import ma.solide.teacherservice.model.ParentMeeting;
import ma.solide.teacherservice.repository.ParentMeetingRepository;
import ma.solide.teacherservice.school.SchoolContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ParentMeetingService {

    private final ParentMeetingRepository repository;

    public ParentMeetingService(ParentMeetingRepository repository) {
        this.repository = repository;
    }

    public List<ParentMeeting> list() {
        return repository.findAllBySchoolIdOrderByMeetingDateAsc(SchoolContext.getRequiredSchoolId());
    }

    public ParentMeeting create(ParentMeetingRequest request) {
        validate(request);
        ParentMeeting meeting = ParentMeeting.builder()
                .schoolId(SchoolContext.getRequiredSchoolId())
                .title(request.getTitle().trim())
                .meetingDate(LocalDate.parse(request.getDate().trim()))
                .location(request.getLocation().trim())
                .details(StringUtils.hasText(request.getDetails()) ? request.getDetails().trim() : null)
                .createdBy(StringUtils.hasText(request.getCreatedBy()) ? request.getCreatedBy().trim() : "teacher")
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(meeting);
    }

    public ParentMeeting update(Long id, ParentMeetingRequest request) {
        validate(request);
        String schoolId = SchoolContext.getRequiredSchoolId();
        ParentMeeting meeting = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found"));
        if (!schoolId.equals(meeting.getSchoolId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found");
        }

        meeting.setTitle(request.getTitle().trim());
        meeting.setMeetingDate(LocalDate.parse(request.getDate().trim()));
        meeting.setLocation(request.getLocation().trim());
        meeting.setDetails(StringUtils.hasText(request.getDetails()) ? request.getDetails().trim() : null);
        return repository.save(meeting);
    }

    public void delete(Long id) {
        String schoolId = SchoolContext.getRequiredSchoolId();
        ParentMeeting meeting = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found"));
        if (!schoolId.equals(meeting.getSchoolId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found");
        }
        repository.delete(meeting);
    }

    private void validate(ParentMeetingRequest request) {
        if (!StringUtils.hasText(request.getTitle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (!StringUtils.hasText(request.getDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }
        if (!StringUtils.hasText(request.getLocation())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "location is required");
        }
    }
}

