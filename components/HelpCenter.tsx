
import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Send, Loader2, Sparkles, User, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initializing GoogleGenAI client with the environment variable API_KEY directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FAQS = [
  {
    question: "How do I report an issue?",
    answer: "Simply click the 'Report Issue' button on the header or dashboard. You'll be asked to take or upload a photo, provide a brief description, and the app will automatically tag your GPS location."
  },
  {
    question: "How long does it take for an issue to be fixed?",
    answer: "Resolution times vary by category. High-priority issues like open manholes or hazardous waste are typically addressed within 24-48 hours. General maintenance may take 5-7 business days."
  },
  {
    question: "What are 'Civic Points' and how do I earn them?",
    answer: "Civic Points are our way of rewarding active community members. You earn points for every valid report submitted and bonus points when your report is successfully resolved by authorities."
  },
  {
    question: "Is my privacy protected when I report?",
    answer: "Yes. While your name is visible to authorities for verification, it is anonymized in the Public Feed. We only share necessary location data to fix the civic issue."
  },
  {
    question: "Can I report issues for other cities?",
    answer: "Currently, SaafRasta is active in selected pilot cities. If you are outside a pilot zone, you can still log reports, but response times from authorities may be delayed as we expand our network."
  }
];

const HelpCenter: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    {role: 'bot', text: "Namaste! I'm SaafBot, your SaafRasta support assistant. How can I help you improve your neighborhood today?"}
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are SaafBot, the official support AI for SaafRasta, a civic-tech app for reporting urban issues in India. You are helpful, polite, and deeply knowledgeable about the app's features: AI photo reporting, GPS tagging, civic points, authority dashboards, and volunteering. Keep answers concise and related to civic issues or the app. If asked about something unrelated, politely steer back to SaafRasta's mission of cleaner cities."
        }
      });

      setChatMessages(prev => [...prev, { role: 'bot', text: response.text || "I'm sorry, I couldn't process that. Please try again or check our FAQs." }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'bot', text: "Connection error. Please check your internet or try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 py-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px]"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6">How can we help?</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Find answers to common questions or chat with SaafBot, our AI civic assistant.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* FAQ Column */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <HelpCircle size={28} />
              </div>
              <h2 className="text-3xl font-black text-slate-900">Frequently Asked</h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className={`border rounded-[2rem] overflow-hidden transition-all ${openFaq === i ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-bold text-slate-800 text-lg">{faq.question}</span>
                    {openFaq === i ? <ChevronUp className="text-emerald-600" /> : <ChevronDown className="text-slate-400" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed font-medium animate-in slide-in-from-top-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Chatbot Column */}
          <section className="flex flex-col h-[600px] border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden bg-white">
            <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">SaafBot AI Support</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Assistant</span>
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about reports, points, or city status..."
                className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
              >
                <Send size={20} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
