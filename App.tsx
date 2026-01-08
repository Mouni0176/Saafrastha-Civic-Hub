
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import FeatureDetail from './components/FeatureDetail';
import Challenges from './components/Challenges';
import Impact from './components/Impact';
import WhyUs from './components/WhyUs';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ReportModal from './components/ReportModal';
import AuthModal from './components/AuthModal';
import UserDashboard from './components/UserDashboard';
import GovDashboard from './components/GovDashboard';
import PublicReports from './components/PublicReports';
import HelpCenter from './components/HelpCenter';
import ReportAbuse from './components/ReportAbuse';
import NotificationsView from './components/NotificationsView';
import { dbService } from './services/database';
import { supabase } from './services/supabase';
import { Loader2, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';

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

const SQL_SETUP_CODE = `-- SAAFRASTA DATABASE SCHEMA FIX
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'citizen',
  department TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT,
  reporter_name TEXT,
  title TEXT,
  description TEXT,
  location TEXT,
  category TEXT,
  severity TEXT,
  status TEXT DEFAULT 'New',
  progress INTEGER DEFAULT 0,
  image_url TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  support_count INTEGER DEFAULT 0,
  dispute_count INTEGER DEFAULT 0,
  supported_by TEXT[] DEFAULT '{}',
  disputed_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable All Access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable All Access" ON reports FOR ALL USING (true) WITH CHECK (true);`;

const WelcomeOverlay: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, []);

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
            Your civic dashboard is ready. Let's work together to build a cleaner city.
          </p>
        </div>
        <button 
          onClick={onClose}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-black transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [history, setHistory] = useState<AppView[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);

  useEffect(() => {
    const handleSyncProfile = async (session: any) => {
      if (!session?.user) return null;
      let profile = await dbService.getUserProfile(session.user.id);
      if (!profile) {
        const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Civic Member';
        await dbService.syncProfile(session.user.id, session.user.email!, fullName, 'citizen');
        profile = await dbService.getUserProfile(session.user.id);
      }
      return profile;
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await handleSyncProfile(session);
        if (profile) {
          setUser(profile);
          setCurrentView('dashboard');
        }
      }
      const isHealthy = await dbService.init();
      if (!isHealthy) setDbError("Database synchronization required.");
      else {
        setIsDbReady(true);
        const initialReports = await dbService.getAllReports();
        setReports(initialReports);
      }
      setIsInitializing(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        const profile = await handleSyncProfile(session);
        if (profile) {
          setUser(profile);
          if (currentView === 'home' || currentView === 'about' || currentView === 'features') {
            setCurrentView('dashboard');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView('home');
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
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

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_SETUP_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      setUser(null);
      setCurrentView('home');
    }
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
    if (!user) return setIsAuthModalOpen(true);
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

  const renderContent = () => {
    if (isInitializing && !user) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 size={32} className="text-emerald-500 animate-spin" />
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Hub...</p>
      </div>
    );

    switch (currentView) {
      case 'about': return <About />;
      case 'features': return <Features onNavigate={handleNavigate} onSelectFeature={(id) => { setSelectedFeatureId(id); handleNavigate('feature_detail'); }} />;
      case 'process': return <HowItWorks />;
      case 'public_reports': return <PublicReports user={dynamicUser} reports={reports} onVote={handleVote} />;
      case 'feature_detail': return selectedFeatureId !== null ? <FeatureDetail featureId={selectedFeatureId} onBack={handleBack} onGetStarted={() => handleNavigate('home')} /> : <Features onNavigate={handleNavigate} />;
      case 'help_center': return <HelpCenter />;
      case 'report_abuse': return <ReportAbuse />;
      case 'notifications': return <NotificationsView notifications={[]} onMarkRead={() => {}} onClear={() => {}} />;
    }

    if (user && currentView === 'dashboard') {
      return (
        <div className="container mx-auto px-4 py-8">
          {user.role === 'citizen' ? (
            <UserDashboard user={dynamicUser!} reports={reports.filter(r => r.reporterId === user.id)} onOpenReport={() => setIsReportModalOpen(true)} onNavigate={handleNavigate} />
          ) : (
            <GovDashboard user={dynamicUser!} allReports={reports} onUpdateProgress={(id, p) => onUpdateProgress(id, p)} />
          )}
        </div>
      );
    }

    return (
      <Hero 
        user={dynamicUser} 
        onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onNavigate={handleNavigate} 
      />
    );
  };

  const onUpdateProgress = async (id: string, progress: number) => {
    const r = reports.find(x => x.id === id);
    if (!r) return;
    const updated = { ...r, progress, status: (progress === 100 ? 'Resolved' : 'In Progress') as any };
    setReports(prev => prev.map(x => x.id === id ? updated : x));
    await dbService.updateReport(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {dbError && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-[150] flex items-center justify-center gap-4 shadow-lg">
           <ShieldAlert size={14} /> <span>{dbError}</span>
           <button onClick={() => setShowRepairModal(true)} className="bg-white text-red-600 px-3 py-1 rounded-lg font-bold text-[9px] hover:bg-slate-100">Fix Database</button>
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
      />
      <main className={`flex-grow ${isDbReady || dbError ? 'pt-24' : 'pt-16'}`}>{renderContent()}</main>
      <Footer onNavigate={handleNavigate} />
      {showWelcome && user && <WelcomeOverlay user={user} onClose={() => setShowWelcome(false)} />}
      {isReportModalOpen && <ReportModal user={dynamicUser} onReportSubmit={addReport} onClose={() => setIsReportModalOpen(false)} />}
      {isAuthModalOpen && <AuthModal onLogin={handleLogin} onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
};

export default App;
