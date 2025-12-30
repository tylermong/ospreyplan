package app.ospreyplan.backend.audit;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "degree_requirements")
public class DegreeRequirement {
    @Id
    private String id;

    @Column(name = "degree_code")
    private String degreeCode;

    private String category;
    private String name;

    @Column(name = "required_count")
    private Short requiredCount;

    private Short priority;

    @OneToMany(mappedBy = "degreeRequirement", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<RequirementCriteria> criteria;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDegreeCode() {
        return degreeCode;
    }

    public void setDegreeCode(String degreeCode) {
        this.degreeCode = degreeCode;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Short getRequiredCount() {
        return requiredCount;
    }

    public void setRequiredCount(Short requiredCount) {
        this.requiredCount = requiredCount;
    }

    public Short getPriority() {
        return priority;
    }

    public void setPriority(Short priority) {
        this.priority = priority;
    }

    public List<RequirementCriteria> getCriteria() {
        return criteria;
    }

    public void setCriteria(List<RequirementCriteria> criteria) {
        this.criteria = criteria;
    }
}
