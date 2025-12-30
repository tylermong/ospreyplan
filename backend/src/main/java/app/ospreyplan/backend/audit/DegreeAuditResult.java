package app.ospreyplan.backend.audit;

import java.util.ArrayList;
import java.util.List;

public class DegreeAuditResult {
    private String name;
    private String category;
    private int requiredCount;
    private List<CourseDTO> satisfiedBy = new ArrayList<>();

    public DegreeAuditResult() {}

    public DegreeAuditResult(String name, String category, int requiredCount) {
        this.name = name;
        this.category = category;
        this.requiredCount = requiredCount;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getRequiredCount() {
        return requiredCount;
    }

    public void setRequiredCount(int requiredCount) {
        this.requiredCount = requiredCount;
    }

    public List<CourseDTO> getSatisfiedBy() {
        return satisfiedBy;
    }

    public void setSatisfiedBy(List<CourseDTO> satisfiedBy) {
        this.satisfiedBy = satisfiedBy;
    }
}
