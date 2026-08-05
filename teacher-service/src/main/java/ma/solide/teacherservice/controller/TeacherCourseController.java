package ma.solide.teacherservice.controller;

import java.util.List;

import ma.solide.teacherservice.dto.TeacherCourseRequest;
import ma.solide.teacherservice.model.TeacherCourse;
import ma.solide.teacherservice.service.TeacherCourseService;
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
@RequestMapping("/api/teachercourses")
public class TeacherCourseController {

    private final TeacherCourseService teacherCourseService;

    public TeacherCourseController(TeacherCourseService teacherCourseService) {
        this.teacherCourseService = teacherCourseService;
    }

    @GetMapping
    public ResponseEntity<List<TeacherCourse>> list(@RequestParam(required = false, name = "teacher") String teacherId) {
        return ResponseEntity.ok(teacherCourseService.listCourses(teacherId));
    }

    @PostMapping
    public ResponseEntity<TeacherCourse> create(@RequestBody TeacherCourseRequest request) {
        return ResponseEntity.ok(teacherCourseService.createCourse(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teacherCourseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}

