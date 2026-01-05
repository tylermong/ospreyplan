package app.ospreyplan.backend.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DegreeRequirementRepository extends JpaRepository<DegreeRequirement, String> {
    List<DegreeRequirement> findByDegreeCodeOrderByPriorityAsc(String degreeCode);
}
