package app.ospreyplan.backend.planner.semester;

import app.ospreyplan.backend.planner.course.PlannedCourse;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "planned_semesters")
public class PlannedSemester
{
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    private String title;

    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlannedCourse> plannedCourses;

    public UUID getId()
    {
        return id;
    }

    public void setId(UUID id)
    {
        this.id = id;
    }

    public UUID getUserId()
    {
        return userId;
    }

    public void setUserId(UUID userId)
    {
        this.userId = userId;
    }

    public String getTitle()
    {
        return title;
    }

    public void setTitle(String title)
    {
        this.title = title;
    }

    public List<PlannedCourse> getPlannedCourses()
    {
        return plannedCourses;
    }

    public void setPlannedCourses(List<PlannedCourse> plannedCourses)
    {
        this.plannedCourses = plannedCourses;
    }
}
