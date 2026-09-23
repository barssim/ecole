package ma.solide.usermanagement.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    @Value("${jwt.secret:kdJf9zf2xg8kPfgmNc4gWqTdR5veYnZ4Jwr6Hg4B3dVt9Lf83n}")
    private String secretKey;

    @Value("${jwt.expiration:3600000}")
    private long expirationTime;

    public String generateToken(Integer userId, String username, String schoolId, String roleCsv) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("user_id", userId);
        claims.put("school_id", schoolId);
        claims.put("roles", parseRoles(roleCsv));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
				.signWith(signingKey()).compact();
    }

    public Claims parseAndValidate(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key signingKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    private List<String> parseRoles(String roleCsv) {
        if (roleCsv == null || roleCsv.isBlank()) {
            return List.of();
        }

        return Arrays.stream(roleCsv.split(","))
                .map(String::trim)
                .filter(role -> !role.isBlank())
                .toList();
    }
}
