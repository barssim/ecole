package ma.solide.solide_api_gateway;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Global filter that validates the JWT credential on every non-public request.
 *
 * <p>Public paths (no token required):
 * <ul>
 *   <li>{@code /api/auth/login}</li>
 *   <li>{@code /api/auth/register}</li>
 *   <li>{@code /actuator/**}</li>
 * </ul>
 *
 * <p>On a valid token the filter extracts {@code tenant_id} and {@code roles} claims
 * and forwards them as {@code X-Tenant-Id} and {@code X-User-Roles} headers so that
 * downstream services can perform their own tenant scoping / role checks without
 * trusting any client-supplied values.
 */
@Component
public class JwtAuthenticationGlobalFilter implements GlobalFilter, Ordered {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String TENANT_HEADER = "X-Tenant-Id";
    private static final String ROLE_HEADER = "X-User-Roles";

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey signingKey;

    @PostConstruct
    void initKey() {
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getURI().getPath();
        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(BEARER_PREFIX.length());
        Claims claims;
        try {
            claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            return unauthorized(exchange);
        }

        String tenantId = claims.get("tenant_id", String.class);
        Object rolesObj = claims.get("roles");
        String rolesCsv = toRolesCsv(rolesObj);

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .headers(headers -> {
                    if (tenantId != null && !tenantId.isBlank()) {
                        headers.set(TENANT_HEADER, tenantId.trim().toLowerCase());
                    }
                    if (rolesCsv != null && !rolesCsv.isBlank()) {
                        headers.set(ROLE_HEADER, rolesCsv);
                    }
                })
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicPath(String path) {
        return path.equals("/api/auth/login")
                || path.equals("/api/auth/register")
                || path.startsWith("/actuator/");
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    @SuppressWarnings("unchecked")
    private String toRolesCsv(Object rolesObj) {
        if (rolesObj == null) {
            return null;
        }
        if (rolesObj instanceof List) {
            return String.join(",", (List<String>) rolesObj);
        }
        return rolesObj.toString();
    }

    @Override
    public int getOrder() {
        return -2;
    }
}
