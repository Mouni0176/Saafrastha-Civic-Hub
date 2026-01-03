
import React, { useState } from 'react';
import { User, Report, AppView } from '../App';
import { 
  MapPin, 
  ShieldCheck, 
  LayoutGrid, 
  History, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  Activity,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
  Award,
  Zap
} from 'lucide-react';

interface UserDashboardProps {
  user: User;
  reports: Report[];
  onOpenReport: () => void;
  onNavigate?: (view: AppView) => void;
}

type DashboardTab = 'overview' | 'activity' | 'community';

const UserDashboard: React.FC<UserDashboardProps> = ({ user, reports, onOpenReport, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const myReports = reports.filter(r => r.reporterId === user.id);
  const activeReports = myReports.filter(r => r.status !== 'Resolved');
  const resolvedCount = myReports.filter(r => r.status === 'Resolved').length;

  const renderOverview = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 h-full">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] h-full flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Activity size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Sector Pulse</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time incident monitoring</p>
              </div>
            </div>

            {activeReports.length > 0 ? (
              <div className="space-y-6 flex-grow">
                {activeReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="group p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-2xl transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                            <img src={report.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=100'} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{report.title}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                              <MapPin size={10} className="text-emerald-500" /> {report.location.split(',')[0]}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm ${
                           report.status === 'In Progress' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                         }`}>
                           {report.status}
                         </span>
                         <p className="text-xs font-black text-slate-900 mt-1.5">{report.progress}%</p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{width: `${report.progress}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-16 text-center space-y-6">
                 <div className="w-24 h-24 bg-emerald-50 text-emerald-300 rounded-[2.5rem] flex items-center justify-center shadow-inner animate-pulse">
                    <ShieldCheck size={48} />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Status: Secured</h4>
                    <p className="text-slate-400 text-xs font-bold max-w-[280px] mx-auto mt-2 leading-relaxed uppercase tracking-wider">Gateway data is synchronized. Your sector has no active hazard flags.</p>
                 </div>
              </div>
            )}
            
            <button onClick={() => setActiveTab('activity')} className="mt-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-900/10">
               Access Complete Activity Records <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
           <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group flex-grow border border-white/5">
              <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                <Sparkles size={180} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                       <Zap size={16} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Civic Trust Rating</p>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-8xl font-black tracking-tighter text-emerald-500">{user.points}</span>
                    <span className="text-xs font-black text-slate-600 mb-5 uppercase tracking-widest">PTS</span>
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Vanguard Status</span>
                    <span className="text-emerald-500">Tier: Platinum Catalyst</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" style={{width: '82%'}}></div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center">
                     <Award size={20} className="text-amber-500" />
                     <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                       "Your reports saved <span className="text-white">142h</span> of municipal labor this quarter."
                     </p>
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-10 flex-shrink-0">
              <div className="space-y-2 text-center border-r border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Fixes</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{resolvedCount}</p>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Logs</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{myReports.length}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 animate-in fade-in duration-1000 relative">
      <div className="flex flex-col items-center text-center mb-20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Sector 4 Oversight Terminal</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-none">
          Civic <span className="text-emerald-600">Command</span>
        </h1>
        <div className="p-1 px-5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
          Authorized User Session Active
        </div>
      </div>

      <div className="flex justify-center mb-20">
        <div className="inline-flex items-center bg-white p-2 rounded-[3rem] border border-slate-100 shadow-xl overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'overview', label: 'Operations', icon: <LayoutGrid size={18} /> },
            { id: 'activity', label: 'Telemetry Logs', icon: <History size={18} /> },
            { id: 'community', label: 'Network Hub', icon: <Globe size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center gap-4 px-10 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'overview' && renderOverview()}
        
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {myReports.length === 0 ? (
              <div className="col-span-full py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-inner">
                   <Clock size={40} />
                </div>
                <div>
                   <h4 className="text-2xl font-black text-slate-800 uppercase tracking-widest">No Active Telemetry</h4>
                   <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Use the Hazard tool to initialize your first dispatch.</p>
                </div>
              </div>
            ) : (
              myReports.map(report => (
                <div key={report.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-700">
                  <div className="h-64 relative bg-slate-50 overflow-hidden">
                    {report.imageUrl ? (
                      <img src={report.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-[2000ms]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><MapPin size={64} /></div>
                    )}
                    <div className="absolute top-8 left-8 flex gap-2">
                       <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20 backdrop-blur-md ${
                        report.status === 'Resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                       }`}>
                         {report.status}
                       </div>
                    </div>
                  </div>
                  <div className="p-10 flex-grow flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{report.category}</span>
                       <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID {report.id}</span>
                    </div>
                    <h4 className="font-black text-2xl text-slate-900 leading-tight mb-8 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{report.title}</h4>
                    
                    <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Resolution Grid Status</span>
                         <span className="text-emerald-600">{report.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100">
                         <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{width: `${report.progress}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
             <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                  <Globe size={300} />
                </div>
                <div className="relative z-10 space-y-6 text-center md:text-left flex-grow">
                   <div className="flex items-center gap-3 justify-center md:justify-start">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Network Feed Active</span>
                   </div>
                   <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">Sector 4 Community Hub</h3>
                   <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-2xl uppercase tracking-wider opacity-80">
                      Synchronized visibility into neighborhood health. Access live peer reports and collaborative validation streams.
                   </p>
                </div>
                <div className="relative z-10 flex-shrink-0">
                   <button 
                     onClick={() => onNavigate && onNavigate('public_reports')}
                     className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl"
                   >
                     Access Global Feed
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1,2,3].map(i => (
                  <div key={i} className="h-48 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center p-8 text-center group">
                    <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mb-4 group-hover:text-emerald-200 transition-colors">
                       <Zap size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Stream {i}</p>
                    <div className="mt-4 flex gap-1.5">
                       <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:0s]"></div>
                       <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                       <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 right-10 z-[150] group">
        <div className="absolute bottom-[110%] right-0 mb-6 animate-bounce-subtle pointer-events-none opacity-100 transition-all duration-700 translate-y-0">
          <div className="bg-slate-900 text-white px-7 py-4 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] relative border border-white/10 backdrop-blur-md">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Initialize Dispatch Report</p>
            <div className="absolute top-full right-10 -mt-1 w-4 h-4 bg-slate-900 border-r border-b border-white/10 rotate-45"></div>
          </div>
        </div>

        <div className="absolute -inset-6 bg-emerald-600/20 rounded-full blur-2xl group-hover:bg-emerald-600/30 transition-all duration-700 animate-pulse"></div>
        <button 
          onClick={onOpenReport}
          title="Instant Hazard Dispatch"
          className="relative w-24 h-24 bg-emerald-600 text-white rounded-[2.5rem] flex flex-col items-center justify-center shadow-[0_30px_70px_rgba(16,185,129,0.4)] hover:bg-emerald-700 active:scale-90 transition-all border border-white/20 group-hover:rotate-12 duration-500"
        >
          <AlertTriangle size={40} className="mb-0.5" />
          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Filing</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default UserDashboard;
