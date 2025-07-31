package app.ospreyplan.backend.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    public ResponseEntity<Void> handleOAuthCallback(@RequestParam("code") String code) throws JsonProcessingException
    {
        logger.info("Received OAuth callback with code: {}", code);

        String url = supabaseProjectUrl + "/auth/v1/token?grant_type=pkce";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseServiceRoleKey);

        Map<String, String> body = new HashMap<>();
        body.put("auth_code", code);
        body.put("provider", "google");

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = new RestTemplate().postForEntity(url, request, String.class);

        logger.info("Supabase token endpoint response status: {}", response.getStatusCode());
        logger.debug("Supabase token endpoint response body: {}", response.getBody());

        ObjectMapper mapper = new ObjectMapper();
        JsonNode json = mapper.readTree(response.getBody());
        String accessToken = json.get("access_token").asText();

        String frontendUrl = frontendBaseUrl + "/auth/callback?access_token=" + accessToken;

        logger.info("Redirecting user to frontend: {}", frontendUrl);

        HttpHeaders redirectHeaders = new HttpHeaders();
        redirectHeaders.setLocation(java.net.URI.create(frontendUrl));

        return new ResponseEntity<>(redirectHeaders, HttpStatus.FOUND);
    }
}
