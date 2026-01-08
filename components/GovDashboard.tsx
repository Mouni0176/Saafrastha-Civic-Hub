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
  Send,
  PieChart as PieChartIcon,
  Activity,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px ${color};"></div>`,
        iconSize: [14, 14]
      });
      const marker = L.marker([report.lat!, report.lng!], { icon: customIcon })
        .bindPopup(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 12px; min-width: 180px;">
            <p style="margin: 0; font-size: 8px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">${report.id}</p>
            <h4 style="margin: 4px 0 12px; font-weight: 800; font-size: 14px; color: #0f172a; line-height: 1.2;">${report.title}</h4>
            <button id="marker-${report.id}" style="width: 100%; padding: 10px; background: #0f172a; color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;">Initiate Review</button>
          </div>
        `, { closeButton: false, className: 'custom-popup' });
      marker.on('popupopen', () => {
        const btn = document.getElementById(`marker-${report.id}`);
        if (btn) btn.onclick = () => onSelect(report.id);
      });
      markersLayer.current?.addLayer(marker);
    });
    if (validReports.length > 0 && leafletMap.current) {
      const bounds = L.latLngBounds(validReports.map(r => [r.lat!, r.lng!] as [number, number]));
      leafletMap.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    }
  };

  useEffect(() => { updateView(); }, [reports]);

  return <div ref={mapRef} id="map-container" className="bg-slate-100 w-full h-full" />;
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

    const categories: Record<string, number> = {};
    allReports.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    const categoryChartData = Object.entries(categories).map(([name, value]) => ({ name, value }));

    const severities: Record<string, number> = { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
    allReports.forEach(r => {
      if (severities.hasOwnProperty(r.severity)) {
        severities[r.severity]++;
      }
    });
    const severityChartData = Object.entries(severities).map(([name, value]) => ({ name, value }));

    return { 
      total, 
      resolved, 
      critical, 
      inProgress, 
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

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row -mt-24">
      {/* SaaS Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-950 flex-col pt-32 pb-10 px-8 sticky top-0 h-screen border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.1)]">
        <div className="mb-12 flex items-center gap-4 p-4 bg-white/5 rounded-[2rem] border border-white/5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <UserIcon size={24} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-black text-xs tracking-tight truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate">{user.department || 'Dispatcher'}</p>
            </div>
          </div>
        </div>
        
        <nav className="space-y-3 flex-grow">
          {[
            { id: 'queue', label: 'Incident Queue', icon: <ListTodo size={20} /> },
            { id: 'map', label: 'Tactical View', icon: <MapIcon size={20} /> },
            { id: 'analytics', label: 'Performance', icon: <BarChart3 size={20} /> },
          ].map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id as GovTab)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                activeTab === link.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                {link.icon}
                {link.label}
              </div>
              {activeTab === link.id && <ArrowRight size={14} />}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
              <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[8px] font-black tracking-widest">SECURE</div>
           </div>
           <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Units</p>
              <div className="flex -space-x-2">
                 {[1,2,3,4].map(i => <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-950 bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">U{i}</div>)}
              </div>
           </div>
        </div>
      </aside>

      {/* Main Command View */}
      <main className="flex-grow pt-32 pb-20 px-6 lg:px-12 h-screen overflow-hidden flex flex-col">
        {activeTab === 'queue' ? (
          <div className="flex-grow flex flex-col lg:flex-row gap-8 min-h-0 overflow-hidden">
            
            {/* List Sidebar */}
            <div className={`lg:w-[400px] flex flex-col min-h-0 ${selectedReportId ? 'hidden lg:flex' : 'flex'}`}>
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Incidents</h2>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search Node..." 
                    className="bg-white border border-slate-200 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-black w-48 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all uppercase"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto space-y-3 pr-3 custom-scrollbar pb-24">
                {filteredReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group ${
                      selectedReportId === report.id 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/10' 
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${report.severity === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`}></div>
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{report.id}</span>
                       </div>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                         report.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-400'
                       }`}>{report.status}</span>
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tight line-clamp-1 mb-2">{report.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold opacity-40">
                       <MapPin size={10} />
                       <span className="truncate">{report.location.split(',')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail View */}
            <div className={`flex-grow flex flex-col min-h-0 ${!selectedReportId ? 'hidden lg:flex' : 'flex'}`}>
              {selectedReport ? (
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl h-full flex flex-col min-h-0 animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden relative">
                  
                  {/* Status Notifications */}
                  {showDispatchMsg && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 animate-in slide-in-from-top-4 duration-700 border border-white/10">
                       <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                          <Send size={18} className="text-white" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Data Synchronized</p>
                          <p className="text-xs font-bold text-slate-400">Tactical units informed</p>
                       </div>
                    </div>
                  )}

                  {/* Header Bar */}
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-6">
                      <button onClick={() => setSelectedReportId(null)} className="lg:hidden p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"><ChevronLeft size={20} /></button>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Profile • {selectedReport.id}</p>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedReport.title}</h3>
                      </div>
                    </div>
                    <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                      selectedReport.severity === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedReport.severity} Severity
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="flex-grow overflow-y-auto p-10 space-y-12 min-h-0 custom-scrollbar bg-slate-50/30">
                    <div className="grid lg:grid-cols-2 gap-12">
                       {/* Evidence Visual */}
                       <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Evidence</h4>
                          <div className="aspect-square rounded-[2.5rem] bg-white overflow-hidden border border-slate-200 shadow-xl group relative">
                            {selectedReport.imageUrl ? (
                              <>
                                <img src={selectedReport.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Incident Evidence" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                   <p className="text-white text-xs font-bold">Captured {selectedReport.date}</p>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-4">
                                <ImageIcon size={64} />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Visual Record</p>
                              </div>
                            )}
                          </div>
                       </div>
                       
                       {/* Control Station */}
                       <div className="space-y-10">
                         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                               <Truck size={100} />
                            </div>
                            
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                  <Truck size={24} className="text-emerald-400" />
                               </div>
                               <div>
                                  <h4 className="text-lg font-black uppercase tracking-tight">Fleet Dispatch</h4>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Assign Tactical Team</p>
                               </div>
                            </div>
                            
                            <div className="space-y-4">
                              <select 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                                value={assignedCrew}
                                onChange={(e) => setAssignedCrew(e.target.value)}
                              >
                                 <option value="" className="bg-slate-900">Select Fleet Node</option>
                                 <option value="Alpha-1" className="bg-slate-900">Unit Alpha-1 (Sanitation)</option>
                                 <option value="Delta-4" className="bg-slate-900">Unit Delta-4 (Engineering)</option>
                                 <option value="Rapid-A" className="bg-slate-900">Rapid Response Alpha</option>
                                 <option value="Civic-V" className="bg-slate-900">Volunteer Network</option>
                              </select>

                              <button 
                                 onClick={handleDispatch}
                                 disabled={!assignedCrew}
                                 className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.75rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-2xl shadow-emerald-600/20 active:scale-95"
                              >
                                 <Send size={16} /> Broadcast Dispatch
                              </button>
                            </div>
                         </div>

                         {/* Progress Modulation */}
                         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                           <div className="flex justify-between items-end">
                             <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Progress</p>
                               <h5 className="text-3xl font-black text-indigo-600 leading-none">{stagedProgress}%</h5>
                             </div>
                             <div className="flex gap-2">
                                {[25, 50, 75, 100].map(v => (
                                  <button key={v} onClick={() => setStagedProgress(v)} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black hover:bg-indigo-50 hover:text-indigo-600 transition-all">{v}</button>
                                ))}
                             </div>
                           </div>
                           <div className="relative pt-4">
                              <input 
                                type="range" 
                                className="w-full h-2.5 bg-slate-100 rounded-full appearance-none accent-indigo-600 cursor-pointer" 
                                value={stagedProgress} 
                                onChange={(e) => setStagedProgress(parseInt(e.target.value))} 
                              />
                           </div>
                         </div>
                       </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-slate-100">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Geographic Node</p>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><MapPin size={18} /></div>
                             <p className="text-xs font-bold text-slate-700 leading-tight">{selectedReport.location}</p>
                          </div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-slate-200">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Validation Hub</p>
                          <div className="flex items-center gap-6">
                             <div className="text-center">
                                <p className="text-lg font-black text-emerald-600">{selectedReport.supportCount}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Upvotes</p>
                             </div>
                             <div className="w-px h-8 bg-slate-100"></div>
                             <div className="text-center">
                                <p className="text-lg font-black text-rose-600">{selectedReport.disputeCount}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Disputes</p>
                             </div>
                          </div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-slate-200">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">System Logic</p>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center"><Zap size={18} /></div>
                             <p className="text-xs font-bold text-slate-700">Auto-Prioritized</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Commit Controls */}
                  <div className="p-8 border-t border-slate-100 flex items-center justify-end bg-white gap-4">
                    <button onClick={() => setSelectedReportId(null)} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard Draft</button>
                    <button 
                      disabled={!isDirty || isSyncing}
                      onClick={handleCommitChanges}
                      className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all min-w-[180px] shadow-xl ${
                        showSyncSuccess ? 'bg-emerald-500 text-white' : !isDirty ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'
                      }`}
                    >
                      {isSyncing ? 'Syncing...' : showSyncSuccess ? 'Synchronized' : 'Commit Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-300 space-y-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
                    <AlertCircle size={48} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black uppercase tracking-widest text-slate-900">Station Idle</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Awaiting Node Selection</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'map' ? (
          <div className="flex-grow bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 relative h-full">
            <div className="absolute top-8 left-8 z-[100] p-6 glass-morphism rounded-[2rem] shadow-2xl border border-white/50 max-w-xs space-y-4">
               <h3 className="text-lg font-black tracking-tight text-slate-900">Geospatial Overlay</h3>
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Critical nodes identified</span>
               </div>
               <p className="text-xs font-medium text-slate-500 leading-relaxed">Interactive tactical map of Sector 4. Select nodes to view deep metrics.</p>
            </div>
            <CityMap reports={allReports} onSelect={(id) => { setSelectedReportId(id); setActiveTab('queue'); }} />
          </div>
        ) : (
          <div className="space-y-10 overflow-y-auto h-full pb-32 custom-scrollbar pr-4">
            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'SLA Success', val: `${analyticsData.resolutionRate}%`, icon: <CheckCircle size={20} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                { label: 'Infrastructure Repaired', val: analyticsData.resolved, icon: <CheckCircle size={20} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                { label: 'Critical Breaches', val: analyticsData.critical, icon: <AlertCircle size={20} />, color: 'bg-red-50 text-red-600 border-red-100' },
                { label: 'System Health', val: `Active`, icon: <Activity size={20} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
              ].map(s => (
                <div key={s.label} className={`bg-white p-8 rounded-[2.5rem] border ${s.color.split(' ')[2]} shadow-sm transition-all hover:shadow-xl`}>
                   <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-xl ${s.color.split(' ')[0]} ${s.color.split(' ')[1]}`}>{s.icon}</div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{s.label}</p>
                   </div>
                   <p className="text-4xl font-black text-slate-900 tracking-tighter">{s.val}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-12 gap-8">
               <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><PieChartIcon size={20} /></div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Incident Distribution</h3>
                     </div>
                  </div>
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.categoryChartData}
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {analyticsData.categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '20px' }}
                           itemStyle={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}
                        />
                        <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ paddingLeft: '30px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '800' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="lg:col-span-5 space-y-8">
                  <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                        <Zap size={160} />
                     </div>
                     <div className="relative z-10 space-y-6">
                        <h4 className="text-2xl font-black tracking-tight leading-none">Transparency Ledger</h4>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Operational Pulse</p>
                        
                        <div className="grid grid-cols-2 gap-8 pt-6">
                           <div className="space-y-2">
                              <p className="text-3xl font-black text-emerald-400 leading-none">{analyticsData.resolved}</p>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fixed Nodes</p>
                           </div>
                           <div className="space-y-2 text-right">
                              <p className="text-3xl font-black text-indigo-400 leading-none">{analyticsData.inProgress}</p>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Ops</p>
                           </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-white/5">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Node Sync Velocity</span>
                              <span className="text-[10px] font-black text-emerald-400">OPTIMAL</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full w-4/5 bg-emerald-500 rounded-full animate-pulse"></div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex-grow">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                        <Activity size={14} className="text-indigo-500" /> Resolution Heat
                     </h3>
                     <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.severityChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '800', fill: '#94a3b8' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
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