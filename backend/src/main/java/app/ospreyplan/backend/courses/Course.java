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

    @Column(name = "min_credits")
    private Integer minCredits;

    @Column(name = "max_credits")
    private Integer maxCredits;

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

    public Integer getMinCredits()
    {
        return minCredits;
    }

    public void setMinCredits(Integer minCredits)
    {
        this.minCredits = minCredits;
    }

    public Integer getMaxCredits()
    {
        return maxCredits;
    }

    public void setMaxCredits(Integer maxCredits)
    {
        this.maxCredits = maxCredits;
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
