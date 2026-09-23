package ma.solide.secretaryoffice;

import ma.solide.secretaryoffice.security.JwtAuthenticationFilter;
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
                        .requestMatchers(HttpMethod.GET, "/api/activities", "/api/gallery/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/attestations/request").hasRole("PARENT")
                        .requestMatchers(HttpMethod.GET, "/api/attestations/**").hasAnyRole("MANAGER", "ADMIN", "SECRETARY", "PARENT")
                        .requestMatchers("/api/attestations/**").hasAnyRole("MANAGER", "ADMIN", "SECRETARY")
                        .requestMatchers(HttpMethod.GET, "/api/classes/**", "/api/exams/**")
                                .hasAnyRole("MANAGER", "ADMIN", "SECRETARY", "TEACHER", "STUDENT", "PARENT")
                        .requestMatchers("/api/classes/**", "/api/exams/**", "/api/activities/**")
                                .hasAnyRole("MANAGER", "ADMIN", "SECRETARY")
                        .requestMatchers(HttpMethod.GET, "/api/presence/professors/*")
                                .hasAnyRole("MANAGER", "ADMIN", "SECRETARY", "TEACHER")
                        .requestMatchers("/api/presence/professors/**").hasAnyRole("MANAGER", "ADMIN", "SECRETARY")
                        .requestMatchers("/api/gallery/**").hasAnyRole("MANAGER", "ADMIN")
                        .anyRequest().denyAll())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable()).httpBasic(basic -> basic.disable()).build();
    }
}
