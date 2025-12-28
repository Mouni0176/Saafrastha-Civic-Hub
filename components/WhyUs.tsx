
import React from 'react';
import { Check } from 'lucide-react';

const WhyUs: React.FC = () => {
  const points = [
    "Real-time GPS tracking for absolute accuracy",
    "Accountability with mandatory 'Fixed' photo proof",
    "Scalable for both dense cities and remote villages",
    "Gamified rewards for active community members",
    "Open API for NGO and volunteer integration",
    "Advanced heatmaps for government planning"
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 order-2 lg:order-1">
             <div className="relative bg-slate-100 rounded-[2.5rem] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800" 
                  alt="City Dashboard" 
                  className="rounded-[2.5rem] shadow-2xl w-full"
                />
                <div className="absolute -bottom-8 -right-8 bg-emerald-600 text-white p-8 rounded-3xl shadow-xl max-w-xs hidden md:block">
                  <p className="text-2xl font-bold mb-2">99%</p>
                  <p className="text-sm opacity-90 font-medium">Uptime for our municipal critical dashboard.</p>
                </div>
             </div>
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2 space-y-8">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Why SaafRasta?</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">Smart Governance Starts Here</h3>
            <p className="text-lg text-slate-600">
              Traditional complaint systems are broken. They lack transparency and accountability. SaafRasta redesigns the relationship between citizen and city.
            </p>
            <div className="space-y-4">
              {points.map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 bg-emerald-100 text-emerald-600 p-1 rounded-full">
                    <Check size={16} />
                  </div>
                  <p className="font-semibold text-slate-700">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
