import React from 'react';
import { 
  ChevronLeft, 
  Cpu, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Globe, 
  Camera, 
  Eye, 
  TrendingUp, 
  HandHelping, 
  LayoutDashboard 
} from 'lucide-react';

interface FeatureDetailProps {
  featureId: number;
  onBack: () => void;
  onGetStarted: () => void;
}

const FEATURE_DATA = [
  {
    icon: <Camera />,
    title: "AI-Powered Photo Reporting",
    tagline: "Smarter reporting using World-Class Computer Vision.",
    desc: "Our AI-Powered Photo Reporting system leverages the Google Gemini 2.5 Flash model to instantly analyze user-submitted photos. When a citizen snaps a picture of an issue—whether it's a cracked pavement, an overflowing bin, or a leaking pipe—our AI identifies the core problem in milliseconds.",
    techStack: ["Gemini 2.5 Flash API", "TensorFlow Lite", "AWS S3 Image Storage", "PyTorch Analytics"],
    benefits: [
      "90% reduction in manual data entry for citizens.",
      "Automatic categorization for faster routing to correct departments.",
      "Severity detection based on visual density of the hazard.",
      "Image enhancement for low-light or blurry submissions."
    ],
    color: "emerald"
  },
  {
    icon: <Eye />,
    title: "Transparent Tracking",
    tagline: "Know exactly where your request stands.",
    desc: "Transparency is the bedrock of trust. Our Transparent Tracking system ensures that once a report is submitted, it is never 'lost in the system'. Every action taken by authorities is logged and visible to the reporter in real-time through a state-machine driven progress bar.",
    techStack: ["Real-time WebSockets", "Node.js Event Stream", "React State Management", "Firebase Cloud Messaging"],
    benefits: [
      "Live status updates from 'Submitted' to 'Resolved'.",
      "Timestamped audit logs for every stage of the process.",
      "Photo proof requirements for authorities to close a case.",
      "Direct feedback loop for citizens to rate the resolution."
    ],
    color: "blue"
  },
  {
    icon: <TrendingUp />,
    title: "Data-Driven Prioritization",
    desc: "SaafRasta doesn't just fix issues; it prevents them. By using Geo-spatial heatmaps and historical data clusters, we help city managers identify systemic failures. If a particular street has five potholes reported in a month, our system flags it for a complete road resurfacing rather than a temporary patch.",
    tagline: "Strategic resource allocation for smarter cities.",
    techStack: ["PostGIS Spatial DB", "Leaflet.js Mapping", "Python Data Science Stack", "Chart.js Visualizations"],
    benefits: [
      "Heatmaps to identify high-risk 'Hazard Zones'.",
      "Predictive maintenance alerts for aging infrastructure.",
      "Budget optimization for municipal departments.",
      "Trend analysis for urban planning and development."
    ],
    color: "amber"
  },
  {
    icon: <HandHelping />,
    title: "Civic Volunteering",
    desc: "Not every issue requires a government contract. SaafRasta bridges the gap between civic problems and local community spirit. We partner with registered NGOs and student groups to tackle minor sanitation and aesthetic issues, fostering a sense of ownership over public spaces.",
    tagline: "Empowering the community to take the lead.",
    techStack: ["NGO Auth Portal", "Event Management API", "Digital Badge System", "Social Sharing Integration"],
    benefits: [
      "Gamified reward system for active volunteers.",
      "Safe and vetted platform for local NGO participation.",
      "Community clean-up drive coordination tools.",
      "Digital certificates and civic impact badges for resumes."
    ],
    color: "purple"
  },
  {
    icon: <LayoutDashboard />,
    title: "Authority Dashboard",
    desc: "A powerful command center for city managers. The Authority Dashboard provides a bird's-eye view of all civic activity. It allows for team assignment, performance tracking of field workers, and comprehensive KPI monitoring to ensure the city is meeting its service level agreements (SLAs).",
    tagline: "Professional tools for public servants.",
    techStack: ["React Admin Framework", "RBAC Security Layer", "Worker App Integration", "PDF/Excel Report Engines"],
    benefits: [
      "Unified view of all pending and active requests.",
      "Staff management and field worker dispatching.",
      "Performance analytics for different city sectors.",
      "Secure data handling with encrypted government access."
    ],
    color: "slate"
  }
];

const FeatureDetail: React.FC<FeatureDetailProps> = ({ featureId, onBack, onGetStarted }) => {
  const data = FEATURE_DATA[featureId];
  const colorClass = data.color === 'emerald' ? 'text-emerald-600 bg-emerald-50' : 
                    data.color === 'blue' ? 'text-blue-600 bg-blue-50' :
                    data.color === 'amber' ? 'text-amber-600 bg-amber-50' :
                    data.color === 'purple' ? 'text-purple-600 bg-purple-50' :
                    data.color === 'green' ? 'text-green-600 bg-green-50' : 'text-slate-600 bg-slate-50';

  return (
    <div className="bg-white min-h-screen">
      {/* Dynamic Header */}
      <div className={`py-20 border-b border-slate-100 relative overflow-hidden bg-slate-50`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] -z-0"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors mb-12 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Features
          </button>
          
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-2/3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${colorClass}`}>
                {React.cloneElement(data.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                {data.title}
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                {data.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-24">
        <div className="grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Sparkles className="text-emerald-600" /> Feature Overview
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {data.desc}
              </p>
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Zap className="text-blue-600" /> Core Benefits
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {data.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white group-hover:scale-110 transition-transform">
                      <ShieldCheck size={12} />
                    </div>
                    <p className="text-slate-700 font-medium">{benefit}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Cpu size={20} className="text-emerald-400" /> Technology Stack
              </h4>
              <ul className="space-y-4">
                {data.techStack.map((tech, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium">{tech}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 pt-8 border-t border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Development Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-sm font-bold">Live in Pilot Cities</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem]">
              <h4 className="text-xl font-bold text-slate-900 mb-4">Start Using This</h4>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Experience {data.title} first-hand by reporting an issue in your neighborhood today.
              </p>
              <button 
                onClick={onGetStarted}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg"
              >
                Try It Now
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-100 py-16 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-slate-500 font-bold mb-6">Explore more innovations</p>
          <div className="flex flex-wrap justify-center gap-4">
             {FEATURE_DATA.map((f, i) => (
               <button 
                key={i} 
                onClick={() => {
                  onBack();
                }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${i === featureId ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-emerald-600 hover:text-emerald-600'}`}
               >
                 {React.cloneElement(f.icon as React.ReactElement<any>, { size: 20 })}
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetail;