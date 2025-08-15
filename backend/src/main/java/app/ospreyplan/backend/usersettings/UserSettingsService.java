package app.ospreyplan.backend.usersettings;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class UserSettingsService
{
    private final UserSettingsRepository repository;

    @Value("${supabase.jwt-secret}")
    private String supabaseJwtSecret;

    public UserSettingsService(UserSettingsRepository repository)
    {
        this.repository = repository;
    }

    public UserSettings updateSettings(UserSettingsDTO dto, HttpServletRequest request)
    {
        UUID userId = getCurrentUserId(request);

        UserSettings settings = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User ID not found"));

        settings.setDegree(dto.getDegree());
        settings.setStartYear(dto.getStartYear());

        return repository.save(settings);
    }

    private UUID getCurrentUserId(HttpServletRequest request)
    {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer "))
        {
            throw new RuntimeException("No token provided");
        }

        String token = authHeader.substring(7); // remove "Bearer " prefix

        Claims claims;
        try
        {
            claims = Jwts.parserBuilder()
                .setSigningKey(supabaseJwtSecret.getBytes(StandardCharsets.UTF_8))
                .build()
                .parseClaimsJws(token)
                .getBody();
        }
        catch (JwtException e)
        {
            throw new RuntimeException("Invalid or expired token", e);
        }

        String userIdString = claims.getSubject();
        return UUID.fromString(userIdString);
    }
}
