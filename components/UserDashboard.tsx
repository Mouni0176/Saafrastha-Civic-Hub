
import React, { useState, useMemo } from 'react';
import { User, Report, AppView } from '../App';
import { 
  MapPin, 
  LayoutGrid, 
  History, 
  Globe, 
  Activity,
  Award,
  Zap,
  Search,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

interface UserDashboardProps {
  user: User;
  userReports: Report[];
  publicReports: Report[];
  onVote: (id: string, type: 'support' | 'dispute') => void;
  onOpenReport: () => void;
  onNavigate?: (view: AppView) => void;
}

type DashboardTab = 'overview' | 'community';

const UserDashboard: React.FC<UserDashboardProps> = ({ user, userReports, publicReports, onVote, onOpenReport, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;

  const filteredPublicReports = useMemo(() => {
    const lowSearch = searchTerm.toLowerCase();
    return publicReports.filter(r => 
      r.title.toLowerCase().includes(lowSearch) || 
      r.location.toLowerCase().includes(lowSearch) || 
      r.category.toLowerCase().includes(lowSearch)
    );
  }, [publicReports, searchTerm]);

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">History</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your track record</p>
                </div>
              </div>
            </div>

            {userReports.length > 0 ? (
              <div className="space-y-4">
                {userReports.map((report) => (
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
                    <p className="text-slate-900 font-bold uppercase tracking-widest text-xs">No reports yet</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                <Zap size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-emerald-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold tracking-tighter text-emerald-400">{user.points}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">PTS</span>
                </div>
                <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3 items-center">
                   <Award size={18} className="text-amber-500" />
                   <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-tight">"Vanguard"</p>
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
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                   <p className="text-4xl font-black text-slate-900 leading-none">{userReports.length}</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderCommunityFeed = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <Activity size={20} className="text-emerald-500" /> Live Civic Grid
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Transparency Live.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPublicReports.map((report) => {
          const hasSupported = report.supportedBy?.includes(user?.id || '');
          const hasDisputed = report.disputedBy?.includes(user?.id || '');
          const alreadyVoted = hasSupported || hasDisputed;

          return (
            <div key={report.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {report.imageUrl ? (
                  <img src={report.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={report.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200"><MapPin size={32} /></div>
                )}
                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg ${
                  report.status === 'Resolved' ? 'bg-emerald-500' : 
                  report.status === 'In Progress' ? 'bg-indigo-600' : 'bg-amber-500'
                }`}>
                  {report.status}
                </div>
              </div>
              <div className="p-6 flex-grow space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">#{report.id}</span>
                  <span className="text-[8px] font-black px-2 py-0.5 bg-slate-50 text-slate-500 rounded uppercase">{report.category}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{report.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <MapPin size={12} className="text-emerald-500" />
                  <span className="truncate">{report.location.split(',')[0]}</span>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-slate-50 flex items-center gap-2 border-t border-slate-100">
                <button 
                  onClick={() => onVote(report.id, 'support')}
                  disabled={alreadyVoted}
                  className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border active:scale-95 ${
                    hasSupported ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                  } disabled:opacity-50`}
                >
                  <ThumbsUp size={12} /> {report.supportCount}
                </button>
                <button 
                  onClick={() => onVote(report.id, 'dispute')}
                  disabled={alreadyVoted}
                  className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border active:scale-95 ${
                    hasDisputed ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-600 border-rose-100 hover:bg-rose-50'
                  } disabled:opacity-50`}
                >
                  <ThumbsDown size={12} /> {report.disputeCount}
                </button>
              </div>
              <div className="px-6 py-3 bg-white border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <UserCheck size={10} className="text-emerald-500" /> Verified
                 </div>
                 {report.status === 'Resolved' && <CheckCircle2 size={12} className="text-emerald-500" />}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPublicReports.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No reports found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 animate-in fade-in duration-700">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             Hub Active
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Namaste, {user.name.split(' ')[0]}
          </h1>
        </div>
      </div>

      <div className="flex mb-12 border-b border-slate-100 overflow-x-auto no-scrollbar gap-10">
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutGrid size={18} /> },
          { id: 'community', label: 'Feed', icon: <Globe size={18} /> }
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
        {activeTab === 'overview' ? renderOverview() : renderCommunityFeed()}
      </div>
    </div>
  );
};

export default UserDashboard;
