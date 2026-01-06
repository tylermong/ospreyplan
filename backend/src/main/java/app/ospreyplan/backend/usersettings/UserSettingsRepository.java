package app.ospreyplan.backend.usersettings;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserSettingsRepository extends JpaRepository<UserSettings, UUID>
{
    @Modifying
    @Query("DELETE FROM UserSettings u WHERE u.id = :id")
    void deleteByUserId(@Param("id") UUID id);
}
