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

/**
 * Handles authentication callback redirection and PKCE token exchange
 * against Supabase. On successful token exchange, httpOnly cookies are
 * issued for the access and refresh tokens.
 *
 * Endpoints:
 * - GET `/auth/callback` – forwards the authorization code to the frontend
 * - POST `/auth/exchange` – exchanges code + code_verifier for tokens
 *
 * Configuration properties consumed by this controller:
 * - `supabase.project-url` – base URL of the Supabase project
 * - `supabase.anon-key` or `supabase.service-role-key` – API key for Supabase
 * - `frontend.base-url` – base URL of the frontend app
 * - `backend.base-url` – base URL of this backend (used for redirect URI and cookie security)
 */
@RestController
@RequestMapping("/auth")
public class AuthController
{
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final String ERROR_KEY = "error";
    private static final String DETAILS_KEY = "details";

    // Supabase project base URL (https://<project-id>.supabase.co)
    @Value("${supabase.project-url}")
    private String supabaseProjectUrl;

    // Supabase API key; prefer anon key, fallback to service role if anon not provided
    // TODO: Pick one of these
    @Value("${supabase.anon-key:${supabase.service-role-key}}")
    private String supabaseApiKey;

    // Frontend base URL used to redirect after OAuth callback
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    // Backend base URL used when constructing redirect_uri and deciding cookie security
    @Value("${backend.base-url}")
    private String backendBaseUrl;

    // Allowed domain for OAuth login
    @Value("${auth.allowed-domains}")
    private String allowedDomains;

    /**
     * Receives the authorization {@code code} from Supabase and redirects the user
     * agent to the frontend callback route, where the SPA completes the exchange.
     *
     * @param code the authorization code returned by Supabase
     * @return 302 Found with a Location header pointing to the frontend callback URL
     */
    @GetMapping("/callback")
    public ResponseEntity<Void> handleOAuthCallback(@RequestParam("code") String code)
    {
        logger.debug("Received OAuth callback");

        // Forward the auth code to the frontend so that it can perform the exchange
        String frontendUrl = frontendBaseUrl + "/auth/callback?code=" + code;
        HttpHeaders redirectHeaders = new HttpHeaders();
        redirectHeaders.setLocation(java.net.URI.create(frontendUrl));
        return new ResponseEntity<>(redirectHeaders, HttpStatus.FOUND);
    }

    /**
     * Exchanges a PKCE authorization code for tokens via Supabase and sets
     * httpOnly cookies for the access and refresh tokens on success.
     *
     * Expected request body fields:
     * - {@code code}: the authorization code received from the OAuth redirect
     * - {@code code_verifier}: the original code verifier used during the PKCE flow
     *
     * @param payload JSON body containing {@code code} and {@code code_verifier}
     * @return 200 OK with Set-Cookie headers when successful; otherwise an error response
     */
    @PostMapping("/exchange")
    public ResponseEntity<Map<String, Object>> exchangeCodeForToken(@RequestBody Map<String, String> payload)
    {
        // Validate required parameters
        String code = payload.get("code");
        String codeVerifier = payload.get("code_verifier");

        if (code == null || codeVerifier == null)
        {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, "Missing code or code_verifier"));
        }

        // Supabase token endpoint for PKCE exchange
        String url = supabaseProjectUrl + "/auth/v1/token?grant_type=pkce";

        // Prepare headers for Supabase request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseApiKey);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonBody;
        try {
            // Serialize the token exchange payload
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

            // Execute request against Supabase token endpoint
            ResponseEntity<String> response = new RestTemplate().postForEntity(url, requestEntity, String.class);

            if (!response.getStatusCode().is2xxSuccessful())
            {
                logger.error("Supabase token exchange failed: {}", response.getBody());
                return ResponseEntity.status(response.getStatusCode())
                        .body(Map.of(ERROR_KEY, "Supabase token exchange failed", DETAILS_KEY, response.getBody()));
            }

            // Parse tokens from JSON response
            JsonNode tokenJson = objectMapper.readTree(Optional.ofNullable(response.getBody()).orElse("{}"));
            String accessToken = tokenJson.path("access_token").asText("");
            String refreshToken = tokenJson.path("refresh_token").asText("");
            int expiresInSeconds = tokenJson.path("expires_in").asInt(3600);

            // Basic sanity check that tokens exist
            if (accessToken.isEmpty() || refreshToken.isEmpty())
            {
                logger.error("Token exchange succeeded but tokens are missing: {}", response.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(ERROR_KEY, "Token parsing failed"));
            }

            // Use HTTPS to decide whether to mark cookies as Secure
            boolean secureCookie = backendBaseUrl != null && backendBaseUrl.startsWith("https://");

            // Access token cookie is httpOnly and has a max-age matching expiry
            ResponseCookie accessCookie = ResponseCookie
                    .from("sb-access-token", accessToken)
                    .httpOnly(true)
                    .secure(secureCookie)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(expiresInSeconds)
                    .build();

            // Refresh token cookie is httpOnly; omit maxAge to allow session-based handling by defaults
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

            // Respond with cookies set; body includes a simple status for debugging
            return new ResponseEntity<>(Map.of("status", "ok"), setCookieHeaders, HttpStatus.OK);
        }
        catch (HttpStatusCodeException ex)
        {
            // Return the HTTP status code and error message received from Supabase when available
            logger.error("Supabase token exchange failed: status={}, body={}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of(ERROR_KEY, "Supabase token exchange failed", DETAILS_KEY, ex.getResponseBodyAsString()));
        }
        catch (Exception e)
        {
            // Generic safety net for unexpected failures
            logger.error("Error during token exchange: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, "Internal server error", DETAILS_KEY, e.getMessage()));
        }
    }
    
    private boolean isAllowedDomain(String email)
    {
        if (email == null)
        {
            return false;
        }

        int at = email.lastIndexOf('@');
        if (at < 0 || at == email.length() - 1)
        {
            return false;
        }

        String domain = email.substring(at + 1).toLowerCase();
        for (String allowedDomain : allowedDomains.split(","))
        {
            if (domain.equals(allowedDomain.trim().toLowerCase()))
            {
                return true;
            }
        }

        return false;
    }
}
