package app.ospreyplan.backend.security;

import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
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
    @Value("${supabase.project-url}")
    String supabaseProjectUrl;
    @Value("${supabase.anon-key:${supabase.service-role-key}}")
    String supabaseApiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException
    {
        Cookie[] cookies = Optional.ofNullable(req.getCookies()).orElse(new Cookie[0]);
        String token = Arrays.stream(cookies).filter(c -> "sb-access-token".equals(c.getName())).map(Cookie::getValue)
                .findFirst().orElse(null);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null)
        {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.set("apikey", supabaseApiKey);

            try
            {
                new RestTemplate().exchange(supabaseProjectUrl + "/auth/v1/user", HttpMethod.GET,
                        new HttpEntity<>(headers), String.class);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("supabase-user",
                        null, List.of());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
            catch (Exception ignore)
            {
                /* leave unauthenticated → 401 by config */ }
        }
        chain.doFilter(req, res);
    }
}
