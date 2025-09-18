package app.ospreyplan.backend.planner.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PlannedCourseRepository extends JpaRepository<PlannedCourse, UUID>
{
    
}
