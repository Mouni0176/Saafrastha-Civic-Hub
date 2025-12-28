
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Report, AppView } from '../App';
import L from 'leaflet';
import { 
  ListTodo, 
  BarChart3, 
  Users, 
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
  Truck,
  Activity,
  XCircle,
  Loader2,
  Zap,
  Radio,
  Wifi,
  Thermometer,
  Gauge,
  RotateCw,
  RefreshCcw,
  Check
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface GovDashboardProps {
  user: User;
  allReports: Report[];
  onUpdateProgress: (id: string, progress: number) => void;
  onNavigate?: (view: AppView) => void;
}

type GovTab = 'queue' | 'map' | 'fleet' | 'analytics';

interface RoutingData {
  target: Report;
  officerLoc: { lat: number; lng: number };
}

interface FleetUnit {
  id: string;
  team: string;
  task: string;
  status: 'Active' | 'Idle' | 'In Transit' | 'On-Site';
  unit: string;
  battery: number;
}

const INITIAL_FLEET: FleetUnit[] = [
  { id: 'U-401', team: 'Squad Alpha', task: 'Road Repair', status: 'Active', unit: 'HDV-Truck', battery: 84 },
  { id: 'U-402', team: 'Sanitation A', task: 'Waste Clearing', status: 'In Transit', unit: 'Compact-Van', battery: 92 },
  { id: 'U-403', team: 'Electrical B', task: 'Maintenance', status: 'On-Site', unit: 'Aerial-Lift', battery: 65 },
  { id: 'U-404', team: 'Squad Gamma', task: 'Pothole Filling', status: 'Idle', unit: 'Mobile-Mixer', battery: 100 },
  { id: 'U-405', team: 'Plumbing Unit', task: 'Water Leak', status: 'Active', unit: 'Service-Rig', battery: 42 },
];

const CityMap: React.FC<{ 
  reports: Report[], 
  onSelect: (id: string) => void,
  routingData?: RoutingData | null,
  onCancelRouting?: () => void
}> = ({ reports, onSelect, routingData, onCancelRouting }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const timer = setTimeout(() => {
      if (leafletMap.current || !mapRef.current) return;

      const center: [number, number] = [28.6139, 77.2090];
      
      leafletMap.current = L.map(mapRef.current, {
        center: center,
        zoom: 12,
        zoomControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
      }).addTo(leafletMap.current);

      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
      routeLayer.current = L.layerGroup().addTo(leafletMap.current);
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
    if (!markersLayer.current || !routeLayer.current || !leafletMap.current) return;
    
    markersLayer.current.clearLayers();
    routeLayer.current.clearLayers();

    if (routingData) {
      const { target, officerLoc } = routingData;
      
      const officerIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #6366f1; width: 24px; height: 24px; border-radius: 8px; border: 3px solid white; box-shadow: 0 0 15px #6366f1; display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const targetIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px #ef4444; display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([officerLoc.lat, officerLoc.lng], { icon: officerIcon }).addTo(routeLayer.current).bindPopup("<b>You are here</b>");
      L.marker([target.lat!, target.lng!], { icon: targetIcon }).addTo(routeLayer.current).bindPopup(`<b>Incident: ${target.title}</b>`);

      const path = L.polyline(
        [[officerLoc.lat, officerLoc.lng], [target.lat!, target.lng!]], 
        { color: '#6366f1', weight: 4, dashArray: '10, 10', opacity: 0.8 }
      ).addTo(routeLayer.current);

      leafletMap.current.fitBounds(path.getBounds(), { padding: [100, 100] });
    } else {
      const validReports = reports.filter(r => r.lat && r.lng);
      validReports.forEach(report => {
        const color = report.severity === 'Critical' ? '#ef4444' : 
                     report.severity === 'High' ? '#f97316' : 
                     report.severity === 'Medium' ? '#eab308' : '#3b82f6';

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}88;"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([report.lat!, report.lng!], { icon: customIcon })
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 5px; min-width: 150px;">
              <h4 style="margin: 0 0 5px 0; font-weight: 800; font-size: 14px; color: #1e293b;">${report.title}</h4>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600;">#${report.id} • ${report.severity}</p>
              <button id="marker-${report.id}" style="margin-top: 10px; width: 100%; padding: 8px; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 10px;">View Case</button>
            </div>
          `, { closeButton: false, offset: [0, -5] });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`marker-${report.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelect(report.id);
              leafletMap.current?.closePopup();
            };
          }
        });

        markersLayer.current?.addLayer(marker);
      });

      if (validReports.length > 0 && leafletMap.current) {
        const bounds = L.latLngBounds(validReports.map(r => [r.lat!, r.lng!] as [number, number]));
        leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        leafletMap.current.invalidateSize();
      }
    }
  };

  useEffect(() => {
    updateView();
  }, [reports, routingData]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div ref={mapRef} id="map-container" className="bg-slate-50 flex-grow" />
      {routingData && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
           <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center animate-pulse">
                    <Navigation size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Routing to Incident</p>
                    <p className="text-sm font-bold truncate max-w-[150px]">{routingData.target.title}</p>
                 </div>
              </div>
              <button 
                onClick={onCancelRouting}
                className="p-3 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
              >
                <XCircle size={24} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

const GovDashboard: React.FC<GovDashboardProps> = ({ user, allReports, onUpdateProgress, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<GovTab>('queue');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [routingData, setRoutingData] = useState<RoutingData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Staged progress state for Commit Changes
  const [stagedProgress, setStagedProgress] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Fleet management states
  const [fleetUnits, setFleetUnits] = useState<FleetUnit[]>(INITIAL_FLEET);
  const [activeTelemetry, setActiveTelemetry] = useState<FleetUnit | null>(null);
  const [activeCommand, setActiveCommand] = useState<FleetUnit | null>(null);
  const [telemetryStream, setTelemetryStream] = useState({ speed: 0, load: 0, temp: 0, signal: 0 });

  // Update telemetry data periodically when open
  useEffect(() => {
    if (!activeTelemetry) return;
    const interval = setInterval(() => {
      setTelemetryStream({
        speed: Math.floor(Math.random() * 40) + 20,
        load: Math.floor(Math.random() * 30) + 40,
        temp: Math.floor(Math.random() * 10) + 32,
        signal: Math.floor(Math.random() * 20) + 80,
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [activeTelemetry]);

  const selectedReport = useMemo(() => 
    allReports.find(r => r.id === selectedReportId), 
    [allReports, selectedReportId]
  );

  // Synchronize staged progress when report changes
  useEffect(() => {
    if (selectedReport) {
      setStagedProgress(selectedReport.progress);
    }
  }, [selectedReportId]);

  const filteredReports = useMemo(() => {
    return allReports
      .filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.includes(searchTerm);
        const matchesSeverity = filterSeverity === 'All' || r.severity === filterSeverity;
        return matchesSearch && matchesSeverity;
      })
      .sort((a, b) => {
        if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
        if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
        const severityOrder: Record<string, number> = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }, [allReports, searchTerm, filterSeverity]);

  const handleRouteToCrew = () => {
    if (!selectedReport || !selectedReport.lat || !selectedReport.lng) {
      alert("This report does not have valid GPS coordinates.");
      return;
    }

    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRoutingData({
          target: selectedReport,
          officerLoc: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
        setActiveTab('map');
        setIsLocating(false);
      },
      (error) => {
        console.error("Error fetching officer location:", error);
        alert("Could not fetch your current location. Please check permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCommitChanges = async () => {
    if (!selectedReport || isSyncing) return;
    
    setIsSyncing(true);
    
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onUpdateProgress(selectedReport.id, stagedProgress);
    
    setIsSyncing(false);
    setShowSyncSuccess(true);
    
    // Reset success visual after 3 seconds
    setTimeout(() => {
      setShowSyncSuccess(false);
    }, 3000);
  };

  const updateFleetUnit = (id: string, updates: Partial<FleetUnit>) => {
    setFleetUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (activeCommand?.id === id) {
      setActiveCommand(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const renderFleet = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full pb-20">
      {fleetUnits.map((unit, i) => (
        <div key={unit.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 group hover:border-indigo-200 transition-all h-fit">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-slate-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Truck size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{unit.team}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unit.id} • {unit.unit}</p>
               </div>
            </div>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg tracking-widest uppercase ${
              unit.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
              unit.status === 'Idle' ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'
            }`}>
              {unit.status}
            </span>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Current Objective</span>
                <span className="text-xs font-black text-slate-800">{unit.task}</span>
             </div>
             <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Energy Reserves</span>
                   <span>{unit.battery}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                   <div className={`h-full ${unit.battery < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${unit.battery}%`}}></div>
                </div>
             </div>
          </div>
          <div className="pt-4 border-t border-slate-50 flex gap-2">
             <button 
                onClick={() => setActiveCommand(unit)}
                className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:scale-95"
             >
                Command
             </button>
             <button 
                onClick={() => setActiveTelemetry(unit)}
                className="flex-1 py-3 bg-white border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all active:scale-95"
             >
                Telemetry
             </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => {
    const pieData = [
      { name: 'Roads', value: 45, color: '#6366f1' },
      { name: 'Electrical', value: 25, color: '#10b981' },
      { name: 'Sanitation', value: 30, color: '#f59e0b' },
    ];
    const timelineData = [
      { time: '08:00', load: 12, res: 5 },
      { time: '12:00', load: 38, res: 18 },
      { time: '16:00', load: 42, res: 35 },
      { time: '20:00', load: 22, res: 20 },
    ];
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full pb-20 px-1">
        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">System Resolution Velocity</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Incident vs Resolution Throughput</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incoming</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed</span>
                    </div>
                 </div>
              </div>
              <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                       <defs>
                          <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                       <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                       <Area type="monotone" dataKey="load" stroke="#6366f1" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={4} />
                       <Area type="monotone" dataKey="res" stroke="#10b981" fill="transparent" strokeWidth={4} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-between shadow-2xl min-h-[400px]">
              <div>
                <h3 className="text-xl font-black mb-1">Issue Distribution</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sector Segment Breakdown</p>
              </div>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                 {pieData.map(d => (
                   <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                        <span className="text-xs font-bold text-slate-300">{d.name}</span>
                      </div>
                      <span className="text-xs font-black">{d.value}%</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
           {[
             { label: 'Avg Resolution Time', val: '4.2h', diff: '-12%', icon: <Clock /> },
             { label: 'SLA Fulfillment', val: '98.4%', diff: '+0.2%', icon: <CheckCircle2 /> },
             { label: 'Citizen Satisfaction', val: '4.8/5', diff: 'Optimal', icon: <Activity /> },
             { label: 'Active Personnel', val: '142', diff: 'Morning Shift', icon: <Users /> }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
                <div className="flex justify-between items-start mb-4 text-slate-400">
                   {stat.icon}
                   <span className="text-[10px] font-black text-emerald-600 uppercase">{stat.diff}</span>
                </div>
                <p className="text-3xl font-black text-slate-900">{stat.val}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const sidebarLinks = [
    { id: 'queue', label: 'Dispatch Queue', icon: <ListTodo size={20} /> },
    { id: 'map', label: 'City Hub Map', icon: <MapIcon size={20} /> },
    { id: 'fleet', label: 'Fleet Systems', icon: <Truck size={20} /> },
    { id: 'analytics', label: 'Macro Insights', icon: <BarChart3 size={20} /> },
  ];

  const handleMarkerSelect = (id: string) => {
    setSelectedReportId(id);
    setActiveTab('queue');
    setRoutingData(null);
  };

  const isDirty = selectedReport && stagedProgress !== selectedReport.progress;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row -mt-20 overflow-hidden">
      <aside className="hidden lg:flex w-72 bg-slate-900 flex-col pt-32 pb-10 px-6 sticky top-0 h-screen border-r border-slate-800 flex-shrink-0">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <ShieldCheck size={24} />
             </div>
             <div>
                <h4 className="text-white font-bold text-sm tracking-tight">{user.name.split(' ')[0]} Officer</h4>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mt-1">{user.department || 'Municipal Command'}</p>
             </div>
          </div>
        </div>
        <nav className="space-y-1.5 flex-grow overflow-y-auto custom-scrollbar pr-1">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id as GovTab);
                if (link.id !== 'map') setRoutingData(null);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest ${
                activeTab === link.id 
                  ? 'bg-white/10 text-white border border-white/10 shadow-xl' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </nav>
        <div className="pt-6 border-t border-slate-800">
          <div className="bg-indigo-600/10 p-5 rounded-[2rem] border border-indigo-500/20">
            <h5 className="font-bold text-indigo-400 text-[10px] uppercase tracking-widest mb-3">Live Feed Status</h5>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Gateway: Active</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-grow pt-32 pb-20 px-4 lg:px-8 flex flex-col h-screen overflow-hidden relative">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col overflow-hidden">
          {activeTab === 'queue' ? (
            <div className="flex-grow flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
              <div className={`lg:w-1/2 flex flex-col min-h-0 h-full ${selectedReportId ? 'hidden lg:flex' : 'flex'}`}>
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="pr-4">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Active Incident Feed</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {filteredReports.filter(r => r.status !== 'Resolved').length} Unresolved Issues
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filter ID..." 
                      className="bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium w-32 sm:w-40 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-24 lg:pb-8 min-h-0">
                  {filteredReports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setShowSyncSuccess(false);
                      }}
                      className={`w-full text-left p-5 rounded-3xl border transition-all flex flex-col gap-3 group h-fit ${
                        selectedReportId === report.id 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20' 
                          : 'bg-white border-slate-100 hover:border-slate-300 text-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded tracking-tighter uppercase ${
                            report.severity === 'Critical' ? 'bg-orange-500 text-white' : 
                            report.severity === 'High' ? 'bg-amber-100 text-amber-700' : 
                            selectedReportId === report.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {report.severity}
                          </span>
                          <span className={`text-[10px] font-bold ${selectedReportId === report.id ? 'text-slate-400' : 'text-slate-300'}`}>
                            #{report.id}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold ${selectedReportId === report.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                          {report.date}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm line-clamp-1">{report.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <MapPin size={12} className={selectedReportId === report.id ? 'text-indigo-400 shrink-0' : 'text-slate-400 shrink-0'} />
                          <span className="text-[10px] font-bold truncate opacity-70">{report.location.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={`w-12 h-1 bg-current opacity-20 rounded-full overflow-hidden`}>
                            <div className={`h-full ${report.status === 'Resolved' ? 'bg-emerald-400' : 'bg-indigo-400'}`} style={{width: `${report.progress}%`}}></div>
                          </div>
                          <span className="text-[10px] font-black">{report.progress}%</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`lg:w-1/2 flex flex-col min-h-0 h-full ${!selectedReportId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedReport ? (
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 min-h-0">
                    <div className="p-6 sm:px-8 sm:py-7 border-b border-slate-50 flex flex-shrink-0 items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <button 
                          onClick={() => {
                            setSelectedReportId(null);
                            setShowSyncSuccess(false);
                          }}
                          className="lg:hidden p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Incident Profile</p>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">{selectedReport.title}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6 sm:p-8 min-h-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
                        <div className="space-y-6">
                          <div className="aspect-square rounded-[2rem] bg-slate-50 overflow-hidden border border-slate-100 group relative shadow-inner">
                            {selectedReport.imageUrl ? (
                              <img src={selectedReport.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <ImageIcon size={48} />
                              </div>
                            )}
                          </div>
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <MapPin size={12} className="text-indigo-600" /> Dispatch Location
                            </h5>
                            <p className="text-sm font-bold text-slate-800 leading-relaxed mb-4 line-clamp-2">{selectedReport.location}</p>
                            <button 
                              onClick={handleRouteToCrew}
                              disabled={isLocating}
                              className="w-full py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                            >
                               {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />} 
                               {isLocating ? 'Locating...' : 'Route to Crew'}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Incident Metadata</h5>
                            <div className="space-y-1">
                              {[
                                { label: 'Reporter', value: selectedReport.reporterName },
                                { label: 'Urgency', value: selectedReport.severity, color: selectedReport.severity === 'Critical' ? 'text-red-500' : 'text-amber-500' },
                                { label: 'Support', value: `${selectedReport.supportCount} Citizens` },
                              ].map((meta, i) => (
                                <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{meta.label}</span>
                                  <span className={`text-xs font-black truncate max-w-[120px] text-right ${meta.color || 'text-slate-800'}`}>{meta.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <CheckCircle size={18} />
                              </div>
                              <h5 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Resolution Control</h5>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                 <span className="text-slate-400">Task Completion</span>
                                 <span className="text-indigo-600">{stagedProgress}%</span>
                              </div>
                              <input 
                                type="range" 
                                className="w-full h-2.5 bg-indigo-100 rounded-full appearance-none accent-indigo-600 cursor-pointer shadow-inner mb-4"
                                value={stagedProgress}
                                onChange={(e) => {
                                  setStagedProgress(parseInt(e.target.value));
                                  setShowSyncSuccess(false);
                                }}
                              />
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: 'New', val: 0 },
                                  { label: 'Progress', val: 50 },
                                  { label: 'Resolved', val: 100 }
                                ].map(st => (
                                  <button 
                                    key={st.label}
                                    onClick={() => {
                                      setStagedProgress(st.val);
                                      setShowSyncSuccess(false);
                                    }}
                                    className={`py-2.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center ${
                                      stagedProgress === st.val 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'bg-white border border-indigo-100 text-indigo-400 hover:bg-indigo-50 shadow-sm'
                                    }`}
                                  >
                                    {st.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 sm:px-8 sm:py-7 border-t border-slate-50 flex items-center justify-between flex-shrink-0 bg-white/80 backdrop-blur-md sticky bottom-0 z-20">
                      <div className="hidden sm:flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {isSyncing ? 'Synchronizing Node...' : (isDirty ? 'Unsaved Local Changes' : 'Terminal Synced')}
                        </span>
                      </div>
                      <button 
                        disabled={!isDirty || isSyncing}
                        className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                          showSyncSuccess 
                            ? 'bg-emerald-500 text-white' 
                            : !isDirty 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                        }`}
                        onClick={handleCommitChanges}
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCcw size={16} className="animate-spin" />
                            Syncing...
                          </>
                        ) : showSyncSuccess ? (
                          <>
                            <Check size={16} />
                            Committed
                          </>
                        ) : (
                          'Commit Changes'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 shadow-inner">
                      <AlertCircle size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Selection Required</h3>
                    <p className="text-slate-400 font-medium max-w-xs mt-2">Pick an incident from the feed to access terminal controls.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'map' ? (
            <div className="flex-grow bg-white rounded-[3rem] shadow-xl overflow-hidden relative border border-slate-100 min-h-0 h-full">
               <div className="absolute top-8 left-8 z-[10] flex flex-col gap-2">
                  <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-100">
                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        {routingData ? 'Active Navigation' : 'City Hub Topology'}
                     </h3>
                     <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest leading-none">
                        {routingData ? 'Routing Path Calculated' : 'Sector 4 Dispatch Monitoring'}
                     </p>
                  </div>
               </div>
               <CityMap 
                 reports={allReports} 
                 onSelect={handleMarkerSelect} 
                 routingData={routingData}
                 onCancelRouting={() => setRoutingData(null)}
               />
            </div>
          ) : activeTab === 'fleet' ? (
             <div className="flex-grow min-h-0 overflow-hidden">{renderFleet()}</div>
          ) : (
             <div className="flex-grow min-h-0 overflow-hidden">{renderAnalytics()}</div>
          )}
        </div>

        {/* Command Overlay */}
        {activeCommand && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setActiveCommand(null)} />
             <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-8">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 text-white rounded-2xl">
                         <Truck size={24} />
                      </div>
                      <div>
                         <h3 className="font-black text-slate-900 uppercase tracking-tight">Command Center</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeCommand.team} • {activeCommand.id}</p>
                      </div>
                   </div>
                   <button onClick={() => setActiveCommand(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><XCircle size={24} className="text-slate-300" /></button>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Active', 'Idle', 'In Transit', 'On-Site'].map(st => (
                           <button 
                             key={st}
                             onClick={() => updateFleetUnit(activeCommand.id, { status: st as any })}
                             className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                               activeCommand.status === st ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                             }`}
                           >
                             {st}
                           </button>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Task</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                        value={activeCommand.task}
                        onChange={(e) => updateFleetUnit(activeCommand.id, { task: e.target.value })}
                      />
                   </div>
                   <button 
                      onClick={() => setActiveCommand(null)}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4"
                   >
                      Confirm Dispatch
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Telemetry Overlay */}
        {activeTelemetry && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm" onClick={() => setActiveTelemetry(null)} />
             <div className="relative bg-slate-800 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/5">
                <div className="p-8 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="relative">
                         <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                            <Radio size={24} className="animate-pulse" />
                         </div>
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping"></div>
                      </div>
                      <div>
                         <h3 className="font-black text-white uppercase tracking-tight">Live Telemetry</h3>
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{activeTelemetry.team} Systems Feed</p>
                      </div>
                   </div>
                   <button onClick={() => setActiveTelemetry(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XCircle size={28} className="text-slate-600" /></button>
                </div>
                
                <div className="p-8 grid grid-cols-2 gap-4">
                   {[
                     { label: 'Ground Speed', val: `${telemetryStream.speed} KM/H`, icon: <Gauge className="text-indigo-400" />, sub: 'Optimal Range' },
                     { label: 'System Temp', val: `${telemetryStream.temp}°C`, icon: <Thermometer className="text-amber-400" />, sub: 'Core Stabilized' },
                     { label: 'Network Signal', val: `${telemetryStream.signal}%`, icon: <Wifi className="text-blue-400" />, sub: '5G Low Latency' },
                     { label: 'Current Load', val: `${telemetryStream.load}%`, icon: <RotateCw className="text-emerald-400" />, sub: 'Payload Validated' },
                   ].map((t, i) => (
                     <div key={i} className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 space-y-3">
                        <div className="flex items-center gap-3">
                           {t.icon}
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.label}</span>
                        </div>
                        <div>
                           <p className="text-2xl font-black text-white tracking-tighter">{t.val}</p>
                           <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">{t.sub}</p>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                           <div className="h-full bg-current transition-all duration-1000 opacity-20" style={{width: `${Math.random() * 40 + 60}%`}}></div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="p-8 pt-0">
                   <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-3 border border-indigo-500/20">
                      <Zap size={16} className="text-indigo-500" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-grow">Awaiting Sector 4 Update...</p>
                      <div className="flex gap-1">
                         <div className="w-1 h-3 bg-indigo-500 animate-bounce"></div>
                         <div className="w-1 h-3 bg-indigo-500 animate-bounce [animation-delay:0.2s]"></div>
                         <div className="w-1 h-3 bg-indigo-500 animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-3.5 flex justify-around items-center z-50 rounded-t-[2.5rem] shadow-2xl">
        {sidebarLinks.map(link => (
          <button
            key={link.id}
            onClick={() => {
              setActiveTab(link.id as GovTab);
              if (link.id !== 'map') setRoutingData(null);
              setSelectedReportId(null);
            }}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all min-w-[60px] ${
              activeTab === link.id ? 'text-white bg-indigo-600 shadow-xl shadow-indigo-600/20' : 'text-slate-500'
            }`}
          >
            {React.cloneElement(link.icon as React.ReactElement<any>, { size: 20 })}
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">{link.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default GovDashboard;
