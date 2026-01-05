package app.ospreyplan.backend.courses;

import java.io.Serializable;
import java.util.Objects;

public class CourseId implements Serializable
{
    private String subject;
    private Integer courseNumber;

    public CourseId()
    {

    }

    public CourseId(String subject, Integer courseNumber)
    {
        this.subject = subject;
        this.courseNumber = courseNumber;
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

    @Override
    public boolean equals(Object o)
    {
        if (!(o instanceof CourseId courseId)) return false;
        return Objects.equals(subject, courseId.subject) && Objects.equals(courseNumber, courseId.courseNumber);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(subject, courseNumber);
    }
}
