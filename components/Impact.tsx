
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', reports: 400, resolved: 320 },
  { name: 'Feb', reports: 600, resolved: 510 },
  { name: 'Mar', reports: 800, resolved: 720 },
  { name: 'Apr', reports: 1100, resolved: 1010 },
];

const Impact: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-slate-900 rounded-[3rem] overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 md:p-16 space-y-8">
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Sustainability & Community</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">Quantifying our collective impact</h3>
              <p className="text-lg text-slate-400">
                SaafRasta isn't just about reporting; it's about shifting the civic culture. We've seen a 40% improvement in response times in our pilot clusters.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div>
                  <p className="text-4xl font-extrabold text-emerald-400 mb-1">85%</p>
                  <p className="text-sm text-slate-400 font-medium">Faster Response</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-blue-400 mb-1">12k+</p>
                  <p className="text-sm text-slate-400 font-medium">Reports Fixed</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-amber-400 mb-1">50+</p>
                  <p className="text-sm text-slate-400 font-medium">Partners NGOs</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-purple-400 mb-1">94%</p>
                  <p className="text-sm text-slate-400 font-medium">Citizen Trust</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 bg-slate-800/50 p-8 flex flex-col justify-center border-l border-slate-800">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-white mb-2">Resolution Efficiency</h4>
                <p className="text-sm text-slate-400">Reporting vs Resolution rate over pilot period</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="reports" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div> Reports
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div> Resolved
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
