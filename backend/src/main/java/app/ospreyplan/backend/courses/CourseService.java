package app.ospreyplan.backend.courses;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService
{
    private final CourseRepository repository;

    public CourseService(CourseRepository repository)
    {
        this.repository = repository;
    }

    public List<Course> getAllCourses()
    {
        return repository.findAll();
    }
}
