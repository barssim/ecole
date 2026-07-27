package ma.solide.finance_manager.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS is handled exclusively by the API Gateway (solide-api-gateway).
 * Configuring CORS here as well produces duplicate Access-Control-Allow-Origin
 * headers on responses that pass through the gateway, which browsers
 * reject as "Invalid CORS request".
 *
 * This class is intentionally empty. Do NOT add CORS mappings here.
 */
@Configuration
public class WebConfig {
}
