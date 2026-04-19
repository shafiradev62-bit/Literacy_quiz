import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCompletedSession } from "@/hooks/useExamSession";

interface Unit7PisaProps {
  onGoTo?: (index: number) => void;
  onExit?: () => void;
}

const STEP_LABELS_EN = ["Overview", "Assignment 1", "Analysis 2", "Exploration 3", "Synthesis 4", "Valuation 5"];
const STEP_LABELS_ID = ["Gambaran", "Tugas 1", "Analisis 2", "Eksplorasi 3", "Sintesis 4", "Evaluasi 5"];

const MATCH_DRAGGABLES = [
  { id: "effect_fish", en: "Reduces fish population", idText: "Mengurangi populasi ikan", icon: "🐟" },
  { id: "effect_overfish", en: "Reduces overfishing behavior", idText: "Mengurangi pemancingan berlebih", icon: "🎣" },
  { id: "effect_water", en: "Improves water quality", idText: "Meningkatkan kualitas air", icon: "💧" },
  { id: "effect_biodiv", en: "Increases marine biodiversity", idText: "Meningkatkan biodiversitas laut", icon: "🐚" },
];

const FACTORS = [
  { id: "factor_fish", en: "High fishing intensity", idText: "Intensitas pancing tinggi", color: "from-rose-500 to-red-600" },
  { id: "factor_aware", en: "High community awareness", idText: "Kesadaran masyarakat tinggi", color: "from-emerald-500 to-teal-600" },
  { id: "factor_waste", en: "Good waste management", idText: "Pengelolaan limbah baik", color: "from-blue-500 to-indigo-600" },
  { id: "factor_cons", en: "Strong conservation", idText: "Konservasi yang kuat", color: "from-violet-500 to-purple-600" },
];

