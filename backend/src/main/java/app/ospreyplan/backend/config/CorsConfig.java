package app.ospreyplan.backend.config;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class CorsConfig
{
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        List<String> allowedOrigins = new ArrayList<>();
        
        // Always allow localhost for development
        allowedOrigins.add("http://localhost:3000");

        // If in production, add the production URL variants
        if (frontendBaseUrl != null && !frontendBaseUrl.isEmpty()) {
            allowedOrigins.addAll(Arrays.asList(generateAllowedOrigins(frontendBaseUrl)));
        }
        
        configuration.setAllowedOrigins(allowedOrigins);
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*")); 
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Generates allowed origins by creating both www and non-www variants of the given URL Assumes URL is in format
     * "https://domain.com" (non-www)
     * 
     * @param  baseUrl the base frontend URL
     * @return         array containing both non-www and www variants
     */
    private String[] generateAllowedOrigins(String baseUrl)
    {
        int protocolIndex = baseUrl.indexOf("://");
        String protocol = baseUrl.substring(0, protocolIndex + 3);
        String domain = baseUrl.substring(protocolIndex + 3);

        // Generate both variants
        String nonWwwVariant = baseUrl;
        String wwwVariant = protocol + "www." + domain;

        return new String[]{ nonWwwVariant, wwwVariant };
    }
}
