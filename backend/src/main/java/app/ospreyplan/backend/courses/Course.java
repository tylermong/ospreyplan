package app.ospreyplan.backend.courses;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course
{
    @EmbeddedId
    private CourseId courseId;

    @Column(name = "name")
    private String name;

    @Column(name = "credits")
    private Integer credits;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "filled")
    private Integer filled;

    @Column(name = "remaining")
    private Integer remaining;

    @Column(name = "term")
    private Integer term;

    @Column(name = "prerequisite")
    private String prerequisite;

    @Column(name = "attributes", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> attributes;

    public CourseId getCourseId()
    {
        return courseId;
    }

    public void setCourseId(CourseId courseId)
    {
        this.courseId = courseId;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public Integer getCredits()
    {
        return credits;
    }

    public void setCredits(Integer credits)
    {
        this.credits = credits;
    }

    public Integer getCapacity()
    {
        return capacity;
    }

    public void setCapacity(Integer capacity)
    {
        this.capacity = capacity;
    }

    public Integer getFilled()
    {
        return filled;
    }

    public void setFilled(Integer filled)
    {
        this.filled = filled;
    }

    public Integer getRemaining()
    {
        return remaining;
    }

    public void setRemaining(Integer remaining)
    {
        this.remaining = remaining;
    }

    public Integer getTerm()
    {
        return term;
    }

    public void setTerm(Integer term)
    {
        this.term = term;
    }

    public String getPrerequisite() {
        return prerequisite;
    }

    public void setPrerequisite(String prerequisite) {
        this.prerequisite = prerequisite;
    }

    public List<String> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<String> attributes) {
        this.attributes = attributes;
    }
}
