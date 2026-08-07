package ma.solide.studentservice.controller;

import java.util.List;

import ma.solide.studentservice.dto.StudentScheduleDayResponse;
import ma.solide.studentservice.dto.StudentScheduleRequest;
import ma.solide.studentservice.service.StudentScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/studentschedule")
public class StudentScheduleController {

    private final StudentScheduleService studentScheduleService;

    public StudentScheduleController(StudentScheduleService studentScheduleService) {
        this.studentScheduleService = studentScheduleService;
    }

    @GetMapping
    public ResponseEntity<List<StudentScheduleDayResponse>> list(@RequestParam(required = false, name = "user") String studentId) {
        return ResponseEntity.ok(studentScheduleService.listSchedule(studentId));
    }

    @PostMapping
    public ResponseEntity<StudentScheduleDayResponse> create(@RequestBody StudentScheduleRequest request) {
        return ResponseEntity.ok(studentScheduleService.createDayPlan(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studentScheduleService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}

