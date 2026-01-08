
import React, { useState, useMemo, useEffect, useRef, memo } from 'react';
import { User, Report, AppView } from '../App';
import L from 'leaflet';
import { 
  ListTodo, 
  BarChart3, 
  Search, 
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  MapPin,
  Image as ImageIcon,
  CheckCircle,
  Map as MapIcon,
  TrendingUp,
  Truck,
  Zap,
  Send
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface GovDashboardProps {
  user: User;
  allReports: Report[];
  onUpdateReport: (id: string, updates: Partial<Report>) => void;
  onNavigate?: (view: AppView) => void;
}

type GovTab = 'queue' | 'map' | 'analytics';

const CityMap = memo(({ reports, onSelect }: { reports: Report[], onSelect: (id: string) => void }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const timer = setTimeout(() => {
      if (leafletMap.current || !mapRef.current) return;
      leafletMap.current = L.map(mapRef.current, {
        center: [28.6139, 77.2090],
        zoom: 12,
        zoomControl: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
      }).addTo(leafletMap.current);
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
      updateView();
    }, 100);
    return () => {
      clearTimeout(timer);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  const updateView = () => {
    if (!markersLayer.current || !leafletMap.current) return;
    markersLayer.current.clearLayers();
    const validReports = reports.filter(r => r.lat && r.lng);
    validReports.forEach(report => {
      const color = report.severity === 'Critical' ? '#ef4444' : '#6366f1';
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color}88;"></div>`,
        iconSize: [12, 12]
      });
      const marker = L.marker([report.lat!, report.lng!], { icon: customIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 5px;">
            <h4 style="margin: 0; font-weight: 700; font-size: 13px;">${report.title}</h4>
            <button id="marker-${report.id}" style="margin-top: 10px; width: 100%; padding: 6px; background: #1e293b; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 10px;">Details</button>
          </div>
        `, { closeButton: false });
      marker.on('popupopen', () => {
        const btn = document.getElementById(`marker-${report.id}`);
        if (btn) btn.onclick = () => onSelect(report.id);
      });
      markersLayer.current?.addLayer(marker);
    });
    if (validReports.length > 0 && leafletMap.current) {
      const bounds = L.latLngBounds(validReports.map(r => [r.lat!, r.lng!] as [number, number]));
      leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  useEffect(() => { updateView(); }, [reports]);

  return <div ref={mapRef} id="map-container" className="bg-slate-50 w-full h-full" />;
});

const GovDashboard: React.FC<GovDashboardProps> = ({ user, allReports, onUpdateReport, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<GovTab>('queue');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stagedProgress, setStagedProgress] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [showDispatchMsg, setShowDispatchMsg] = useState(false);
  const [assignedCrew, setAssignedCrew] = useState<string>('');

  const selectedReport = useMemo(() => allReports.find(r => r.id === selectedReportId), [allReports, selectedReportId]);
  
  const analyticsData = useMemo(() => {
    const total = allReports.length;
    const resolved = allReports.filter(r => r.status === 'Resolved').length;
    const critical = allReports.filter(r => r.severity === 'Critical').length;
    const inProgress = allReports.filter(r => r.status === 'In Progress').length;
    const activeTasks = allReports.filter(r => r.status !== 'Resolved');
    const avgProgress = activeTasks.length > 0 
      ? Math.round(activeTasks.reduce((acc, curr) => acc + curr.progress, 0) / activeTasks.length) 
      : 100;

    return { total, resolved, critical, inProgress, avgProgress, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 };
  }, [allReports]);

  useEffect(() => { 
    if (selectedReport) {
      setStagedProgress(selectedReport.progress);
      setAssignedCrew(selectedReport.assignedUnit || '');
      setShowDispatchMsg(false);
    }
  }, [selectedReportId]);

  const filteredReports = useMemo(() => {
    const lowSearch = searchTerm.toLowerCase();
    return allReports
      .filter(r => r.title.toLowerCase().includes(lowSearch) || r.id.toLowerCase().includes(lowSearch))
      .sort((a, b) => (a.status !== 'Resolved' && b.status === 'Resolved' ? -1 : 1));
  }, [allReports, searchTerm]);

  const isDirty = useMemo(() => {
    if (!selectedReport) return false;
    return stagedProgress !== selectedReport.progress || assignedCrew !== (selectedReport.assignedUnit || '');
  }, [selectedReport, stagedProgress, assignedCrew]);

  const handleCommitChanges = async () => {
    if (!selectedReport || isSyncing) return;
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpdateReport(selectedReport.id, { progress: stagedProgress, assignedUnit: assignedCrew || undefined });
    setIsSyncing(false);
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 2000);
  };

  const handleDispatch = () => {
    setShowDispatchMsg(true);
    setTimeout(() => setShowDispatchMsg(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row -mt-20 overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col pt-28 pb-10 px-6 sticky top-0 h-screen border-r border-slate-800">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-xs truncate">{user.name.split(' ')[0]}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{user.department || 'Authority'}</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-grow">
          {[
            { id: 'queue', label: 'Incidents', icon: <ListTodo size={18} /> },
            { id: 'map', label: 'City Map', icon: <MapIcon size={18} /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id as GovTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === link.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fleet Status</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>
           <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Report. Track. Resolve.</p>
        </div>
      </aside>

      <main className="flex-grow pt-28 pb-20 px-4 lg:px-8 h-screen overflow-hidden flex flex-col">
        {activeTab === 'queue' ? (
          <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
            <div className={`lg:w-1/3 flex flex-col min-h-0 ${selectedReportId ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-900">Queue</h2>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-[10px] w-32 focus:ring-1 focus:ring-indigo-500"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar pb-20">
                {filteredReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedReportId === report.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-800 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between mb-1">
                       <span className={`text-[8px] font-black uppercase ${report.severity === 'Critical' ? 'text-red-500' : ''}`}>{report.severity}</span>
                       <span className="text-[8px] font-bold opacity-50">#{report.id}</span>
                    </div>
                    <h3 className="font-bold text-xs truncate">{report.title}</h3>
                  </button>
                ))}
              </div>
            </div>

            <div className={`lg:w-2/3 flex flex-col min-h-0 ${!selectedReportId ? 'hidden lg:flex' : 'flex'}`}>
              {selectedReport ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl h-full flex flex-col min-h-0 animate-in fade-in slide-in-from-right-2 duration-300 overflow-hidden relative">
                  {showDispatchMsg && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border border-white/20">
                       <Send size={20} className="animate-pulse" />
                       <p className="text-xs font-black uppercase tracking-[0.2em]">Information sent to crew</p>
                    </div>
                  )}

                  <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-shrink-0 bg-white">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedReportId(null)} className="lg:hidden p-2 bg-slate-100 rounded-lg"><ChevronLeft size={18} /></button>
                      <h3 className="text-lg font-bold text-slate-900 truncate">{selectedReport.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-8 min-h-0 custom-scrollbar">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="aspect-square rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shadow-inner">
                         {selectedReport.imageUrl ? <img src={selectedReport.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={40} /></div>}
                       </div>
                       
                       <div className="space-y-6">
                         <div className="bg-indigo-900 p-6 rounded-2xl text-white space-y-4 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                  <Truck size={16} />
                               </div>
                               <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest">Route to Crew</h4>
                               </div>
                            </div>
                            
                            <select 
                              className="w-full bg-indigo-800 border border-indigo-700 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-400"
                              value={assignedCrew}
                              onChange={(e) => setAssignedCrew(e.target.value)}
                            >
                               <option value="">Select Team</option>
                               <option value="Alpha-1">Alpha-1 (Sanitation)</option>
                               <option value="Delta-4">Delta-4 (Roads)</option>
                               <option value="Rapid-A">Rapid Response</option>
                            </select>

                            <button 
                               onClick={handleDispatch}
                               disabled={!assignedCrew}
                               className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                            >
                               <Send size={14} /> Dispatch Information
                            </button>
                         </div>

                         <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                             <span className="text-slate-400">Progress</span>
                             <span className="text-indigo-600">{stagedProgress}%</span>
                           </div>
                           <input type="range" className="w-full h-1.5 bg-indigo-100 rounded-full appearance-none accent-indigo-600" value={stagedProgress} onChange={(e) => setStagedProgress(parseInt(e.target.value))} />
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-50 flex items-center justify-end bg-white">
                    <button 
                      disabled={!isDirty || isSyncing}
                      onClick={handleCommitChanges}
                      className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        showSyncSuccess ? 'bg-emerald-500 text-white' : !isDirty ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'
                      }`}
                    >
                      {isSyncing ? 'Syncing...' : showSyncSuccess ? 'Synced' : 'Commit'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
                  <AlertCircle size={32} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Select Incident</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'map' ? (
          <div className="flex-grow bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 relative h-full">
            <CityMap reports={allReports} onSelect={(id) => { setSelectedReportId(id); setActiveTab('queue'); }} />
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto h-full pb-20 custom-scrollbar pr-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Rate', val: `${analyticsData.resolutionRate}%`, icon: <CheckCircle size={14} />, color: 'text-emerald-500' },
                { label: 'Resolved', val: analyticsData.resolved, icon: <CheckCircle size={14} />, color: 'text-indigo-500' },
                { label: 'Critical', val: analyticsData.critical, icon: <AlertCircle size={14} />, color: 'text-red-500' },
                { label: 'Avg Prof', val: `${analyticsData.avgProgress}%`, icon: <TrendingUp size={14} />, color: 'text-blue-500' }
              ].map(s => (
                <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-2 mb-2">
                      <div className={s.color}>{s.icon}</div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                   </div>
                   <p className="text-2xl font-black text-slate-900">{s.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px]"></div>
               <div className="relative z-10 flex-grow text-center md:text-left">
                  <h4 className="text-2xl font-black tracking-tight mb-2">Transparency Live.</h4>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Resolution Velocity: High</p>
               </div>
               <div className="relative z-10 flex gap-8">
                  <div className="text-center">
                     <p className="text-3xl font-black text-emerald-400 leading-none">{analyticsData.resolved}</p>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">Fixed</p>
                  </div>
                  <div className="text-center">
                     <p className="text-3xl font-black text-indigo-400 leading-none">{analyticsData.inProgress}</p>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">Active</p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GovDashboard;
