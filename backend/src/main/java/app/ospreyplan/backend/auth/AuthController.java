package app.ospreyplan.backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController
{
    @Value("${supabase.project-url}")
    private String supabaseProjectUrl;

    @Value("${supabase.service-role-key}")
    private String supabaseServiceRoleKey;

    @GetMapping("/callback")
    public ResponseEntity<String> handleOAuthCallback(@RequestParam("code") String code)
    {
        String url = supabaseProjectUrl + "/auth/v1/token?grant_type=pkce";

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseServiceRoleKey);

        Map<String, String> body = new HashMap<>();
        body.put("auth_code", code);
        body.put("provider", "google");

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        // TODO: Handle the response (save session, create user, etc.)

        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }
}
