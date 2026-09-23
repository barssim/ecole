package ma.solide.teacherservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Value("${jwt.secret:239487234972394e98er023r934o9342oi4uew0923w8734928374}")
    private String secret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                    .build().parseClaimsJws(authorization.substring(7).trim()).getBody();
            String school = claims.get("school_id", String.class);
            String requestSchool = request.getHeader("X-School-Id");
            Number userId = claims.get("user_id", Number.class);
            if (claims.getSubject() == null || userId == null || school == null || requestSchool == null
                    || !school.equalsIgnoreCase(requestSchool.trim())) {
                unauthorized(response);
                return;
            }
            var authentication = new UsernamePasswordAuthenticationToken(
                    claims.getSubject(), null, authorities(claims));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            chain.doFilter(request, response);
        } catch (JwtException | IllegalArgumentException exception) {
            SecurityContextHolder.clearContext();
            unauthorized(response);
        }
    }

    private List<SimpleGrantedAuthority> authorities(Claims claims) {
        Object roles = claims.get("roles");
        if (!(roles instanceof Collection<?> values)) return List.of();
        return values.stream().map(String::valueOf).map(String::trim).filter(value -> !value.isBlank())
                .map(String::toUpperCase).map(value -> value.startsWith("ROLE_") ? value : "ROLE_" + value)
                .distinct().map(SimpleGrantedAuthority::new).toList();
    }

    private void unauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Invalid or expired token\"}");
    }
}
