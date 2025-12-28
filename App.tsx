
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

const STORAGE_KEYS = {
  USER: 'saaf_active_user',
};

const AboutView: React.FC<{onOpenReport: () => void}> = ({onOpenReport}) => (
  <div className="animate-in fade-in duration-500">
    <About />
    <Challenges />
    <Impact />
    <WhyUs />
    <CTA onOpenReport={onOpenReport} />
  </div>
);

const App: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [history, setHistory] = useState<AppView[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await dbService.init();
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setCurrentView('dashboard');
        }

        const allReports = await dbService.getAllReports();
        if (allReports.length > 0) {
          setReports(allReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
          const initialReports: Report[] = [
            { id: 'SR-1001', reporterId: 'system', reporterName: 'Sarah Civic', title: 'Large Pothole', description: 'Deep pothole causing traffic issues near the main intersection.', location: 'Main Street, Sector 4', category: 'Roads', severity: 'High', status: 'In Progress', progress: 45, date: '25/10/2023', imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800', supportCount: 12, disputeCount: 1, supportedBy: [], disputedBy: [], lat: 28.6139, lng: 77.2090 },
            { id: 'SR-1002', reporterId: 'system', reporterName: 'John Doe', title: 'Streetlight Out', description: 'Dark alleyway near school, unsafe for kids walking home.', location: 'Baker Lane, North Wing', category: 'Electrical', severity: 'Medium', status: 'New', progress: 0, date: '26/10/2023', imageUrl: 'https://images.unsplash.com/photo-1557333610-90ee4a951ecf?auto=format&fit=crop&q=80&w=800', supportCount: 8, disputeCount: 0, supportedBy: [], disputedBy: [], lat: 28.6200, lng: 77.2200 },
            { id: 'SR-1003', reporterId: 'system', reporterName: 'Amit Shah', title: 'Illegal Garbage Dumping', description: 'Waste accumulated near the park entrance, attracting pests.', location: 'Green Valley Park', category: 'Sanitation', severity: 'High', status: 'Resolved', progress: 100, date: '24/10/2023', imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=1200', supportCount: 45, disputeCount: 2, supportedBy: [], disputedBy: [], lat: 28.6300, lng: 77.2400 }
          ];
          for (const r of initialReports) {
            await dbService.saveReport(r);
          }
          setReports(initialReports);
        }
      } catch (err) {
        console.error("Database initialization failed:", err);
      } finally {
        setIsDbReady(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const mockNotifications: Notification[] = [];
    if (user.role === 'citizen') {
      const myReports = reports.filter(r => r.reporterId === user.id);
      if (myReports.length > 0) {
        mockNotifications.push({
          id: 'n1',
          title: 'Status Update',
          message: `Work has started on your report: ${myReports[0].title}`,
          timestamp: '2 hours ago',
          type: 'status_change',
          isRead: false,
          relatedReportId: myReports[0].id
        });
      }
      mockNotifications.push({
        id: 'n2',
        title: 'Achievement Unlocked',
        message: 'You earned 50 points for your first verified report!',
        timestamp: '1 day ago',
        type: 'points',
        isRead: true
      });
    } else {
      const criticals = reports.filter(r => r.severity === 'Critical');
      if (criticals.length > 0) {
        mockNotifications.push({
          id: 'n3',
          title: 'Emergency Dispatch',
          message: `New Critical incident logged: ${criticals[0].title}. Immediate action required.`,
          timestamp: '15 minutes ago',
          type: 'priority',
          isRead: false,
          relatedReportId: criticals[0].id
        });
      }
      mockNotifications.push({
        id: 'n4',
        title: 'System Synchronized',
        message: 'Terminal sector 4 gateway is now active and syncing telemetry.',
        timestamp: '5 hours ago',
        type: 'system',
        isRead: true
      });
    }
    setNotifications(mockNotifications);
  }, [user, reports]);

  const dynamicUser = useMemo(() => {
    if (!user) return null;
    const userReports = reports.filter(r => r.reporterId === user.id);
    const resolvedCount = userReports.filter(r => r.status === 'Resolved').length;
    const reportPoints = userReports.length * 50;
    const resolutionPoints = resolvedCount * 100;

    return {
      ...user,
      reportsCount: userReports.length,
      points: reportPoints + resolutionPoints
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleNavigate(user ? 'dashboard' : 'home');
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setIsAuthModalOpen(false);
    setCurrentView('dashboard');
    setHistory([]);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setCurrentView('home');
    setHistory([]);
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
    setReports(prev => [newReport, ...prev]);
  };

  const handleVote = async (reportId: string, type: 'support' | 'dispute') => {
    if (!user) return setIsAuthModalOpen(true);
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) return;
    const report = { ...reports[reportIndex] };
    if (!report.supportedBy) report.supportedBy = [];
    if (!report.disputedBy) report.disputedBy = [];
    if (report.supportedBy.includes(user.id) || report.disputedBy.includes(user.id)) return;
    if (type === 'support') {
      report.supportedBy.push(user.id);
      report.supportCount = report.supportedBy.length;
    } else {
      report.disputedBy.push(user.id);
      report.disputeCount = report.disputedBy.length;
    }
    const updated = [...reports];
    updated[reportIndex] = report;
    setReports(updated);
    await dbService.updateReport(report);
  };

  const updateReportProgress = async (reportId: string, progress: number) => {
    const r = reports.find(x => x.id === reportId);
    if (!r) return;
    const newStatus = progress === 100 ? 'Resolved' : (progress > 0 ? 'In Progress' : 'New');
    const updated = { ...r, progress, status: newStatus as any };
    await dbService.updateReport(updated);
    setReports(prev => prev.map(x => x.id === reportId ? updated : x));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const renderContent = () => {
    if (!isDbReady) return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    if (user) {
      switch (currentView) {
        case 'home':
          return (
            <div className="animate-in fade-in duration-700">
              <Hero user={dynamicUser} onOpenReport={() => setIsReportModalOpen(true)} onOpenAuth={() => {}} onNavigate={handleNavigate} />
            </div>
          );
        case 'public_reports':
          return <PublicReports user={dynamicUser} reports={reports} onVote={handleVote} />;
        case 'help_center':
          return <HelpCenter />;
        case 'report_abuse':
          return <ReportAbuse onOpenCrisis={() => setIsReportModalOpen(true)} />;
        case 'notifications':
          return <NotificationsView notifications={notifications} onMarkRead={markAsRead} onClear={clearNotifications} />;
        case 'feature_detail':
          return <FeatureDetail featureId={selectedFeatureId ?? 0} onBack={handleBack} onGetStarted={() => setIsReportModalOpen(true)} />;
        case 'dashboard':
        default:
          return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {user.role === 'citizen' ? (
                <div className="container mx-auto px-4 py-8">
                  <UserDashboard 
                    user={dynamicUser!} 
                    reports={reports.filter(r => r.reporterId === user.id)} 
                    onOpenReport={() => setIsReportModalOpen(true)}
                    onNavigate={handleNavigate}
                  />
                </div>
              ) : (
                <GovDashboard 
                  user={dynamicUser!} 
                  allReports={reports} 
                  onUpdateProgress={updateReportProgress} 
                  onNavigate={handleNavigate} 
                />
              )}
            </div>
          );
      }
    }

    switch (currentView) {
      case 'public_reports': return <PublicReports user={null} reports={reports} onVote={handleVote} />;
      case 'about': return <AboutView onOpenReport={() => setIsAuthModalOpen(true)} />;
      case 'features': return <Features onNavigate={handleNavigate} onSelectFeature={(id) => { setSelectedFeatureId(id); handleNavigate('feature_detail'); }} />;
      case 'process': return <HowItWorks />;
      case 'feature_detail': return <FeatureDetail featureId={selectedFeatureId ?? 0} onBack={handleBack} onGetStarted={() => setIsAuthModalOpen(true)} />;
      case 'help_center': return <HelpCenter />;
      case 'report_abuse': return <ReportAbuse onOpenCrisis={() => setIsAuthModalOpen(true)} />;
      case 'home':
      default:
        return (
          <div className="animate-in fade-in duration-700">
            <Hero user={null} onOpenReport={() => setIsAuthModalOpen(true)} onOpenAuth={() => setIsAuthModalOpen(true)} onNavigate={handleNavigate} />
          </div>
        );
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        user={dynamicUser} 
        currentView={currentView}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onOpenReport={() => user ? setIsReportModalOpen(true) : setIsAuthModalOpen(true)} 
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        unreadNotifications={unreadCount}
      />
      <main className="flex-grow pt-16">
        {renderContent()}
      </main>
      <Footer onNavigate={handleNavigate} />
      
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
