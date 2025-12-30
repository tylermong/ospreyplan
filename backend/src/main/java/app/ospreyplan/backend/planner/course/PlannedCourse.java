package app.ospreyplan.backend.planner.course;

import app.ospreyplan.backend.planner.semester.PlannedSemester;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "planned_courses")
public class PlannedCourse
{
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id")
    @JsonBackReference
    private PlannedSemester plannedSemester;

    private String subject;

    @Column(name = "course_number")
    private Integer courseNumber;

    private String section;

    @Column(name = "created_at")
    private java.time.OffsetDateTime createdAt;

    private Integer credits;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = java.time.OffsetDateTime.now();
        }
    }

    public UUID getId()
    {
        return id;
    }

    public void setId(UUID id)
    {
        this.id = id;
    }

    public PlannedSemester getPlannedSemester()
    {
        return plannedSemester;
    }

    public void setPlannedSemester(PlannedSemester plannedSemester)
    {
        this.plannedSemester = plannedSemester;
    }

    public String getSubject()
    {
        return subject;
    }

    public void setSubject(String subject)
    {
        this.subject = subject;
    }

    public Integer getCourseNumber()
    {
        return courseNumber;
    }

    public void setCourseNumber(Integer courseNumber)
    {
        this.courseNumber = courseNumber;
    }

    public String getSection()
    {
        return section;
    }

    public void setSection(String section)
    {
        this.section = section;
    }

    public java.time.OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getCredits()
    {
        return credits;
    }

    public void setCredits(Integer credits)
    {
        this.credits = credits;
    }
}
