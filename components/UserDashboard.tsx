
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

type DashboardTab = 'overview' | 'activity' | 'community';

const UserDashboard: React.FC<UserDashboardProps> = ({ user, reports, onOpenReport, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const myReports = reports.filter(r => r.reporterId === user.id);
  const activeReports = myReports.filter(r => r.status !== 'Resolved');
  const resolvedCount = myReports.filter(r => r.status === 'Resolved').length;

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Current Activity</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your recent reports and status</p>
                </div>
              </div>
            </div>

            {activeReports.length > 0 ? (
              <div className="space-y-4">
                {activeReports.slice(0, 3).map((report) => (
                  <div key={report.id} className="p-6 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                            <img src={report.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=100'} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">{report.title}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                              <MapPin size={10} className="text-emerald-500" /> {report.location.split(',')[0]}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className={`text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest ${
                           report.status === 'In Progress' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                         }`}>
                           {report.status}
                         </span>
                         <p className="text-xs font-bold text-slate-900 mt-1">{report.progress}%</p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-700" style={{width: `${report.progress}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                 <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-[1.5rem] flex items-center justify-center">
                    <ShieldCheck size={32} />
                 </div>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No active reports</p>
              </div>
            )}
            
            <button onClick={() => setActiveTab('activity')} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
               View All Reports <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
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
                   <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
                     "Citizen Vanguard"
                   </p>
                </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resolved</p>
                <p className="text-3xl font-bold text-slate-900">{resolvedCount}</p>
              </div>
              <div className="text-center border-l border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Logged</p>
                <p className="text-3xl font-bold text-slate-900">{myReports.length}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 animate-in fade-in duration-700">
      <div className="mb-12">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
           Dashboard
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Welcome, {user.name.split(' ')[0]}
        </h1>
      </div>

      <div className="flex mb-12 border-b border-slate-100 overflow-x-auto no-scrollbar gap-8">
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutGrid size={18} /> },
          { id: 'activity', label: 'My Reports', icon: <History size={18} /> },
          { id: 'community', label: 'Community', icon: <Globe size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DashboardTab)}
            className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
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
        
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myReports.length === 0 ? (
              <div className="col-span-full py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center">
                <Clock size={40} className="text-slate-200 mb-4" />
                <h4 className="text-lg font-bold text-slate-800 uppercase tracking-widest">No reports yet</h4>
              </div>
            ) : (
              myReports.map(report => (
                <div key={report.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                  <div className="h-56 relative bg-slate-50 overflow-hidden">
                    {report.imageUrl ? (
                      <img src={report.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><MapPin size={48} /></div>
                    )}
                    <div className="absolute top-4 left-4">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg ${
                        report.status === 'Resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                       }`}>
                         {report.status}
                       </span>
                    </div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{report.category}</span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">#{report.id}</span>
                    </div>
                    <h4 className="font-bold text-xl text-slate-900 leading-tight mb-6">{report.title}</h4>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Completion</span>
                       <span className="text-xs font-bold text-slate-900">{report.progress}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12 border border-white/5 shadow-2xl">
            <div className="relative z-10 space-y-6 text-center md:text-left flex-grow">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Community Hub</span>
               </div>
               <h3 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">Public Transparency Feed</h3>
               <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
                  See what's happening in your city. Support or validate reports from other citizens to help authorities prioritize effectively.
               </p>
               <button 
                 onClick={() => onNavigate && onNavigate('public_reports')}
                 className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95"
               >
                 Go to Public Feed
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-10 right-10 z-[150]">
        <button 
          onClick={onOpenReport}
          className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex flex-col items-center justify-center shadow-xl hover:bg-emerald-700 active:scale-90 transition-all border border-white/10"
        >
          <AlertTriangle size={32} className="mb-0.5" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Report</span>
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
