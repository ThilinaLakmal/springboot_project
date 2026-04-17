package com.smartcampus.config;

import com.smartcampus.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:5175"
                ));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                return config;
            }))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                // Return 401 JSON for unauthenticated requests (expired/missing JWT)
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized. Please log in again.\"}");
                })
                // Return 403 JSON for authenticated users lacking the required role
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Access denied. Insufficient permissions.\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no JWT required
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/resources/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/resource-types/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // Admin-only endpoints
                .requestMatchers(HttpMethod.PUT, "/api/v1/bookings/*/approve").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/bookings/*/reject").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/bookings/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/resources/**").hasRole("ADMIN")

                // All other API endpoints require authentication
                .requestMatchers("/api/v1/**").authenticated()

                // Everything else is permitted (e.g. actuator, error pages)
                .anyRequest().permitAll()
            )
            // Add JWT filter before Spring Security's default auth filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
