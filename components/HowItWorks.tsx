
import React from 'react';
import { Smartphone, MapPin, BarChart3, Wrench, Trophy, Sparkles } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Smartphone />,
      title: "Capture & Report",
      desc: "Take a photo of the issue and add a brief description via text or voice note. AI handles the categorization."
    },
    {
      icon: <MapPin />,
      title: "Auto Tag Location",
      desc: "Our GPS system automatically tags the exact latitude and longitude of the problem for precise routing."
    },
    {
      icon: <BarChart3 />,
      title: "Smart Triage",
      desc: "Issues appear on the municipal dashboard and are prioritized based on severity and public impact."
    },
    {
      icon: <Wrench />,
      title: "Swift Resolution",
      desc: "Authorities assign teams, fix the issue, and upload photo proof of resolution for you to verify."
    },
    {
      icon: <Trophy />,
      title: "Earn Rewards",
      desc: "Get digital civic points for your contribution to a cleaner city environment. Level up your status!"
    }
  ];

  return (
    <section id="how-it-works" className="pb-24 bg-slate-900 text-white overflow-hidden relative min-h-screen">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 blur-[150px] -z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-600/10 blur-[150px] -z-0"></div>

      {/* Page Header */}
      <div className="bg-white/5 backdrop-blur-sm py-20 mb-16 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
             <Sparkles size={14} /> The User Journey
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Seamless <span className="text-emerald-400">Problem Solving</span>
          </h1>
          <p className="text-lg text-slate-400 mt-4 max-w-2xl mx-auto font-medium">
            Fixing your city shouldn't be a chore. We've optimized every step to make civic participation fast, rewarding, and effective.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full border-t border-dashed border-slate-700 -z-10"></div>
              )}
              <div className="mb-8 w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all group-hover:scale-110 group-hover:-rotate-3 shadow-2xl">
                {React.cloneElement(step.icon as React.ReactElement<any>, { size: 40 })}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">0{i + 1}</span>
                  <h4 className="text-xl font-extrabold">{step.title}</h4>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm lg:text-base">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Roadmap Divider */}
        <div className="mt-24 pt-16 border-t border-white/5 grid md:grid-cols-2 gap-16 items-center">
           <div className="space-y-6">
              <h4 className="text-3xl font-bold">Closing the <span className="text-emerald-400">Feedback Loop</span></h4>
              <p className="text-slate-400 text-lg">
                Unlike traditional systems where complaints go into a "black hole", SaafRasta keeps the conversation alive. You aren't just a complainant; you're a stakeholder in the resolution process.
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-emerald-400 border border-white/10">
                    <Smartphone size={24} />
                 </div>
                 <div className="flex-1 h-px bg-white/10"></div>
                 <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Wrench size={24} />
                 </div>
                 <div className="flex-1 h-px bg-white/10"></div>
                 <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-amber-400 border border-white/10">
                    <Trophy size={24} />
                 </div>
              </div>
           </div>
           <div className="bg-white/5 p-1 rounded-[3rem] border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800" 
                alt="Process visualization" 
                className="w-full h-auto rounded-[2.8rem] opacity-80 hover:opacity-100 transition-opacity"
              />
           </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
