package com.smartcampus.controller;

import com.smartcampus.dto.UserProfileDto;
import com.smartcampus.model.entity.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * GET /api/v1/users
     * Returns a list of all users (Admin only).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        log.info("Admin fetching all users");

        List<UserProfileDto> users = userRepository.findAll().stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(users);
    }

    /**
     * GET /api/v1/users/{id}
     * Allows an ADMIN to fetch the profile details of any user by their ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        log.info("Admin fetching user profile for ID: {}", id);

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(toDto(user));
    }

    /**
     * PATCH /api/v1/users/{id}/role
     * Updates a user's role (Admin only).
     * Expects JSON body: { "role": "ADMIN" } or { "role": "STUDENT" }
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
        }

        // Validate allowed roles
        if (!List.of("ADMIN", "STUDENT", "USER").contains(newRole.toUpperCase())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + newRole));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        user.setRole(newRole.toUpperCase());
        userRepository.save(user);

        log.info("Admin updated role for user ID={} to {}", id, newRole.toUpperCase());
        return ResponseEntity.ok(toDto(user));
    }

    /**
     * PATCH /api/v1/users/{id}/status
     * Toggles a user's active status — Block/Unblock (Admin only).
     * Expects JSON body: { "isActive": true } or { "isActive": false }
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean isActive = body.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "isActive is required"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        user.setIsActive(isActive);
        userRepository.save(user);

        log.info("Admin {} user ID={}", isActive ? "unblocked" : "blocked", id);
        return ResponseEntity.ok(toDto(user));
    }

    // ---- Helper ----

    private UserProfileDto toDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .profilePicture(user.getProfilePicture())
                .googleId(user.getGoogleId())
                .isActive(user.getIsActive())
                .build();
    }
}
