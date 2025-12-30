package app.ospreyplan.backend.audit;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "requirement_criteria")
public class RequirementCriteria {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "requirement_id")
    private DegreeRequirement degreeRequirement;

    private String type; // COURSE, ATTRIBUTE, CATCH_ALL
    private String subject;
    
    @Column(name = "course_number")
    private Integer courseNumber;
    
    private String attribute;
    
    @Column(name = "min_level")
    private Integer minLevel;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public DegreeRequirement getDegreeRequirement() {
        return degreeRequirement;
    }

    public void setDegreeRequirement(DegreeRequirement degreeRequirement) {
        this.degreeRequirement = degreeRequirement;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public String getAttribute() {
        return attribute;
    }

    public void setAttribute(String attribute) {
        this.attribute = attribute;
    }

    public Integer getMinLevel() {
        return minLevel;
    }

    public void setMinLevel(Integer minLevel) {
        this.minLevel = minLevel;
    }
}
