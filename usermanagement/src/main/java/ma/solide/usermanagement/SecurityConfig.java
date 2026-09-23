package ma.solide.usermanagement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import ma.solide.usermanagement.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"message\":\"Authentication required\"}");
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(403);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"message\":\"Insufficient permissions\"}");
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/school-customization").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/school-customization").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/users/teachers")
                                .hasAnyRole("MANAGER", "ADMIN", "SECRETARY", "TEACHER")
                        .requestMatchers(HttpMethod.GET, "/api/users/students")
                                .hasAnyRole("MANAGER", "ADMIN", "SECRETARY", "TEACHER", "FINANCE")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/profile").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/*/profile").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/*/password").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/*/cgu-acceptance").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/*").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("MANAGER")
                        .requestMatchers("/api/users/**").authenticated()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
                .httpBasic(httpbasic -> httpbasic.disable());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
