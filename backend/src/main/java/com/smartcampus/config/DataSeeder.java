package com.smartcampus.config;

import com.smartcampus.model.entity.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail("admin@smartcampus.edu").isEmpty()) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .email("admin@smartcampus.edu")
                        .role("ADMIN")
                        .isActive(true)
                        .isEmailVerified(true)
                        .build();
                userRepository.save(admin);
            }

            if (userRepository.findByEmail("student@smartcampus.edu").isEmpty()) {
                User student = User.builder()
                        .username("student")
                        .password(passwordEncoder.encode("student"))
                        .email("student@smartcampus.edu")
                        .role("STUDENT")
                        .isActive(true)
                        .isEmailVerified(true)
                        .build();
                userRepository.save(student);
            }
        };
    }
}