package app.ospreyplan.backend.usersettings;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserSettingsService
{
    private final UserSettingsRepository repository;

    public UserSettingsService(UserSettingsRepository repository)
    {
        this.repository = repository;
    }

    public UserSettings updateSettings(UUID userId, UserSettingsDTO dto)
    {
        UserSettings settings = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User ID not found"));

        settings.setDegree(dto.getDegree());
        settings.setStartYear(dto.getStartYear());

        return repository.save(settings);
    }
}
