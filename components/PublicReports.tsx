import React, { useMemo, memo, useState } from 'react';
import { User, Report } from '../App';
import { MapPin, Shield, Calendar, AlertTriangle, CheckCircle2, Search, ThumbsUp, ThumbsDown, UserCheck, Activity, Globe } from 'lucide-react';

interface PublicReportsProps {
  user: User | null;
  reports: Report[];
  onVote: (id: string, type: 'support' | 'dispute') => void;
}

const ReportCard = memo(({ report, user, onVote }: { report: Report, user: User | null, onVote: (id: string, type: 'support' | 'dispute') => void }) => {
  const hasSupported = report.supportedBy?.includes(user?.id || '');
  const hasDisputed = report.disputedBy?.includes(user?.id || '');
  const alreadyVoted = hasSupported || hasDisputed;

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 group flex flex-col h-full hover:-translate-y-2 border-b-[6px] hover:border-b-emerald-500">
      <div className="relative h-72 overflow-hidden bg-slate-100">
        {report.imageUrl ? (
          <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
            <Shield size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-white text-[10px] font-black uppercase tracking-widest">Active Verification Required</p>
           </div>
        </div>
        <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl text-white ${
          report.status === 'Resolved' ? 'bg-emerald-500' : 
          report.status === 'In Progress' ? 'bg-indigo-600' : 'bg-amber-500'
        }`}>
          {report.status}
        </div>
      </div>

      <div className="p-10 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.15em] border ${
            report.severity === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 
            report.severity === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
          }`}>
            {report.severity} Priority
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{report.id}</span>
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 mb-4 leading-[1.2] uppercase tracking-tight line-clamp-2">{report.title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-8">{report.description}</p>
        
        <div className="mt-auto space-y-4 pt-8 border-t border-slate-50">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <MapPin size={16} className="text-emerald-500 shrink-0" />
            <span className="truncate">{report.location}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Calendar size={16} className="shrink-0" />
            Logged • {report.date}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-y border-slate-100 flex items-center justify-around gap-4">
        <button 
          onClick={() => onVote(report.id, 'support')}
          disabled={alreadyVoted}
          className={`flex-1 py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border active:scale-95 ${
            hasSupported 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20' 
              : alreadyVoted 
                ? 'bg-white text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
                : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <ThumbsUp size={16} fill={hasSupported ? "currentColor" : "none"} /> 
          Verify ({report.supportCount})
        </button>
        <button 
          onClick={() => onVote(report.id, 'dispute')}
          disabled={alreadyVoted}
          className={`flex-1 py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border active:scale-95 ${
            hasDisputed 
              ? 'bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-600/20' 
              : alreadyVoted 
                ? 'bg-white text-slate-300 border-slate-100 cursor-not-allowed opacity-50'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <ThumbsDown size={16} fill={hasDisputed ? "currentColor" : "none"} /> 
          Dispute ({report.disputeCount})
        </button>
      </div>

      <div className="px-10 py-5 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <UserCheck size={16} className="text-emerald-500" />
          Validated Citizen Entry
        </div>
        {report.status === 'Resolved' && <CheckCircle2 size={20} className="text-emerald-500 shadow-sm" />}
      </div>
    </div>
  );
});

const PublicReports: React.FC<PublicReportsProps> = ({ user, reports, onVote }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = useMemo(() => {
    const lowSearch = searchTerm.toLowerCase();
    return reports.filter(r => 
      r.title.toLowerCase().includes(lowSearch) || 
      r.location.toLowerCase().includes(lowSearch) || 
      r.category.toLowerCase().includes(lowSearch)
    );
  }, [reports, searchTerm]);

  return (
    <section className="pb-32 bg-slate-50 min-h-screen">
      {/* Immersive Header */}
      <div className="bg-slate-900 pt-48 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[150px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                 <Globe size={16} /> Global Infrastructure Registry
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                Civic Transparency <br /><span className="text-emerald-400">Ledger.</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
                Aggregating community observations for systemic resolution. Filter through real-time geospatial nodes.
              </p>
            </div>
            
            {/* Real-time Ticker */}
            <div className="p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 min-w-[320px] space-y-4">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Pulse</p>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-black text-white">LIVE</span>
                  </div>
               </div>
               <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">Issues Logged</p>
                  <p className="text-2xl font-black text-white leading-none">{reports.length}</p>
               </div>
               <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">Resolved</p>
                  <p className="text-2xl font-black text-emerald-400 leading-none">{reports.filter(r => r.status === 'Resolved').length}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 -mt-10 relative z-20">
        {/* Search & Interaction Control */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-10 px-6">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{reports.length}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Active Nodes</span>
              </div>
              <div className="w-px h-12 bg-slate-100"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">{reports.filter(r => r.status === 'Resolved').length}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Efficiency Verified</span>
              </div>
           </div>
           
           <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Query Sector, ID, or Category..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4.5 pl-16 pr-6 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-black uppercase tracking-tight"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} user={user} onVote={onVote} />
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-200 space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 animate-pulse">
               <Shield size={48} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Zero Node Coverage</h3>
               <p className="text-slate-400 font-medium text-lg mt-2">Adjust your query parameters to scan broader geospatial data.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicReports;