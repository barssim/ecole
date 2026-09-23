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
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtAuthorizationGlobalFilter implements GlobalFilter, Ordered {

    private static final String SCHOOL_HEADER = "X-School-Id";
    private static final String ROLE_HEADER = "X-User-Roles";
    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String USER_NAME_HEADER = "X-User-Name";

    private final AntPathMatcher paths = new AntPathMatcher();

    @Value("${jwt.secret}")
    private String secret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        HttpMethod method = exchange.getRequest().getMethod();
        String path = exchange.getRequest().getURI().getPath();

        if (HttpMethod.OPTIONS.equals(method) || isPublic(method, path)) {
            return chain.filter(removeUntrustedIdentityHeaders(exchange));
        }

        String authorization = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return reject(exchange, HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(authorization.substring(7).trim())
                    .getBody();

            String username = claims.getSubject();
            String tokenSchool = normalize(claims.get("school_id", String.class));
            Number userId = claims.get("user_id", Number.class);
            Set<String> roles = extractRoles(claims);
            String requestSchool = SchoolResolver.resolve(
                    exchange.getRequest().getHeaders().getFirst(SCHOOL_HEADER),
                    exchange.getRequest().getHeaders().getFirst("Host"));

            if (username == null || username.isBlank() || userId == null || tokenSchool == null
                    || requestSchool == null || !tokenSchool.equals(requestSchool)) {
                return reject(exchange, HttpStatus.UNAUTHORIZED, "Token identity or school is invalid");
            }

            Set<String> allowedRoles = allowedRoles(method, path);
            if (allowedRoles == null) {
                return reject(exchange, HttpStatus.FORBIDDEN, "Endpoint is not permitted");
            }
            if (!allowedRoles.isEmpty() && roles.stream().noneMatch(allowedRoles::contains)) {
                return reject(exchange, HttpStatus.FORBIDDEN, "Insufficient permissions");
            }

            ServerHttpRequest request = exchange.getRequest().mutate()
                    .headers(headers -> {
                        headers.remove(ROLE_HEADER);
                        headers.remove(USER_ID_HEADER);
                        headers.remove(USER_NAME_HEADER);
                        headers.set(SCHOOL_HEADER, tokenSchool);
                        headers.set(ROLE_HEADER, String.join(",", roles));
                        headers.set(USER_ID_HEADER, String.valueOf(userId.longValue()));
                        headers.set(USER_NAME_HEADER, username);
                    })
                    .build();
            return chain.filter(exchange.mutate().request(request).build());
        } catch (JwtException | IllegalArgumentException exception) {
            return reject(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }

    private ServerWebExchange removeUntrustedIdentityHeaders(ServerWebExchange exchange) {
        ServerHttpRequest request = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.remove(ROLE_HEADER);
                    headers.remove(USER_ID_HEADER);
                    headers.remove(USER_NAME_HEADER);
                })
                .build();
        return exchange.mutate().request(request).build();
    }

    private boolean isPublic(HttpMethod method, String path) {
        return path.startsWith("/actuator/")
                || (HttpMethod.POST.equals(method) && path.equals("/api/auth/login"))
                || (HttpMethod.GET.equals(method) && path.equals("/api/school-customization"))
                || (HttpMethod.GET.equals(method) && matches(path, "/api/activities", "/api/gallery/**"));
    }

    private Set<String> allowedRoles(HttpMethod method, String path) {
        if (path.equals("/api/auth/register")) {
            return roles("manager");
        }
        if (path.startsWith("/api/users")) {
            if (method.equals(HttpMethod.GET) && path.equals("/api/users")) return roles("manager");
            if (method.equals(HttpMethod.GET) && path.equals("/api/users/teachers")) return roles("manager", "admin", "secretary", "teacher");
            if (method.equals(HttpMethod.GET) && path.equals("/api/users/students")) return roles("manager", "admin", "secretary", "teacher", "finance");
            if (matches(path, "/api/users/*/profile", "/api/users/*/password", "/api/users/*/cgu-acceptance")) return roles();
            return roles("manager");
        }
        if (path.equals("/api/school-customization")) {
            return method.equals(HttpMethod.PUT) ? roles("manager") : null;
        }
        if (matches(path, "/api/payments/**", "/api/paymentNotice", "/api/paymentNotices/**",
                "/api/facture/**", "/api/factures/**")) {
            return method.equals(HttpMethod.GET)
                    ? roles("manager", "admin", "finance", "parent", "student")
                    : roles("manager", "admin", "finance");
        }
        if (path.startsWith("/api/attestations")) {
            if (method.equals(HttpMethod.POST) && path.equals("/api/attestations/request")) return roles("parent");
            if (method.equals(HttpMethod.GET)) return roles("manager", "admin", "secretary", "parent");
            return roles("manager", "admin", "secretary");
        }
        if (path.startsWith("/api/classes")) {
            return method.equals(HttpMethod.GET)
                    ? roles("manager", "admin", "secretary", "teacher", "student", "parent")
                    : roles("manager", "admin", "secretary");
        }
        if (path.startsWith("/api/exams")) {
            return method.equals(HttpMethod.GET)
                    ? roles("manager", "admin", "secretary", "teacher", "student", "parent")
                    : roles("manager", "admin", "secretary");
        }
        if (path.startsWith("/api/activities")) {
            return roles("manager", "admin", "secretary");
        }
        if (path.startsWith("/api/gallery")) {
            return method.equals(HttpMethod.GET) ? roles() : roles("manager", "admin");
        }
        if (path.startsWith("/api/presence/professors")) {
            if (method.equals(HttpMethod.GET) && !path.equals("/api/presence/professors")) {
                return roles("manager", "admin", "secretary", "teacher");
            }
            return roles("manager", "admin", "secretary");
        }
        if (matches(path, "/api/teachercourses/**", "/api/teacher/**")) {
            return roles("manager", "admin", "teacher");
        }
        if (path.equals("/api/upload")) {
            return roles("manager", "admin", "teacher");
        }
        if (path.startsWith("/api/uploads")) {
            return roles("manager", "admin", "teacher", "student", "parent");
        }
        if (matches(path, "/api/student/grades", "/api/student/notes", "/api/student/exercises", "/api/studentschedule/**")) {
            return method.equals(HttpMethod.GET)
                    ? roles("manager", "admin", "teacher", "student", "parent")
                    : roles("manager", "admin", "teacher");
        }
        if (path.startsWith("/api/student/")) {
            return roles("manager", "admin", "teacher");
        }
        if (path.startsWith("/api/parents/payments")) {
            return roles("manager", "admin", "teacher", "parent", "finance");
        }
        if (path.startsWith("/api/parents/attestation-requests")) {
            return roles("manager", "admin", "secretary", "parent");
        }
        if (path.startsWith("/api/parents/")) {
            return roles("manager", "admin", "teacher", "parent");
        }
        return null;
    }

    private boolean matches(String path, String... patterns) {
        for (String pattern : patterns) {
            if (paths.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }

    private Set<String> extractRoles(Claims claims) {
        Object claim = claims.get("roles");
        if (!(claim instanceof Collection<?> values)) {
            return Set.of();
        }
        return values.stream()
                .map(String::valueOf)
                .map(this::normalizeRole)
                .filter(role -> !role.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    private Set<String> roles(String... values) {
        return Set.of(values);
    }

    private String normalizeRole(String role) {
        String normalized = role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
        return normalized.startsWith("role_") ? normalized.substring(5) : normalized;
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private Mono<Void> reject(ServerWebExchange exchange, HttpStatus status, String message) {
        byte[] body = ("{\"message\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
    }

    @Override
    public int getOrder() {
        return -2;
    }
}
