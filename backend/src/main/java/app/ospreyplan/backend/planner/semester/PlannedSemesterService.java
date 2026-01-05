package app.ospreyplan.backend.planner.semester;

import app.ospreyplan.backend.planner.course.PlannedCourse;
import app.ospreyplan.backend.planner.course.PlannedCourseRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PlannedSemesterService
{
    private final PlannedSemesterRepository semesterRepository;
    private final PlannedCourseRepository courseRepository;

    public PlannedSemesterService(PlannedSemesterRepository semesterRepository, PlannedCourseRepository courseRepository)
    {
        this.semesterRepository = semesterRepository;
        this.courseRepository = courseRepository;
    }

    public List<PlannedSemester> getSemestersByUserId(UUID userId)
    {
        return semesterRepository.findByUserId(userId);
    }

    @Transactional
    public PlannedSemester createSemester(UUID userId, String title)
    {
        PlannedSemester semester = new PlannedSemester();
        semester.setUserId(userId);
        semester.setTitle(title);
        semester.setPlannedCourses(new ArrayList<>());

        return semesterRepository.save(semester);
    }

    @Transactional
    public PlannedCourse addCourseToSemester(UUID semesterId, String subject, Integer courseNumber, Integer credits)
    {
        PlannedSemester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found"));

        boolean exists = semester.getPlannedCourses().stream()
                .anyMatch(pc -> pc.getSubject().equals(subject) && pc.getCourseNumber().equals(courseNumber));

        if (exists)
        {
            throw new IllegalArgumentException("Course " + subject + " " + courseNumber + " is already in this semester.");
        }

        PlannedCourse course = new PlannedCourse();
        course.setPlannedSemester(semester);
        course.setSubject(subject);
        course.setCourseNumber(courseNumber);
        course.setCredits(credits);

        semester.getPlannedCourses().add(course);

        return courseRepository.save(course);
    }

    @Transactional
    public void removeCourseFromSemester(UUID semesterId, UUID courseId)
    {
        PlannedSemester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found: " + semesterId));

        List<PlannedCourse> courses = semester.getPlannedCourses();
        boolean removed = courses.removeIf(course -> course.getId().equals(courseId));

        if (!removed)
        {
            throw new IllegalArgumentException("Course not found in semester: " + courseId);
        }

        semesterRepository.save(semester);
    }

    @Transactional
    public void deleteSemester(UUID semesterId)
    {
        if (!semesterRepository.existsById(semesterId))
        {
            throw new IllegalArgumentException("Semester not found: " + semesterId);
        }
        semesterRepository.deleteById(semesterId);
    }

    @Transactional
    public void updateSemesterTitle(UUID semesterId, String title)
    {
        PlannedSemester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found: " + semesterId));

        semester.setTitle(title);
        semesterRepository.save(semester);
    }
}
