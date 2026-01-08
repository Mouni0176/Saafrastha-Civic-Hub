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
  UserCheck,
  Plus,
  BarChart3,
  TrendingUp
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Primary Track Records */}
      <div className="lg:col-span-8 space-y-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-slate-900/10">
                <History size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal History</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Audit of your filed reports</p>
              </div>
            </div>
            <button 
              onClick={onOpenReport}
              className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Plus size={16} /> New Entry
            </button>
          </div>

          {userReports.length > 0 ? (
            <div className="space-y-4">
              {userReports.map((report) => (
                <div key={report.id} className="p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex-shrink-0">
                          {report.imageUrl ? (
                              <img src={report.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={report.title} />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50"><MapPin size={28} /></div>
                          )}
                       </div>
                       <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${report.severity === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                             {report.id} • {report.category}
                          </p>
                          <h4 className="font-bold text-slate-900 text-lg tracking-tight truncate">{report.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
                            <MapPin size={12} className="text-emerald-500" /> {report.location.split(',')[0]}
                          </p>
                       </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                       <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                         report.status === 'Resolved' ? 'bg-emerald-500 text-white' :
                         report.status === 'In Progress' ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {report.status}
                       </div>
                       <p className="text-xl font-black text-slate-900 tracking-tighter">{report.progress}%</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${report.status === 'Resolved' ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                      style={{width: `${report.progress}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
               <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-slate-100 mb-8">
                  <History size={48} />
               </div>
               <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Incident Records</h4>
               <p className="text-slate-400 font-medium text-sm mt-2 max-w-xs">You haven't initiated any infrastructure reports yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Side Profile & Stats */}
      <div className="lg:col-span-4 space-y-8">
         {/* Impact Dashboard Card */}
         <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
              <TrendingUp size={160} />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Impact Status</p>
                  <p className="text-sm font-black text-white mt-1 uppercase tracking-widest">Active Vanguard</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black tracking-tighter text-emerald-400">{user.points}</span>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Experience</span>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group-hover:bg-white/10 transition-all">
                 <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
                    <Award size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tight">Global Rank</p>
                    <p className="text-xs font-bold text-slate-400">#24 in Sector 4</p>
                 </div>
              </div>
            </div>
         </div>

         {/* Resolution Statistics */}
         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed</p>
                 <p className="text-5xl font-black text-emerald-600 leading-none tracking-tighter">{resolvedCount}</p>
              </div>
              <div className="w-px h-16 bg-slate-100"></div>
              <div className="space-y-2 text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filed</p>
                 <p className="text-5xl font-black text-slate-900 leading-none tracking-tighter">{userReports.length}</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-8 border-t border-slate-50">
               <div className="flex items-center gap-3 text-slate-600">
                  <BarChart3 size={18} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Efficiency: <span className="text-slate-900">High</span></span>
               </div>
               <div className="flex items-center gap-3 text-slate-600">
                  <Globe size={18} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Local Reach: <span className="text-slate-900">District 4</span></span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  const renderCommunityFeed = () => (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
            <Activity size={28} className="text-emerald-500" /> Infrastructure Grid
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Real-time geospatial transparency.</p>
        </div>
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search active reports..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-16 pr-6 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all uppercase tracking-tight"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPublicReports.map((report) => {
          const hasSupported = report.supportedBy?.includes(user?.id || '');
          const hasDisputed = report.disputedBy?.includes(user?.id || '');
          const alreadyVoted = hasSupported || hasDisputed;

          return (
            <div key={report.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 h-full border-b-4 hover:border-b-emerald-500">
              <div className="relative h-60 overflow-hidden bg-slate-100">
                {report.imageUrl ? (
                  <img src={report.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={report.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50"><MapPin size={48} /></div>
                )}
                <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${
                  report.status === 'Resolved' ? 'bg-emerald-500' : 
                  report.status === 'In Progress' ? 'bg-indigo-600' : 'bg-amber-500'
                }`}>
                  {report.status}
                </div>
              </div>
              <div className="p-8 flex-grow space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.id}</span>
                  <span className="text-[9px] font-black px-3 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase tracking-widest">{report.category}</span>
                </div>
                <h4 className="font-black text-xl text-slate-900 leading-tight uppercase tracking-tight line-clamp-2">{report.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                  <MapPin size={14} className="text-emerald-500" />
                  <span className="truncate">{report.location.split(',')[0]}</span>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 flex items-center gap-3 border-t border-slate-100">
                <button 
                  onClick={() => onVote(report.id, 'support')}
                  disabled={alreadyVoted}
                  className={`flex-1 py-3.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border active:scale-95 ${
                    hasSupported ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                  } disabled:opacity-50`}
                >
                  <ThumbsUp size={16} /> {report.supportCount}
                </button>
                <button 
                  onClick={() => onVote(report.id, 'dispute')}
                  disabled={alreadyVoted}
                  className={`flex-1 py-3.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border active:scale-95 ${
                    hasDisputed ? 'bg-rose-600 text-white border-rose-600 shadow-lg' : 'bg-white text-rose-600 border-rose-100 hover:bg-rose-50'
                  } disabled:opacity-50`}
                >
                  <ThumbsDown size={16} /> {report.disputeCount}
                </button>
              </div>
              <div className="px-8 py-5 bg-white border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <UserCheck size={14} className="text-emerald-500" /> Verified
                 </div>
                 {report.status === 'Resolved' && <CheckCircle2 size={18} className="text-emerald-500" />}
              </div>
            </div>
          );
        })}
      </div>

      {filteredPublicReports.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No matching infrastructure nodes found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-24 animate-in fade-in duration-1000">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-12">
        <div className="space-y-4">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             Citizen Node Active
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            Welcome, {user.name.split(' ')[0]}
          </h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutGrid size={18} /> },
            { id: 'community', label: 'The Grid', icon: <Globe size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.75rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-xl border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'overview' ? renderOverview() : renderCommunityFeed()}
      </div>
    </div>
  );
};

export default UserDashboard;