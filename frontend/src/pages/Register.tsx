import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { register, verifyOtp } from '../api/authApi';

export const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name, email, password });
      toast.success('Registration successful. Please check your email for the OTP.');
      setStep(2);
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err.response?.data?.error || 'Registration failed.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      console.error('OTP Verification error:', err);
      const message = err.response?.data?.error || 'Invalid OTP. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
        <div className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8 sm:p-10 animate-fade-in-up animation-delay-2000">
          
          {step === 1 ? (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Create an account</h3>
                <p className="text-slate-500 mt-1.5 text-sm">Sign up in seconds to access campus operations.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
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
                      placeholder="john@example.com"
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
                  {loading ? 'Setting up...' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm font-medium text-slate-600">
                 Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors">Sign in here</Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-8 text-center pt-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 shadow-inner ring-4 ring-blue-50 transition-all">
                  <Mail className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Verify email</h3>
                <p className="text-slate-500 mt-2.5 text-sm leading-relaxed px-2">
                  We've sent a 6-digit verification code to <br/><span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md inline-block mt-1.5 shadow-sm">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 text-center mb-3 text-slate-400 uppercase tracking-widest text-[11px]">Enter Verification Code</label>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-64 text-center text-3xl font-bold tracking-[0.4em] px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-inner"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-70 shadow-xl shadow-blue-500/20"
                  >
                    {loading ? 'Verifying...' : 'Complete Registration'}
                  </button>
                </div>
                
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5"
                  >
                     <span aria-hidden="true" className="text-lg leading-none">&larr;</span> Change email address
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer badges */}
        <div className="flex gap-4 mt-8 animate-fade-in-up">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 py-1.5 px-3 rounded-full text-white/90 text-xs font-semibold shadow-xl">
              <ShieldCheck size={14} className="text-emerald-400" />
              Verifiable Identities
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 py-1.5 px-3 rounded-full text-white/90 text-xs font-semibold shadow-xl">
              <Sparkles size={14} className="text-blue-400" />
              Easy Onboarding
            </div>
        </div>

      </div>
    </div>
  );
};
