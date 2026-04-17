package com.smartcampus.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.GoogleLoginRequest;
import com.smartcampus.model.entity.User;
import com.smartcampus.model.enums.NotificationType;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import com.smartcampus.service.NotificationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final GoogleIdTokenVerifier verifier;

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService,
            NotificationService notificationService,
            @Value("${app.google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    /**
     * POST /api/v1/auth/google
     * Receives a Google ID token from the frontend, verifies it,
     * upserts the user in the database, and returns a JWT.
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            // Verify the Google ID token
            GoogleIdToken idToken = verifier.verify(request.getCredential());

            if (idToken == null) {
                log.warn("Invalid Google ID token received");
                return ResponseEntity.status(401)
                        .body(AuthResponse.builder().token(null).build());
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            log.info("Google login for email: {}", email);

            // Try to find existing user by googleId, then by email
            User user = userRepository.findByGoogleId(googleId)
                    .orElseGet(() -> userRepository.findByEmail(email)
                            .orElse(null));

            if (user == null) {
                // Auto-register with default STUDENT role
                user = User.builder()
                        .username(name != null ? name : email.split("@")[0])
                        .email(email)
                        .password("GOOGLE_OAUTH_USER") // Placeholder — not used for auth
                        .role("STUDENT")
                        .googleId(googleId)
                        .profilePicture(picture)
                        .build();
                user = userRepository.save(user);
                log.info("New user auto-registered with ID: {} and role: STUDENT", user.getId());

                // Notify all admins about the new registration
                try {
                    notificationService.notifyAllAdmins(
                            "New user registered: " + user.getUsername() + " (" + user.getEmail() + ")",
                            NotificationType.SYSTEM
                    );
                } catch (Exception e) {
                    log.warn("Failed to send new user registration notification to admins: {}", e.getMessage());
                }
            } else {
                // Update Google-specific fields if they changed
                boolean updated = false;
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    updated = true;
                }
                if (picture != null && !picture.equals(user.getProfilePicture())) {
                    user.setProfilePicture(picture);
                    updated = true;
                }
                if (name != null && !name.equals(user.getUsername())) {
                    user.setUsername(name);
                    updated = true;
                }
                if (updated) {
                    user = userRepository.save(user);
                }
                log.info("Existing user logged in with ID: {} and role: {}", user.getId(), user.getRole());
            }

            // Block login for deactivated users
            if (Boolean.FALSE.equals(user.getIsActive())) {
                log.warn("Blocked user attempted login: ID={}, email={}", user.getId(), user.getEmail());
                return ResponseEntity.status(403)
                        .body(AuthResponse.builder().token(null).build());
            }

            // Generate JWT
            String jwt = jwtService.generateToken(user);

            AuthResponse response = AuthResponse.builder()
                    .token(jwt)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getUsername())
                    .role(user.getRole())
                    .profilePicture(user.getProfilePicture())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Google authentication failed", e);
            return ResponseEntity.status(401)
                    .body(AuthResponse.builder().token(null).build());
        }
    }

    /**
     * GET /api/v1/auth/me
     * Returns the current authenticated user's info derived from the JWT.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getUsername())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .build();

        return ResponseEntity.ok(response);
    }
}
