package app.ospreyplan.backend.usersettings;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

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
