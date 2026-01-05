package app.ospreyplan.backend.security;

import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Arrays;
import java.util.Optional;
import java.util.List;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;

@Component
public class SupabaseAuthFilter extends OncePerRequestFilter
{
    private static final String APIKEY_HEADER = "apikey";
    private static final String ACCESS_COOKIE_NAME = "sb-access-token";
    private static final String REFRESH_COOKIE_NAME = "sb-refresh-token";
    @Value("${supabase.project-url}")
    String supabaseProjectUrl;
    @Value("${supabase.anon-key:${supabase.service-role-key}}")
    String supabaseApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException
    {
        Cookie[] cookies = Optional.ofNullable(req.getCookies()).orElse(new Cookie[0]);
        String accessToken = Arrays.stream(cookies).filter(c -> ACCESS_COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue).findFirst().orElse(null);
        String refreshToken = Arrays.stream(cookies).filter(c -> REFRESH_COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue).findFirst().orElse(null);

        if (SecurityContextHolder.getContext().getAuthentication() == null)
        {
            try
            {
                boolean authenticated = false;
                if (accessToken != null)
                {
                    try
                    {
                        HttpHeaders headers = new HttpHeaders();
                        headers.setBearerAuth(accessToken);
                        headers.set(APIKEY_HEADER, supabaseApiKey);
                        new RestTemplate().exchange(supabaseProjectUrl + "/auth/v1/user", HttpMethod.GET,
                                new HttpEntity<>(headers), String.class);
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                "supabase-user", null, List.of());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        authenticated = true;
                    }
                    catch (Exception e)
                    {
                        // Access token invalid or expired; fall through to try refresh token
                    }
                }
                
                if (!authenticated && refreshToken != null)
                {
                    // Try to refresh the access token
                    HttpHeaders refreshHeaders = new HttpHeaders();
                    refreshHeaders.setContentType(MediaType.APPLICATION_JSON);
                    refreshHeaders.set(APIKEY_HEADER, supabaseApiKey);
                    String body = "{\"refresh_token\":\"" + refreshToken + "\"}";
                    ResponseEntity<String> refreshResponse = new RestTemplate().postForEntity(
                            supabaseProjectUrl + "/auth/v1/token?grant_type=refresh_token",
                            new HttpEntity<>(body, refreshHeaders), String.class);

                    if (refreshResponse.getStatusCode().is2xxSuccessful())
                    {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode tokenJson = mapper.readTree(refreshResponse.getBody());
                        String newAccess = tokenJson.path("access_token").asText("");
                        String newRefresh = tokenJson.path("refresh_token").asText("");
                        int expiresInSeconds = tokenJson.path("expires_in").asInt(3600);

                        if (!newAccess.isEmpty() && !newRefresh.isEmpty())
                        {
                            boolean secureCookie = req.getRequestURL().toString().startsWith("https://");
                            ResponseCookie accessCookie = ResponseCookie.from(ACCESS_COOKIE_NAME, newAccess)
                                    .httpOnly(true).secure(secureCookie).sameSite("Lax").path("/")
                                    .maxAge(expiresInSeconds).build();
                            ResponseCookie refreshCookie = ResponseCookie.from(REFRESH_COOKIE_NAME, newRefresh)
                                    .httpOnly(true).secure(secureCookie).sameSite("Lax").path("/").build();
                            res.addHeader("Set-Cookie", accessCookie.toString());
                            res.addHeader("Set-Cookie", refreshCookie.toString());

                            // Validate new access token and authenticate
                            HttpHeaders headers2 = new HttpHeaders();
                            headers2.setBearerAuth(newAccess);
                            headers2.set(APIKEY_HEADER, supabaseApiKey);
                            new RestTemplate().exchange(supabaseProjectUrl + "/auth/v1/user", HttpMethod.GET,
                                    new HttpEntity<>(headers2), String.class);
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                    "supabase-user", null, List.of());
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        }
                    }
                }
            }
            catch (Exception e)
            {
                // Leave unauthenticated; SecurityConfig will return 401
            }
        }
        chain.doFilter(req, res);
    }
}
