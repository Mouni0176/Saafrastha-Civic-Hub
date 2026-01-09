import React from 'react';
import { ArrowRight, Activity, Zap, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';
import { User, AppView } from '../App';

interface HeroProps {
  user: User | null;
  onOpenReport: () => void;
  onOpenAuth: () => void;
  onNavigate: (view: AppView) => void;
}

const tickerItems = [
  { label: "Sector 4 Active", val: "Online", icon: <Activity size={12} /> },
  { label: "SLA Success Rate", val: "94.2%", icon: <Zap size={12} /> },
  { label: "Node Registry", val: "Verified", icon: <ShieldCheck size={12} /> },
  { label: "Geodata Clusters", val: "1,240+", icon: <Globe size={12} /> },
  { label: "Sanitation Reports", val: "Resolved", icon: <CheckCircle2 size={12} /> },
  { label: "Hazard Response", val: "Optimized", icon: <Activity size={12} /> },
  { label: "Citizen Trust", val: "Peak", icon: <Zap size={12} /> },
];

const Hero: React.FC<HeroProps> = ({ user, onOpenReport, onOpenAuth, onNavigate }) => {
  return (
    <section className="relative pt-0 pb-0 overflow-hidden bg-slate-50 mesh-bg flex flex-col">
      {/* Infinite Horizontal Scroll Ticker - NOW ABOVE HERO */}
      <div className="w-full bg-slate-900 py-5 relative overflow-hidden flex-shrink-0 border-b border-white/5 z-20">
        <div className="flex whitespace-nowrap animate-infinite-scroll">
          {/* Quadruple the items to ensure a seamless long-range loop on all screens */}
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
            <div 
              key={idx} 
              className="inline-flex items-center gap-4 px-12 border-r border-white/5 group transition-colors hover:bg-white/5"
            >
              <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-emerald-400 group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">
                  {item.label}
                </span>
                <span className="text-[11px] font-black text-white uppercase mt-1 tracking-tight">
                  {item.val}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Subtle decorative "Live" badge overlay */}
        <div className="absolute top-0 left-0 h-full w-40 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-full w-40 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
        
        <div className="absolute top-1/2 left-8 -translate-y-1/2 z-20 hidden sm:flex items-center gap-3 bg-emerald-500/20 px-4 py-2 rounded-xl backdrop-blur-md border border-emerald-500/20">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Network Pulse</span>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 flex-grow pt-24 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-12">
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
                {user ? (
                  <>Advanced <br /><span className="text-emerald-600">Civic Hub.</span></>
                ) : (
                  <>Better Cities, <br /><span className="text-emerald-600">Pure Actions.</span></>
                )}
              </h1>
              <p className="text-xl lg:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                Bridging the gap between citizen observation and institutional action through real-time geospatial intelligence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              {user ? (
                <>
                  <button 
                    onClick={onOpenReport}
                    className="group bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
                  >
                    Initialize Report
                    <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />
                  </button>
                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className="px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    View My Hub
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={onOpenAuth}
                    className="group bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95"
                  >
                    Join the Infrastructure
                    <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={20} />
                  </button>
                  <button 
                    onClick={() => onNavigate('public_reports')}
                    className="px-10 py-6 bg-slate-100 text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-lg active:scale-95"
                  >
                    View Network
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-12 pt-12 border-t border-slate-200">
               {[
                 { label: "Resolved", value: "94%", color: "text-emerald-500" },
                 { label: "Active Nodes", value: "1,240+", color: "text-indigo-500" },
                 { label: "Response", value: "< 4.2h", color: "text-slate-900" }
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col">
                    <span className={`text-2xl font-black ${stat.color} leading-none`}>{stat.value}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex-1 w-full relative">
             <div className="absolute -inset-10 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
             <div className="relative group">
               <div className="absolute -top-8 -left-8 w-32 h-32 bg-indigo-600/10 rounded-[3rem] blur-2xl"></div>
               <div className="relative rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[16px] border-white bg-slate-100 rotate-2 group-hover:rotate-0 transition-transform duration-700">
                  <img 
                    src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1400" 
                    alt="Sustainable City Infrastructure" 
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
               </div>
               
               <div className="absolute bottom-10 -left-10 bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/50 max-w-[280px] animate-in slide-in-from-left-8 duration-1000 delay-500">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Activity size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Feed</p>
                        <p className="text-xs font-black text-slate-900 uppercase">Sector 4 Clean</p>
                     </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full w-4/5 bg-emerald-500 rounded-full"></div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;