
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
import { Globe, Activity, Loader2, ShieldAlert, X, Copy, Check, Database, Sparkles, LogIn, Command, ShieldCheck } from 'lucide-react';

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
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
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
CREATE POLICY "Enable All Access" ON reports FOR ALL USING (true) WITH CHECK (true);

INSERT INTO profiles (id, email, full_name, role, points, password)
VALUES ('u-citizen-1', 'rahul@example.com', 'Rahul Sharma', 'citizen', 450, '123456')
ON CONFLICT (email) DO NOTHING;`;

const WelcomeOverlay: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000); // Extended slightly to allow reading the mission
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl animate-in fade-in duration-700">
      <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl max-w-3xl w-full text-center space-y-10 animate-in zoom-in slide-in-from-bottom-12 duration-1000 border border-white/20">
        <div className="relative inline-block">
          <div className="w-28 h-28 bg-emerald-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-600/30">
            <ShieldCheck size={56} className="animate-pulse" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center border-4 border-white animate-bounce shadow-lg">
            <Sparkles size={24} />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-emerald-600 font-black uppercase tracking-[0.3em] text-xs">Identity Verified: {user.name}</p>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
              Welcome to Civic <br/><span className="text-emerald-600">Issue Reporting</span>
            </h2>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-200"></span>
              <p className="text-xl md:text-2xl font-black text-slate-800 tracking-widest uppercase opacity-90">
                Identify. Report. Resolve.
              </p>
              <span className="w-2 h-2 rounded-full bg-slate-200"></span>
            </div>
            <div className="h-1 w-24 bg-emerald-100 rounded-full"></div>
          </div>

          <p className="text-slate-500 font-bold text-lg max-w-lg mx-auto leading-relaxed">
            Join hands with citizens and authorities to improve public services.
          </p>
        </div>

        <div className="pt-10 border-t border-slate-100 grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector</p>
            <p className="text-sm font-black text-slate-800">Operational</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session</p>
            <p className="text-sm font-black text-emerald-600">Secure</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
            <p className="text-sm font-black text-indigo-600">High</p>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:bg-black"
        >
          Initialize Command Hub
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

  const initApp = async () => {
    setIsInitializing(true);
    setDbError(null);
    try {
      const isHealthy = await dbService.init();
      const sessionUser = await dbService.getSession();
      
      if (sessionUser) {
        setUser(sessionUser);
        setCurrentView('dashboard');
      }

      if (!isHealthy) {
        setDbError("Database synchronization required.");
        setIsDbReady(false);
      } else {
        const initialReports = await dbService.getAllReports();
        setReports(initialReports);
        setIsDbReady(true);
      }
    } catch (err: any) {
      setDbError("Network connectivity error.");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (!supabase || !isDbReady) return;
    const channel = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, async () => {
        try {
          const freshReports = await dbService.getAllReports();
          setReports(freshReports);
        } catch (e) {}
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
    dbService.setSession(userData);
    setIsAuthModalOpen(false);
    setShowWelcome(true);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    setUser(null);
    dbService.setSession(null);
    setCurrentView('home');
    setShowWelcome(false);
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
    
    try {
      await dbService.saveReport(newReport);
      const fresh = await dbService.getAllReports();
      setReports(fresh);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
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
    
    try {
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));
      await dbService.updateReport(updated);
    } catch (err) {}
  };

  const renderContent = () => {
    if (isInitializing && !user) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 size={40} className="text-emerald-500 animate-spin" />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waking up database...</p>
      </div>
    );

    // Common views for all users
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

    // Auth-only views
    if (user) {
      if (currentView === 'dashboard') {
        return (
          <div className="container mx-auto px-4 py-8">
            {user.role === 'citizen' ? (
              <UserDashboard 
                user={dynamicUser!} 
                reports={reports.filter(r => r.reporterId === user.id)} 
                onOpenReport={() => setIsReportModalOpen(true)}
                onNavigate={handleNavigate}
              />
            ) : (
              <GovDashboard 
                user={dynamicUser!} 
                allReports={reports} 
                onUpdateProgress={(id, p) => onUpdateProgress(id, p)} 
              />
            )}
          </div>
        );
      }
    }

    // Fallback to Home/Hero
    return (
      <>
        <Hero 
          user={dynamicUser} 
          onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
          onNavigate={handleNavigate} 
        />
        <About />
        <Features onNavigate={handleNavigate} onSelectFeature={(id) => { setSelectedFeatureId(id); handleNavigate('feature_detail'); }} />
        <Impact />
        <HowItWorks />
        <CTA onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} />
      </>
    );
  };

  const onUpdateProgress = async (id: string, progress: number) => {
    const r = reports.find(x => x.id === id);
    if (!r) return;
    const updated = { ...r, progress, status: (progress === 100 ? 'Resolved' : 'In Progress') as any };
    try {
      setReports(prev => prev.map(x => x.id === id ? updated : x));
      await dbService.updateReport(updated);
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {dbError ? (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-[10px] font-black uppercase tracking-widest sticky top-0 z-[150] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 shadow-xl">
           <div className="flex items-center gap-2">
             <ShieldAlert size={14} /> 
             <span>{dbError}</span>
           </div>
           <button 
             onClick={() => setShowRepairModal(true)} 
             className="bg-white text-red-600 px-4 py-1.5 rounded-lg font-bold text-[9px] hover:bg-slate-100 transition-all shadow-inner"
           >
             Initialize Database Fix
           </button>
        </div>
      ) : isDbReady ? (
        <div className="bg-emerald-600 text-white text-center py-1 px-4 text-[9px] font-black uppercase tracking-[0.2em] sticky top-0 z-[150] flex items-center justify-center gap-2">
           <Globe size={10} className="animate-pulse" /> Live Civic Hub Connected
        </div>
      ) : null}
      
      <Header 
        user={dynamicUser} 
        currentView={currentView}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} 
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      
      <main className={`flex-grow ${isDbReady || dbError ? 'pt-24' : 'pt-16'}`}>
        {renderContent()}
      </main>

      <Footer onNavigate={handleNavigate} />
      
      {showWelcome && user && (
        <WelcomeOverlay user={user} onClose={() => setShowWelcome(false)} />
      )}

      {showRepairModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowRepairModal(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                 <Database size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Fix Console</h3>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
               <p className="text-xs font-bold text-slate-600">Please run this in your Supabase SQL Editor to sync the schema:</p>
               <ol className="text-[10px] text-slate-400 space-y-1 list-decimal list-inside">
                 <li>Copy the code below</li>
                 <li>Paste in Supabase SQL Editor</li>
                 <li>Click Run and reload this page</li>
               </ol>
            </div>
            <button 
              onClick={handleCopySQL} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />} 
              {copied ? 'Code Copied!' : 'Copy Fix Script'}
            </button>
            <button 
              onClick={() => { setShowRepairModal(false); window.location.reload(); }} 
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl"
            >
              I've Run the Code, Reload App
            </button>
          </div>
        </div>
      )}

      {isReportModalOpen && (
        <ReportModal user={dynamicUser} onReportSubmit={addReport} onClose={() => setIsReportModalOpen(false)} />
      )}
      {isAuthModalOpen && (
        <AuthModal onLogin={handleLogin} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  );
};

export default App;
