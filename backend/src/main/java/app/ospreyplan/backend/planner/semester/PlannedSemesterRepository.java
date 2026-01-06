package app.ospreyplan.backend.planner.semester;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlannedSemesterRepository extends JpaRepository<PlannedSemester, UUID>
{
    List<PlannedSemester> findByUserId(UUID userId);

    @Modifying
    @Query("DELETE FROM PlannedCourse c WHERE c.plannedSemester.id IN (SELECT s.id FROM PlannedSemester s WHERE s.userId = :userId)")
    void deleteCoursesByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM PlannedSemester s WHERE s.userId = :userId")
    void deleteSemestersByUserId(@Param("userId") UUID userId);
}
