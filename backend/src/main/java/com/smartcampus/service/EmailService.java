package com.smartcampus.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Smart Campus - Verify Your Registration");
            message.setText("Your Smart Campus verification code is: " + otp + ". It will expire in 5 minutes.");
            message.setFrom("noreply@smartcampus.com");
            
            javaMailSender.send(message);
            log.info("OTP Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email. Please check server email configurations.");
        }
    }
}
