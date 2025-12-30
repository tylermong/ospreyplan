package app.ospreyplan.backend.audit;

public class CourseDTO {
    private String subject;
    private Integer courseNumber;
    private String section;
    private Integer credits;
    private String name;

    public CourseDTO() {}

    public CourseDTO(String subject, Integer courseNumber, String section, Integer credits, String name) {
        this.subject = subject;
        this.courseNumber = courseNumber;
        this.section = section;
        this.credits = credits;
        this.name = name;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getCourseNumber() {
        return courseNumber;
    }

    public void setCourseNumber(Integer courseNumber) {
        this.courseNumber = courseNumber;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
