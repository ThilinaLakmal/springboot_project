import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, BookOpen, Ticket, Info, X, Trash2 } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, NotificationData } from '../../api/notificationApi';
import { useAuth } from '../../contexts/AuthContext';

export const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Fetch unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (err) {
      // Silently fail — non-critical
    }
  }, [isAuthenticated]);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const handleDeleteNotification = async (id: number, isRead: boolean) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (!isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;
    
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BOOKING':
        return <BookOpen size={14} className="text-blue-500" />;
      case 'TICKET':
        return <Ticket size={14} className="text-amber-500" />;
      case 'SYSTEM':
        return <Info size={14} className="text-slate-500" />;
      default:
        return <Info size={14} className="text-slate-400" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'BOOKING':
        return 'bg-blue-100 text-blue-700';
      case 'TICKET':
        return 'bg-amber-100 text-amber-700';
      case 'SYSTEM':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-500 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <div 
        className={`absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden transition-all duration-300 ease-out origin-top-right ${
          isOpen ? 'opacity-100 transform scale-100 translate-y-0 visible' : 'opacity-0 transform scale-95 -translate-y-4 invisible pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50/80 to-blue-50/80 border-b border-slate-200 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  unreadCount === 0 
                    ? 'text-slate-400 cursor-default opacity-60' 
                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                }`}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                title="Clear all notifications"
              >
                <Trash2 size={13} />
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Bell size={32} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50/40' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) handleMarkAsRead(notification.id);
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className={`mt-0.5 p-1.5 rounded-lg ${
                    !notification.isRead ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getTypeBadgeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${
                      !notification.isRead ? 'text-slate-800 font-medium' : 'text-slate-600'
                    }`}>
                      {notification.message}
                    </p>
                  </div>

                  {/* Read Indicator & Delete Action */}
                  <div className="flex-shrink-0 mt-1 flex flex-col items-center gap-2">
                    {!notification.isRead ? (
                       <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" title="Unread"></div>
                    ) : (
                       <Check size={14} className="text-slate-300" title="Read" />
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id, notification.isRead);
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                      title="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-slate-50/80 backdrop-blur-md border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
