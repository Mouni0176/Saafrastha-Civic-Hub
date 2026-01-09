import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import { dbService } from './services/database';
import { supabase } from './services/supabase';
import { Loader2, ShieldCheck, RefreshCw, AlertCircle, X, ArrowRight } from 'lucide-react';

// Lazy load components for performance
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Features = lazy(() => import('./components/Features'));
const FeatureDetail = lazy(() => import('./components/FeatureDetail'));
const About = lazy(() => import('./components/About'));
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const GovDashboard = lazy(() => import('./components/GovDashboard'));
const PublicReports = lazy(() => import('./components/PublicReports'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
const ReportAbuse = lazy(() => import('./components/ReportAbuse'));
const NotificationsView = lazy(() => import('./components/NotificationsView'));
const ReportModal = lazy(() => import('./components/ReportModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const Footer = lazy(() => import('./components/Footer'));

export type UserRole = 'citizen' | 'authority';
export type AppView = 'home' | 'about' | 'features' | 'process' | 'public_reports' | 'dashboard' | 'feature_detail' | 'help_center' | 'report_abuse' | 'notifications';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  reportsCount: number;
  department?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  title: string;
  description: string;
  location: string;
  category: string;
  severity: string;
  status: 'New' | 'In Progress' | 'Resolved';
  progress: number;
  date: string;
  imageUrl?: string;
  supportCount: number;
  disputeCount: number;
  supportedBy: string[];
  disputedBy: string[];
  lat?: number;
  lng?: number;
  assignedUnit?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'status_change' | 'priority' | 'points' | 'system';
  isRead: boolean;
  relatedReportId?: string;
}

const WelcomeOverlay: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] max-w-lg w-full text-center space-y-10 animate-in zoom-in duration-500 border border-white/50 relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="w-24 h-24 bg-emerald-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-600/30 rotate-3">
          <ShieldCheck size={48} />
        </div>
        
        <div className="space-y-4">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Authorization Success</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
            Welcome, <br />{user.name.split(' ')[0]}
          </h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed pt-2">
            Initializing your civic hub. <br />Let's build a cleaner city.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group"
        >
          Entering into Dashboard
          <ArrowRight className="group-hover:translate-x-1.5 transition-transform" size={18} />
        </button>
      </div>
    </div>
  );
};

const ViewLoading: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 animate-pulse">
    <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Civic Grid...</p>
  </div>
);

