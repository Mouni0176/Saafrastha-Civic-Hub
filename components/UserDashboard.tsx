
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
  MessageSquare
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Active Sector Status */}
        <div className="lg:col-span-7 h-full">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Sector Status</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time engagement tracking</p>
              </div>
            </div>

            {activeReports.length > 0 ? (
              <div className="space-y-5 flex-grow">
                {activeReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="group p-5 bg-slate-50/50 rounded-3xl border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                            <img src={report.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=100'} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{report.title}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                              <MapPin size={10} /> {report.location.split(',')[0]}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                           report.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {report.status}
                         </span>
                         <p className="text-[11px] font-black text-slate-900 mt-1">{report.progress}%</p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${report.progress}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-10 text-center space-y-4">
                 <div className="w-20 h-20 bg-emerald-50 text-emerald-300 rounded-[2rem] flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={40} />
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-slate-900">Sector Status: Nominal</h4>
                    <p className="text-slate-400 text-xs font-medium max-w-[240px] mx-auto mt-1 leading-relaxed">Your neighborhood data is synchronized and no critical flags are active.</p>
                 </div>
              </div>
            )}
            
            <button onClick={() => setActiveTab('activity')} className="mt-8 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:gap-3 transition-all">
               Access My Activity Logs <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Reliability Score */}
        <div className="lg:col-span-5 flex flex-col gap-8">
           <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group flex-grow">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Civic Reliability Index</p>
                  <div className="flex items-end gap-2">
                    <span className="text-7xl font-black tracking-tighter text-emerald-400">{user.points}</span>
                    <span className="text-sm font-black text-slate-500 mb-3 uppercase tracking-widest">Trust PTS</span>
                  </div>
                </div>
                <div className="space-y-5 pt-10">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Vanguard Efficiency</span>
                    <span className="text-emerald-400">Top 5% Community Rank</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{width: '75%'}}></div>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                    "Your contributions have saved an estimated 142h of municipal response time this quarter."
                  </p>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-8 flex-shrink-0">
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Fixes</p>
                <p className="text-3xl font-black text-slate-900">{resolvedCount}</p>
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reports</p>
                <p className="text-3xl font-black text-slate-900">{myReports.length}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20 animate-in fade-in duration-700 relative">
      
      {/* Title & Hub Label */}
      <div className="flex flex-col items-center text-center mb-16 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Connected Gateway</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-none">
          My Civic <span className="text-emerald-600">Command</span>
        </h1>
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pt-1">
          <MapPin size={14} className="text-emerald-600" /> SECTOR 4 OVERSIGHT HUB
        </div>
      </div>

      {/* Centered Pill Navigation */}
      <div className="flex justify-center mb-16">
        <div className="inline-flex items-center bg-slate-100/60 p-1.5 rounded-[2.5rem] border border-slate-200/50 shadow-inner overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutGrid size={16} /> },
            { id: 'activity', label: 'My Activity', icon: <History size={16} /> },
            { id: 'community', label: 'Community Hub', icon: <Globe size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Viewport */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {myReports.length === 0 ? (
              <div className="col-span-full py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-4">
                <Clock size={48} className="text-slate-200" />
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-widest">No Personal Logs</h4>
                <p className="text-slate-400 text-xs font-medium">Use the Hazard tool to file your first report.</p>
              </div>
            ) : (
              myReports.map(report => (
                <div key={report.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                  <div className="h-52 relative bg-slate-50 overflow-hidden">
                    {report.imageUrl ? (
                      <img src={report.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-1000" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><MapPin size={48} /></div>
                    )}
                    <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                      report.status === 'Resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {report.status}
                    </div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{report.category}</span>
                       <span className="text-[9px] font-bold text-slate-300">#{report.id}</span>
                    </div>
                    <h4 className="font-black text-xl text-slate-900 leading-tight mb-6">{report.title}</h4>
                    
                    <div className="mt-auto space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Resolution Grid</span>
                         <span className="text-emerald-600">{report.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden shadow-inner">
                         <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${report.progress}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border border-emerald-500">
                <div className="absolute top-0 right-0 p-16 opacity-[0.1] pointer-events-none">
                  <Globe size={240} />
                </div>
                <div className="relative z-10 space-y-4 text-center md:text-left">
                   <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Sector 4 Community Hub</h3>
                   <p className="text-emerald-50 text-sm font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                      Real-time visibility into your city's health. Support your neighbors by validating their reports to help authorities prioritize responses.
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock data or shared reports would go here - filtering from global reports */}
                {/* For demonstration, we'll show a sample of general activity */}
                <div className="col-span-full py-12 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Syncing Community Data Grid...</p>
                   <p className="text-slate-300 text-[10px] mt-2 italic">Navigate to "Public Reports" for full global interaction.</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Hazard Floating Action Button with Persistent Speech Bubble */}
      <div className="fixed bottom-8 right-8 z-[100] group">
        {/* Animated Speech Bubble - Persistent */}
        <div className="absolute bottom-[105%] right-0 mb-4 animate-bounce-subtle pointer-events-none opacity-100 transition-all duration-500 translate-y-0">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] relative border border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Report the issue here</p>
            {/* Arrow */}
            <div className="absolute top-full right-8 -mt-1 w-3 h-3 bg-slate-900 border-r border-b border-slate-800 rotate-45"></div>
          </div>
        </div>

        <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-xl group-hover:bg-red-600/30 transition-all animate-pulse"></div>
        <button 
          onClick={onOpenReport}
          title="Instant Hazard Dispatch"
          className="relative w-20 h-20 bg-red-600 text-white rounded-[2rem] flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-90 transition-all border border-red-500/50"
        >
          <AlertTriangle size={36} />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default UserDashboard;
