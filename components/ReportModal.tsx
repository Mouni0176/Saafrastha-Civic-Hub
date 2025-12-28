
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin, Send, Loader2, Sparkles, CheckCircle2, Navigation, RefreshCw, ShieldAlert, FileText, CheckSquare, Zap, ShieldCheck } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { User, Report } from '../App';

// Initializing the Gemini API client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const [aiAnalysis, setAiAnalysis] = useState<{ category: string; severity: string; suggestion: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect user's current location and reverse geocode it to a readable address.
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
        // Display the error message instead of the object
        const errorMessage = error.message || "An unknown location error occurred.";
        alert(`Geolocation failed: ${errorMessage}. Please check browser permissions and try again.`);
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

  // Uses Gemini AI to analyze the issue description and provide metadata like category and severity.
  const analyzeIssue = async () => {
    if (!description) return;
    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this civic issue description: "${description}". Categorize it, determine severity (Low, Medium, High, Critical), and suggest which department should handle it. Also provide a short catchy 3-word title.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              severity: { type: Type.STRING },
              suggestion: { type: Type.STRING }
            },
            required: ["title", "category", "severity", "suggestion"]
          }
        }
      });
      let cleanedText = response.text || '{}';
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const result = JSON.parse(cleanedText);
      setAiAnalysis(result);
      setTitle(result.title);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setAiAnalysis({ category: "General Maintenance", severity: "Medium", suggestion: "Municipal Works" });
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
      alert("Error submitting report. The database might be busy. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col max-h-[85vh]">
        {/* Compact Integrated Header */}
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

          {/* Stepper Inside Header */}
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

        {/* Floating Scrollable Content Area */}
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
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Consulting Gemini AI...</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative z-10">
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Detected Issue</h4>
                      <p className="text-2xl font-black text-slate-900">{title || 'Processing...'}</p>
                    </div>
                    
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

                    <div className="bg-white p-5 rounded-2xl border border-indigo-100 flex gap-3">
                      <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recommended Agency</p>
                        <p className="text-xs font-bold text-slate-700">{aiAnalysis?.suggestion || 'Calculating...'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                   Your civic report has been securely transmitted to the municipal gateway. Track progress in your hub.
                 </p>
               </div>

               <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 inline-flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Broadcast Live to Sector 4</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
