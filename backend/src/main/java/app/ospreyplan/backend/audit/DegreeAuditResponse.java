package app.ospreyplan.backend.audit;

import java.util.List;

public class DegreeAuditResponse {
    private String degreeCode;
    private List<DegreeAuditResult> results;

    public DegreeAuditResponse() {}

    public DegreeAuditResponse(String degreeCode, List<DegreeAuditResult> results) {
        this.degreeCode = degreeCode;
        this.results = results;
    }

    public String getDegreeCode() {
        return degreeCode;
    }

    public void setDegreeCode(String degreeCode) {
        this.degreeCode = degreeCode;
    }

    public List<DegreeAuditResult> getResults() {
        return results;
    }

    public void setResults(List<DegreeAuditResult> results) {
        this.results = results;
    }
}
