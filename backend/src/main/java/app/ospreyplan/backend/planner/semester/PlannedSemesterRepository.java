package app.ospreyplan.backend.planner.semester;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlannedSemesterRepository extends JpaRepository<PlannedSemester, UUID>
{
    List<PlannedSemester> findByUserId(UUID userId);
}
