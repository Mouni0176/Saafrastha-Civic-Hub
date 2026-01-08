
import React, { useState, useEffect } from 'react';
import { ShieldCheck, LogOut, ChevronLeft, Bell, Home, Info, Sparkles, Workflow, Rss, User as UserIcon, Menu, X } from 'lucide-react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={16} /> },
    { id: 'about', label: 'About', icon: <Info size={16} /> },
    { id: 'features', label: 'Features', icon: <Sparkles size={16} /> },
    { id: 'process', label: 'Process', icon: <Workflow size={16} /> },
    { id: 'public_reports', label: 'Public Feed', icon: <Rss size={16} /> },
  ];

  const showBackButton = currentView !== 'home' && currentView !== 'dashboard';
  const showLandingNav = !user && !isAuthOpen;

  const handleMobileNav = (view: AppView) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[300] transition-all duration-700 ${
        isScrolled ? 'py-4 translate-y-0' : 'py-8'
      }`}>
        <div className="container mx-auto px-6">
          <div className={`flex items-center justify-between gap-4 px-4 md:px-6 py-3 rounded-[2rem] transition-all duration-500 ${
            isScrolled ? 'glass-morphism shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)]' : 'bg-transparent'
          }`}>
            
            {/* Logo & Back Control */}
            <div className="flex items-center gap-4 md:gap-6">
              {showBackButton && (
                <button 
                  onClick={onBack}
                  className="p-2.5 bg-white shadow-sm border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <button 
                onClick={() => onNavigate('home')} 
                className="flex items-center gap-3 active:scale-95 transition-all group"
              >
                <div className="bg-emerald-600 p-2 md:p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-600/30 group-hover:rotate-12 transition-transform duration-500">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 leading-none">
                    Saaf<span className="text-emerald-600">Rasta</span>
                  </span>
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Infrastructure Hub</span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            {showLandingNav && (
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
                      currentView === link.id 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {user ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <button 
                    onClick={() => onNavigate('notifications')}
                    className={`relative p-2.5 md:p-3 rounded-2xl transition-all ${
                      currentView === 'notifications' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Bell size={18} className="md:w-5 md:h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-600 text-[8px] md:text-[9px] font-black text-white rounded-full border-2 border-white flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="hidden xs:block h-8 w-px bg-slate-200 mx-1"></div>

                  <button 
                    onClick={() => onNavigate('dashboard')}
                    className={`flex items-center gap-3 p-1.5 md:pr-5 rounded-2xl border transition-all ${
                      currentView === 'dashboard' 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                        : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                      <UserIcon size={16} />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-[10px] font-black uppercase tracking-tight leading-none">{user.name.split(' ')[0]}</p>
                      <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">{user.points} XP</p>
                    </div>
                  </button>

                  <button 
                    onClick={onLogout}
                    className="p-2.5 md:p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                  >
                    <LogOut size={18} className="md:w-5 md:h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={onOpenAuth}
                    className="px-5 md:px-8 py-2.5 md:py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95"
                  >
                    Login
                  </button>
                  {/* Mobile Menu Toggle */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl active:scale-95"
                  >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Backdrop & Content */}
      <div className={`fixed inset-0 z-[250] bg-slate-900/40 backdrop-blur-xl transition-all duration-500 lg:hidden ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`absolute top-24 left-6 right-6 bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 transition-all duration-500 transform ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-12'
        }`}>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 mb-2">Command Gateway</p>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleMobileNav(link.id)}
                className={`w-full flex items-center gap-5 p-5 rounded-3xl transition-all ${
                  currentView === link.id 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`${currentView === link.id ? 'text-white' : 'text-emerald-600'}`}>
                  {link.icon}
                </div>
                <span className="text-sm font-black uppercase tracking-widest">{link.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
               SaafRasta Civic Hub v2.1<br/>Sector 4 Node Active
             </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
