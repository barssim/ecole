package ma.solide.usermanagement;


@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .authorizeHttpRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
			)
		.formLogin(form -> form.disable())
                .httpBasic(httpbasic -> httpbasic.disable());

        return http.build();

    }
