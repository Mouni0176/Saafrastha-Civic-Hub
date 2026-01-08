
import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, User as UserIcon, AlertCircle, ShieldCheck, ChevronRight, ChevronLeft, Heart, Users, Eye } from 'lucide-react';
import { User, UserRole } from '../App';
import { dbService } from '../services/database';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        });

        if (authError) throw authError;

        if (data.user) {
          const profile = await dbService.getUserProfile(data.user.id);
          if (profile) {
            onLogin(profile);
          } else {
            const fullName = name || data.user.email!.split('@')[0];
            await dbService.syncProfile(data.user.id, data.user.email!, fullName, role);
            const newProfile = await dbService.getUserProfile(data.user.id);
            if (newProfile) onLogin(newProfile);
          }
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password: password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          await dbService.syncProfile(data.user.id, email, name, role);
          const profile = await dbService.getUserProfile(data.user.id);
          if (profile) onLogin(profile);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during authentication.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-8">
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl" onClick={onClose} />
      
      {/* Rectangular Dashboard Card */}
      <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in slide-in-from-bottom-8 duration-500 border border-white/20">
        
        {/* Navigation Control Bar */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-slate-50 bg-slate-50/50">
          <button 
            onClick={onClose}
            className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
               <ChevronLeft size={16} />
            </div>
            Back
          </button>
          
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <ShieldCheck size={16} />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900">
              Saaf<span className="text-emerald-600">Rasta</span>
            </span>
          </div>

          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-10 lg:p-14">
          <div className="grid md:grid-cols-5 gap-12">
            
            {/* Minimal Mission Section (2/5) */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                {isLogin ? "Welcome Back." : "Join Us."}
              </h2>
              <div className="space-y-4">
                {[
                  { icon: <Eye size={14} />, label: "Report" },
                  { icon: <Heart size={14} />, label: "Track" },
                  { icon: <Users size={14} />, label: "Resolve" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-600">
                    <span className="text-emerald-500">{item.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pt-4 border-t border-slate-50">
                Transparency in every street.
              </p>
            </div>

            {/* Form Section (3/5) */}
            <div className="md:col-span-3 space-y-8">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-red-100 animate-shake">
                  <AlertCircle size={18} className="shrink-0" /> {error}
                </div>
              )}

              {/* Role Tabs */}
              <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setRole('citizen')}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${role === 'citizen' ? 'bg-white text-slate-900 shadow-xl border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Citizen
                </button>
                <button 
                  onClick={() => setRole('authority')}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${role === 'authority' ? 'bg-white text-slate-900 shadow-xl border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Officer
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative group">
                    <input 
                      type="text" required placeholder="FULL NAME" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-12 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase"
                      value={name} onChange={(e) => setName(e.target.value)}
                    />
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  </div>
                )}

                <div className="relative group">
                  <input 
                    type="email" required placeholder="EMAIL" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-12 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                </div>

                <div className="relative group">
                  <input 
                    type="password" required placeholder="PASSWORD" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-12 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                </div>

                <button 
                  type="submit" disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                    role === 'authority' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'
                  } text-white shadow-slate-200`}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      {isLogin ? 'Enter' : 'Register'}
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                  }}
                  className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] hover:text-emerald-600 transition-colors underline underline-offset-8"
                >
                  {isLogin ? "Need an account?" : "Already member?"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}} />
    </div>
  );
};

export default AuthModal;
