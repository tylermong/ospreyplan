package app.ospreyplan.backend.planner.semester;

import app.ospreyplan.backend.planner.course.PlannedCourse;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
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

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "plannedSemester", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
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

    public OffsetDateTime getCreatedAt()
    {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt)
    {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt()
    {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt)
    {
        this.updatedAt = updatedAt;
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
