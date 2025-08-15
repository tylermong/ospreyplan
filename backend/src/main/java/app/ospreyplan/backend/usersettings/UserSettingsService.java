package app.ospreyplan.backend.usersettings;

import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class UserSettingsService
{
    private final UserSettingsRepository repository;

    public UserSettingsService(UserSettingsRepository repository)
    {
        this.repository = repository;
    }

    public UserSettings updateSettings(UserSettingsDTO dto)
    {
        UUID userId = getCurrentUserId();

        UserSettings settings = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User ID not found"));

        settings.setDegree(dto.getDegree());
        settings.setStartYear(dto.getStartYear());

        return repository.save(settings);
    }

    private UUID getCurrentUserId()
    {
        // Implement your logic to retrieve the current user's ID
        return UUID.randomUUID(); // Placeholder implementation
    }
}
