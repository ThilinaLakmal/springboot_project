import api from './client';

export interface NotificationData {
  id: number;
  userId: number;
  message: string;
  type: 'BOOKING' | 'TICKET' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

/**
 * Fetch all notifications for the current authenticated user.
 */
export const getNotifications = () => {
  return api.get<NotificationData[]>('/notifications');
};

/**
 * Get the count of unread notifications.
 */
export const getUnreadCount = () => {
  return api.get<{ count: number }>('/notifications/unread-count');
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = (id: number) => {
  return api.patch<NotificationData>(`/notifications/${id}/read`);
};

/**
 * Mark all notifications as read.
 */
export const markAllAsRead = () => {
  return api.patch<{ message: string }>('/notifications/read-all');
};
