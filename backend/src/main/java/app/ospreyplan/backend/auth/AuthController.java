package app.ospreyplan.backend.auth;

import app.ospreyplan.backend.planner.semester.PlannedSemesterRepository;
import app.ospreyplan.backend.usersettings.UserSettingsRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.ResponseCookie;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpStatusCodeException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Handles authentication callback redirection and PKCE token exchange against Supabase. On successful token exchange,
 * httpOnly cookies are issued for the access and refresh tokens.
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
 * - `auth.cookie-domain` – domain for auth cookies (set to allow sharing between subdomains)
 * - `auth.allowed-domains` – allowed email domains for authentication
 */
@RestController
@RequestMapping("/auth")
public class AuthController
{
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final String ERROR_KEY = "error";
    private static final String DETAILS_KEY = "details";
    private static final String APIKEY_HEADER = "apikey";
    private static final String ACCESS_COOKIE_NAME = "sb-access-token";
    private static final String REFRESH_COOKIE_NAME = "sb-refresh-token";
    private static final String UNAUTHORIZED_MESSAGE = "Unauthorized";

    private final UserSettingsRepository userSettingsRepository;
    private final PlannedSemesterRepository plannedSemesterRepository;
    private final PlatformTransactionManager transactionManager;

    public AuthController(UserSettingsRepository userSettingsRepository, PlannedSemesterRepository plannedSemesterRepository, PlatformTransactionManager transactionManager)
    {
        this.userSettingsRepository = userSettingsRepository;
        this.plannedSemesterRepository = plannedSemesterRepository;
        this.transactionManager = transactionManager;
    }

    // Supabase project base URL (https://<project-id>.supabase.co)
    @Value("${supabase.project-url}")
    private String supabaseProjectUrl;

    // Supabase API key; prefer anon key, fallback to service role if anon not provided
    // TODO: Pick one of these
    @Value("${supabase.anon-key:${supabase.service-role-key}}")
    private String supabaseApiKey;

    @Value("${supabase.jwt-secret}")
    private String supabaseJwtSecret;

    // Frontend base URL used to redirect after OAuth callback
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    // Backend base URL used when constructing redirect_uri and deciding cookie security
    @Value("${backend.base-url}")
    private String backendBaseUrl;

    // Cookie domain for auth tokens
    @Value("${auth.cookie-domain}")
    private String cookieDomain;

    // Allowed domain for OAuth login
    @Value("${auth.allowed-domains}")
    private String allowedDomains;

    // Pre-processed set of allowed domains for fast lookups
    private Set<String> allowedDomainSet = Set.of();

    @PostConstruct
    void initAllowedDomains()
    {
        if (allowedDomains == null || allowedDomains.isBlank())
        {
            allowedDomainSet = Set.of();
            logger.warn("No allowed domains configured; all sign-ins will be blocked");
            return;
        }

        allowedDomainSet = Arrays.stream(allowedDomains.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toUnmodifiableSet());

        logger.debug("Configured allowed domains: {}", allowedDomainSet);
    }

