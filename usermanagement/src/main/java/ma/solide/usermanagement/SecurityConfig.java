package ma.solide.usermanagement;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // CSRF protection is disabled intentionally: this is a stateless REST API that
        // authenticates via ****** tokens, not browser session cookies.  Browsers
        // never attach JWT tokens automatically, so CSRF attacks are not applicable.
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(
                        auth -> auth
                                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                                .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .httpBasic(httpbasic -> httpbasic.disable());

        return http.build();
    }
}
