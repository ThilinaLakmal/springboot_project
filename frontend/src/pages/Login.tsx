import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User } from '../contexts/AuthContext';
import { Building2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { googleLogin } from '../api/authApi';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google authentication failed. No credential received.');
      return;
    }

    setLoading(true);
    try {
      const response = await googleLogin(credentialResponse.credential);
      const data = response.data;

      if (!data.token) {
        toast.error('Authentication failed. Please try again.');
        return;
      }

      const userData: User = {
        id: data.userId.toString(),
        name: data.name,
        email: data.email,
        role: data.role as 'ADMIN' | 'USER' | 'STUDENT',
        profilePicture: data.profilePicture,
      };

      login(userData, data.token);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate('/app/facilities/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.error || 'Authentication failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In was cancelled or failed. Please try again.');
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"></div>

      {/* Logo & Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <Building2 size={36} />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
          SmartUniNexus
        </h2>
        <p className="mt-2 text-center text-sm text-blue-200 uppercase tracking-widest font-semibold font-mono">
          Operations Hub
        </p>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-slate-800">Welcome to Smart Campus</h3>
            <p className="text-sm text-slate-500 mt-1">
              Sign in with your university Google account to continue.
            </p>
          </div>

          {/* Google Sign-In Section */}
          <div className="space-y-6">
            {/* Google Sign-In Button */}
            <div className="flex justify-center">
              {loading ? (
                <div className="flex items-center gap-3 py-3 px-6 bg-slate-50 rounded-xl border border-slate-200">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm font-semibold text-slate-600">Authenticating...</span>
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  width="350"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium uppercase tracking-wider">
                  Secure OAuth 2.0
                </span>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                <ShieldCheck size={18} className="text-blue-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">Secure Login</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Google OAuth 2.0 protected</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
                <Sparkles size={18} className="text-emerald-600 mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">Auto Setup</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Account created instantly</p>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ArrowRight size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">First time?</span> Your account will be created
                  automatically with student access when you sign in with Google.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
