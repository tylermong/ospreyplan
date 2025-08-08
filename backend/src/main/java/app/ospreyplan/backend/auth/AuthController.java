package app.ospreyplan.backend.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController
{
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final String ERROR_KEY = "error";
    private static final String DETAILS_KEY = "details";

    @Value("${supabase.project-url}")
    private String supabaseProjectUrl;

    @Value("${supabase.anon-key:${supabase.service-role-key}}")
    private String supabaseApiKey;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${backend.base-url}")
    private String backendBaseUrl;

    @GetMapping("/callback")
    public ResponseEntity<Void> handleOAuthCallback(@RequestParam("code") String code)
    {
        logger.debug("Received OAuth callback");
        String frontendUrl = frontendBaseUrl + "/auth/callback?code=" + code;
        HttpHeaders redirectHeaders = new HttpHeaders();
        redirectHeaders.setLocation(java.net.URI.create(frontendUrl));
        return new ResponseEntity<>(redirectHeaders, HttpStatus.FOUND);
    }

    @PostMapping("/exchange")
    public ResponseEntity<Map<String, Object>> exchangeCodeForToken(@RequestBody Map<String, String> payload)
    {
        String code = payload.get("code");
        String codeVerifier = payload.get("code_verifier");

        if (code == null || codeVerifier == null)
        {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, "Missing code or code_verifier"));
        }


        String url = supabaseProjectUrl + "/auth/v1/token?grant_type=pkce";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseApiKey);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonBody;
        try {
            jsonBody = objectMapper.writeValueAsString(Map.of(
                "auth_code", code,
                "redirect_uri", backendBaseUrl + "/auth/callback",
                "code_verifier", codeVerifier
            ));
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            logger.error("Failed to serialize token exchange payload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Internal server error", DETAILS_KEY, "Serialization failed"));
        }

        HttpEntity<String> requestEntity = new HttpEntity<>(jsonBody, headers);

        try
        {
            logger.debug("Request URL: {}", url);

            ResponseEntity<String> response = new RestTemplate().postForEntity(url, requestEntity, String.class);

            if (!response.getStatusCode().is2xxSuccessful())
            {
                logger.error("Supabase token exchange failed: {}", response.getBody());
                return ResponseEntity.status(response.getStatusCode())
                        .body(Map.of(ERROR_KEY, "Supabase token exchange failed", DETAILS_KEY, response.getBody()));
            }

            JsonNode tokenJson = objectMapper.readTree(Optional.ofNullable(response.getBody()).orElse("{}"));
            String accessToken = tokenJson.path("access_token").asText("");
            String refreshToken = tokenJson.path("refresh_token").asText("");
            int expiresInSeconds = tokenJson.path("expires_in").asInt(3600);

            if (accessToken.isEmpty() || refreshToken.isEmpty())
            {
                logger.error("Token exchange succeeded but tokens are missing: {}", response.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(ERROR_KEY, "Token parsing failed"));
            }

            boolean secureCookie = backendBaseUrl != null && backendBaseUrl.startsWith("https://");

            ResponseCookie accessCookie = ResponseCookie
                    .from("sb-access-token", accessToken)
                    .httpOnly(true)
                    .secure(secureCookie)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(expiresInSeconds)
                    .build();

            ResponseCookie refreshCookie = ResponseCookie
                    .from("sb-refresh-token", refreshToken)
                    .httpOnly(true)
                    .secure(secureCookie)
                    .sameSite("Lax")
                    .path("/")
                    .build();

            HttpHeaders setCookieHeaders = new HttpHeaders();
            setCookieHeaders.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
            setCookieHeaders.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

            return new ResponseEntity<>(Map.of("status", "ok"), setCookieHeaders, HttpStatus.OK);
        }
        catch (HttpStatusCodeException ex)
        {
            logger.error("Supabase token exchange failed: status={}, body={}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of(ERROR_KEY, "Supabase token exchange failed", DETAILS_KEY, ex.getResponseBodyAsString()));
        }
        catch (Exception e)
        {
            logger.error("Error during token exchange: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, "Internal server error", DETAILS_KEY, e.getMessage()));
        }
    }
}
