import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { NotificationPanel } from './NotificationPanel';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-end px-6 sticky top-0 z-30">
      <div className="flex items-center gap-5">
        {/* Notification Panel (replaces static Bell icon) */}
        <NotificationPanel />

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          {/* Clickable profile link — navigates to /app/profile */}
          <Link to="/app/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name || 'Guest'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase() || 'User'}</p>
            </div>

            {/* Profile Picture or Default Icon */}
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-9 h-9 rounded-full border-2 border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <UserIcon size={18} />
              </div>
            )}
          </Link>

          <button 
            onClick={handleLogout}
            className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

