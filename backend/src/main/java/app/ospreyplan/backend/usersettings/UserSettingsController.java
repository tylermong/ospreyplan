package app.ospreyplan.backend.usersettings;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/settings")
public class UserSettingsController
{
    private final UserSettingsService service;

    public UserSettingsController(UserSettingsService service)
    {
        this.service = service;
    }

    @PutMapping
    public ResponseEntity<UserSettings> updateUserSettings(@RequestBody UserSettingsDTO dto, HttpServletRequest request)
    {
        UserSettings settings = service.updateSettings(dto, request);

        return ResponseEntity.ok(settings);
    }
}
