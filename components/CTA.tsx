
import React from 'react';

interface CTAProps {
  onOpenReport: () => void;
}

const CTA: React.FC<CTAProps> = ({ onOpenReport }) => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-emerald-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Grid lines removed for cleaner look */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-white/20">
          </div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-6xl font-extrabold text-white leading-tight">Be Part of the Change</h2>
            <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
              Whether you're a concerned citizen or a municipal authority, your contribution matters. Let's build cleaner cities together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={onOpenReport}
                className="bg-white text-emerald-700 px-10 py-5 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Start Reporting Now
              </button>
            </div>
            <p className="text-emerald-100/70 text-sm font-medium pt-4">Available for both iOS and Android</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