const App: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [history, setHistory] = useState<AppView[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isViewChanging, setIsViewChanging] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Points Earned!', message: 'You earned 50 points for validating a neighborhood report.', timestamp: '2h ago', type: 'points', isRead: false },
    { id: '2', title: 'Status Update', message: 'Report #SR-1290 has been moved to "In Progress".', timestamp: '5h ago', type: 'status_change', isRead: false },
    { id: '3', title: 'Critical Alert', message: 'New high-priority hazard reported in Sector 4.', timestamp: '1d ago', type: 'priority', isRead: true },
  ]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isHealthy = await Promise.race([
          dbService.init(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 2000))
        ]);

        setIsDbReady(isHealthy);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await dbService.getUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            const hash = window.location.hash.replace('#', '') as AppView;
            setCurrentView(['dashboard', 'about', 'public_reports'].includes(hash) ? hash : 'dashboard');
          }
        }
        
        dbService.getAllReports().then(reps => {
          if (reps) setReports(reps);
        });

      } catch (e) {
        console.warn("Init issue:", e);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await dbService.getUserProfile(session.user.id);
        if (profile) {
          setUser(profile);
          setCurrentView(v => (['home', 'features', 'process'].includes(v) ? 'dashboard' : v));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView('home');
        setHistory([]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleNavigate = useCallback((view: AppView) => {
    if (view === currentView) return;
    setIsViewChanging(true);
    setTimeout(() => {
      setHistory(h => [...h, currentView]);
      setCurrentView(view);
      window.location.hash = view;
      window.scrollTo({ top: 0, behavior: 'auto' });
      setIsViewChanging(false);
    }, 300);
  }, [currentView]);

  const handleBack = useCallback(() => {
    setIsViewChanging(true);
    setTimeout(() => {
      setHistory(prev => {
        if (prev.length === 0) {
          setCurrentView(user ? 'dashboard' : 'home');
          setIsViewChanging(false);
          return prev;
        }
        const newHistory = [...prev];
        const prevView = newHistory.pop()!;
        setCurrentView(prevView);
        window.location.hash = prevView;
        setIsViewChanging(false);
        return newHistory;
      });
    }, 300);
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    setShowWelcome(true);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      setCurrentView('home');
      setHistory([]);
      window.location.hash = 'home';
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const onUpdateReport = async (id: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(x => {
      if (x.id !== id) return x;
      const updated = { ...x, ...updates };
      if (updates.progress === 100) updated.status = 'Resolved' as const;
      else if (updates.progress !== undefined && updates.progress > 0) updated.status = 'In Progress' as const;
      return updated;
    }));
    try { await dbService.updateReport({ ...reports.find(r => r.id === id)!, ...updates }); } catch (e) { console.error(e); }
  };

  const addReport = async (reportData: Partial<Report>) => {
    if (!user) return;
    
    // Optimistic Update
    const tempId = `SR-TEMP-${Math.floor(Math.random() * 1000)}`;
    const newReport: Report = {
      id: tempId,
      reporterId: user.id,
      reporterName: user.name,
      title: reportData.title || 'Untitled Issue',
      description: reportData.description || '',
      location: reportData.location || 'Unknown',
      category: reportData.category || 'General',
      severity: reportData.severity || 'Medium',
      status: 'New',
      progress: 0,
      date: new Date().toLocaleDateString('en-GB'),
      imageUrl: reportData.imageUrl,
      supportCount: 0,
      disputeCount: 0,
      supportedBy: [],
      disputedBy: [],
      lat: reportData.lat,
      lng: reportData.lng
    };

    setReports(prev => [newReport, ...prev]);

    try {
      await dbService.saveReport({ ...newReport, id: `SR-${Math.floor(Math.random() * 9000) + 1000}` });
      const fresh = await dbService.getAllReports();
      setReports(fresh);
    } catch (err) {
      console.error("Save failed:", err);
      // Rollback optimistic update
      setReports(prev => prev.filter(r => r.id !== tempId));
      throw err;
    }
  };

  const handleVote = async (reportId: string, type: 'support' | 'dispute') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const report = reports.find(r => r.id === reportId);
    if (!report || report.supportedBy.includes(user.id) || report.disputedBy.includes(user.id)) return;
    const updated = { ...report };
    if (type === 'support') {
      updated.supportedBy = [...updated.supportedBy, user.id];
      updated.supportCount++;
    } else {
      updated.disputedBy = [...updated.disputedBy, user.id];
      updated.disputeCount++;
    }
    setReports(prev => prev.map(r => r.id === reportId ? updated : r));
    await dbService.updateReport(updated);
  };

  if (isInitializing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <RefreshCw size={40} className="text-emerald-500 animate-spin mb-6" />
      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center opacity-40">Synchronizing Civic Network...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isAuthModalOpen && (
        <Header 
          user={user} 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          onBack={handleBack} 
          onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
          onLogout={handleLogout}
          unreadCount={unreadCount}
        />
      )}

      <main className={`flex-grow transition-all duration-300 ${isAuthModalOpen ? 'pt-0' : 'pt-24'} ${isViewChanging ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <Suspense fallback={<ViewLoading />}>
          <div className="view-transition">
            {(() => {
              switch (currentView) {
                case 'home': return <Hero user={user} onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)} onNavigate={handleNavigate} />;
                case 'about': return <About />;
                case 'features': return <Features onNavigate={handleNavigate} onSelectFeature={(id) => { setSelectedFeatureId(id); handleNavigate('feature_detail'); }} />;
                case 'process': return <HowItWorks />;
                case 'public_reports': return <PublicReports user={user} reports={reports} onVote={handleVote} />;
                case 'feature_detail': return selectedFeatureId !== null ? <FeatureDetail featureId={selectedFeatureId} onBack={handleBack} onGetStarted={() => handleNavigate('home')} /> : <Features onNavigate={handleNavigate} />;
                case 'help_center': return <HelpCenter />;
                case 'report_abuse': return <ReportAbuse />;
                case 'notifications': return <NotificationsView notifications={notifications} onMarkRead={(id) => setNotifications(n => n.map(x => x.id === id ? {...x, isRead: true} : x))} onClear={() => setNotifications([])} />;
                case 'dashboard': return user ? (
                  <div className="container mx-auto px-4 py-8">
                    {user.role === 'citizen' ? (
                      <UserDashboard user={user} userReports={reports.filter(r => r.reporterId === user.id)} publicReports={reports} onVote={handleVote} onOpenReport={() => setIsReportModalOpen(true)} onNavigate={handleNavigate} />
                    ) : (
                      <GovDashboard user={user} allReports={reports} onUpdateReport={onUpdateReport} onNavigate={handleNavigate} />
                    )}
                  </div>
                ) : <Hero user={null} onOpenReport={() => setIsAuthModalOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)} onNavigate={handleNavigate} />;
                default: return <Hero user={user} onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)} onNavigate={handleNavigate} />;
              }
            })()}
          </div>
        </Suspense>
      </main>
      
      {!isAuthModalOpen && (
        <Suspense fallback={null}>
          <Footer onNavigate={handleNavigate} />
        </Suspense>
      )}

      {showWelcome && user && <WelcomeOverlay user={user} onClose={() => setShowWelcome(false)} />}
      {isReportModalOpen && <ReportModal user={user} onReportSubmit={addReport} onClose={() => setIsReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onLogin={handleLogin} onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
};

export default App;