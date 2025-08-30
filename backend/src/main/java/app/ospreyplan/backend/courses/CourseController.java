package app.ospreyplan.backend.courses;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController
{
    private final CourseService service;

    public CourseController(CourseService service)
    {
        this.service = service;
    }

    @GetMapping
    public List<Course> getCourses()
    {
        return service.getAllCourses();
    }
}
