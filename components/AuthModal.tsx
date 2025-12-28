
import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, ShieldCheck, Loader2, User as UserIcon, Building2, AlertCircle, ArrowLeft, Heart, Sparkles, Check, KeyRound, Timer, CheckCircle2, Info } from 'lucide-react';
import { User, UserRole } from '../App';
import { dbService } from '../services/database';

interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'signup_verify' | 'forgot_request' | 'forgot_verify' | 'forgot_reset' | 'signup_success' | 'reset_success';

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('citizen');
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    newPassword: '',
    department: 'Municipal Works'
  });
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);
  const [signedUpUser, setSignedUpUser] = useState<User | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Timer logic for OTP
  useEffect(() => {
    let interval: number | undefined;
    if (mode === 'signup_verify' && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timeLeft]);

  // Reset timer when entering verification or resending
  useEffect(() => {
    if (mode === 'signup_verify') {
      setTimeLeft(300);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Email Regex for stricter validation
  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  useEffect(() => {
    if (mode === 'signup' && !isNameManuallyEdited && formData.email.trim() !== '') {
      const emailPart = formData.email.split('@')[0];
      if (emailPart) {
        const formattedName = emailPart
          .split(/[._-]/)
          .filter(Boolean)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        setFormData(prev => ({ ...prev, name: formattedName }));
      }
    }
  }, [formData.email, mode, isNameManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const existingUser = await dbService.getUserByEmail(formData.email);
        if (!existingUser || existingUser.password !== formData.password) {
          setError("Invalid email or password.");
          setIsLoading(false);
          return;
        }
        onLogin({
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          points: 0,
          reportsCount: 0,
          department: existingUser.department
        });
      } else if (mode === 'signup') {
        if (!isValidEmail(formData.email)) {
          setError("Please enter a valid official email address.");
          setIsLoading(false);
          return;
        }

        const existingUser = await dbService.getUserByEmail(formData.email);
        if (existingUser) {
          setError("This email is already registered in our civic database.");
          setIsLoading(false);
          return;
        }
        
        setMode('signup_verify');
        setIsLoading(false);
      } else if (mode === 'signup_verify') {
        // Mock verification logic
        if (otp === '123456') {
          const finalName = formData.name.trim() || (formData.email.split('@')[0]) || (role === 'citizen' ? 'Citizen' : 'Officer');
          const newUserId = `u-${Math.random().toString(36).substr(2, 9)}`;
          const newUser = {
            id: newUserId,
            email: formData.email.toLowerCase(),
            password: formData.password,
            name: finalName,
            role: role,
            department: role === 'authority' ? formData.department : undefined
          };
          
          await dbService.saveUser(newUser);
          const userObj: User = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            points: 0,
            reportsCount: 0,
            department: newUser.department
          };
          
          setSignedUpUser(userObj);
          setMode('signup_success');
        } else {
          setError("Invalid verification code. Please check the code sent to your email.");
        }
        setIsLoading(false);
      } else if (mode === 'forgot_request') {
        const existingUser = await dbService.getUserByEmail(formData.email);
        if (!existingUser) {
          setError("Email not found in our records.");
          setIsLoading(false);
          return;
        }
        setMode('forgot_verify');
      } else if (mode === 'forgot_verify') {
        if (otp === '123456') {
          setMode('forgot_reset');
        } else {
          setError("Invalid verification code. Try '123456'.");
        }
      } else if (mode === 'forgot_reset') {
        const existingUser = await dbService.getUserByEmail(formData.email);
        if (existingUser) {
          existingUser.password = formData.newPassword;
          await dbService.saveUser(existingUser);
          setMode('reset_success');
        }
      }
    } catch (err) {
      setError("An unexpected system error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = () => {
    setTimeLeft(300);
    setOtp('');
    setError(null);
    // Visual feedback for resending
    alert("Simulation: Verification email re-sent to " + formData.email);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {(mode !== 'login' && mode !== 'signup_success' && mode !== 'reset_success') && (
                <button onClick={() => setMode(mode === 'signup_verify' ? 'signup' : 'login')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 mr-1">
                  <ArrowLeft size={18} />
                </button>
              )}
              <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                <ShieldCheck size={20} />
              </div>
              <span className="text-lg font-bold text-slate-800">SaafRasta Portal</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {mode === 'signup_verify' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Verify Your Identity</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    We've sent a 6-digit verification code to <span className="text-indigo-600 font-bold">{formData.email}</span>. Please enter it below to activate your account.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                  <AlertCircle className="flex-shrink-0" size={20} />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                    <span>Verification Code</span>
                    <span className={`${timeLeft < 60 ? 'text-red-500' : 'text-indigo-600'} flex items-center gap-1 font-black`}>
                      <Timer size={10} /> {formatTime(timeLeft)}
                    </span>
                  </label>
                  <div className="relative">
                    <input 
                      ref={otpInputRef}
                      type="text" 
                      maxLength={6}
                      autoFocus
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-12 font-black text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all" 
                      placeholder="000000" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                    />
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  </div>
                  
                  {/* Prototype Debug Info */}
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3">
                    <Info size={14} className="text-amber-600 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-800 leading-tight">
                      <span className="uppercase font-black">Prototype Note:</span> Since actual emails are disabled in this browser preview, please use code <span className="underline font-black">123456</span> to proceed.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={otp.length < 6 || isLoading || timeLeft === 0}
                  className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm & Join Network'}
                </button>

                <div className="text-center">
                   <button 
                     type="button"
                     onClick={resendCode}
                     className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                   >
                      Resend Verification Email
                   </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'signup_success' && (
            <div className="text-center space-y-8 py-8 animate-in fade-in zoom-in">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Heart size={48} fill="currentColor" className="animate-pulse" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-bounce" size={28} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Identity Verified!</h3>
                <p className="text-slate-600 font-medium leading-relaxed px-2">
                  Welcome to SaafRasta, {signedUpUser?.name.split(' ')[0]}. Your email has been authenticated and you are now part of our civic mission.
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => signedUpUser && onLogin(signedUpUser)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[2rem] font-bold text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  Enter Your Dashboard
                </button>
              </div>

              <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-3 text-left">
                <div className="bg-emerald-500 text-white p-1 rounded-full flex-shrink-0">
                  <Check size={14} />
                </div>
                <p className="text-xs font-bold text-emerald-800 leading-normal uppercase tracking-wider">
                  Registration Verified & Active
                </p>
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode.startsWith('forgot')) && mode !== 'signup_success' && mode !== 'signup_verify' && (
            <>
              <div className="mb-8">
                <h3 className="text-3xl font-black text-slate-900 mb-2">
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'signup' && 'Join SaafRasta'}
                  {mode.startsWith('forgot') && 'Account Recovery'}
                </h3>
                <p className="text-slate-500 font-medium text-sm">
                  {mode === 'login' && 'Secure login to your civic dashboard.'}
                  {mode === 'signup' && 'Start your journey toward a cleaner city today.'}
                  {mode.startsWith('forgot') && 'Enter your email to reset your portal access.'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                  <AlertCircle className="flex-shrink-0" size={20} />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button type="button" onClick={() => setRole('citizen')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === 'citizen' ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                    <UserIcon className={role === 'citizen' ? 'text-emerald-600' : 'text-slate-400'} size={24} />
                    <span className={`text-xs font-bold ${role === 'citizen' ? 'text-emerald-700' : 'text-slate-500'}`}>Citizen</span>
                  </button>
                  <button type="button" onClick={() => setRole('authority')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === 'authority' ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                    <Building2 className={role === 'authority' ? 'text-blue-600' : 'text-slate-400'} size={24} />
                    <span className={`text-xs font-bold ${role === 'authority' ? 'text-blue-700' : 'text-slate-500'}`}>Authority</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-11 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      placeholder="name@example.com" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-11 font-bold" 
                        placeholder="Rahul Sharma" 
                        value={formData.name} 
                        onChange={(e) => {
                          setFormData({...formData, name: e.target.value});
                          setIsNameManuallyEdited(true);
                        }} 
                      />
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    </div>
                  </div>
                )}

                {(mode === 'login' || mode === 'signup') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-11 font-bold" 
                        placeholder="••••••••" 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setMode('forgot_request')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl mt-4 disabled:opacity-70 active:scale-95 ${
                    mode === 'signup' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                  }`}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    mode === 'signup' ? 'Create My Account' : 'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-emerald-600 font-black hover:underline text-[10px] uppercase tracking-widest">
                  {mode === 'login' ? "New to SaafRasta? Sign up" : "Already have an account? Log in"}
                </button>
              </div>
            </>
          )}

          {(mode === 'forgot_request' || mode === 'forgot_verify' || mode === 'forgot_reset' || mode === 'reset_success') && (
            <div className="animate-in fade-in slide-in-from-right-4">
              {mode === 'forgot_request' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl text-slate-400">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Reset Link</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                        We will send a recovery code to your registered email to help you reclaim your account.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Email</label>
                        <input 
                           type="email" 
                           required 
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                           placeholder="you@example.com"
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                     </div>
                     <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">
                        Send Recovery Code
                     </button>
                  </form>
                </div>
              )}
              
              {mode === 'forgot_verify' && (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={28} />
                  </div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">Check Your Inbox</h4>
                  <p className="text-xs text-slate-500 font-medium">Enter the 6-digit code sent to your email.</p>
                  <input 
                    type="text" 
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-black text-center text-2xl tracking-[0.5em]" 
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button onClick={handleSubmit} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">
                    Verify Code
                  </button>
                </div>
              )}

              {mode === 'forgot_reset' && (
                <div className="space-y-6">
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">New Password</h4>
                  <p className="text-xs text-slate-500 font-medium">Choose a strong, unique password for your dashboard.</p>
                  <input 
                    type="password" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-bold" 
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  />
                  <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl">
                    Update Password
                  </button>
                </div>
              )}

              {mode === 'reset_success' && (
                <div className="text-center space-y-8 py-8 animate-in zoom-in">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Password Secured!</h3>
                  <button 
                    onClick={() => setMode('login')}
                    className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest"
                  >
                    Proceed to Login
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