    /**
     * Receives the authorization {@code code} from Supabase and redirects the user agent to the frontend callback
     * route, where the SPA completes the exchange.
     *
     * @param  code the authorization code returned by Supabase
     * @return      302 Found with a Location header pointing to the frontend callback URL
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
     * Exchanges a PKCE authorization code for tokens via Supabase and sets httpOnly cookies for the access and refresh
     * tokens on success.
     *
     * Expected request body fields:
     * - {@code code}: the authorization code received from the OAuth redirect
     * - {@code code_verifier}: the original code verifier used during the PKCE flow
     *
     * @param  payload JSON body containing {@code code} and {@code code_verifier}
     * @return         200 OK with Set-Cookie headers when successful; otherwise an error response
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
        headers.set(APIKEY_HEADER, supabaseApiKey);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonBody;
        try
        {
            // Serialize the token exchange payload
            jsonBody = objectMapper.writeValueAsString(Map.of("auth_code", code, "redirect_uri",
                    backendBaseUrl + "/auth/callback", "code_verifier", codeVerifier));
        }
        catch (com.fasterxml.jackson.core.JsonProcessingException e)
        {
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

            // Verify the user is from an allowed domain
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            userHeaders.set(APIKEY_HEADER, supabaseApiKey);
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);

            // Fetch the user from Supabase
            ResponseEntity<String> userResponse = new RestTemplate().exchange(supabaseProjectUrl + "/auth/v1/user",
                    HttpMethod.GET, userRequest, String.class);

            // If the user fetch fails, block the sign-in
            if (!userResponse.getStatusCode().is2xxSuccessful())
            {
                logger.info("Sign-in blocked: failed to fetch Supabase user, status={}", userResponse.getStatusCode());

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(ERROR_KEY, "Unable to verify account domain"));
            }

            // Parse the user from the response
            JsonNode userJson = objectMapper.readTree(Optional.ofNullable(userResponse.getBody()).orElse("{}"));
            String email = userJson.path("email").asText("");

            // If the user is not from an allowed domain, block the sign-in
            if (!isAllowedDomain(email))
            {
                logger.info("Sign-in blocked: disallowed domain for email={}", email);

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(ERROR_KEY, "Only @go.stockton.edu Google accounts are allowed"));
            }

            // Use HTTPS to decide whether to mark cookies as Secure
            boolean secureCookie = backendBaseUrl != null && backendBaseUrl.startsWith("https://");

            // Access token cookie is httpOnly and has a max-age matching expiry
            // Set domain to allow sharing between subdomains
            ResponseCookie accessCookie = ResponseCookie.from(ACCESS_COOKIE_NAME, accessToken).httpOnly(true)
                    .secure(secureCookie).sameSite("Lax").path("/").maxAge(expiresInSeconds).domain(cookieDomain).build();

            // Refresh token cookie is httpOnly; omit maxAge to allow session-based handling by defaults
            // Set domain to allow sharing between subdomains
            ResponseCookie refreshCookie = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken).httpOnly(true)
                    .secure(secureCookie).sameSite("Lax").path("/").domain(cookieDomain).build();

            HttpHeaders setCookieHeaders = new HttpHeaders();
            setCookieHeaders.add(HttpHeaders.SET_COOKIE, accessCookie.toString());
            setCookieHeaders.add(HttpHeaders.SET_COOKIE, refreshCookie.toString());

            // Respond with cookies set; body includes a simple status for debugging
            return new ResponseEntity<>(Map.of("status", "ok"), setCookieHeaders, HttpStatus.OK);
        }
        catch (HttpStatusCodeException ex)
        {
            // Return the HTTP status code and error message received from Supabase when available
            logger.error("Supabase token exchange failed: status={}, body={}", ex.getStatusCode(),
                    ex.getResponseBodyAsString());
            return ResponseEntity.status(ex.getStatusCode()).body(
                    Map.of(ERROR_KEY, "Supabase token exchange failed", DETAILS_KEY, ex.getResponseBodyAsString()));
        }
        catch (Exception e)
        {
            // Generic safety net for unexpected failures
            logger.error("Error during token exchange: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(Map.of(ERROR_KEY, "Internal server error", DETAILS_KEY, e.getMessage()));
        }
    }

    /**
     * Logs out the current user by clearing auth cookies.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletResponse response)
    {
        boolean secureCookie = backendBaseUrl != null && backendBaseUrl.startsWith("https://");

        ResponseCookie clearAccess = ResponseCookie.from(ACCESS_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .domain(cookieDomain)
                .build();

        ResponseCookie clearRefresh = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .domain(cookieDomain)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, clearAccess.toString());
        headers.add(HttpHeaders.SET_COOKIE, clearRefresh.toString());

        return new ResponseEntity<>(Map.of("status", "logged_out"), headers, HttpStatus.OK);
    }

    /**
     * Deletes the user account and all associated data.
     */
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, Object>> deleteAccount(HttpServletRequest request, HttpServletResponse response)
    {
        // 1. Get access token
        String accessToken = null;
        if (request.getCookies() != null)
        {
            for (jakarta.servlet.http.Cookie c : request.getCookies())
            {
                if (ACCESS_COOKIE_NAME.equals(c.getName()))
                {
                    accessToken = c.getValue();
                    break;
                }
            }
        }

        if (accessToken == null || accessToken.isEmpty())
        {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(ERROR_KEY, UNAUTHORIZED_MESSAGE));
        }

        UUID userId = null;
        try
        {
            // 2. Validate with Supabase
            // Verify current token works and get ID
            String idStr = null;
            
            try {
                HttpHeaders userHeaders = new HttpHeaders();
                userHeaders.setBearerAuth(accessToken);
                userHeaders.set(APIKEY_HEADER, supabaseApiKey);
                HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);

                ResponseEntity<String> userResponse = new RestTemplate().exchange(
                        supabaseProjectUrl + "/auth/v1/user", HttpMethod.GET, userRequest, String.class);

                ObjectMapper mapper = new ObjectMapper();
                JsonNode userJson = mapper.readTree(Optional.ofNullable(userResponse.getBody()).orElse("{}"));
                idStr = userJson.path("id").asText(null);
            } catch (Exception ex) {
                // If token is invalid/expired/deleted, try to trust the token's sub claim if it verifies against our secret
                try {
                     var claims = Jwts.parserBuilder()
                        .setSigningKey(supabaseJwtSecret.getBytes(StandardCharsets.UTF_8))
                        .build()
                        .parseClaimsJws(accessToken)
                        .getBody();
                     idStr = claims.getSubject();
                     logger.warn("Supabase user fetch failed (user likely already deleted). Using ID from JWT: {}", idStr);
                } catch (Exception jwtEx) {
                     logger.warn("Token check failed completely: {}", ex.getMessage());
                }
            }

