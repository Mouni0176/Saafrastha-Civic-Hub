
import React from 'react';
import { ShieldCheck, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { AppView } from '../App';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (view: AppView) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <button onClick={() => handleNav('home')} className="flex items-center gap-2 group">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <ShieldCheck size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Saaf<span className="text-emerald-600">Rasta</span>
              </span>
            </button>
            <p className="text-slate-500 leading-relaxed text-sm">
              A crowdsourced civic issue reporting and resolution platform. Building cleaner, safer, and smarter cities for everyone.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><button onClick={() => handleNav('home')} className="hover:text-emerald-600 transition-colors font-medium">Home</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-emerald-600 transition-colors font-medium">About Us</button></li>
              <li><button onClick={() => handleNav('features')} className="hover:text-emerald-600 transition-colors font-medium">Features</button></li>
              <li><button onClick={() => handleNav('process')} className="hover:text-emerald-600 transition-colors font-medium">How It Works</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><button onClick={() => handleNav('help_center')} className="hover:text-emerald-600 transition-colors font-medium">Help Center</button></li>
              <li><button onClick={() => handleNav('report_abuse')} className="hover:text-emerald-600 transition-colors font-medium text-red-500">Report Abuse</button></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors font-medium">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Stay Informed</h4>
            <p className="text-slate-500 mb-6 text-sm">Subscribe for monthly impact reports of your neighborhood.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors text-sm">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-slate-500 text-xs font-medium">
              © {new Date().getFullYear()} SaafRasta. Empowering citizens across India.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              Official Civic Hub: Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
