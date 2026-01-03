
import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, User as UserIcon, Building2, AlertCircle, ShieldCheck, Sparkles, LogIn, ChevronRight } from 'lucide-react';
import { User, UserRole } from '../App';
import { dbService } from '../services/database';

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
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const userData = await dbService.getUserByEmail(email);
        if (!userData || userData.password !== password) {
          setError("Invalid credentials. Please verify your data.");
          setIsLoading(false);
          return;
        }
        onLogin({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          points: userData.points || 0,
          reportsCount: 0,
          department: userData.department
        });
      } else {
        const existing = await dbService.getUserByEmail(email);
        if (existing) {
          setError("This account already exists.");
          setIsLoading(false);
          return;
        }

        const newUser = {
          id: `u-${Math.random().toString(36).substr(2, 9)}`,
          email: email.toLowerCase(),
          password: password,
          name: name || email.split('@')[0],
          role: role,
          points: 0
        };
        
        await dbService.saveUser(newUser);
        onLogin({
          ...newUser,
          reportsCount: 0
        } as User);
      }
    } catch (err: any) {
      setError("Synchronous connection failure. Database fix required.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in duration-500 border border-white/20">
        {/* Professional Side Branding */}
        <div className="lg:w-2/5 bg-slate-900 p-12 text-white relative flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-emerald-500 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-blue-500 rounded-full blur-[80px]"></div>
          </div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-10">
                <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-600/20">
                   <ShieldCheck size={28} />
                </div>
                <span className="text-2xl font-black tracking-tighter">Saaf<span className="text-emerald-500">Rasta</span></span>
             </div>
             
             <div className="space-y-6">
                <h3 className="text-4xl font-black leading-tight tracking-tight">The Next Level of Civic <span className="text-emerald-500 italic">Accountability</span>.</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                   Join India's most advanced civic-tech ecosystem. Direct access to municipal dispatch systems and community-led resolutions.
                </p>
             </div>
          </div>

          <div className="relative z-10 pt-12">
             <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Gateway Status</span>
                </div>
                <p className="text-xs font-bold text-slate-400">98.4% Resolution Rate in Sector 4 Hub</p>
             </div>
          </div>
        </div>

        {/* Main Form Panel */}
        <div className="lg:w-3/5 p-12 bg-white relative">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
          
          <div className="max-w-md mx-auto">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {isLogin ? 'Welcome Back Officer' : 'Create Civic Identity'}
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Access the Unified Command Gateway</p>
            </div>

            {error && (
              <div className="p-5 bg-red-50 text-red-600 rounded-[2rem] mb-8 flex items-center gap-4 text-xs font-black uppercase tracking-widest border border-red-100">
                <AlertCircle size={20} className="shrink-0" /> {error}
              </div>
            )}

            {!isLogin && (
              <div className="flex p-1.5 bg-slate-50 rounded-[1.8rem] border border-slate-100 mb-8">
                <button 
                  onClick={() => setRole('citizen')}
                  className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${role === 'citizen' ? 'bg-white text-slate-900 shadow-xl border border-slate-100 scale-105 z-10' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Citizen HUB
                </button>
                <button 
                  onClick={() => setRole('authority')}
                  className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${role === 'authority' ? 'bg-white text-slate-900 shadow-xl border border-slate-100 scale-105 z-10' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Official PORTAL
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verified Full Name</label>
                  <div className="relative group">
                    <input 
                      type="text" required placeholder="RAHUL SHARMA" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-14 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase"
                      value={name} onChange={(e) => setName(e.target.value)}
                    />
                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email Gateway</label>
                <div className="relative group">
                  <input 
                    type="email" required placeholder="OFFICER@SAAFRASTA.GOV" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-14 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Encrypted Password</label>
                  {isLogin && <button type="button" className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Recovery</button>}
                </div>
                <div className="relative group">
                  <input 
                    type="password" required placeholder="••••••••" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-14 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                </div>
              </div>

              <button 
                type="submit" disabled={isLoading}
                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                  role === 'authority' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                } text-white shadow-emerald-500/20`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    {isLogin ? 'Initialize Session' : 'Register Identity'}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
              >
                {isLogin ? "New to the hub? Create Access" : "Already registered? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
