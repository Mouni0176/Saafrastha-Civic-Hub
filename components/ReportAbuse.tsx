
import React, { useState } from 'react';
/* Removed non-existent ShieldWarning and unused Flame from lucide-react to fix compilation error */
import { AlertTriangle, Send, ShieldAlert, CheckCircle2, Loader2, Mail, Info } from 'lucide-react';

interface ReportAbuseProps {
  onOpenCrisis?: () => void;
}

const ReportAbuse: React.FC<ReportAbuseProps> = ({ onOpenCrisis }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    reportId: '',
    reason: 'Inappropriate Content',
    details: '',
    userEmail: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate sending to saafrastha@gmail.com
    console.log("SENDING ABUSE REPORT TO saafrastha@gmail.com:", formData);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white p-6">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Report Received</h2>
          <p className="text-slate-500 font-medium">
            Thank you for keeping SaafRasta safe. Our community integrity team has received your report and is investigating it now.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <div className="bg-red-50 py-24 border-b border-red-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[100px]"></div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldAlert size={14} /> Trust & Safety Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Security Hub</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
            Report civic emergencies or platform misuse to maintain our community's integrity.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 relative z-20">
        <div className="max-w-5xl mx-auto">
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Guidelines */}
            <div className="space-y-8">
              <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6 shadow-xl">
                <h3 className="text-2xl font-black uppercase tracking-tight">Platform Safety</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Report users who are posting fake reports or harassing others. Email logs are mirrored to <span className="text-emerald-400 font-bold">saafrastha@gmail.com</span>.
                </p>
                <ul className="space-y-4">
                  {[
                    "No fake or misleading civic reports",
                    "No offensive language or inappropriate photos",
                    "No commercial advertising or spam",
                    "No impersonation of government officials"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] flex gap-5">
                <Info className="text-blue-500 flex-shrink-0" size={28} />
                <p className="text-sm text-blue-800 leading-relaxed font-bold">
                  Identify specific cases using the Unique ID (e.g. #SR-1001) found on the report detail page.
                </p>
              </div>
            </div>

            {/* Platform Abuse Form */}
            <div>
              <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Report Platform Misuse</h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Issue ID</label>
                  <input 
                    type="text" 
                    placeholder="#SR-XXXX" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold"
                    value={formData.reportId}
                    onChange={(e) => setFormData({...formData, reportId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for Violation</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-black appearance-none"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  >
                    <option>Inappropriate Content</option>
                    <option>Fake/Spam Report</option>
                    <option>Harassment/Bullying</option>
                    <option>Misleading Information</option>
                    <option>Other Misuse</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence Details</label>
                  <textarea 
                    required
                    placeholder="Provide specific details about the violation..." 
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-medium"
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Follow-up Contact</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required
                      placeholder="you@example.com" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-14 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold"
                      value={formData.userEmail}
                      onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                    />
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Submit Safety Report</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportAbuse;
