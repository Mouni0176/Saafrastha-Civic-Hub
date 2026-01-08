import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin, Send, Loader2, Sparkles, CheckCircle2, Navigation, RefreshCw, ShieldAlert, FileText, CheckSquare, Zap, ShieldCheck, AlertCircle, Map as MapIcon } from 'lucide-react';
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
        text: `INPUTS FOR AUDIT:
1. WRITTEN DESCRIPTION: "${description}"
2. MANUAL ADDRESS: "${address}"`
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: `You are a strict issue-verification and analysis assistant for a reporting application.
Your job is NOT to guess or be creative. Your job is to verify alignment and report facts only.
You are allowed and encouraged to reject requests when inputs are conflicting, unclear, or irrelevant.

STEP 1 — ADDRESS VALIDATION
- Reject the address if it is empty, vague (e.g., "my area", "near me"), uses placeholders ("test", "asdf"), or lacks real-world structure.
- If rejected, set address_valid: false and explain why in "reason".

STEP 2 — IMAGE vs DESCRIPTION CHECK
- Determine whether the provided image clearly and unambiguously supports the issue described in the text.
- If the image does NOT clearly match the description (e.g., description says "pothole" but image shows "trash", "a cat", or "no issue"):
  - Do NOT analyze the issue.
  - Do NOT infer missing details or guess intent.
  - Set image_matches_description: false.
  - Return: { "image_matches_description": false, "confidence_level": "low", "issue_analysis": "", "reason": "The uploaded image does not clearly support the reported issue. Please upload a relevant image." }

STEP 3 — ISSUE ANALYSIS (ONLY IF ALL CHECKS PASS)
- Treat the written description as the primary source of truth.
- Identify CATEGORY (Sanitation, Road Work, Hazards, Utilities, Public Health), SEVERITY (Low, Medium, High, Critical), and a TITLE.

ABSOLUTE RULES:
- NEVER guess.
- NEVER assume the image is correct if it differs from text.
- NEVER add extra issues not in the description.
- If unsure, lower the confidence level or REJECT.

OUTPUT FORMAT (JSON ONLY):
{
  "address_valid": boolean,
  "image_matches_description": boolean,
  "confidence_level": "high | medium | low",
  "issue_analysis": "Clear factual analysis using format: CATEGORY: [cat], SEVERITY: [sev], TITLE: [title]. [Details]",
  "address": "exact user-typed address",
  "reason": "Explain how the image supports/fails the description or why the address is invalid"
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
        reason: "The analysis system encountered a technical audit failure. Please check your inputs.",
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
      alert("Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[85vh]">
        <div className="bg-slate-900 px-8 py-6 relative flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-red-600/30">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="font-black text-white text-lg tracking-tight uppercase leading-none">Civic Dispatch</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">Strict Audit v3.2</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-slate-400">
              <X size={20}/>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {[
              { n: 1, label: 'Evidence', icon: <FileText size={14} /> },
              { n: 2, label: 'Audit', icon: <Zap size={14} /> },
              { n: 3, label: 'Result', icon: <CheckSquare size={14} /> }
            ].map((s) => (
              <div key={s.n} className={`flex items-center gap-2 ${step === s.n ? 'text-white' : 'text-slate-500'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${
                  step === s.n ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 
                  step > s.n ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-700'
                }`}>
                  {step > s.n ? <CheckCircle2 size={14} /> : s.n}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] hidden xs:block">{s.label}</span>
                {s.n < 3 && <div className="w-4 h-px bg-slate-800 mx-1 hidden sm:block"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 relative overflow-y-auto custom-scrollbar flex-grow bg-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-50 font-black text-[10rem] -z-10 select-none opacity-60 pointer-events-none">
            SAAF
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div 
                className={`relative aspect-[16/8] rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group ${
                  previewUrl ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={40} className="text-slate-300 group-hover:text-indigo-400 transition-colors mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence Mandatory for Audit</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin size={12} className="text-indigo-500" /> Precise Address
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    placeholder="Street, Area, City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText size={12} /> Issue Description
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px]"
                    placeholder="Provide a factual description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={!description || !address || !previewUrl}
                onClick={() => { analyzeIssue(); setStep(2); }}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                Start Verification <Navigation size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              {isAnalyzing ? (
                <div className="bg-indigo-50/50 p-12 rounded-[3rem] border border-indigo-100 flex flex-col items-center gap-6">
                  <Loader2 size={48} className="animate-spin text-indigo-600" />
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Cynical Audit Active...</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifying image-text correlation</p>
                  </div>
                </div>
              ) : aiAnalysis && (!aiAnalysis.address_valid || !aiAnalysis.image_matches_description) ? (
                <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 text-center space-y-6">
                  <div className="w-20 h-20 bg-white text-red-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <AlertCircle size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-red-900 uppercase">Audit Rejected</h4>
                    <p className="text-sm font-medium text-red-700 leading-relaxed">
                      {aiAnalysis.reason}
                    </p>
                  </div>
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20"
                  >
                    Adjust Inputs & Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-indigo-50/50 p-8 rounded-[3rem] border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Sparkles size={80} />
                    </div>
                    
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Validated Profile</h4>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-600">
                          {aiAnalysis?.confidence_level} Confidence
                        </span>
                      </div>
                      
                      <p className="text-2xl font-black text-slate-900 leading-tight">{title || 'Processing...'}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                          <p className="text-xs font-bold text-slate-800">{aiAnalysis?.category}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Severity</p>
                          <p className={`text-xs font-black ${aiAnalysis?.severity === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>
                            {aiAnalysis?.severity}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-indigo-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Factual Analysis</p>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {aiAnalysis?.issue_analysis.split('TITLE:')[1]?.split('.').slice(1).join('.').trim() || aiAnalysis?.issue_analysis}
                        </p>
                      </div>

                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                        <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Audit Status</p>
                          <p className="text-[10px] font-bold text-slate-600 leading-tight">
                             Correlation Verified. Evidence matches description.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MapIcon size={12} className="text-indigo-500" /> Logged Geodata
                    </h5>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed italic">"{address}"</p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-5 bg-white border border-slate-200 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all"
                    >
                      Resubmit
                    </button>
                    <button 
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="flex-[2] bg-indigo-600 text-white py-5 px-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Finalize Report <CheckCircle2 size={18} /></>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-8 animate-in zoom-in duration-500">
               <div className="relative inline-block">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={56} className="animate-in slide-in-from-bottom-2" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-bounce" size={28} />
               </div>
               
               <div className="space-y-4">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">Report Logged!</h3>
                 <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                   Audit successful. Your civic report has been securely transmitted.
                 </p>
               </div>

               <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 inline-flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Broadcast Live to Sector Node</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;