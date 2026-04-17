import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, User } from '../contexts/AuthContext';
import { Building2, ArrowRight, ShieldCheck, Sparkles, Mail, Lock } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { googleLogin, login as manualLogin } from '../api/authApi';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await manualLogin({ email, password });
      const data = response.data;
      
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
      console.error('Manual login error:', err);
      const message = err.response?.data?.error || 'Authentication failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900 font-sans bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm z-0"></div>

      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center animate-fade-in-up mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/40 mb-5">
            <Building2 size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            SmartUniNexus
          </h2>
          <p className="mt-2 text-sm text-blue-200 uppercase tracking-widest font-semibold font-mono drop-shadow-sm">
            Operations Hub
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8 sm:p-10 animate-fade-in-up">
          
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome</h3>
            <p className="text-slate-500 mt-1.5 text-sm">Sign in to your account to continue.</p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleManualLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center text-sm font-medium text-slate-600">
               Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-700 transition-colors">Sign up here</Link>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-slate-400 font-semibold uppercase tracking-wider bg-white/95">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center w-full pb-2">
              {loading ? (
                <div className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                  <div className="animate-spin h-5 w-5 border-2 border-slate-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm font-semibold text-slate-700">Connecting...</span>
                </div>
              ) : (
                <div className="hover:scale-[1.02] transition-transform duration-200 ease-out cursor-pointer flex justify-center w-full">
                  <div className="rounded-xl overflow-hidden flex justify-center shadow-sm ring-1 ring-slate-200">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      width="350"
                      text="signin_with"
                      logo_alignment="center"
                      shape="rectangular"
                    />
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex gap-4 mt-8 animate-fade-in-up">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 py-1.5 px-3 rounded-full text-white/90 text-xs font-semibold shadow-xl">
              <ShieldCheck size={14} className="text-emerald-400" />
              Secure Login
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 py-1.5 px-3 rounded-full text-white/90 text-xs font-semibold shadow-xl">
              <Sparkles size={14} className="text-blue-400" />
              Fast Setup
            </div>
        </div>

      </div>
    </div>
  );
};
