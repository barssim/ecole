package ma.solide.parentservice.controller;

import java.util.List;

import ma.solide.parentservice.model.ParentAttendanceRecord;
import ma.solide.parentservice.service.ParentAttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents/attendance")
public class ParentAttendanceController {

    private final ParentAttendanceService service;

    public ParentAttendanceController(ParentAttendanceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ParentAttendanceRecord>> list(@RequestParam(required = false, name = "student") String studentName) {
        return ResponseEntity.ok(service.list(studentName));
    }
}

