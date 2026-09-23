package ma.solide.finance_manager;

import ma.solide.finance_manager.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/payments/**", "/api/paymentNotice",
                                "/api/paymentNotices/**", "/api/factures/**")
                                .hasAnyRole("MANAGER", "ADMIN", "FINANCE", "PARENT", "STUDENT")
                        .requestMatchers("/api/payments/**", "/api/paymentNotices/**", "/api/facture/**")
                                .hasAnyRole("MANAGER", "ADMIN", "FINANCE")
                        .anyRequest().denyAll())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable()).httpBasic(basic -> basic.disable()).build();
    }
}