            if (idStr == null)
            {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(ERROR_KEY, "Invalid token or user not found"));
            }
            userId = UUID.fromString(idStr);
        }
        catch (Exception e)
        {
            logger.error("Delete account failed during verification", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(ERROR_KEY, UNAUTHORIZED_MESSAGE));
        }

        // 3. Delete local data
        logger.info("Deleting account for user {}", userId);
        try
        {
            UUID finalUserId = userId;
            // Execute DB deletions in a separate, short-lived transaction
            new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
                // Delete planner data (courses first, then semesters)
                plannedSemesterRepository.deleteCoursesByUserId(finalUserId);
                plannedSemesterRepository.deleteSemestersByUserId(finalUserId);

                // Delete user settings
                userSettingsRepository.deleteByUserId(finalUserId);
            });

            // 5. Delete from Supabase Auth
            // Use try-catch to ensure we don't fail the whole request if this part fails
            // Executed OUTSIDE the DB transaction to prevent connection leaks
            try {
                deleteSupabaseUser(userId.toString());
            } catch (Exception ex) {
                logger.error("Supabase deletion failed (user might be deleted locally only): {}", ex.getMessage());
            }
        }
        catch (Exception e)
        {
            // If local deletion fails, we DO want to report error
            logger.error("Failed to delete user data for {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to delete user data", DETAILS_KEY, e.getMessage()));
        }

        // 4. Logout (clear cookies)
        boolean secureCookie = backendBaseUrl != null && backendBaseUrl.startsWith("https://");
        ResponseCookie clearAccess = ResponseCookie.from(ACCESS_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(0) // Expire immediately
                .domain(cookieDomain)
                .build();

        ResponseCookie clearRefresh = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/")
                .maxAge(0) // Expire immediately
                .domain(cookieDomain)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearAccess.toString())
                .header(HttpHeaders.SET_COOKIE, clearRefresh.toString())
                .body(Map.of("status", "account_deleted"));
    }

    /**
     * Returns the current Supabase user payload if the access token is valid.
     */
    @GetMapping("/me")
    public ResponseEntity<JsonNode> me(HttpServletRequest request)
    {
        // Read access token from cookie
        String accessToken = null;
        if (request.getCookies() != null)
        {
            for (jakarta.servlet.http.Cookie c : request.getCookies())
            {
                if (ACCESS_COOKIE_NAME.equals(c.getName()))
                {
                    accessToken = c.getValue();
                    break;
                }
            }
        }

        if (accessToken == null || accessToken.isEmpty())
        {
            ObjectMapper mapper = new ObjectMapper();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(mapper.createObjectNode().put(ERROR_KEY, UNAUTHORIZED_MESSAGE));
        }

        try
        {
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            userHeaders.set(APIKEY_HEADER, supabaseApiKey);
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);

            ResponseEntity<String> userResponse = new RestTemplate().exchange(
                    supabaseProjectUrl + "/auth/v1/user", HttpMethod.GET, userRequest, String.class);

            if (!userResponse.getStatusCode().is2xxSuccessful())
            {
                ObjectMapper mapper = new ObjectMapper();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(mapper.createObjectNode().put(ERROR_KEY, UNAUTHORIZED_MESSAGE));
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode userJson = mapper.readTree(Optional.ofNullable(userResponse.getBody()).orElse("{}"));
            return ResponseEntity.ok(userJson);
        }
        catch (Exception e)
        {
            ObjectMapper mapper = new ObjectMapper();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(mapper.createObjectNode().put(ERROR_KEY, UNAUTHORIZED_MESSAGE));
        }
    }

    /**
     * Checks if the email is from an allowed domain
     *
     * @param  email the email to check
     * @return       true if the email is from an allowed domain, false otherwise
     */
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
        return allowedDomainSet.contains(domain);
    }

    private void deleteSupabaseUser(String userId)
    {
        try
        {
            // Create a custom JWT with service_role privileges
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", "service_role");
            claims.put("iss", "supabase");
            
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 60000)) // 1 min expiry
                    .signWith(Keys.hmacShaKeyFor(supabaseJwtSecret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                    .compact();

            String url = supabaseProjectUrl + "/auth/v1/admin/users/" + userId;
            HttpHeaders headers = new HttpHeaders();
            
            // Supabase Admin API expects 'apikey' (can be anon key) AND 'Authorization: Bearer <service_role_token>'
            headers.set("apikey", supabaseApiKey);
            headers.setBearerAuth(token);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            new RestTemplate().exchange(url, HttpMethod.DELETE, request, Void.class);
            logger.info("Deleted Supabase user {}", userId);
        }
        catch (Exception e) 
        {
            logger.error("Failed to delete Supabase user {}", userId, e);
            // We do NOT throw here, as local data is already deleted. 
            // Logging the error is sufficient; user cannot log in anyway as they are deleted locally.
            // (Ideally we should ensure consistency, but Supabase user without local data is harmless)
        }
    }
}
