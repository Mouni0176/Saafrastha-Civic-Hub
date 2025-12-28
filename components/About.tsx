
import React from 'react';
import { CheckCircle2, MapPin, Camera, Sparkles, Smartphone, Users, ChevronLeft } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="bg-white overflow-hidden">
      {/* Page Header */}
      <div className="bg-emerald-50 py-16 mb-16 border-b border-emerald-100">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Our Mission: <span className="text-emerald-600">Cleaner India</span>
          </h1>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl font-medium">
            Discover how SaafRasta is rewriting the relationship between citizens and governance through technology.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 mb-12">
        {/* Headline */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">The Purpose</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 leading-tight">
            Making Our Cities Cleaner and Safer, Together
          </h3>
          
          <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
            <p>
              <strong>SaafRasta</strong> is your direct link to a better neighborhood. We believe that small actions lead to big changes. Our app helps you report civic issues like garbage piles, potholes, or broken streetlights in seconds, so they can be fixed faster.
            </p>
            <p>
              Whether you are in a busy metro or a quiet town, SaafRasta works across India to ensure your voice is heard. By simply snapping a photo and sharing your location, you help our government partners prioritize the most urgent problems in our communities.
            </p>
            <p>
              No more complicated forms or endless waiting. Just report, track the progress on your phone, and see your city transform in real-time.
            </p>
          </div>
        </div>

        {/* Intro Image Suggestion - Replaced the person with a clean city landscape */}
        <div className="mb-24">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group border-[12px] border-slate-50 bg-slate-100 h-64 md:h-[500px]">
            <img 
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200" 
              alt="Clean Cityscape Vision" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
              <p className="text-white font-bold text-3xl italic">"Our collective journey toward a cleaner city."</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start pb-24 border-b border-slate-100">
          {/* How it helps section */}
          <div className="space-y-8">
            <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Sparkles className="text-emerald-600" /> How it helps you
            </h4>
            <div className="grid gap-6">
              {[
                {
                  icon: <Camera className="text-emerald-600" />,
                  title: "Easy Reporting",
                  desc: "Report issues using photos, voice notes, or text in just three taps. No complex forms required."
                },
                {
                  icon: <MapPin className="text-blue-600" />,
                  title: "Smart Location Tracking",
                  desc: "Our GPS automatically finds the exact spot, ensuring help reaches the right place every time."
                },
                {
                  icon: <Smartphone className="text-amber-600" />,
                  title: "Real-Time Tracking",
                  desc: "Watch as authorities acknowledge your report and update its progress until it is fully resolved."
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 p-8 bg-slate-50 rounded-[2rem] hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5">
                  <div className="mt-1 p-3 bg-white rounded-xl shadow-sm">{item.icon}</div>
                  <div>
                    <h5 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h5>
                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why it matters section */}
          <div className="space-y-8 lg:bg-slate-900 lg:p-12 lg:rounded-[3rem] lg:text-white lg:shadow-2xl">
            <h4 className="text-2xl font-bold text-slate-900 lg:text-white flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" /> Why this app matters
            </h4>
            <div className="space-y-8 text-slate-600 lg:text-slate-400 leading-relaxed text-lg">
              <p>
                SaafRasta is about ownership and accountability. When we report together, we create a transparent map of our city's needs. It helps authorities work more efficiently and empowers every citizen to take pride in their surroundings.
              </p>
              <ul className="space-y-6">
                {[
                  "It turns citizens into active community participants.",
                  "It ensures high-priority hazards like open manholes are fixed fast.",
                  "It builds trust through clear, photo-verified resolutions.",
                  "It creates a data-backed vision for a cleaner, greener India."
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                    <span className="font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
