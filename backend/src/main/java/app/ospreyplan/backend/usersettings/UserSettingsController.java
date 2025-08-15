package app.ospreyplan.backend.usersettings;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
public class UserSettingsController
{
    private final UserSettingsService service;

    public UserSettingsController(UserSettingsService service)
    {
        this.service = service;
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserSettings> updateUserSettings(
            @PathVariable UUID userId,
            @RequestBody UserSettingsDTO dto)
    {
        UserSettings settings = service.updateSettings(userId, dto);

        return ResponseEntity.ok(settings);
    }
}
