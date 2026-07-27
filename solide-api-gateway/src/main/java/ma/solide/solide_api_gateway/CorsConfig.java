package ma.solide.solide_api_gateway;

/**
 * CORS is configured exclusively via spring.cloud.gateway.globalcors in application.yml.
 * Having a CorsWebFilter bean alongside globalcors creates duplicate/conflicting
 * Access-Control-Allow-Origin headers, which browsers reject as "Invalid CORS request".
 *
 * This class is intentionally left empty. Do NOT re-add a CorsWebFilter bean here.
 */
public class CorsConfig {
}
