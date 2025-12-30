package app.ospreyplan.backend.planner.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlannedCourseRepository extends JpaRepository<PlannedCourse, UUID>
{
    List<PlannedCourse> findByPlannedSemester_UserIdOrderByCreatedAtAsc(UUID userId);
}
