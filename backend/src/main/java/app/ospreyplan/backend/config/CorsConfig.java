package app.ospreyplan.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig
{
    @Value("${frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Bean
    public WebMvcConfigurer corsConfigurer()
    {
        return new WebMvcConfigurer()
        {
            @Override
            public void addCorsMappings(CorsRegistry registry)
            {
                // Generate both www and non-www variants of the frontend URL
                String[] allowedOrigins = generateAllowedOrigins(frontendBaseUrl);

                registry.addMapping("/**")
                        .allowedOrigins(allowedOrigins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true);
            }
        };
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
