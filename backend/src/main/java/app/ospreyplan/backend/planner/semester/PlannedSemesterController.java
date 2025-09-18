package app.ospreyplan.backend.planner.semester;

import app.ospreyplan.backend.planner.course.PlannedCourse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/semesters")
public class PlannedSemesterController
{
    private final PlannedSemesterService service;

    public PlannedSemesterController(PlannedSemesterService service)
    {
        this.service = service;
    }

    @GetMapping("/user/{userId}")
    public List<PlannedSemester> getSemestersByUserId(@PathVariable UUID userId)
    {
        return service.getSemestersByUserId(userId);
    }

    @PostMapping
    public PlannedSemester createSemester(@RequestParam UUID userId, @RequestParam String title)
    {
        return service.createSemester(userId, title);
    }

    @PostMapping("/{semesterId}/courses")
    public PlannedCourse addCourseToSemester(@PathVariable UUID semesterId, @RequestParam String subject, @RequestParam Integer courseNumber, @RequestParam String section, @RequestParam Integer credits)
    {
        return service.addCourseToSemester(semesterId, subject, courseNumber, section, credits);
    }

    @DeleteMapping("/{semesterId}/courses/{courseId}")
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public void removeCourseFromSemester(@PathVariable UUID semesterId, @PathVariable UUID courseId)
    {
        service.removeCourseFromSemester(semesterId, courseId);
    }

    @DeleteMapping("/{semesterId}")
    @ResponseStatus(code = org.springframework.http.HttpStatus.NO_CONTENT)
    public void deleteSemester(@PathVariable UUID semesterId)
    {
        service.deleteSemester(semesterId);
    }
}
