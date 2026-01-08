
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
  Award,
  Zap
} from 'lucide-react';

interface UserDashboardProps {
  user: User;
  reports: Report[];
  onOpenReport: () => void;
  onNavigate?: (view: AppView) => void;
}

type DashboardTab = 'overview' | 'community';

const UserDashboard: React.FC<UserDashboardProps> = ({ user, reports, onOpenReport, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const myReports = reports.filter(r => r.reporterId === user.id);
  const resolvedCount = myReports.filter(r => r.status === 'Resolved').length;

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Reports History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">My Reports History</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking your contributions</p>
                </div>
              </div>
            </div>

            {myReports.length > 0 ? (
              <div className="space-y-4">
                {myReports.map((report) => (
                  <div key={report.id} className="p-6 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                            {report.imageUrl ? (
                                <img src={report.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={report.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200"><MapPin size={24} /></div>
                            )}
                         </div>
                         <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight truncate">{report.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <MapPin size={10} className="text-emerald-500" /> {report.location.split(',')[0]}
                                </p>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">#{report.id}</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                         <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest text-white ${
                           report.status === 'Resolved' ? 'bg-emerald-500' :
                           report.status === 'In Progress' ? 'bg-indigo-600' : 'bg-amber-500'
                         }`}>
                           {report.status}
                         </span>
                         <p className="text-xs font-black text-slate-900">{report.progress}%</p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${report.status === 'Resolved' ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                        style={{width: `${report.progress}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                 <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                    <History size={40} />
                 </div>
                 <div className="space-y-2">
                    <p className="text-slate-900 font-bold uppercase tracking-widest text-xs">No reports found</p>
                    <p className="text-slate-400 text-[10px] font-medium max-w-[200px]">You haven't logged any civic issues yet.</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Profile & Stats */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                <Zap size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-emerald-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact Points</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tighter text-emerald-400">{user.points}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">PTS</span>
                </div>
                <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3 items-center">
                   <Award size={18} className="text-amber-500" />
                   <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-tight">"Citizen Vanguard"</p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Ranked in Top 10%</p>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolved</p>
                   <p className="text-4xl font-black text-emerald-600 leading-none">{resolvedCount}</p>
                </div>
                <div className="w-px h-12 bg-slate-50"></div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logged</p>
                   <p className="text-4xl font-black text-slate-900 leading-none">{myReports.length}</p>
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-50">
                 <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Civic Standing</span>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                       <span>Verification Level</span>
                       <span className="text-slate-900">Verified</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-[100%]"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 animate-in fade-in duration-700">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             Active Hub
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Namaste, {user.name.split(' ')[0]}
          </h1>
        </div>
      </div>

      <div className="flex mb-12 border-b border-slate-100 overflow-x-auto no-scrollbar gap-10">
        {[
          { id: 'overview', label: 'Overview & History', icon: <LayoutGrid size={18} /> },
          { id: 'community', label: 'Public Transparency Feed', icon: <Globe size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DashboardTab)}
            className={`flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        
        {activeTab === 'community' && (
          <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
            <div className="relative z-10 space-y-8 text-center lg:text-left flex-grow">
               <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Global Network</span>
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Civic Activity <br/><span className="text-emerald-400">Heatmap Feed</span></h3>
                  <p className="text-slate-400 text-base font-medium leading-relaxed max-w-xl">
                    See how your community is working together. Support, dispute, or validate reports from neighbors to ensure municipal attention is focused on the most critical urban needs.
                  </p>
               </div>
               <button 
                 onClick={() => onNavigate && onNavigate('public_reports')}
                 className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all active:scale-95 shadow-xl"
               >
                 Launch Public Feed <ArrowUpRight size={14} className="inline ml-2" />
               </button>
            </div>
            <div className="hidden lg:block relative z-10 w-1/3 aspect-square bg-slate-800 rounded-3xl border border-white/10 p-2 overflow-hidden shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=600" 
                    className="w-full h-full object-cover rounded-2xl opacity-50"
                    alt="City Grid"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-4 bg-emerald-600 rounded-2xl shadow-2xl">
                        <Activity size={32} />
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
