
import React from 'react';
import { Code, Lightbulb, Rocket } from 'lucide-react';

const Hackathon: React.FC = () => {
  return (
    <section id="hackathon" className="py-24 bg-emerald-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-5">
        <Code size={400} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200">
            Hackathon Project
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Our Vision & Future Roadmap</h2>
          <p className="text-slate-600 italic">
            "Developed with passion during the 2024 CivicTech Hackathon to solve real-world problems using modern web technologies."
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100">
            <div className="text-emerald-600 mb-6">
              <Lightbulb size={32} />
            </div>
            <h4 className="text-xl font-bold mb-4 text-slate-900">Innovation</h4>
            <p className="text-slate-600 mb-6">Using Computer Vision via Gemini API to automatically categorize reports, reducing manual data entry for municipalities by 90%.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100">
            <div className="text-emerald-600 mb-6">
              <Code size={32} />
            </div>
            <h4 className="text-xl font-bold mb-4 text-slate-900">Architecture</h4>
            <p className="text-slate-600 mb-6">Built using React and TypeScript for a robust frontend, and a geo-spatial database for efficient location-based querying.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100">
            <div className="text-emerald-600 mb-6">
              <Rocket size={32} />
            </div>
            <h4 className="text-xl font-bold mb-4 text-slate-900">Scaling Up</h4>
            <p className="text-slate-600 mb-6">Future plans include IoT sensors in manholes and streetlights to auto-generate reports even before citizens notice.</p>
          </div>
        </div>

        <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white">
           <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                 <h4 className="text-2xl font-bold mb-2">Open for Collaboration</h4>
                 <p className="text-slate-400">This is an open-source project. We are looking for mentors, developers, and municipal partners to take SaafRasta from demo to production.</p>
              </div>
              <a href="#" className="whitespace-nowrap bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors">
                 View Github Repo
              </a>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Hackathon;
