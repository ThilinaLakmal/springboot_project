import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Mail, Shield, KeyRound, ArrowLeft, Loader2, AlertCircle, Sparkles, Building, Briefcase } from 'lucide-react';
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
      setProfileData(null);
      setError(null);
      return;
    }

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
          googleId: null,
        }
      : null;

  const roleStyles: Record<string, { gradient: string, badge: string, icon: any }> = {
    ADMIN: {
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]',
      icon: Shield
    },
    STUDENT: {
      gradient: 'from-blue-400 via-indigo-500 to-purple-500',
      badge: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]',
      icon: Briefcase
    },
    USER: {
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      badge: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
      icon: Building
    },
  };

  const currentStyle = roleStyles[displayUser?.role || 'USER'] || roleStyles.USER;
  const RoleIcon = currentStyle.icon;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center relative w-full flex-1">
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
             <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/30 animate-pulse"></div>
             <Loader2 size={48} className="animate-spin text-blue-600 relative z-10" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">Loading Profile</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 w-full flex-1">
        <div className="w-full max-w-md text-center bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-red-100 p-10 animate-fade-in-up">
          <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100/50">
            <AlertCircle size={36} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Access Denied</h2>
          <p className="text-base text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center pb-20 pt-6 px-4 sm:px-6 relative flex-1 animate-fade-in-up">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100 to-transparent pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Navigation & Admin Warning Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
           <button
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors group bg-white/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200/50 shadow-sm"
           >
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             Back
           </button>

           {isAdminView && (
             <div className="px-4 py-2 rounded-xl bg-amber-50/80 backdrop-blur-md border border-amber-200/50 flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.1)] animate-pulse-slow">
               <Shield size={14} className="text-amber-600" />
               <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                 Admin Active Session
               </p>
             </div>
           )}
        </div>

        {/* Master Profile Container */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white overflow-hidden relative ring-1 ring-slate-100">
          
          {/* Stunning Animated Header Banner */}
          <div className={`h-48 md:h-64 relative bg-gradient-to-br ${currentStyle.gradient} overflow-hidden`}>
             {/* Particles/Mesh effect overlay */}
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-70" />
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 mix-blend-overlay"></div>
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 blur-3xl rounded-full translate-y-1/3 -translate-x-1/3 mix-blend-overlay"></div>
          </div>

          <div className="px-6 sm:px-12 pb-12 relative">
             {/* Floating Avatar Area */}
             <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-24 relative z-10 mb-10 w-full">
                <div className="relative group mx-auto sm:mx-0">
                  <div className="absolute inset-0 bg-white rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  {displayUser?.profilePicture ? (
                    <img
                      src={displayUser.profilePicture}
                      alt={displayUser.name}
                      className="w-40 h-40 sm:w-48 sm:h-48 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-full border-[6px] border-white/90 shadow-2xl object-cover relative z-10 bg-white hover:-translate-y-1 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-full border-[6px] border-white/90 shadow-2xl bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center relative z-10 hover:-translate-y-1 transition-transform duration-300">
                      <UserIcon size={72} className="text-slate-300" />
                    </div>
                  )}
                  {/* Floating Identity Badge integrated to Avatar */}
                  <div className={`absolute -bottom-3 sm:bottom-0 -right-2 sm:right-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 z-20 border-2 border-white ${currentStyle.badge}`}>
                     <RoleIcon size={12} className="stroke-[3]" />
                     {displayUser?.role || 'USER'}
                  </div>
                </div>

                {/* Primary Identifiers */}
                <div className="flex-1 text-center sm:text-left mb-2.5">
                   <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-2">
                     {displayUser?.name || 'Guest User'}
                   </h1>
                   <p className="text-base sm:text-lg text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-2">
                     <Mail size={18} className="text-slate-400" />
                     {displayUser?.email || 'N/A'}
                   </p>
                </div>
             </div>

             {/* Bento Box Grid for Account Information */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* Auth Provider Tile */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Authentication</p>
                        <p className="text-lg font-bold text-slate-800">Google OAuth 2.0</p>
                     </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between opacity-80">
                    <span className="text-xs font-semibold text-slate-500">Security Level</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <Sparkles size={12}/> Verified
                    </span>
                  </div>
                </div>

                {/* System IDs Tile */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500">
                        <KeyRound size={28} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Primary Identifiers</p>
                        <p className="text-lg font-bold text-slate-800">System Trace</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3 mt-auto">
                     <div className="flex flex-col bg-slate-50/80 p-3 rounded-2xl border border-slate-100/50">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Database ID</span>
                       <span className="text-sm font-bold text-slate-700 font-mono tracking-wider ml-1">{displayUser?.id || '—'}</span>
                     </div>

                     {isAdminView && displayUser?.googleId && (
                       <div className="flex flex-col bg-red-50/50 p-3 rounded-2xl border border-red-100/80">
                         <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1 ml-1">Secure Google ID</span>
                         <span className="text-sm font-bold text-red-700 font-mono tracking-wider ml-1 truncate" title={displayUser.googleId}>{displayUser.googleId}</span>
                       </div>
                     )}
                  </div>
                </div>

             </div>

          </div>

          {/* Elegant Footer Notice */}
          <div className="bg-slate-50/90 backdrop-blur-md border-t border-slate-100 px-8 py-5">
            <p className="text-xs text-slate-500 font-medium text-center leading-relaxed">
              {isAdminView ? (
                <>Identity data is secured and managed by upstream Google authorities.</>
              ) : (
                <>
                  Your profile details are synced and managed by Google. To update your name or photo, securely visit your{' '}
                  <a
                    href="https://myaccount.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-bold underline underline-offset-4 decoration-blue-200 transition-colors"
                  >
                    Google Account Interface
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
