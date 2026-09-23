package ma.solide.usermanagement.security;

public record JwtPrincipal(Integer userId, String username, String schoolId) {
}
