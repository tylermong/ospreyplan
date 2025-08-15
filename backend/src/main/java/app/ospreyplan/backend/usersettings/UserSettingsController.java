package app.ospreyplan.backend.usersettings;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
    public ResponseEntity<UserSettingsDTO> updateUserSettings(@RequestBody UserSettingsDTO dto, HttpServletRequest request)
    {
        UserSettingsDTO updatedSettingsDto = service.updateSettings(dto, request);

        return ResponseEntity.ok(updatedSettingsDto);
    }

    @GetMapping
    public ResponseEntity<UserSettingsDTO> getUserSettings(HttpServletRequest request)
    {
        UserSettingsDTO retrievedSettingsDto = service.getUserSettings(request);

        return ResponseEntity.ok(retrievedSettingsDto);
    }

}
