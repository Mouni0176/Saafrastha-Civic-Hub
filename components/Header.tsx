
import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, ChevronLeft, Bell, Plus, LayoutDashboard, ChevronDown, Home, Info, Sparkles, Workflow, Rss } from 'lucide-react';
import { User, AppView } from '../App';

interface HeaderProps {
  user: User | null;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onBack: () => void;
  onOpenReport: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  isAuthOpen?: boolean;
  unreadCount?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  currentView, 
  onNavigate, 
  onBack, 
  onOpenReport, 
  onOpenAuth, 
  onLogout,
  isAuthOpen = false,
  unreadCount = 0
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={14} /> },
    { id: 'about', label: 'About', icon: <Info size={14} /> },
    { id: 'features', label: 'Features', icon: <Sparkles size={14} /> },
    { id: 'process', label: 'Process', icon: <Workflow size={14} /> },
    { id: 'public_reports', label: 'Public Feed', icon: <Rss size={14} /> },
  ];

  const handleLinkClick = (id: AppView) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  // User specifically requested no back buttons in the dashboard
  const showBackButton = currentView !== 'home' && currentView !== 'dashboard';
  const showLandingNav = !user && !isAuthOpen;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[300] transition-all duration-500 ${
      isScrolled ? 'py-3' : 'py-6'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo Section & Back Button */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button 
                  onClick={onBack}
                  className="p-2 bg-white/80 backdrop-blur-md hover:bg-slate-100 text-slate-600 rounded-xl transition-all active:scale-95 border border-slate-200 shadow-sm"
                  aria-label="Go back"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <button 
                onClick={() => onNavigate('home')} 
                className="flex items-center gap-2 group active:scale-95 transition-all"
              >
                <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-600/20 group-hover:rotate-6 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-900">
                  Saaf<span className="text-emerald-600">Rasta</span>
                </span>
              </button>
            </div>

            {/* Mobile Actions (Visible only on mobile) */}
            <div className="flex items-center gap-2 lg:hidden">
              {user && (
                <button 
                  onClick={() => onNavigate('notifications')}
                  className="p-2 text-slate-400 relative hover:text-slate-900 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[8px] font-black text-white rounded-full border border-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              {user ? (
                <button onClick={() => onNavigate('dashboard')} className="p-2 text-slate-900 bg-slate-100 rounded-lg">
                  <LayoutDashboard size={20} />
                </button>
              ) : !isAuthOpen && (
                <button onClick={onOpenAuth} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Central Navigation */}
          {showLandingNav && (
            <nav className="relative w-full lg:w-auto animate-in fade-in duration-500">
              <div className={`hidden lg:flex items-center p-1.5 bg-white/70 backdrop-blur-md rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 group/hub transition-all hover:shadow-2xl hover:border-emerald-100`}>
                {navLinks.map((link, idx) => (
                  <React.Fragment key={link.id}>
                    <button
                      onClick={() => handleLinkClick(link.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all relative overflow-hidden ${
                        currentView === link.id 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-[1.02] z-10' 
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </button>
                    {idx < navLinks.length - 1 && (
                      <div className="w-px h-4 bg-slate-100 mx-1 group-hover/hub:bg-transparent transition-colors"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="lg:hidden w-full">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                      {navLinks.find(l => l.id === currentView)?.icon || <Sparkles size={16} />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">
                      {navLinks.find(l => l.id === currentView)?.label || 'Menu'}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMobileMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 z-[310] animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 gap-1">
                      {navLinks.map((link) => (
                        <button
                          key={link.id}
                          onClick={() => handleLinkClick(link.id)}
                          className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            currentView === link.id 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {link.icon} {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* User Profile & Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-2xl border border-white/50 animate-in slide-in-from-right-4 duration-500">
                
                {/* Notification Bell (Desktop) */}
                <button 
                  onClick={() => onNavigate('notifications')}
                  className={`p-2.5 rounded-xl transition-all relative group ${
                    currentView === 'notifications' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-label="Notifications"
                >
                  <Bell size={20} className={currentView === 'notifications' ? '' : 'group-hover:rotate-12 transition-transform'} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-[10px] font-black text-white rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="flex flex-col items-end px-2">
                   <p className="text-[10px] font-black text-slate-900 leading-none uppercase tracking-tight">{user.name.split(' ')[0]}</p>
                   <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">{user.points} Pts</p>
                </div>
                
                <button 
                  onClick={onLogout}
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : !isAuthOpen && (
              <button 
                onClick={onOpenAuth}
                className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 animate-in fade-in duration-500"
              >
                Login
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
