import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Mail, Shield, KeyRound, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, UserProfile } from '../api/userApi';

export const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we are viewing another user's profile (admin view)
  const isAdminView = !!id;

  useEffect(() => {
    if (!id) {
      // No ID in URL — show logged-in user from AuthContext (no fetch needed)
      setProfileData(null);
      setError(null);
      return;
    }

    // ID present — admin fetches that user's profile from backend
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserById(id);
        setProfileData(data);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403) {
          setError('Access denied. Only admins can view other user profiles.');
        } else if (status === 404) {
          setError('User not found.');
        } else {
          setError('Failed to load user profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Resolved display data — either fetched profile or the logged-in user
  const displayUser = isAdminView
    ? profileData
      ? {
          id: String(profileData.id),
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
          profilePicture: profileData.profilePicture,
          googleId: profileData.googleId,
        }
      : null
    : authUser
      ? {
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role,
          profilePicture: authUser.profilePicture ?? null,
          googleId: null, // Not available from AuthContext
        }
      : null;

  const roleBadgeStyles: Record<string, string> = {
    ADMIN: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200',
    STUDENT: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-200',
    USER: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200',
  };

  const badgeStyle = roleBadgeStyles[displayUser?.role || 'USER'] || roleBadgeStyles.USER;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Profile</h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Admin View Badge */}
        {isAdminView && (
          <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <Shield size={14} className="text-amber-600" />
            <p className="text-xs font-semibold text-amber-700">
              Admin View — Viewing profile of another user
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {/* Banner */}
          <div className={`h-28 relative ${isAdminView ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'}`}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-60" />
          </div>

          {/* Avatar */}
          <div className="flex justify-center -mt-14 relative z-10">
            {displayUser?.profilePicture ? (
              <img
                src={displayUser.profilePicture}
                alt={displayUser.name}
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <UserIcon size={40} className="text-slate-400" />
              </div>
            )}
          </div>

          {/* Name, Role Badge & Email */}
          <div className="text-center pt-4 pb-6 px-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {displayUser?.name || 'Guest User'}
            </h1>

            <span
              className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${badgeStyle}`}
            >
              <Shield size={12} />
              {displayUser?.role || 'USER'}
            </span>

            <p className="mt-3 text-sm text-slate-500 flex items-center justify-center gap-1.5">
              <Mail size={14} className="text-slate-400" />
              {displayUser?.email || 'N/A'}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 mx-6" />

          {/* Account Information Section */}
          <div className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Account Information
            </h2>

            <div className="space-y-3">
              {/* Auth Provider */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
                  {/* Google "G" SVG */}
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Google OAuth 2.0</p>
                  <p className="text-xs text-slate-500">Authenticated via Google</p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-500">
                  <KeyRound size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">User ID</p>
                  <p className="text-xs text-slate-500 font-mono">{displayUser?.id || '—'}</p>
                </div>
              </div>

              {/* Google ID — only shown in admin view when available */}
              {isAdminView && displayUser?.googleId && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-500">
                    <svg width="16" height="16" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Google ID</p>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-[280px]">{displayUser.googleId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              {isAdminView ? (
                <>This user's profile is managed by their Google account.</>
              ) : (
                <>
                  Profile information is managed by your Google account. To update your name or photo, visit your{' '}
                  <a
                    href="https://myaccount.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-600 font-medium underline underline-offset-2"
                  >
                    Google Account settings
                  </a>.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
