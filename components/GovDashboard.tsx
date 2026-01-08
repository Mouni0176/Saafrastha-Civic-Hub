
import React, { useState, useMemo, useEffect, useRef, memo } from 'react';
import { User, Report, AppView } from '../App';
import L from 'leaflet';
import { 
  ListTodo, 
  BarChart3, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  MapPin,
  Image as ImageIcon,
  Navigation,
  CheckCircle,
  Map as MapIcon,
  Activity,
  XCircle,
  Loader2,
  RefreshCcw,
  Check,
  Globe,
  Settings,
  ArrowUpRight,
  Truck,
  Zap,
  Radio,
  Wifi,
  Battery,
  Send,
  Crosshair,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface GovDashboardProps {
  user: User;
  allReports: Report[];
  onUpdateReport: (id: string, updates: Partial<Report>) => void;
  onNavigate?: (view: AppView) => void;
}

type GovTab = 'queue' | 'map' | 'analytics';

// Memoized map component to prevent re-initialization lag
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
  const [isDispatching, setIsDispatching] = useState(false);
  const [showDispatchMsg, setShowDispatchMsg] = useState(false);
  const [assignedCrew, setAssignedCrew] = useState<string>('');

  const selectedReport = useMemo(() => allReports.find(r => r.id === selectedReportId), [allReports, selectedReportId]);
  
  // Accurate Analytics Calculations
  const analyticsData = useMemo(() => {
    const total = allReports.length;
    const resolved = allReports.filter(r => r.status === 'Resolved').length;
    const critical = allReports.filter(r => r.severity === 'Critical').length;
    const inProgress = allReports.filter(r => r.status === 'In Progress').length;
    const dispatched = allReports.filter(r => !!r.assignedUnit).length;
    
    // Category Breakdown
    const categories: Record<string, number> = {};
    allReports.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    const categoryChartData = Object.entries(categories).map(([name, value]) => ({ name, value }));

    // Severity Breakdown
    const severities: Record<string, number> = { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
    allReports.forEach(r => {
      if (severities.hasOwnProperty(r.severity)) {
        severities[r.severity]++;
      }
    });
    const severityChartData = Object.entries(severities).map(([name, value]) => ({ name, value }));

    // Calculate Average Efficiency (based on progress of non-resolved reports)
    const activeTasks = allReports.filter(r => r.status !== 'Resolved');
    const avgProgress = activeTasks.length > 0 
      ? Math.round(activeTasks.reduce((acc, curr) => acc + curr.progress, 0) / activeTasks.length) 
      : 100;

    return {
      total,
      resolved,
      critical,
      inProgress,
      dispatched,
      avgProgress,
      categoryChartData,
      severityChartData,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
    };
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
    const progressChanged = stagedProgress !== selectedReport.progress;
    const crewChanged = assignedCrew !== (selectedReport.assignedUnit || '');
    return progressChanged || crewChanged;
  }, [selectedReport, stagedProgress, assignedCrew]);

  const handleCommitChanges = async () => {
    if (!selectedReport || isSyncing) return;
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onUpdateReport(selectedReport.id, { 
      progress: stagedProgress,
      assignedUnit: assignedCrew || undefined
    });
    setIsSyncing(false);
    setShowSyncSuccess(true);
    setTimeout(() => setShowSyncSuccess(false), 2000);
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row -mt-20 overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col pt-28 pb-10 px-6 sticky top-0 h-screen border-r border-slate-800">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-xs truncate">{user.name.split(' ')[0]} Officer</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{user.department || 'Authority'}</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-grow">
          {[
            { id: 'queue', label: 'Command Queue', icon: <ListTodo size={18} /> },
            { id: 'map', label: 'City Map', icon: <MapIcon size={18} /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id as GovTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                activeTab === link.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Fleet</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>
           {[
             { id: 'Alpha-4', status: 'Online' },
             { id: 'Delta-1', status: 'In Transit' }
           ].map(u => (
             <div key={u.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[9px] font-bold text-slate-300">{u.id}</span>
                <span className="text-[8px] font-black uppercase text-emerald-400">{u.status}</span>
             </div>
           ))}
        </div>
      </aside>

      <main className="flex-grow pt-28 pb-20 px-4 lg:px-8 h-screen overflow-hidden flex flex-col">
        {activeTab === 'queue' ? (
          <div className="flex-grow flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
            <div className={`lg:w-1/3 flex flex-col min-h-0 ${selectedReportId ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-900">Incident Feed</h2>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search ID..." 
                    className="bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-[10px] w-32 focus:ring-1 focus:ring-indigo-500"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar pb-20">
                {filteredReports.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                     <CheckCircle size={32} className="mx-auto mb-3 text-emerald-500 opacity-20" />
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No matching incidents</p>
                  </div>
                ) : filteredReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedReportId === report.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-800 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                       <span className={`text-[9px] font-bold uppercase ${report.severity === 'Critical' ? 'text-red-500 font-black' : ''}`}>{report.severity}</span>
                       <span className="text-[9px] font-bold opacity-50">#{report.id}</span>
                    </div>
                    <h3 className="font-bold text-xs truncate">{report.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[8px] font-bold opacity-40 uppercase tracking-tighter truncate max-w-[150px]">{report.location}</p>
                      {report.assignedUnit && (
                        <div className="flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded text-[7px] font-black text-indigo-600 uppercase">
                           <Truck size={8} /> Dispatched
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`lg:w-2/3 flex flex-col min-h-0 ${!selectedReportId ? 'hidden lg:flex' : 'flex'}`}>
              {selectedReport ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl h-full flex flex-col min-h-0 animate-in fade-in slide-in-from-right-2 duration-300 overflow-hidden relative">
                  {showDispatchMsg && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[50] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 border border-white/20">
                       <Send size={18} className="animate-pulse" />
                       <p className="text-xs font-black uppercase tracking-widest">Information sent to your crew</p>
                    </div>
                  )}

                  <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-shrink-0 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedReportId(null)} className="lg:hidden p-2 bg-slate-100 rounded-lg"><ChevronLeft size={18} /></button>
                      <h3 className="text-lg font-bold text-slate-900 truncate">{selectedReport.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Active Session</span>
                    </div>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-8 min-h-0 custom-scrollbar">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                         <div className="aspect-square rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shadow-inner">
                           {selectedReport.imageUrl ? <img src={selectedReport.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={40} /></div>}
                         </div>
                       </div>
                       
                       <div className="space-y-6">
                         <div className="bg-slate-50 p-6 rounded-2xl">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Incident Location</p>
                           <p className="text-xs font-bold text-slate-800 leading-relaxed">{selectedReport.location}</p>
                         </div>

                         <div className="bg-indigo-900 p-6 rounded-2xl text-white space-y-4 shadow-xl relative overflow-hidden">
                            {selectedReport.assignedUnit && (
                              <div className="absolute top-0 right-0 p-4">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                              </div>
                            )}
                            
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                  <Truck size={16} />
                               </div>
                               <div>
                                  <h4 className="text-[10px] font-black uppercase tracking-widest">Route to Crew</h4>
                                  <p className="text-[8px] text-slate-400">{selectedReport.assignedUnit ? `Assigned to ${selectedReport.assignedUnit}` : 'Assign tactical field units'}</p>
                               </div>
                            </div>
                            
                            <select 
                              className="w-full bg-indigo-800 border border-indigo-700 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                              value={assignedCrew}
                              onChange={(e) => setAssignedCrew(e.target.value)}
                            >
                               <option value="">Select Field Unit</option>
                               <option value="Sanitation-1">Alpha-1 (Sanitation)</option>
                               <option value="Roadworks-4">Delta-4 (Road Maintenance)</option>
                               <option value="Emergency-0">Rapid Response Alpha</option>
                            </select>
                            
                            {/* Manual 'Dispatch Unit' button removed as requested. 
                                Officer now simply assigns and clicks 'Commit Changes' below. */}
                         </div>

                         <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                             <span className="text-slate-400">Resolution Progress</span>
                             <span className="text-indigo-600">{stagedProgress}%</span>
                           </div>
                           <input type="range" className="w-full h-1.5 bg-indigo-100 rounded-full appearance-none accent-indigo-600" value={stagedProgress} onChange={(e) => setStagedProgress(parseInt(e.target.value))} />
                         </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {[
                         { label: 'Unit Link', val: assignedCrew || 'N/A', icon: <Radio size={14} /> },
                         { label: 'Signal', val: '98%', icon: <Wifi size={14} /> },
                         { label: 'Unit Pwr', val: '84%', icon: <Battery size={14} /> },
                       ].map(t => (
                         <div key={t.label} className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">{t.icon}</div>
                            <div>
                               <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{t.label}</p>
                               <p className="text-[10px] font-bold text-slate-800">{t.val}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-50 flex items-center justify-end flex-shrink-0 bg-white">
                    <button 
                      disabled={!isDirty || isSyncing}
                      onClick={handleCommitChanges}
                      className={`px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                        showSyncSuccess ? 'bg-emerald-500 text-white' : !isDirty ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-indigo-600/20'
                      }`}
                    >
                      {isSyncing ? 'Syncing...' : showSyncSuccess ? 'Synced' : 'Commit Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
                  <AlertCircle size={32} className="mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Select an incident to manage</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'map' ? (
          <div className="flex-grow bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 relative min-h-0 h-full">
            <CityMap reports={allReports} onSelect={(id) => { setSelectedReportId(id); setActiveTab('queue'); }} />
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto h-full pb-20 custom-scrollbar pr-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Resolution Rate', val: `${analyticsData.resolutionRate}%`, icon: <CheckCircle2 size={14} />, color: 'text-emerald-500' },
                { label: 'Total Resolved', val: analyticsData.resolved, icon: <CheckCircle size={14} />, color: 'text-indigo-500' },
                { label: 'Critical Load', val: analyticsData.critical, icon: <AlertCircle size={14} />, color: 'text-red-500' },
                { label: 'Avg Progress', val: `${analyticsData.avgProgress}%`, icon: <TrendingUp size={14} />, color: 'text-blue-500' }
              ].map(s => (
                <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-2 mb-2">
                      <div className={s.color}>{s.icon}</div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                   </div>
                   <p className="text-2xl font-bold text-slate-900">{s.val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                           <PieChartIcon size={16} className="text-indigo-500" /> Issue Distribution
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">Breakdown by civic category</p>
                     </div>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={analyticsData.categoryChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {analyticsData.categoryChartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                           <Legend />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                           <TrendingUp size={16} className="text-indigo-500" /> Severity Index
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">Volume per priority level</p>
                     </div>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.severityChartData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                           <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                           <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                              {analyticsData.severityChartData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.name === 'Critical' ? '#ef4444' : entry.name === 'High' ? '#f59e0b' : '#6366f1'} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px]"></div>
               <div className="relative z-10 flex-grow text-center md:text-left">
                  <h4 className="text-2xl font-black tracking-tight mb-2">Fleet Dispatch Performance</h4>
                  <p className="text-slate-400 text-sm font-medium">Currently managing {analyticsData.dispatched} field units across {analyticsData.total} incidents.</p>
               </div>
               <div className="relative z-10 flex gap-8">
                  <div className="text-center">
                     <p className="text-3xl font-black text-emerald-400 leading-none">{analyticsData.resolved}</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Resolved</p>
                  </div>
                  <div className="text-center">
                     <p className="text-3xl font-black text-indigo-400 leading-none">{analyticsData.inProgress}</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Active</p>
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
