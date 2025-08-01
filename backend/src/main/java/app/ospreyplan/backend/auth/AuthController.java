package app.ospreyplan.backend.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController
{
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${supabase.project-url}")
    private String supabaseProjectUrl;

    @Value("${supabase.service-role-key}")
    private String supabaseServiceRoleKey;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @GetMapping("/callback")
    public ResponseEntity<Void> handleOAuthCallback(@RequestParam("code") String code)
    {
        logger.info("Received OAuth callback with code: {}", code);
        String frontendUrl = frontendBaseUrl + "/auth/callback?code=" + code;
        HttpHeaders redirectHeaders = new HttpHeaders();
        redirectHeaders.setLocation(java.net.URI.create(frontendUrl));
        return new ResponseEntity<>(redirectHeaders, HttpStatus.FOUND);
    }

    @PostMapping("/exchange")
    public ResponseEntity<?> exchangeCodeForToken(@RequestBody Map<String, String> payload)
    {
        String code = payload.get("code");
        String codeVerifier = payload.get("code_verifier");

        if (code == null || codeVerifier == null)
        {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing code or code_verifier"));
        }

        String url = supabaseProjectUrl + "/auth/v1/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("apikey", supabaseServiceRoleKey);

        // Build form data
        String form = String.format("grant_type=authorization_code&code=%s&redirect_uri=%s&code_verifier=%s", code,
                java.net.URLEncoder.encode(frontendBaseUrl + "/auth/callback", java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(codeVerifier, java.nio.charset.StandardCharsets.UTF_8));

        HttpEntity<String> requestEntity = new HttpEntity<>(form, headers);

        try
        {
            ResponseEntity<String> response = new RestTemplate().postForEntity(url, requestEntity, String.class);

            if (!response.getStatusCode().is2xxSuccessful())
            {
                return ResponseEntity.status(response.getStatusCode())
                        .body(Map.of("error", "Supabase token exchange failed", "details", response.getBody()));
            }

            return ResponseEntity.ok(response.getBody());
        }
        catch (Exception e)
        {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }
}
