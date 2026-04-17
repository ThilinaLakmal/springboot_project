package com.smartcampus.service;

import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.RegisterRequest;
import com.smartcampus.model.entity.User;
import com.smartcampus.model.enums.NotificationType;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final NotificationService notificationService;

    public void registerUser(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email already in use.");
        }

        String otp = generateOtp();

        User user = User.builder()
                .username(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("STUDENT")
                .isEmailVerified(false)
                .otpCode(otp)
                .otpExpiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        userRepository.save(user);
        
        emailService.sendOtpEmail(user.getEmail(), otp);
        
        log.info("New user registered manually, OTP sent: {}", user.getEmail());
        
        try {
            notificationService.notifyAllAdmins(
                    "New user registered manually: " + user.getUsername() + " (" + user.getEmail() + ")",
                    NotificationType.SYSTEM
            );
        } catch (Exception e) {
            log.warn("Failed to notify admins of new registration: {}", e.getMessage());
        }
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getIsEmailVerified() != null && user.getIsEmailVerified()) {
            throw new RuntimeException("Email is already verified.");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            throw new RuntimeException("Invalid OTP code.");
        }

        if (user.getOtpExpiryTime() != null && user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired.");
        }

        // Valid OTP
        user.setIsEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);
        
        log.info("User email verified successfully: {}", user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials.");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Your account is deactivated. Please contact support.");
        }

        if (Boolean.FALSE.equals(user.getIsEmailVerified())) {
            throw new RuntimeException("Please verify your email first.");
        }

        String jwt = jwtService.generateToken(user);
        
        log.info("User logged in manually: {}", user.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getUsername())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    private String generateOtp() {
        Random rnd = new Random();
        int number = rnd.nextInt(999999);
        return String.format("%06d", number);
    }
}
