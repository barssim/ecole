package ma.solide.teacherservice;

import ma.solide.teacherservice.security.JwtAuthenticationFilter;
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
                        .requestMatchers(HttpMethod.GET, "/api/presence/professors/*")
                                .hasAnyRole("MANAGER", "ADMIN", "SECRETARY", "TEACHER")
                        .requestMatchers("/api/presence/professors/**").hasAnyRole("MANAGER", "ADMIN", "SECRETARY")
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").hasAnyRole("MANAGER", "ADMIN", "TEACHER", "STUDENT", "PARENT")
                        .requestMatchers("/api/upload", "/api/teachercourses/**", "/api/teacher/**").hasAnyRole("MANAGER", "ADMIN", "TEACHER")
                        .anyRequest().denyAll())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable()).httpBasic(basic -> basic.disable()).build();
    }
}
