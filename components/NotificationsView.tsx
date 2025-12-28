
import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Zap, ShieldCheck, Trash2, X } from 'lucide-react';
import { Notification } from '../App';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onClear: () => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onMarkRead, onClear }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <CheckCircle2 size={20} className="text-emerald-500" />;
      case 'priority': return <AlertTriangle size={20} className="text-red-500" />;
      case 'points': return <Zap size={20} className="text-amber-500" />;
      case 'system': return <ShieldCheck size={20} className="text-indigo-500" />;
      default: return <Bell size={20} className="text-slate-400" />;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header Area */}
      <div className="bg-slate-900 pt-32 pb-16 px-4 md:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Notification Hub</h1>
            <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Your personal activity feed</p>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={onClear}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest py-2 px-4 bg-white/5 rounded-xl border border-white/10"
            >
              <Trash2 size={14} /> Clear All Records
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
        {notifications.length === 0 ? (
          <div className="py-32 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 border-2 border-dashed border-slate-100">
              <Bell size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Aura: Silent</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">
              No new alerts in your sector. We'll notify you when your contributions reach the command gateway.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => onMarkRead(n.id)}
                className={`relative p-6 rounded-[2rem] border transition-all cursor-pointer flex gap-5 group ${
                  n.isRead 
                    ? 'bg-white border-slate-100 grayscale-[0.3]' 
                    : 'bg-indigo-50/20 border-indigo-100 shadow-md shadow-indigo-500/5'
                }`}
              >
                {!n.isRead && (
                  <div className="absolute top-8 left-3 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-lg"></div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all ${
                  n.isRead ? 'bg-slate-50 text-slate-300' : 'bg-white shadow-sm text-slate-800'
                }`}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-grow space-y-1 pr-6">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-black text-sm uppercase tracking-tight ${n.isRead ? 'text-slate-500' : 'text-slate-900'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{n.timestamp}</span>
                  </div>
                  <p className={`text-xs font-medium leading-relaxed ${n.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                    {n.message}
                  </p>
                </div>

                <button 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-slate-600"
                  onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
