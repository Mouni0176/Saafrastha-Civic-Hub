
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin, Send, Loader2, Sparkles, CheckCircle2, Navigation, RefreshCw, ShieldAlert, FileText, CheckSquare, Zap, ShieldCheck, AlertCircle } from 'lucide-react';
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
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [title, setTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ category: string; severity: string; analysis: string; image_matches_description: boolean; reason: string; confidence_level: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: { 'Accept-Language': 'en-US,en;q=0.5' }
            }
          );
          if (!response.ok) throw new Error("Geocoder failed");
          const data = await response.json();
          const detectedAddress = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(detectedAddress);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation failed:", error);
        const msg = error.message || "Unknown location error";
        alert(`Geolocation failed: ${msg}. Please check browser permissions and try again.`);
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

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
    if (!description || !base64Image) return;
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
        text: `REPORTED ISSUE DESCRIPTION: "${description}"`
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: `You are a strict issue-verification and analysis assistant for a reporting application.
You are allowed and encouraged to reject requests when inputs are conflicting or unclear.
Your job is NOT to guess or be creative.
Your job is to verify alignment and report facts only.

The user provides:
1) An image
2) A short written issue description

You must follow the steps and rules below exactly.
STEP 1 — IMAGE vs DESCRIPTION CHECK
Determine whether the image clearly supports the issue described in the text.

If the image does NOT clearly match the description:
- Do NOT analyze the issue
- Do NOT infer missing details
- Do NOT guess intent
- Return this exact result:
{
  "image_matches_description": false,
  "confidence_level": "low",
  "analysis": "",
  "reason": "The uploaded image does not clearly support the reported issue. Please upload a relevant image."
}

STEP 2 — ISSUE ANALYSIS (ONLY IF MATCHED)
If and only if the image matches the description:
- Treat the written description as the primary source of truth
- Use the image only as supporting evidence
- Do not introduce any issues not explicitly mentioned in the description
- If details are insufficient, state that clearly

STEP 3 — OUTPUT FORMAT
Always respond using valid JSON in the exact structure below:
{
  "image_matches_description": true,
  "confidence_level": "high | medium | low",
  "analysis": "A detailed factual analysis of the issue based strictly on the description. You MUST include metadata markers in the text like CATEGORY: [category], SEVERITY: [severity], TITLE: [title]. (Categories: Sanitation, Road Work, Hazards, Utilities, Public Health. Severities: Low, Medium, High, Critical). Then continue with the factual analysis.",
  "reason": "Brief explanation of how the image supports the description"
}

IMPORTANT RULES:
- Never guess
- Never assume the image is correct
- Never add extra issues
- If unsure, lower the confidence level or reject`,
          responseMimeType: "application/json",
        }
      });
      
      let cleanedText = response.text || '{}';
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const result = JSON.parse(cleanedText);
      
      // Post-process fields for internal app use
      let cat = "General Maintenance";
      let sev = "Medium";
      let t = "Reported Issue";
      
      if (result.image_matches_description && result.analysis) {
        const catMatch = result.analysis.match(/CATEGORY: ([^,]+)/i);
        const sevMatch = result.analysis.match(/SEVERITY: ([^,]+)/i);
        const titleMatch = result.analysis.match(/TITLE: ([^.]+)/i);
        
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
        category: "General Maintenance", 
        severity: "Medium", 
        analysis: "Analysis failed due to system error.", 
        image_matches_description: true,
        reason: "System was unable to perform vision check.",
        confidence_level: "low"
      });
      setTitle("Reported Issue");
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
        lat: coords?.lat,
        lng: coords?.lng
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
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">Official Filing v2.1</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-slate-400">
              <X size={20}/>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {[
              { n: 1, label: 'Evidence', icon: <Camera size={14} /> },
              { n: 2, label: 'AI Intel', icon: <Zap size={14} /> },
              { n: 3, label: 'Confirm', icon: <CheckSquare size={14} /> }
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
                className={`relative aspect-[16/10] rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group ${
                  previewUrl ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={48} className="text-slate-300 group-hover:text-indigo-400 transition-colors mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Click to upload evidence</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText size={12} /> Brief Description
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[120px]"
                  placeholder="What's happening? (e.g., Deep pothole at the main crossing...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                disabled={!description || !previewUrl}
                onClick={() => { analyzeIssue(); setStep(2); }}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                Next Step: AI Analysis <Navigation size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="bg-indigo-50/50 p-8 rounded-[3rem] border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles size={100} />
                </div>
                
                {isAnalyzing ? (
                  <div className="flex flex-col items-center py-10 gap-4">
                    <Loader2 size={40} className="animate-spin text-indigo-600" />
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Strict Verification in Progress...</p>
                  </div>
                ) : aiAnalysis && !aiAnalysis.image_matches_description ? (
                  <div className="space-y-6 text-center py-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={32} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 uppercase">Verification Failed</h4>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                      {aiAnalysis.reason}
                    </p>
                    <button 
                      onClick={() => setStep(1)}
                      className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Re-upload relevant image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Verified Issue Profile</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Confidence</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          aiAnalysis?.confidence_level === 'high' ? 'bg-emerald-100 text-emerald-600' :
                          aiAnalysis?.confidence_level === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {aiAnalysis?.confidence_level}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-2xl font-black text-slate-900">{title || 'Processing...'}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                        <p className="text-xs font-bold text-slate-800">{aiAnalysis?.category || 'Detecting...'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-indigo-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Severity</p>
                        <p className={`text-xs font-black ${aiAnalysis?.severity === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>
                          {aiAnalysis?.severity || 'Assessing...'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-indigo-100 space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Factual Analysis</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {aiAnalysis?.analysis.split('TITLE:')[0].split('SEVERITY:')[0].split('CATEGORY:')[0].replace(/CATEGORY:|SEVERITY:|TITLE:/g, '').trim() || aiAnalysis?.analysis}
                      </p>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                      <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Evidence Context</p>
                        <p className="text-[10px] font-bold text-slate-600 leading-tight">{aiAnalysis?.reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {aiAnalysis?.image_matches_description && (
                <>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MapPin size={12} className="text-red-500" /> Verified Location
                        </h5>
                        {isFetchingLocation && <RefreshCw size={12} className="animate-spin text-slate-400" />}
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed truncate">{address || 'Detecting...'}</p>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="flex-1 py-5 bg-white border border-slate-200 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all"
                    >
                      Edit Report
                    </button>
                    <button 
                      disabled={isAnalyzing || isSubmitting}
                      onClick={handleSubmit}
                      className="flex-[2] bg-indigo-600 text-white py-5 px-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Finalize Filing <CheckCircle2 size={18} /></>}
                    </button>
                  </div>
                </>
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
                   Your civic report has been securely transmitted. Track progress in your hub.
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
