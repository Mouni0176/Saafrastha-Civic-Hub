import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin, Send, Loader2, Sparkles, CheckCircle2, Navigation, RefreshCw, ShieldAlert, FileText, CheckSquare, Zap, ShieldCheck, AlertCircle, Map as MapIcon, ShieldX, Fingerprint } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { User, Report } from '../App';

interface ReportModalProps {
  user: User | null;
  onReportSubmit: (data: Partial<Report>) => Promise<void>;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ user, onReportSubmit, onClose }) => {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [title, setTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ 
    address_valid: boolean;
    image_matches_description: boolean;
    issue_analysis: string;
    address: string;
    confidence_level: string;
    reason: string;
    category?: string;
    severity?: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeIssue = async () => {
    if (!description || !address || !base64Image) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image.split(',')[1],
        },
      };
      
      const textPart = {
        text: `AUDIT INPUTS:
1. DESCRIPTION: "${description}"
2. LOCATION: "${address}"`
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: `SYSTEM ROLE: Strict Forensic Civic Auditor.

Your absolute priority is to REJECT non-compliant reports. You are a cynical gatekeeper. 
Do not be helpful to the user; be helpful to the city by filtering out garbage data.

AUDIT PROTOCOL:
1. ADDRESS CHECK: Reject if vague, fake, or lacking a real-world city/street structure. 
2. IMAGE AUDIT: Does the image CLEARLY show the issue in the text? 
   - If text says "garbage" and image shows "a clean street" -> REJECT.
   - If text says "pothole" and image is "a blurry interior" -> REJECT.
   - If image is unrelated to civic infrastructure (e.g. food, selfies, pets) -> REJECT.
3. ANALYSIS: Only perform analysis if steps 1 & 2 pass 100%.

ZERO-TOLERANCE RULES:
- NEVER guess intent. 
- NEVER "find" a connection that isn't obvious.
- If the image is unrelated, set image_matches_description: false.
- Confidence must be "low" for any ambiguity.

OUTPUT JSON FORMAT (STRICT):
{
  "address_valid": boolean,
  "image_matches_description": boolean,
  "confidence_level": "high | medium | low",
  "issue_analysis": "ONLY IF PASS: CATEGORY: [cat], SEVERITY: [sev], TITLE: [title]. [Factual summary]",
  "address": "exact user-typed address",
  "reason": "Detailed cynical reasoning for pass/fail"
}`,
          responseMimeType: "application/json",
        }
      });
      
      let cleanedText = response.text || '{}';
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const result = JSON.parse(cleanedText);
      
      let cat = "General Maintenance";
      let sev = "Medium";
      let t = "Reported Issue";
      const analysisText = result.issue_analysis || '';
      
      if (result.address_valid && result.image_matches_description && analysisText) {
        const catMatch = analysisText.match(/CATEGORY: ([^,]+)/i);
        const sevMatch = analysisText.match(/SEVERITY: ([^,]+)/i);
        const titleMatch = analysisText.match(/TITLE: ([^.]+)/i);
        
        if (catMatch) cat = catMatch[1].trim();
        if (sevMatch) sev = sevMatch[1].trim();
        if (titleMatch) t = titleMatch[1].trim();
      }

      setAiAnalysis({
        ...result,
        category: cat,
        severity: sev
      });
      setTitle(t);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setAiAnalysis({ 
        address_valid: false,
        image_matches_description: false,
        issue_analysis: "",
        address: "",
        reason: "The audit gateway encountered a technical anomaly. Review inputs and resubmit.",
        confidence_level: "low"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const reportData: Partial<Report> = {
        title: title || 'New Report',
        description,
        category: aiAnalysis?.category || 'General',
        severity: aiAnalysis?.severity || 'Medium',
        imageUrl: base64Image || previewUrl || undefined,
        location: address,
      };
      
      await onReportSubmit(reportData);
      setStep(3);
      setTimeout(() => onClose(), 3000);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Transmission failed. Re-initiating connection...");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-500 border border-white/10 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-8 py-6 relative flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-2xl shadow-red-600/30">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="font-black text-white text-lg tracking-tight uppercase leading-none">Civic Auditor</h3>
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">Strict Forensic Protocol v3.2</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-slate-400">
              <X size={20}/>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            {[
              { n: 1, label: 'Entry', icon: <Fingerprint size={14} /> },
              { n: 2, label: 'Audit', icon: <Zap size={14} /> },
              { n: 3, label: 'Logged', icon: <CheckSquare size={14} /> }
            ].map((s) => (
              <div key={s.n} className={`flex items-center gap-3 ${step === s.n ? 'text-white' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${
                  step === s.n ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 
                  step > s.n ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-700'
                }`}>
                  {step > s.n ? <CheckCircle2 size={16} /> : s.n}
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.1em] hidden xs:block">{s.label}</span>
                {s.n < 3 && <div className="w-4 h-px bg-slate-800 mx-1 hidden sm:block"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-10 relative overflow-y-auto custom-scrollbar flex-grow bg-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-50 font-black text-[12rem] -z-10 select-none opacity-40 pointer-events-none">
            SAAF
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Evidence Picker */}
              <div 
                className={`relative aspect-[16/8] rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group ${
                  previewUrl ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm">Change Evidence</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-white group-hover:shadow-xl transition-all duration-500 mb-4">
                      <Camera size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-8">Mandatory Visual Evidence File</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <MapPin size={12} className="text-indigo-500" /> Precise Location Registry
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] py-5 px-8 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                    placeholder="Street, Landmark, City (e.g., Sector 4 Main Cross, Noida)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <FileText size={12} className="text-emerald-500" /> Factual Issue Description
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[120px] placeholder:text-slate-300"
                    placeholder="Be brief and objective about the observation..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={!description || !address || !previewUrl}
                onClick={() => { analyzeIssue(); setStep(2); }}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
              >
                Initiate Strict Audit 
                <Navigation size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {isAnalyzing ? (
                <div className="bg-slate-900 p-12 rounded-[3rem] border border-white/10 flex flex-col items-center gap-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan" />
                  
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-white/5 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 text-indigo-400 animate-pulse" size={24} />
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Running Forensic Integrity Audit...</p>
                    <div className="flex flex-col gap-2">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Verifying Image-Description Correlation</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Authenticating Geographic Metadata</p>
                    </div>
                  </div>

                  <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes scan {
                      0% { transform: translateY(0); opacity: 0; }
                      50% { opacity: 1; }
                      100% { transform: translateY(300px); opacity: 0; }
                    }
                    .animate-scan {
                      animation: scan 2.5s infinite linear;
                    }
                  `}} />
                </div>
              ) : aiAnalysis && (!aiAnalysis.address_valid || !aiAnalysis.image_matches_description) ? (
                <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100 text-center space-y-8 animate-in zoom-in">
                  <div className="w-24 h-24 bg-white text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-rose-600/10 rotate-3">
                    <ShieldX size={48} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black text-rose-900 uppercase tracking-tight">Audit Rejected</h4>
                    <p className="text-sm font-medium text-rose-700 leading-relaxed px-4">
                      {aiAnalysis.reason}
                    </p>
                  </div>
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-5 bg-rose-600 text-white rounded-[1.75rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
                  >
                    Adjust Evidence Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="bg-indigo-50/50 p-8 rounded-[3.5rem] border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                      <ShieldCheck size={120} />
                    </div>
                    
                    <div className="space-y-8 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                           <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Verified Node Registry</h4>
                        </div>
                        <span className="text-[9px] font-black uppercase px-3 py-1 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">
                          {aiAnalysis?.confidence_level} Confidence
                        </span>
                      </div>
                      
                      <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tighter uppercase">{title || 'Authenticated Issue'}</h2>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-[1.5rem] border border-indigo-50 shadow-sm">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sector Class</p>
                          <p className="text-xs font-black text-slate-800 uppercase">{aiAnalysis?.category}</p>
                        </div>
                        <div className="bg-white p-5 rounded-[1.5rem] border border-indigo-50 shadow-sm">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority Rank</p>
                          <p className={`text-xs font-black uppercase ${aiAnalysis?.severity === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>
                            {aiAnalysis?.severity}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-[2rem] border border-indigo-50 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Audit Summary</p>
                        <p className="text-xs text-slate-700 leading-relaxed font-bold">
                          {aiAnalysis?.issue_analysis.split('TITLE:')[1]?.split('.').slice(1).join('.').trim() || aiAnalysis?.issue_analysis}
                        </p>
                      </div>

                      <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100 flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm flex-shrink-0">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Integrity Status</p>
                          <p className="text-[10px] font-bold text-slate-600 leading-tight italic">
                             "{aiAnalysis?.reason}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                       <MapIcon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Logged Coordinates</h5>
                      <p className="text-xs font-black text-slate-700 truncate tracking-tight">{address}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-5 bg-white border border-slate-200 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                    >
                      Audit Again
                    </button>
                    <button 
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="flex-[2] bg-indigo-600 text-white py-5 px-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Finalize Dispatch <Send size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-16 space-y-10 animate-in zoom-in duration-700">
               <div className="relative inline-block">
                  <div className="w-28 h-28 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner rotate-3">
                    <CheckCircle2 size={64} className="animate-in slide-in-from-bottom-4 duration-1000" />
                  </div>
                  <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-bounce" size={32} />
               </div>
               
               <div className="space-y-4">
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Audit Passed</h3>
                 <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xs mx-auto">
                   Observation authenticated. Dispatch command transmitted to local node.
                 </p>
               </div>

               <div className="p-5 bg-emerald-50 rounded-[1.75rem] border border-emerald-100 inline-flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Live Signal: BROADCASTING</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;