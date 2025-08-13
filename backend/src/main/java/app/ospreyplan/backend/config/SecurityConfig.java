package app.ospreyplan.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;
import app.ospreyplan.backend.security.SupabaseAuthFilter;

@Configuration
public class SecurityConfig
{
    private final SupabaseAuthFilter supabaseAuthFilter;

    public SecurityConfig(SupabaseAuthFilter supabaseAuthFilter)
    {
        this.supabaseAuthFilter = supabaseAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception
    {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(
                        auth -> auth.requestMatchers("/auth/**").permitAll().anyRequest().authenticated())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> res.sendError(401)))
                .formLogin(AbstractHttpConfigurer::disable)
                .addFilterBefore(supabaseAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
