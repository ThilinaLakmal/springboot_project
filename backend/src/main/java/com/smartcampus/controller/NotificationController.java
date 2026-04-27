package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDto;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/v1/notifications
     * Returns all notifications for the currently authenticated user.
     * User ID is derived from the JWT token (set by JwtAuthenticationFilter).
     */
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMyNotifications(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    /**
     * GET /api/v1/notifications/unread-count
     * Returns the count of unread notifications for the current user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * PATCH /api/v1/notifications/{id}/read
     * Marks a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable("id") Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    /**
     * PATCH /api/v1/notifications/read-all
     * Marks all notifications for the current user as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    /**
     * DELETE /api/v1/notifications/{id}
     * Deletes a specific notification. Ensures user ownership.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable("id") Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(Map.of("message", "Notification deleted successfully"));
    }

    /**
     * DELETE /api/v1/notifications/all
     * Deletes all notifications for the current user.
     */
    @DeleteMapping("/all")
    public ResponseEntity<Map<String, String>> deleteAllNotifications(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        notificationService.deleteAllUserNotifications(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications deleted successfully"));
    }
}
