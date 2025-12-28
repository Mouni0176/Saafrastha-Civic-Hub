
import React from 'react';
import { Camera, Eye, TrendingUp, HandHelping, Recycle, LayoutDashboard, Sparkles, ArrowUpRight } from 'lucide-react';
import { AppView } from '../App';

interface FeaturesProps {
  onNavigate?: (view: AppView) => void;
  onSelectFeature?: (id: number) => void;
}

const Features: React.FC<FeaturesProps> = ({ onNavigate, onSelectFeature }) => {
  const features = [
    {
      icon: <Camera />,
      title: "AI-Powered Photo Reporting",
      desc: "Automatic issue categorization using Gemini AI to identify garbage, potholes, or leaks instantly.",
      color: "bg-emerald-50 text-emerald-600",
      accent: "border-emerald-100 hover:shadow-emerald-100"
    },
    {
      icon: <Eye />,
      title: "Transparent Tracking",
      desc: "Real-time updates on your phone: Submitted → Acknowledged → In Progress → Fixed with photo proof.",
      color: "bg-blue-50 text-blue-600",
      accent: "border-blue-100 hover:shadow-blue-100"
    },
    {
      icon: <TrendingUp />,
      title: "Data-Driven Prioritization",
      desc: "Heatmaps help municipalities focus resources on high-impact recurring problem areas for systemic change.",
      color: "bg-amber-50 text-amber-600",
      accent: "border-amber-100 hover:shadow-amber-100"
    },
    {
      icon: <HandHelping />,
      title: "Civic Volunteering",
      desc: "Connect with local NGOs for community cleanup drives and earn digital badges for your social profile.",
      color: "bg-purple-50 text-purple-600",
      accent: "border-purple-100 hover:shadow-purple-100"
    },
    {
      icon: <Recycle />,
      title: "Circular Economy Support",
      desc: "Direct channel for small recycling vendors to collect segregated waste reported by the community.",
      color: "bg-green-50 text-green-600",
      accent: "border-green-100 hover:shadow-green-100"
    },
    {
      icon: <LayoutDashboard />,
      title: "Authority Dashboard",
      desc: "Comprehensive analytics, staff management, and KPI tracking for city managers and street workers.",
      color: "bg-slate-100 text-slate-700",
      accent: "border-slate-200 hover:shadow-slate-100"
    }
  ];

  return (
    <section id="features" className="pb-24 bg-white">
      {/* Page Header */}
      <div className="bg-slate-50 py-16 mb-16 border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">
             <Sparkles size={14} className="text-emerald-500" /> Technology Highlights
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Innovation for <span className="text-emerald-600 italic">Civic Good</span>
          </h1>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl font-medium">
            Explore the powerful tools built to make urban maintenance smarter, faster, and more transparent.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className={`p-10 rounded-[2.5rem] border ${feature.accent} bg-white hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col`}>
              <div className="flex-grow">
                <div className={`mb-8 w-16 h-16 rounded-2xl flex items-center justify-center ${feature.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                <h4 className="text-2xl font-extrabold text-slate-900 mb-4">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed text-lg mb-8">
                  {feature.desc}
                </p>
              </div>
              
              <button 
                onClick={() => onSelectFeature && onSelectFeature(i)}
                className="mt-auto flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all group/btn"
              >
                Learn more about this feature <ArrowUpRight size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>

              {/* Decorative Number */}
              <span className="absolute -bottom-6 -right-2 text-9xl font-black text-slate-50 group-hover:text-emerald-50 transition-colors pointer-events-none -z-10">
                0{i + 1}
              </span>
            </div>
          ))}
        </div>
        
        {/* Footer Feature Callout */}
        <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center text-white">
           <h4 className="text-3xl font-bold mb-4">Ready to test these features?</h4>
           <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of citizens already using these tools to build a better version of their city every single day.</p>
           <button 
              onClick={() => onNavigate && onNavigate('home')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-emerald-500/20"
           >
              Get Started Now
           </button>
        </div>
      </div>
    </section>
  );
};

export default Features;
