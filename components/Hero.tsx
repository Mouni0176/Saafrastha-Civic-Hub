
import React from 'react';
import { ArrowRight, MapPin, Camera, CheckCircle, Sparkles, Activity, ShieldCheck, Globe, Zap } from 'lucide-react';
import { User, AppView } from '../App';

interface HeroProps {
  user: User | null;
  onOpenReport: () => void;
  onOpenAuth: () => void;
  onNavigate: (view: AppView) => void;
}

const Hero: React.FC<HeroProps> = ({ user, onOpenReport, onOpenAuth, onNavigate }) => {
  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-32 overflow-hidden bg-white">
      {/* Professional Background Mesh & Grids */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        
        {/* Subtle Grid Lines */}
        <svg className="absolute inset-0 h-full w-full stroke-slate-200/50 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse" x="50%" y="-1">
              <path d="M.5 40V.5H40" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Live Civic Pulse Ticker */}
      <div className="w-full bg-slate-900 py-3 mb-16 overflow-hidden border-y border-slate-800 shadow-2xl relative">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] cursor-default">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-50 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Sector 4 Status: <span className="text-emerald-400">98% Resolved</span></span>
              </div>
              <div className="flex items-center gap-3">
                <Activity size={14} className="text-blue-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Reports: <span className="text-white">1,242 Today</span></span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={14} className="text-amber-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Partners: <span className="text-white">42 Municipalities</span></span>
              </div>
              <div className="flex items-center gap-3">
                <Zap size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resolution Velocity: <span className="text-white">4.2h Avg</span></span>
              </div>
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
        `}} />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left space-y-10">
            {/* Minimal Impact Statement */}
            <div className="inline-flex items-center gap-3 p-1 pr-4 rounded-full bg-white border border-slate-200 shadow-xl shadow-slate-200/20 group cursor-default">
              <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg group-hover:rotate-12 transition-transform">
                <Globe size={16} />
              </div>
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Civic Innovation Hub</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
                {user ? (
                  <>Impact <br /><span className="text-emerald-600">Your Hub.</span></>
                ) : (
                  <>Better Cities. <br /><span className="text-emerald-600">Pure Action.</span></>
                )}
              </h1>

              <p className="text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                {user 
                  ? `Active session: ${user.name.split(' ')[0]}. Status: Vanguard.`
                  : 'Report. Track. Resolve. The direct link from citizen to officer.'
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              {user ? (
                <button 
                  onClick={onOpenReport}
                  className="group w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95"
                >
                  New Report
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </button>
              ) : (
                <>
                  <button 
                    onClick={onOpenAuth}
                    className="group w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95"
                  >
                    Join Hub
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </button>
                  <button 
                    onClick={() => onNavigate('features')}
                    className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-slate-50 active:scale-95 shadow-lg"
                  >
                    Explore
                  </button>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-6 border-t border-slate-100">
              {[
                { icon: <Camera size={18} />, text: 'Visual' },
                { icon: <MapPin size={18} />, text: 'GPS' },
                { icon: <CheckCircle size={18} />, text: 'Verified' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  <span className="text-emerald-500">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl mx-auto relative group">
             {/* Decorative Elements */}
             <div className="absolute -inset-4 bg-emerald-500/20 rounded-[3rem] blur-2xl group-hover:bg-emerald-500/30 transition-all -z-10"></div>
             
             <div className="relative z-10 rounded-[2.8rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[12px] border-white bg-slate-100 aspect-[4/3]">
                <img 
                  src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1200" 
                  alt="Modern Clean City Visualization" 
                  className="w-full h-full object-cover transition-opacity duration-700 group-hover:scale-105"
                  onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                  style={{ opacity: 0 }}
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
