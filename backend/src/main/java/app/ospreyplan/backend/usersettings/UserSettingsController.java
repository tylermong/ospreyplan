package app.ospreyplan.backend.usersettings;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.CacheControl;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

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

        String eTag = "\"" + Integer.toHexString(Objects.hash(retrievedSettingsDto.getDegree(), retrievedSettingsDto.getStartYear())) + "\"";

        String ifNoneMatch = request.getHeader("If-None-Match");
        CacheControl cache = CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic();

        if (ifNoneMatch != null && ifNoneMatch.equals(eTag))
        {
            return ResponseEntity.status(304).eTag(eTag).cacheControl(cache).build();
        }

        return ResponseEntity.ok()
                .eTag(eTag)
                .cacheControl(cache)
                .body(retrievedSettingsDto);
    }

}
