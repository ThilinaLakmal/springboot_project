import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, BookOpen, Ticket, Info, Trash2, ArrowLeft, RotateCcw } from 'lucide-react';
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
    case 'BOOKING': return <BookOpen size={20} className="text-blue-500" />;
    case 'TICKET': return <Ticket size={20} className="text-amber-500" />;
    case 'SYSTEM': return <Info size={20} className="text-slate-500" />;
    default: return <Info size={20} className="text-slate-400" />;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'BOOKING': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'TICKET': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'SYSTEM': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-100 text-slate-500 border-slate-200';
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
    if (!window.confirm("Are you sure you want to wipe all notifications?")) return;
    
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
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up relative z-10 flex-1 px-4 sm:px-0">
      {/* Page Header Area */}
      <div className="bg-white/60 backdrop-blur-3xl rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-white flex flex-col md:flex-row justify-between items-center gap-6 mt-4 relative overflow-hidden">
        
        {/* Deep orb effect inside header */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col w-full md:w-auto">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-slate-400 hover:text-blue-600 transition-colors mb-4 gap-1.5 text-xs font-bold uppercase tracking-widest w-fit"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)]">
                <Bell size={28} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-red-500/30 animate-pulse">
                      {unreadCount} NEW
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">Review your recent alerts and system updates.</p>
             </div>
          </div>
        </div>
        
        <div className="flex flex-row items-center gap-3 w-full md:w-auto relative z-10">
          {notifications.length > 0 && (
             <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   unreadCount === 0 
                     ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                     : 'bg-white shadow-lg text-slate-700 hover:text-blue-600 border border-slate-100 hover:border-blue-200 hover:-translate-y-1'
                }`}
             >
                <CheckCheck size={16} /> Mark all read
             </button>
          )}
          {notifications.length > 0 && (
             <button
                onClick={handleClearAll}
                className="flex-[0.5] md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 transition-all hover:-translate-y-1 shadow-sm"
                title="Wipe all notifications"
             >
                <Trash2 size={16} /> <span className="hidden sm:inline">Wipe</span>
             </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
         {loading ? (
           <div className="flex flex-col items-center justify-center h-[400px] text-blue-500">
             <div className="animate-spin h-10 w-10 border-[3px] border-slate-200 border-t-current rounded-full mb-4"></div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Feed...</p>
           </div>
         ) : notifications.length === 0 ? (
           <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col items-center justify-center h-[400px]">
             <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-6 text-blue-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
                <Bell size={48} />
             </div>
             <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">You're Empty!</h3>
             <p className="text-slate-500 font-medium text-lg">You have no new alerts. Enjoy the silence.</p>
           </div>
         ) : (
           <div className="space-y-4">
              {notifications.map((notification) => (
                 <div
                   key={notification.id}
                   className={`relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-[400ms] group flex flex-col sm:flex-row gap-5 items-start sm:items-center will-change-transform ${
                      !notification.isRead 
                        ? 'bg-white shadow-[0_10px_30px_-5px_rgba(59,130,246,0.15)] border-blue-100 hover:shadow-[0_20px_40px_-5px_rgba(59,130,246,0.25)] hover:-translate-y-1.5' 
                        : 'bg-white/70 backdrop-blur-md border-white/50 shadow-sm hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] hover:bg-white hover:-translate-y-1 opacity-90 hover:opacity-100'
                   }`}
                 >
                    {/* Read Indicator Line (Left Edge Accent) */}
                    {!notification.isRead && (
                       <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-blue-500 rounded-r-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    )}

                    {/* Icon Bubble */}
                    <div className={`flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-[1.25rem] shadow-inner ${
                       !notification.isRead ? 'bg-blue-50' : 'bg-slate-50'
                    }`}>
                       {getTypeIcon(notification.type)}
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 min-w-0 pr-0 sm:pr-8">
                       <div className="flex flex-wrap items-center gap-3 mb-2.5">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${getTypeBadgeColor(notification.type)}`}>
                             {notification.type}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                             <RotateCcw size={13} className="opacity-60" /> {formatTime(notification.createdAt)}
                          </span>
                       </div>
                       <p className={`text-[15px] leading-relaxed ${
                          !notification.isRead ? 'text-slate-800 font-extrabold' : 'text-slate-600 font-semibold'
                       }`}>
                          {notification.message}
                       </p>
                    </div>

                    {/* Action Buttons (Slide in on Hover for md+) */}
                    <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto mt-4 sm:mt-0 sm:opacity-0 sm:translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                       {!notification.isRead && (
                          <button
                             onClick={() => handleMarkAsRead(notification.id)}
                             title="Mark as Read"
                             className="flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                          >
                             <Check size={18} className="stroke-[3]" />
                          </button>
                       )}
                       
                       <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          title="Delete Alert"
                          className="flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5"
                       >
                          <Trash2 size={18} />
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
