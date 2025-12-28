
import React from 'react';
import { User, Report } from '../App';
import { MapPin, Shield, Calendar, AlertTriangle, CheckCircle2, Search, ThumbsUp, ThumbsDown, UserCheck } from 'lucide-react';

interface PublicReportsProps {
  user: User | null;
  reports: Report[];
  onVote: (id: string, type: 'support' | 'dispute') => void;
}

const PublicReports: React.FC<PublicReportsProps> = ({ user, reports, onVote }) => {
  return (
    <section className="pb-24 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-slate-900 py-20 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] -z-0"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
             <Shield size={14} /> Official Transparency Feed
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Live Civic <span className="text-emerald-400">Activity Grid</span>
          </h1>
          <p className="text-lg text-slate-400 mt-4 max-w-2xl mx-auto font-medium">
            Browse active and resolved reports. Use Support or Dispute to validate community issues.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Search & Stats Bar */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6 px-4">
              <div>
                <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports Logged</p>
              </div>
              <div className="w-px h-8 bg-slate-100"></div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{reports.filter(r => r.status === 'Resolved').length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issues Resolved</p>
              </div>
           </div>
           
           <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by area or issue type..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
              />
           </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reports.map((report) => {
            const hasSupported = report.supportedBy?.includes(user?.id || '');
            const hasDisputed = report.disputedBy?.includes(user?.id || '');
            const alreadyVoted = hasSupported || hasDisputed;

            return (
              <div key={report.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                {/* Image Preview */}
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  {report.imageUrl ? (
                    <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Shield size={48} />
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    report.status === 'Resolved' ? 'bg-emerald-500 text-white' : 
                    report.status === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {report.status}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                      report.severity === 'Critical' ? 'bg-red-50 text-red-600' : 
                      report.severity === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {report.severity} Priority
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{report.id}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{report.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium">{report.description}</p>
                  
                  <div className="space-y-3 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <MapPin size={14} className="text-emerald-500" />
                      <span className="truncate">{report.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Calendar size={14} className="text-slate-400" />
                      Reported on {report.date}
                    </div>
                  </div>
                </div>

                {/* Interaction Buttons (Support / Dispute) */}
                <div className="px-6 py-4 bg-slate-50 border-y border-slate-100 flex items-center justify-around gap-2">
                  <button 
                    onClick={() => onVote(report.id, 'support')}
                    disabled={alreadyVoted}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border active:scale-95 ${
                      hasSupported 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : alreadyVoted 
                          ? 'bg-white text-slate-300 border-slate-100 cursor-not-allowed'
                          : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <ThumbsUp size={16} fill={hasSupported ? "currentColor" : "none"} /> 
                    Support ({report.supportCount})
                  </button>
                  <button 
                    onClick={() => onVote(report.id, 'dispute')}
                    disabled={alreadyVoted}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border active:scale-95 ${
                      hasDisputed 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : alreadyVoted 
                          ? 'bg-white text-slate-300 border-slate-100 cursor-not-allowed'
                          : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <ThumbsDown size={16} fill={hasDisputed ? "currentColor" : "none"} /> 
                    Dispute ({report.disputeCount})
                  </button>
                </div>

                {/* Footer Indicator */}
                <div className="px-8 py-4 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    <UserCheck size={12} className="text-emerald-500" />
                    Verified Citizen Report
                  </div>
                  {report.status === 'Resolved' && <CheckCircle2 size={16} className="text-emerald-500" />}
                </div>
              </div>
            );
          })}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <Shield size={64} className="text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-800">No active reports found</h3>
            <p className="text-slate-500">Be the first to secure your street today.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicReports;
