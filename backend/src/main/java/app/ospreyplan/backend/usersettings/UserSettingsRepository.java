package app.ospreyplan.backend.usersettings;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingsRepository extends JpaRepository<UserSettings, UUID>
{

}
