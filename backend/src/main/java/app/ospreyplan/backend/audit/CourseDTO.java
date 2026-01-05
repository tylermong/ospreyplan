package app.ospreyplan.backend.audit;

public class CourseDTO {
    private String subject;
    private Integer courseNumber;
    private Integer credits;
    private String name;

    public CourseDTO() {}

    public CourseDTO(String subject, Integer courseNumber, Integer credits, String name) {
        this.subject = subject;
        this.courseNumber = courseNumber;
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
