package com.smartcampus.service;

import com.smartcampus.dto.NotificationDto;
import com.smartcampus.model.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    /**
     * Create a notification for a specific user.
     * This is the primary method other modules should call.
     *
     * @param userId  the target user ID
     * @param message the notification message
     * @param type    the notification type (BOOKING, TICKET, SYSTEM)
     * @return the created notification DTO
     */
    NotificationDto createNotification(Long userId, String message, NotificationType type);

    /**
     * Get all notifications for a specific user, ordered by newest first.
     */
    List<NotificationDto> getUserNotifications(Long userId);

    /**
     * Get the count of unread notifications for a user.
     */
    long getUnreadCount(Long userId);

    /**
     * Mark a single notification as read.
     */
    NotificationDto markAsRead(Long notificationId);

    /**
     * Mark all notifications for a user as read.
     */
    void markAllAsRead(Long userId);
}
