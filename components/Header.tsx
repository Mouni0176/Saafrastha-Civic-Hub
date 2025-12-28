
import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck, LogOut, Award, ChevronLeft, ChevronRight, Home, LayoutDashboard, Bell } from 'lucide-react';
import { User, AppView } from '../App';

interface HeaderProps {
  user: User | null;
  currentView: AppView;
  unreadNotifications?: number;
  onNavigate: (view: AppView) => void;
  onBack: () => void;
  onOpenReport: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentView, unreadNotifications = 0, onNavigate, onBack, onOpenReport, onOpenAuth, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const landingLinks: { name: string; view: AppView }[] = [
    { name: 'Home', view: 'home' },
    { name: 'About', view: 'about' },
    { name: 'Features', view: 'features' },
    { name: 'Process', view: 'process' },
    { name: 'View Issues', view: 'public_reports' },
  ];

  const dashboardLinks: { name: string; view: AppView; icon: any }[] = [
    { name: 'Home', view: 'home', icon: <Home size={18} /> },
    { name: 'My Hub', view: 'dashboard', icon: <LayoutDashboard size={18} /> },
  ];

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  const isHomeView = currentView === 'home';

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled || user ? 'glass-morphism py-2 shadow-lg border-b border-slate-100' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {!isHomeView && (
              <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-600 border border-slate-100 active:scale-90 transition-all">
                <ChevronLeft size={24} />
              </button>
            )}
            <button onClick={() => handleNavClick('home')} className="flex items-center gap-2 group">
              <div className="bg-emerald-600 p-2 rounded-xl text-white group-hover:rotate-12 transition-all shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={22} />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-800 hidden xs:block">
                Saaf<span className="text-emerald-600">Rasta</span>
              </span>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {user ? (
              dashboardLinks.map((link) => (
                <button 
                  key={link.name} 
                  onClick={() => handleNavClick(link.view)}
                  className={`text-[11px] uppercase tracking-widest font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${currentView === link.view ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {link.icon} {link.name}
                </button>
              ))
            ) : (
              landingLinks.map((link) => (
                <button 
                  key={link.name} 
                  onClick={() => handleNavClick(link.view)}
                  className={`text-[11px] uppercase tracking-widest font-black px-5 py-2.5 rounded-xl transition-all ${currentView === link.view ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {link.name}
                </button>
              ))
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate('notifications')}
                  className={`relative flex p-2.5 rounded-xl border transition-all ${currentView === 'notifications' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-slate-600 border-slate-100'}`}
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 bg-white border border-slate-100 pl-2 pr-4 py-1.5 rounded-2xl hover:shadow-md transition-all">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold shadow-inner">{user.name[0]}</div>
                    <div className="text-left hidden sm:block">
                      <p className="text-[10px] font-black text-slate-800 leading-none uppercase tracking-widest">{user.name.split(' ')[0]}</p>
                      {user.role === 'citizen' ? (
                        <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5"><Award size={10} /> {user.points} pts</p>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">Verified Official</p>
                      )}
                    </div>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{user.email}</p>
                        {user.role === 'citizen' && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <Award size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{user.points} Points Earned</span>
                          </div>
                        )}
                      </div>
                      
                      {user.role === 'citizen' && (
                        <button 
                          onClick={() => { onOpenReport(); setIsProfileOpen(false); }} 
                          className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          Report Issue
                        </button>
                      )}

                      <div className="h-px bg-slate-50 my-1"></div>
                      <button onClick={() => { onLogout(); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors"><LogOut size={16} /> Logout</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={onOpenAuth} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 px-4 py-2 transition-colors">Login</button>
                <button onClick={onOpenReport} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 hover:bg-emerald-700">Report Now</button>
              </div>
            )}
            
            <button className="md:hidden text-slate-600 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[64px] bg-white z-[100] p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="flex flex-col gap-2">
            {(user ? dashboardLinks : landingLinks).map((link) => (
              <button key={link.name} onClick={() => handleNavClick(link.view)} className={`flex items-center justify-between p-5 rounded-2xl font-black text-sm uppercase tracking-widest ${currentView === link.view ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 active:bg-slate-50'}`}>
                {link.name} <ChevronRight size={20} />
              </button>
            ))}
          </div>
          <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
            {user ? (
              <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full bg-slate-100 text-slate-600 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest">Sign Out</button>
            ) : (
              <button onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} className="w-full bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20">Get Started</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
