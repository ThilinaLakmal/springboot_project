import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, updateUserStatus, UserProfile } from '../api/userApi';
import { Link } from 'react-router-dom';
import {
  Users, Shield, ShieldAlert, ShieldCheck, Eye, Ban, CheckCircle2,
  Loader2, AlertCircle, Search, ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [roleDropdownId, setRoleDropdownId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setRoleDropdownId(null);
    if (roleDropdownId !== null) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [roleDropdownId]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    setRoleDropdownId(null);
    try {
      const updated = await updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId: number, currentlyActive: boolean) => {
    setUpdatingId(userId);
    try {
      const updated = await updateUserStatus(userId, !currentlyActive);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success(currentlyActive ? 'User blocked successfully' : 'User unblocked successfully');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-amber-100 text-amber-700 border-amber-200',
      STUDENT: 'bg-blue-100 text-blue-700 border-blue-200',
      USER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    const icons: Record<string, React.ReactNode> = {
      ADMIN: <ShieldAlert size={12} />,
      STUDENT: <Shield size={12} />,
      USER: <ShieldCheck size={12} />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[role] || styles.USER}`}>
        {icons[role] || icons.USER}
        {role}
      </span>
    );
  };

  const statusBadge = (active: boolean) =>
    active ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
        <CheckCircle2 size={12} />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
        <Ban size={12} />
        Blocked
      </span>
    );

  // Loading
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading users…</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Users</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button onClick={fetchUsers} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">{users.length} registered user{users.length !== 1 && 's'}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-slate-300" />
                      <p className="text-sm text-slate-400 font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className={`hover:bg-slate-50/70 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}>
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.profilePicture ? (
                          <img
                            src={u.profilePicture}
                            alt={u.name}
                            className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                            <UserIcon size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4">{roleBadge(u.role)}</td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">{statusBadge(u.isActive)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Profile */}
                        <Link
                          to={`/app/profile/${u.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Eye size={13} />
                          View
                        </Link>

                        {/* Change Role Dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRoleDropdownId(roleDropdownId === u.id ? null : u.id);
                            }}
                            disabled={updatingId === u.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Shield size={13} />
                            Role
                            <ChevronDown size={12} />
                          </button>

                          {roleDropdownId === u.id && (
                            <div
                              className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {['ADMIN', 'STUDENT', 'USER'].map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleRoleChange(u.id, role)}
                                  disabled={u.role === role}
                                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                                    u.role === role
                                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                                      : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                                  }`}
                                >
                                  {role}
                                  {u.role === role && <span className="ml-1 text-[10px] text-slate-400">(current)</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Block / Unblock Toggle */}
                        <button
                          onClick={() => handleStatusToggle(u.id, u.isActive)}
                          disabled={updatingId === u.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            u.isActive
                              ? 'text-red-600 bg-red-50 hover:bg-red-100'
                              : 'text-green-600 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {updatingId === u.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : u.isActive ? (
                            <Ban size={13} />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          {u.isActive ? 'Block' : 'Unblock'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3">
          <p className="text-xs text-slate-400">
            Showing {filteredUsers.length} of {users.length} user{users.length !== 1 && 's'}
          </p>
        </div>
      </div>
    </div>
  );
};
