
import React from 'react';
import { Trash2, HardHat, AlertTriangle, Droplets, LightbulbOff, HeartPulse } from 'lucide-react';

const Challenges: React.FC = () => {
  const challenges = [
    { icon: <Trash2 />, title: "Illegal Dumping", color: "text-red-500" },
    { icon: <HardHat />, title: "Potholes & Road Damage", color: "text-orange-500" },
    { icon: <AlertTriangle />, title: "Open Manholes", color: "text-yellow-600" },
    { icon: <Droplets />, title: "Water Logging", color: "text-blue-500" },
    { icon: <LightbulbOff />, title: "Broken Streetlights", color: "text-gray-500" },
    { icon: <HeartPulse />, title: "Public Health Risks", color: "text-rose-500" },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Focus Areas</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Tackling the most critical civic challenges
            </h3>
            <p className="text-lg text-slate-600">
              Citizens are the eyes and ears of a city. By reporting these common issues, you help the government prioritize repairs where they are needed most.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {challenges.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className={`${item.color}`}>{item.icon}</span>
                  <span className="font-semibold text-slate-700">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            <div className="aspect-square bg-emerald-100 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 blur-3xl opacity-40"></div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400" alt="Civic Issue" className="rounded-2xl shadow-lg border-4 border-white" />
              <img src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=400" alt="Civic Issue" className="rounded-2xl shadow-lg mt-8 border-4 border-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Challenges;
