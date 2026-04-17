import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
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
      className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-0"></div>

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
          Create Account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          
          {step === 1 ? (
            <>
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-slate-800">Student Sign Up</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your details to create an account.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Sign Up'}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-slate-500">Already have an account?</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Sign in here <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center animate-fade-in-up">
                <h3 className="text-xl font-bold text-slate-800">Email Verification</h3>
                <p className="text-sm text-slate-500 mt-1">
                  We've sent a 6-digit verification code to <span className="font-semibold text-slate-700">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-medium text-slate-700 text-center">Enter OTP Code</label>
                  <div className="mt-2 flex justify-center">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="appearance-none block w-48 text-center text-2xl tracking-[0.5em] px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                     &larr; Back to Registration
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
