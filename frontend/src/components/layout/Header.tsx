import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { NotificationPanel } from './NotificationPanel';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of the system?")) {
      logout();
      toast.success('Successfully logged out');
      navigate('/login');
    }
  };

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex items-center justify-between px-6 sticky top-0 z-30 transition-all">
      
      {/* Left: Greeting and Search */}
      <div className="flex items-center gap-6 flex-1">
        <div className="hidden lg:block min-w-[200px]">
          <h2 className="text-slate-800 font-bold text-lg leading-tight flex items-center gap-2">
            {greeting}, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'Guest'}</span>! 👋
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
            Operations Dashboard
          </p>
        </div>


      </div>

      {/* Right: Notifications and Profile */}
      <div className="flex items-center gap-5 ml-4">
        {/* Notification Panel */}
        <NotificationPanel />

        <div className="flex items-center gap-4 pl-5 border-l border-slate-200/80">
          {/* Clickable profile link */}
          <Link to="/app/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name || 'Guest'}</p>
              <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">{user?.role || 'User'}</p>
            </div>

            {/* Profile Picture or Default Icon */}
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border-2 border-slate-200 shadow-sm">
                <UserIcon size={18} />
              </div>
            )}
          </Link>

          <button 
            onClick={handleLogout}
            className="ml-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-all py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
