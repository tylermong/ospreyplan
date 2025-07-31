package app.ospreyplan.backend.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
            throws JsonProcessingException
    {
        String code = payload.get("code");
        String codeVerifier = payload.get("code_verifier");

        if (code == null || codeVerifier == null)
        {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing code or code_verifier"));
        }

        String url = supabaseProjectUrl + "/auth/v1/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseServiceRoleKey);

        Map<String, String> body = new HashMap<>();
        body.put("grant_type", "authorization_code");
        body.put("code", code);
        body.put("redirect_uri", frontendBaseUrl + "/auth/callback");
        body.put("code_verifier", codeVerifier);

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = new RestTemplate().postForEntity(url, requestEntity, String.class);

        if (!response.getStatusCode().is2xxSuccessful())
        {
            logger.error("Supabase token endpoint returned error status: {} Body: {}", response.getStatusCode(),
                    response.getBody());
            return ResponseEntity.status(response.getStatusCode())
                    .body(Map.of("error", "Supabase token exchange failed"));
        }

        logger.info("Supabase token endpoint response status: {}", response.getStatusCode());
        logger.debug("Supabase token endpoint response body: {}", response.getBody());

        return ResponseEntity.ok(response.getBody());
    }
}
