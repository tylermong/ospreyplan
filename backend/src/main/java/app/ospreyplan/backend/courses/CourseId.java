package app.ospreyplan.backend.courses;

import java.io.Serializable;
import java.util.Objects;

public class CourseId implements Serializable
{
    private String subject;
    private Integer courseNumber;
    private String section;

    public CourseId()
    {

    }

    public CourseId(String subject, Integer courseNumber, String section)
    {
        this.subject = subject;
        this.courseNumber = courseNumber;
        this.section = section;
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

    @Override
    public boolean equals(Object o)
    {
        if (!(o instanceof CourseId courseId)) return false;
        return Objects.equals(subject, courseId.subject) && Objects.equals(courseNumber, courseId.courseNumber) && Objects.equals(section, courseId.section);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(subject, courseNumber, section);
    }
}
