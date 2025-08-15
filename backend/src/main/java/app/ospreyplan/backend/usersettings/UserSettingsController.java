package app.ospreyplan.backend.usersettings;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
public class UserSettingsController
{
    private final UserSettingsRepository repository;

    public UserSettingsController(UserSettingsRepository repository)
    {
        this.repository = repository;
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserSettings> updateUserSettings(
            @PathVariable UUID userId,
            @RequestBody UserSettingsDTO dto)
    {
        UserSettings settings = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User ID not found"));

        settings.setDegree(dto.getDegree());
        settings.setStartYear(dto.getStartYear());

        repository.save(settings);

        return ResponseEntity.ok(settings);
    }
}
