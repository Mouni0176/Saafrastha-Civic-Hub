
import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle2, ChevronRight, Globe, Loader2, Sparkles, Building2, Trash2 } from 'lucide-react';

interface JurisdictionSetupProps {
  onSave: (cities: string[]) => Promise<void>;
  initialCities: string[];
}

const ALL_CITIES = [
  "New Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", 
  "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", 
  "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", 
  "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", 
  "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi"
];

const POPULAR_CITIES = [
  { name: "New Delhi", icon: "🏛️" },
  { name: "Mumbai", icon: "🏙️" },
  { name: "Bengaluru", icon: "🌳" },
  { name: "Chennai", icon: "🌊" },
  { name: "Kolkata", icon: "🌉" },
  { name: "Hyderabad", icon: "🏰" }
];

const JurisdictionSetup: React.FC<JurisdictionSetupProps> = ({ onSave, initialCities }) => {
  const [selectedCities, setSelectedCities] = useState<string[]>(initialCities);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleCity = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        const detectedCity = data.address.city || data.address.state_district || data.address.state;
        
        // Find closest match in our list
        const match = ALL_CITIES.find(c => detectedCity.toLowerCase().includes(c.toLowerCase()));
        if (match && !selectedCities.includes(match)) {
          toggleCity(match);
        } else if (detectedCity && !selectedCities.includes(detectedCity)) {
          toggleCity(detectedCity);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsDetecting(false);
      }
    });
  };

  const filteredCities = ALL_CITIES.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedCities.includes(c)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="mb-12 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-100">
           <Building2 size={14} /> Authority Management
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
          Define Your <span className="text-indigo-600">Jurisdiction</span>
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl">
          Select the municipalities and sectors you are authorized to manage. You will only receive civic reports from these areas.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          {/* Search Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search city or municipality..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-16 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all"
            >
              {isDetecting ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              Detect my current location
            </button>

            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Popular Hubs</p>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {POPULAR_CITIES.map(city => (
                   <button
                     key={city.name}
                     onClick={() => toggleCity(city.name)}
                     className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                       selectedCities.includes(city.name) 
                       ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                       : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'
                     }`}
                   >
                     <span className="text-xl">{city.icon}</span>
                     <span className="text-xs font-bold truncate">{city.name}</span>
                   </button>
                 ))}
               </div>
            </div>

            {searchTerm && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Search Results</p>
                <div className="flex flex-wrap gap-2">
                  {filteredCities.map(city => (
                    <button
                      key={city}
                      onClick={() => toggleCity(city)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                    >
                      + {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl flex-grow flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                 </div>
                 <h3 className="font-black text-lg uppercase tracking-tight">Active Jurisdiction</h3>
               </div>
               <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                 {selectedCities.length} Cities
               </span>
            </div>

            <div className="flex-grow space-y-3 mb-8 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {selectedCities.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                   <Globe size={32} className="mb-3 opacity-20" />
                   <p className="text-[10px] font-black uppercase tracking-widest">No cities assigned</p>
                </div>
              ) : (
                selectedCities.map(city => (
                  <div key={city} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group animate-in slide-in-from-right-2">
                    <span className="font-bold text-sm tracking-tight">{city}</span>
                    <button 
                      onClick={() => toggleCity(city)}
                      className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button 
              disabled={selectedCities.length === 0 || isSaving}
              onClick={async () => {
                setIsSaving(true);
                await onSave(selectedCities);
                setIsSaving(false);
              }}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <>Activate Command Gateway <ChevronRight size={18} /></>}
            </button>
            <p className="mt-6 text-[8px] text-slate-500 font-black uppercase tracking-[0.25em] text-center">
              All jurisdiction changes are logged for transparency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JurisdictionSetup;
