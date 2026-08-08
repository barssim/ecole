package ma.solide.secretaryoffice.controller;

import java.util.List;

import ma.solide.secretaryoffice.dto.ClassScheduleDayResponse;
import ma.solide.secretaryoffice.dto.ClassScheduleRequestDTO;
import ma.solide.secretaryoffice.service.ClassScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/classes/{classId}/schedule")
public class ClassScheduleController {

    private final ClassScheduleService classScheduleService;

    public ClassScheduleController(ClassScheduleService classScheduleService) {
        this.classScheduleService = classScheduleService;
    }

    @GetMapping
    public ResponseEntity<List<ClassScheduleDayResponse>> list(@PathVariable Integer classId) {
        return ResponseEntity.ok(classScheduleService.listSchedule(classId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClassScheduleDayResponse create(@PathVariable Integer classId, @RequestBody ClassScheduleRequestDTO request) {
        return classScheduleService.createDayPlan(classId, request);
    }

    @DeleteMapping("/{entryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer classId, @PathVariable Long entryId) {
        classScheduleService.deleteEntry(classId, entryId);
    }
}
