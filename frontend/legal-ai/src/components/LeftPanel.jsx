import image from "../assets/images/login.jpg";
import { ShieldCheck, Lock, Sparkles, Scale } from "lucide-react";

function LeftPanel() {
  return (
    <div 
      className="relative hidden md:flex flex-col justify-between overflow-hidden p-12 text-white border-r border-slate-900 bg-cover bg-center min-h-screen"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Premium dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#081827]/98 via-[#030914]/95 to-[#020710]/98"></div>


      {/* Decorative Blur Blobs */}
      <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl"></div>
      <div className="absolute bottom-10 -right-20 h-56 w-56 rounded-full bg-yellow-500/5 blur-2xl"></div>

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-yellow-500 to-amber-300 shadow-md">
            <Scale size={18} className="text-black" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-white leading-none">
              LegalAI
            </h1>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-yellow-500">
              Rule & Document RAG
            </span>
          </div>
        </div>
      </div>

      {/* Middle Pitch */}
      <div className="relative z-10 my-auto py-8">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-500 mb-3">
          <Sparkles size={11} />
          <span>Advanced AI Synthesis</span>
        </div>
        
        <h2 className="font-serif text-3xl font-bold leading-tight text-white">
          Intelligent Legal <br />
          <span className="bg-gradient-to-r from-yellow-400 to-amber-300 bg-clip-text text-transparent">
            Document Analysis
          </span>
        </h2>

        <p className="mt-4 text-xs leading-relaxed text-slate-300">
          Upload contracts, guidelines, or rule-based policy files. Ask questions and retrieve answers grounded with source citations.
        </p>
      </div>

      {/* Bottom Certs */}
      <div className="relative z-10 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Enterprise Trust & Privacy
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck size={14} className="text-yellow-500" />
            <span className="text-[10px] font-medium text-slate-300">SOC2 Compliant Database</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Lock size={14} className="text-yellow-500" />
            <span className="text-[10px] font-medium text-slate-300">256-Bit SSL Encryption</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default LeftPanel;