const Unit7Pisa = ({ onExit }: Unit7PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";

  const [currentStep, setCurrentStep] = useState(0);

  // Simulation Controls
  const [fishingIntensity, setFishingIntensity] = useState("Medium");
  const [awareness, setAwareness] = useState("Medium");
  const [waste, setWaste] = useState("Moderate");
  const [conservation, setConservation] = useState("Partial");

  const [outputs, setOutputs] = useState({
    fish: "Medium",
    biodiversity: "Medium",
    water: "Medium",
    sustainability: "Medium",
  });

  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [showWritingGuide, setShowWritingGuide] = useState(false);

  // Responses
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [q2Choice, setQ2Choice] = useState("");
  const [q3Choice, setQ3Choice] = useState("");
  const [q3Explanation, setQ3Explanation] = useState("");
  const [q4Choice, setQ4Choice] = useState("");
  const [q4Explanation, setQ4Explanation] = useState("");
  const [q5Choice, setQ5Choice] = useState("");
  const [q5Explanation, setQ5Explanation] = useState("");

  const calculateResult = () => {
    setIsRunning(true);
    setTimeout(() => {
      let fish = "Medium";
      let biodivers = "Medium";
      let water = "Medium";

      if (fishingIntensity === "High") {
        fish = "Low";
        biodivers = "Low";
      } else if (fishingIntensity === "Low") {
        fish = "High";
      }

      if (conservation === "Full") {
        biodivers = "High";
        if (fishingIntensity !== "High") fish = "High";
      } else if (conservation === "None") {
        biodivers = "Low";
      }

      if (waste === "Good") {
        water = "High";
      } else if (waste === "Poor") {
        water = "Low";
      }

      const scoreMap: Record<string, number> = { "High": 3, "Medium": 2, "Moderate": 2, "Partial": 2, "Low": 1, "Poor": 1, "None": 1, "Full": 3, "Good": 3 };
      const avg = (scoreMap[fish] + scoreMap[biodivers] + scoreMap[water]) / 3;
      let sustain = "Medium";
      if (avg >= 2.6) sustain = "High";
      if (avg <= 1.4) sustain = "Low";

      setOutputs({ fish, biodiversity: biodivers, water, sustainability: sustain });
      setIsRunning(false);
    }, 800);
  };

  const handleRecordData = () => {
    setHistory(prev => [
      {
        id: prev.length + 1,
        fishing: fishingIntensity,
        awareness: awareness,
        waste: waste,
        conservation: conservation,
        fish: outputs.fish,
        water: outputs.water,
        biodiversity: outputs.biodiversity,
        sustain: outputs.sustainability,
      },
      ...prev,
    ]);
  };

  const handleDrop = (factorId: string, itemText: string) => {
    setMatches(prev => ({ ...prev, [factorId]: itemText }));
  };

  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;

  const headerGradient = "from-slate-900 to-slate-800";
  const leftPanelBg = "bg-[#fdfcfb]"; // Soft Paper White
  const rightPanelBg = "bg-[#0f172a]"; // Deep Midnight Slate

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      {/* ── PREMIUM NAVIGATION HEADER ── */}
      <header className={`h-16 bg-gradient-to-r ${headerGradient} flex items-center justify-between px-8 shrink-0 z-30 border-b border-white/5 shadow-2xl backdrop-blur-xl bg-opacity-80`}>
        <div className="flex items-center gap-10">
           <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">7</div>
              <div className="flex flex-col">
                 <span className="text-[14px] font-bold tracking-widest text-white">{isId ? "NADRAN ECO-SIM" : "NADRAN ECO-SIM"}</span>
                 <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-[0.2em]">{isId ? "Pusat Literasi Kelautan" : "Marine Literacy Hub"}</span>
              </div>
           </div>
           
           <div className="h-8 w-px bg-white/10" />

           <nav className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="group relative flex flex-col items-center">
                  <div className={`w-10 h-1.5 rounded-full transition-all duration-500 ${currentStep >= s ? "bg-gradient-to-r from-indigo-400 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-white/10"}`} />
                  <span className={`text-[8px] mt-1 font-bold uppercase tracking-widest transition-colors ${currentStep >= s ? "text-cyan-400" : "text-white/20"}`}>{s}</span>
                </div>
              ))}
           </nav>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{stepLabels[currentStep]}</span>
            </div>
            <button
               onClick={() => {
                 saveCompletedSession(7, { matches, q2Choice, q3Choice, q3Explanation, q4Choice, q4Explanation, q5Choice, q5Explanation, history }, 0, 5);
                 onExit?.();
               }}
               className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT COLUMN: Interactive Learning ── */}
        <div className={`w-[40%] ${leftPanelBg} flex flex-col overflow-hidden relative border-r border-slate-200 shadow-sm`}>
          {/* Banner */}
          <div className="h-16 flex items-center px-10 shrink-0 bg-white border-b border-slate-200 justify-between">
             <h2 className="text-[14px] font-bold text-slate-800 uppercase tracking-tighter">{isId ? "Modul Interaktif" : "Interactive Module"}</h2>
             <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase">Phase {currentStep}</div>
          </div>

          <div className="p-10 overflow-y-auto h-full flex flex-col exam-scrollbar relative z-10">
            
            {currentStep === 0 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-slate-900 leading-[1.1] tracking-tighter">
                    {isId ? "Misteri Laut Cirebon: Ritual Nadran" : "Cirebon Marine Mystery: The Nadran Ritual"}
                  </h1>
                  <p className="text-[15px] leading-relaxed text-slate-600 font-medium">
                    {isId 
                      ? "Jelajahi bagaimana tradisi kuno nelayan Cirebon tidak hanya menjadi wujud syukur, tapi juga kunci keberlanjutan masa depan kita."
                      : "Explore how ancient Cirebon traditions are not just expressions of gratitude, but the key to our sustainable future."}
                  </p>
                </div>
                
                <button onClick={() => setCurrentStep(1)} className="group relative w-full py-5 bg-slate-900 text-white font-bold rounded-3xl shadow-2xl overflow-hidden active:scale-[0.98] transition-all">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 text-xs tracking-[0.4em] uppercase">{isId ? "MULAI EKSPEDISI" : "START EXPEDITION"}</span>
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="p-6 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                   <p className="text-[14px] font-bold leading-relaxed relative z-10">
                     {isId 
                        ? "Pasangkan setiap faktor strategis dengan dampaknya terhadap ekosistem laut kita."
                        : "Match each strategic factor with its impact on our marine ecosystem."}
                   </p>
                </div>
                
                <div className="space-y-4">
                  {FACTORS.map(f => (
                    <div key={f.id} className="group flex flex-col gap-2">
                       <span className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-widest">{isId ? f.idText : f.en}</span>
                       <div 
                         onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                         onDrop={e => handleDrop(f.id, e.dataTransfer.getData("text/plain"))}
                         className={`min-h-[56px] border-2 border-dashed rounded-3xl flex items-center justify-between px-6 transition-all duration-300 ${matches[f.id] ? "border-emerald-500 bg-emerald-50/50 shadow-inner" : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"}`}
                       >
                         {matches[f.id] ? (
                           <>
                             <span className="text-[12px] font-bold text-emerald-700">{matches[f.id]}</span>
                             <button onClick={() => handleDrop(f.id, "")} className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-200/50 text-emerald-600">×</button>
                           </>
                         ) : (
                           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{isId ? "Drop Target" : "Drop Target"}</span>
                         )}
                       </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  {MATCH_DRAGGABLES.map(item => {
                    const text = isId ? item.idText : item.en;
                    const isUsed = Object.values(matches).includes(text);
                    return (
                      <div 
                        key={item.id}
                        draggable={!isUsed}
                        onDragStart={e => {
                          e.dataTransfer.setData("text/plain", text);
                          e.dataTransfer.dropEffect = "move";
                        }}
                        className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-105 ${isUsed ? "opacity-10 cursor-not-allowed bg-slate-100 border-slate-200" : "bg-white border-white shadow-xl hover:border-indigo-400 group"}`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[11px] font-bold text-slate-700 leading-tight">{text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(currentStep >= 2) && (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {currentStep === 2 ? (isId ? "Analisis Populasi" : "Population Analysis") : (isId ? "Kesimpulan Berbasis Data" : "Data-Driven Conclusion")}
                    </h3>
                  </div>
                  <p className="text-[14px] leading-relaxed text-slate-600 font-medium">
                    {currentStep === 2 && (isId ? "Berdasarkan simulasi, identifikasi faktor yang memiliki dampak paling destruktif jika tidak dikelola dengan baik." : "Based on the simulation, identify the factor that has the most destructive impact if not managed properly.")}
                    {currentStep === 3 && (isId ? "Jelaskan hubungan korelasi antara kesadaran masyarakat dengan regenerasi populasi ikan." : "Explain the correlation between community awareness and fish population regeneration.")}
                    {currentStep === 4 && (isId ? "Bandingkan data dari Komunitas A dan Komunitas B. Variabel mana yang menjadi pembeda utama kualitas ekosistem mereka?" : "Compare data from Community A and B. Which variable is the primary differentiator for their ecosystem quality?")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  {[
                    currentStep === 2 ? [
                      { label: "A", en: "Poor waste management", idText: "Pengelolaan limbah yang buruk", icon: "🗑️", color: "blue" },
                      { label: "B", en: "High fishing intensity", idText: "Intensitas pancing yang tinggi", icon: "⚡", color: "emerald" },
                      { label: "C", en: "Natural traditions", idText: "Tradisi budaya setempat", icon: "🏺", color: "amber" },
                    ] : [
                      { label: "A", en: "Intensity has no effect", idText: "Intensitas tidak berpengaruh", icon: "❌", color: "blue" },
                      { label: "B", en: "Cultural awareness influences behavior", idText: "Kesadaran budaya mengubah perilaku", icon: "🧠", color: "emerald" },
                      { label: "C", en: "Only natural factors control reefs", idText: "Hanya faktor alam yang mengontrol", icon: "🏺", color: "amber" },
                    ]
                  ][0].map(opt => {
                    const choice = currentStep === 2 ? q2Choice : currentStep === 3 ? q3Choice : q4Choice;
                    const selected = choice === opt.label;
                    
                    const colorClasses: Record<string, string> = {
                      blue: selected ? "bg-blue-600 border-blue-600 text-white" : "bg-blue-50/50 border-blue-100 text-slate-700 hover:border-blue-200",
                      emerald: selected ? "bg-emerald-600 border-emerald-600 text-white" : "bg-emerald-50/50 border-emerald-100 text-slate-700 hover:border-emerald-200",
                      amber: selected ? "bg-amber-500 border-amber-500 text-white" : "bg-amber-50/50 border-amber-100 text-slate-700 hover:border-amber-200",
                    };

                    return (
                      <button 
                        key={opt.label}
                        onClick={() => {
                          if (currentStep === 2) setQ2Choice(opt.label);
                          if (currentStep === 3) setQ3Choice(opt.label);
                          if (currentStep === 4) setQ4Choice(opt.label);
                        }}
                        className={`group w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-200 ${colorClasses[opt.color]}`}
                      >
                        <div className="flex items-center gap-4">
                           <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${selected ? "bg-white text-slate-900" : "bg-white border shadow-sm text-slate-400"}`}>{opt.label}</span>
                           <span className="text-[14px] font-bold">{isId ? opt.idText : opt.en}</span>
                        </div>
                        <span className="text-xl">{opt.icon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Visual fluff for premium look */}
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <div className="w-64 h-64 border-[40px] border-slate-900 rounded-full" />
          </div>
        </div>

        {/* ── RIGHT COLUMN: High-End Dynamic Panel ── */}
        <div className={`flex-1 ${rightPanelBg} flex flex-col overflow-hidden relative`}>
          {/* Header */}
          <div className="h-16 px-10 flex items-center bg-white/5 backdrop-blur-xl shrink-0 border-b border-white/5">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em]">
                   {(currentStep <= 2) ? (isId ? "Simulasi Ekosistem Laut" : "Marine Ecosystem Simulation") : (isId ? "Dashboard Riset" : "Research Dashboard")}
                </span>
             </div>
          </div>

          <div className="p-10 h-full flex flex-col gap-8 overflow-y-auto exam-scrollbar">
            
            {/* Simulation UI */}
            {(currentStep <= 2) && (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-5 gap-6">
                  {/* Controls Card */}
                  <div className="col-span-2 p-8 bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-2xl flex flex-col gap-6 group">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-2">{isId ? "Kontrol Variabel" : "Variable Control"}</p>
                    
                    {[
                      { label: "Intensity", set: setFishingIntensity, val: fishingIntensity, opts: ["Low", "Medium", "High"] },
                      { label: "Awareness", set: setAwareness, val: awareness, opts: ["Low", "Medium", "High"] },
                      { label: "Waste", set: setWaste, val: waste, opts: ["Poor", "Moderate", "Good"] },
                      { label: "Conservation", set: setConservation, val: conservation, opts: ["None", "Partial", "Full"] },
                    ].map(ctl => (
                      <div key={ctl.label} className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{ctl.label}</label>
                        <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-2xl border border-white/5">
                           {ctl.opts.map(o => (
                             <button key={o} onClick={() => ctl.set(o)} className={`py-2 text-[9px] font-bold uppercase rounded-xl transition-all ${ctl.val === o ? "bg-indigo-500 text-white shadow-lg" : "text-white/30 hover:text-white/60"}`}>
                                {o}
                             </button>
                           ))}
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={calculateResult} 
                      disabled={isRunning}
                      className={`w-full mt-4 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isRunning ? "opacity-50" : ""}`}
                    >
                      {isRunning ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                         <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3a.5.5 0 00-.5.5v13a.5.5 0 00.74.433l11-6.5a.5.5 0 000-.866l-11-6.5A.5.5 0 004.5 3z"/></svg> RUN SIMULATION</>
                      )}
                    </button>
                  </div>

                  {/* Stat Bento Grid */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                     {[
                        { l: isId ? "Populasi Ikan" : "Fish Pop.", v: outputs.fish, c: "cyan", i: "🐟" },
                        { l: isId ? "Keanekaragaman" : "Biodiversity", v: outputs.biodiversity, c: "fuchsia", i: "🐚" },
                        { l: isId ? "Kualitas Air" : "Water Quality", v: outputs.water, c: "blue", i: "💧" },
                        { l: isId ? "Keberlanjutan" : "Sustainability", v: outputs.sustainability, c: "emerald", i: "♻️" },
                     ].map(out => (
                        <div key={out.l} className="group relative p-8 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl flex flex-col justify-between hover:bg-white/10 transition-all overflow-hidden">
                           <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${out.c}-500 opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
                           <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{out.l}</span>
                              <span className="text-2xl">{out.i}</span>
                           </div>
                           <div className="mt-4">
                              <span className={`text-2xl font-bold ${out.v === 'Low' || out.v === 'Poor' ? 'text-rose-400' : 'text-cyan-400'}`}>{out.v}</span>
                           </div>
                        </div>
                     ))}
                     
                     {/* Floating Record Button */}
                     <button onClick={handleRecordData} className="col-span-2 py-5 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-bold text-white hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all uppercase tracking-widest active:scale-95">
                        + Save Metrics to History
                     </button>
                  </div>
                </div>

                {/* Aesthetic Visualizer */}
                <div className="relative w-full h-48 bg-black/40 rounded-[40px] border border-white/5 overflow-hidden group shadow-inner">
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent" />
                   
                   {/* Abstract waves */}
                   <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <div className={`flex gap-4 ${isRunning ? "animate-pulse" : ""}`}>
                         {[...Array(20)].map((_, i) => (
                           <div key={i} className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all duration-700" style={{ height: `${20 + Math.random() * 60}px`, opacity: isRunning ? 1 : 0.3 }} />
                         ))}
                      </div>
                   </div>
                   
                   <div className="absolute top-6 left-8 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-[0.4em]">Live Scene Monitor</span>
                   </div>
                </div>
              </div>
            )}

            {/* Dashboard UI for synthesis */}
            {(currentStep > 2) && (
              <div className="flex flex-col gap-6 animate-in zoom-in-95 duration-700">
                <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 p-10 space-y-6">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.4em]">Synthesis Workspace</span>
                     <h4 className="text-2xl font-bold text-white">{isId ? "Tuliskan Analisis Anda" : "Compile Your Findings"}</h4>
                  </div>
                  <textarea
                    value={currentStep === 3 ? q3Explanation : currentStep === 4 ? q4Explanation : q5Explanation}
                    onChange={e => {
                      if (currentStep === 3) setQ3Explanation(e.target.value);
                      if (currentStep === 4) setQ4Explanation(e.target.value);
                      if (currentStep === 5) setQ5Explanation(e.target.value);
                    }}
                    placeholder={isId ? "Jabarkan observasi Anda di sini..." : "Draft your synthesis here..."}
                    className="w-full h-48 bg-black/40 border border-white/10 rounded-3xl p-8 text-[14px] text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium leading-relaxed placeholder:text-white/10"
                  />
                  <div className="flex items-center justify-between">
                    <button onClick={() => setShowWritingGuide(!showWritingGuide)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                      {isId ? "Writing Guide" : "Writing Guide"}
                    </button>
                    <span className="text-[10px] font-bold text-white/20 uppercase">Word Index: {getWordCount(currentStep === 3 ? q3Explanation : currentStep === 4 ? q4Explanation : q5Explanation)}</span>
                  </div>
                </div>

                {/* History Data Table Dashboard Style */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] px-4">Dataset Timeline</span>
                  <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full text-[10px] text-white">
                      <thead>
                        <tr className="bg-white/5 text-white/40 border-b border-white/5">
                          <th className="p-6 text-left font-bold uppercase">Run ID</th>
                          <th className="p-6 text-left font-bold uppercase text-white/40">Fishing</th>
                          <th className="p-6 text-left font-bold uppercase text-white/40">Awareness</th>
                          <th className="p-6 text-left font-bold uppercase">Biology</th>
                          <th className="p-6 text-left font-bold uppercase">Sustainability</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {history.slice(0, 4).map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-6 font-bold text-cyan-400">#00{row.id}</td>
                            <td className="p-6 font-bold opacity-60">{row.fishing}</td>
                            <td className="p-6 font-bold opacity-60">{row.awareness}</td>
                            <td className="p-6">
                               <div className="flex gap-1">
                                  <span className={`px-2 py-1 rounded-md text-[8px] font-bold bg-white/5 ${row.fish === 'Low' ? 'text-rose-400' : 'text-emerald-400'}`}>{row.fish}</span>
                                  <span className={`px-2 py-1 rounded-md text-[8px] font-bold bg-white/5 ${row.biodiversity === 'Low' ? 'text-rose-400' : 'text-emerald-400'}`}>{row.biodiversity}</span>
                               </div>
                            </td>
                            <td className="p-6 font-bold text-indigo-400 uppercase text-[12px]">{row.sustain}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Subtle noise pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/60-lines.png')]" />
        </div>
      </main>

      {/* ── LUXURY CONTROL FOOTER ── */}
      <footer className="h-24 bg-white border-t border-slate-200 flex items-center justify-between px-12 shrink-0 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-6">
           <button 
             disabled={currentStep === 0}
             onClick={() => setCurrentStep(prev => prev - 1)}
             className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 disabled:opacity-0 transition-all font-bold text-xl active:scale-95"
           >
             ←
           </button>
           <div className="flex flex-col">
              <span className="text-[12px] font-bold text-slate-900 uppercase">{stepLabels[currentStep]}</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">Module Sequence {currentStep}/5</span>
           </div>
        </div>

        <button 
          onClick={() => {
            if (currentStep < 5) setCurrentStep(prev => prev + 1);
            else {
               saveCompletedSession(7, { matches, q2Choice, q3Choice, q3Explanation, q4Choice, q4Explanation, q5Choice, q5Explanation, history }, 0, 5);
               onExit?.();
            }
          }}
          className="group relative flex items-center gap-4 px-10 py-5 rounded-3xl bg-slate-900 text-white font-black hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 text-[11px] tracking-[0.4em] uppercase">{currentStep === 5 ? (isId ? "SELESAI" : "FINISH") : (isId ? "SOAL LANJUTAN" : "PROCEED")}</span>
          <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </footer>
    </div>
  );
};

export default Unit7Pisa;
