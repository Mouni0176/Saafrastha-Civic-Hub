
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import { dbService } from './services/database';
import { supabase } from './services/supabase';
import { Loader2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

// Lazy load components for performance
const About = lazy(() => import('./components/About'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Features = lazy(() => import('./components/Features'));
const FeatureDetail = lazy(() => import('./components/FeatureDetail'));
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
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-xl w-full text-center space-y-8 animate-in zoom-in duration-500 border border-slate-100">
        <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Welcome, {user.name.split(' ')[0]}
          </h2>
          <p className="text-slate-500 font-medium text-lg">
            Your civic dashboard is ready. Let's build a cleaner city.
          </p>
        </div>
        <button 
          onClick={onClose}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-black transition-all"
        >
          Explore Dashboard
        </button>
      </div>
    </div>
  );
};

const ViewLoading: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-12">
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
  const [dbError, setDbError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Points Earned!', message: 'You earned 50 points for validating a neighborhood report.', timestamp: '2h ago', type: 'points', isRead: false },
    { id: '2', title: 'Status Update', message: 'Report #SR-1290 has been moved to "In Progress".', timestamp: '5h ago', type: 'status_change', isRead: false },
    { id: '3', title: 'Critical Alert', message: 'New high-priority hazard reported in Sector 4.', timestamp: '1d ago', type: 'priority', isRead: true },
  ]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  useEffect(() => {
    const handleSyncProfile = async (session: any) => {
      if (!session?.user) return null;
      try {
        let profile = await dbService.getUserProfile(session.user.id);
        if (!profile) {
          const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Civic Member';
          await dbService.syncProfile(session.user.id, session.user.email!, fullName, 'citizen');
          profile = await dbService.getUserProfile(session.user.id);
        }
        return profile;
      } catch (err) {
        console.error("Profile sync failed:", err);
        return null;
      }
    };

    const checkAuth = async () => {
      try {
        const isHealthy = await Promise.race([
          dbService.init(),
          new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
        ]).catch(() => true);

        setIsDbReady(isHealthy);
        
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await handleSyncProfile(session);
          if (profile) {
            setUser(profile);
            setCurrentView('dashboard');
          }
        }
        
        const initialReports = await dbService.getAllReports();
        setReports(initialReports || []);

      } catch (e) {
        console.warn("Initialization encountered minor issues:", e);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await handleSyncProfile(session);
        if (profile) {
          setUser(profile);
          setCurrentView(v => (['home', 'about', 'features', 'process'].includes(v) ? 'dashboard' : v));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView('home');
        setHistory([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !isDbReady) return;
    const channel = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, async () => {
        const freshReports = await dbService.getAllReports();
        setReports(freshReports);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isDbReady]);

  const dynamicUser = useMemo(() => {
    if (!user) return null;
    const userReports = reports.filter(r => r.reporterId === user.id);
    const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;
    return {
      ...user,
      reportsCount: userReports.length,
      points: (user.points || 0) + (userReports.length * 50) + (resolvedCount * 100)
    };
  }, [user, reports]);

  const handleNavigate = (view: AppView) => {
    if (view !== currentView) {
      setHistory(prev => [...prev, currentView]);
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevHistory = [...history];
      const prevView = prevHistory.pop()!;
      setHistory(prevHistory);
      setCurrentView(prevView);
    } else {
      handleNavigate(user ? 'dashboard' : 'home');
    }
  };

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
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const onUpdateReport = async (id: string, updates: Partial<Report>) => {
    const r = reports.find(x => x.id === id);
    if (!r) return;
    const updated = { ...r, ...updates };
    if (updates.progress === 100) updated.status = 'Resolved' as const;
    else if (updates.progress !== undefined && updates.progress > 0) updated.status = 'In Progress' as const;

    setReports(prev => prev.map(x => x.id === id ? updated : x));
    try { await dbService.updateReport(updated); } catch (e) { console.error(e); }
  };

  const addReport = async (reportData: Partial<Report>) => {
    if (!user) return;
    const newReport: Report = {
      id: `SR-${Math.floor(Math.random() * 9000) + 1000}`,
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
    await dbService.saveReport(newReport);
    const fresh = await dbService.getAllReports();
    setReports(fresh);
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

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  if (isInitializing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <RefreshCw size={48} className="text-emerald-500 animate-spin mb-6" />
      <p className="text-sm font-black text-slate-900 uppercase tracking-widest text-center">Initializing SaafRasta Gateway...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {dbError && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-[150] flex items-center justify-center gap-4 shadow-lg">
           <AlertCircle size={14} />
           <span>{dbError}</span>
           <button onClick={() => window.location.reload()} className="bg-white text-red-600 px-3 py-1 rounded-lg font-bold text-[9px]">Retry</button>
        </div>
      )}
      <Header 
        user={dynamicUser} 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onBack={handleBack} 
        onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onLogout={handleLogout}
        isAuthOpen={isAuthModalOpen}
        unreadCount={unreadCount}
      />
      <main className="flex-grow pt-24">
        <Suspense fallback={<ViewLoading />}>
          {(() => {
            switch (currentView) {
              case 'home': return <Hero user={dynamicUser} onOpenReport={() => dynamicUser ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)} onNavigate={handleNavigate} />;
              case 'about': return <About />;
              case 'features': return <Features onNavigate={handleNavigate} onSelectFeature={(id) => { setSelectedFeatureId(id); handleNavigate('feature_detail'); }} />;
              case 'process': return <HowItWorks />;
              case 'public_reports': return <PublicReports user={dynamicUser} reports={reports} onVote={handleVote} />;
              case 'feature_detail': return selectedFeatureId !== null ? <FeatureDetail featureId={selectedFeatureId} onBack={handleBack} onGetStarted={() => handleNavigate('home')} /> : <Features onNavigate={handleNavigate} />;
              case 'help_center': return <HelpCenter />;
              case 'report_abuse': return <ReportAbuse />;
              case 'notifications': return <NotificationsView notifications={notifications} onMarkRead={markNotificationRead} onClear={clearNotifications} />;
              case 'dashboard': return dynamicUser ? (
                <div className="container mx-auto px-4 py-8">
                  {dynamicUser.role === 'citizen' ? (
                    <UserDashboard 
                      user={dynamicUser} 
                      userReports={reports.filter(r => r.reporterId === dynamicUser.id)} 
                      publicReports={reports}
                      onVote={handleVote}
                      onOpenReport={() => setIsReportModalOpen(true)} 
                      onNavigate={handleNavigate} 
                    />
                  ) : (
                    <GovDashboard user={dynamicUser} allReports={reports} onUpdateReport={onUpdateReport} onNavigate={handleNavigate} />
                  )}
                </div>
              ) : <Hero user={null} onOpenReport={() => setIsAuthModalOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)} onNavigate={handleNavigate} />;
              default: return <Hero user={dynamicUser} onOpenReport={() => dynamicUser ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)} onNavigate={handleNavigate} />;
            }
          })()}
        </Suspense>
      </main>
      
      <Suspense fallback={null}>
        <Footer onNavigate={handleNavigate} />
        {showWelcome && dynamicUser && <WelcomeOverlay user={dynamicUser} onClose={() => setShowWelcome(false)} />}
        {isReportModalOpen && <ReportModal user={dynamicUser} onReportSubmit={addReport} onClose={() => setIsReportModalOpen(false)} />}
        {isAuthModalOpen && <AuthModal onLogin={handleLogin} onClose={() => setIsAuthModalOpen(false)} />}
      </Suspense>
    </div>
  );
};

export default App;
