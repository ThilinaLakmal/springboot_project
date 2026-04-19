import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, BookOpen, Ticket, Info, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications, 
  NotificationData 
} from '../api/notificationApi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'BOOKING': return <BookOpen size={18} className="text-blue-500" />;
    case 'TICKET': return <Ticket size={18} className="text-amber-500" />;
    case 'SYSTEM': return <Info size={18} className="text-slate-500" />;
    default: return <Info size={18} className="text-slate-400" />;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'BOOKING': return 'bg-blue-100 text-blue-700';
    case 'TICKET': return 'bg-amber-100 text-amber-700';
    case 'SYSTEM': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-500';
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
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
       await markAllAsRead();
       setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
       toast.success('All notifications marked as read');
    } catch (err) {
       console.error('Failed to mark all notifications as read', err);
       toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification', err);
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;
    
    try {
      await clearAllNotifications();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Failed to clear notifications', err);
      toast.error('Failed to clear notifications');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in-up flex-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-2 gap-1 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                <Bell size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notifications</h1>
                <p className="text-sm text-slate-500 mt-0.5">Stay updated with your campus activities.</p>
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {notifications.length > 0 && (
             <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                   unreadCount === 0 
                     ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                     : 'bg-white border text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 border-slate-200'
                }`}
             >
                <CheckCheck size={16} />
                Mark all read
             </button>
          )}
          {notifications.length > 0 && (
             <button
                onClick={handleClearAll}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm"
             >
                <Trash2 size={16} />
                Clear all
             </button>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
         {loading ? (
           <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
             <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-blue-600 rounded-full mb-4"></div>
             <p className="text-sm font-medium">Loading notifications...</p>
           </div>
         ) : notifications.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell size={40} className="text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-700 mb-1">No notifications yet</h3>
             <p className="text-sm text-slate-500">When you interact with the campus operations, your alerts will show here.</p>
           </div>
         ) : (
           <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                 <div
                   key={notification.id}
                   className={`p-5 sm:p-6 transition-all hover:bg-slate-50 group flex flex-col sm:flex-row gap-4 sm:items-start ${
                      !notification.isRead ? 'bg-blue-50/30' : ''
                   }`}
                 >
                    {/* Icon */}
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100">
                       {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getTypeBadgeColor(notification.type)}`}>
                             {notification.type}
                          </span>
                          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                             {formatTime(notification.createdAt)}
                          </span>
                       </div>
                       <p className={`text-sm sm:text-base leading-relaxed ${
                          !notification.isRead ? 'text-slate-800 font-semibold' : 'text-slate-600'
                       }`}>
                          {notification.message}
                       </p>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center justify-end gap-3 sm:pl-4 sm:border-l border-slate-100 mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                       {!notification.isRead ? (
                          <button
                             onClick={() => handleMarkAsRead(notification.id)}
                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                             <Check size={14} />
                             Mark Read
                          </button>
                       ) : (
                          <span title="Read" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg">
                            <CheckCheck size={14} />
                            Read
                          </span>
                       )}
                       
                       <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                       >
                          <Trash2 size={14} />
                          Delete
                       </button>
                    </div>
                 </div>
              ))}
           </div>
         )}
      </div>
    </div>
  );
};
