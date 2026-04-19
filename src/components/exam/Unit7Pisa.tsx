import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCompletedSession } from "@/hooks/useExamSession";

interface Unit7PisaProps {
  onGoTo?: (index: number) => void;
  onExit?: () => void;
}

const STEP_LABELS_EN = ["Introduction", "Question 1", "Question 2", "Question 3", "Question 4", "Question 5"];
const STEP_LABELS_ID = ["Pendahuluan", "Soal 1", "Soal 2", "Soal 3", "Soal 4", "Soal 5"];

// Draggable item text for Matching
const MATCH_DRAGGABLES = [
  { id: "effect_fish", en: "Reduces fish population", idText: "Mengurangi populasi ikan" },
  { id: "effect_overfish", en: "Reduces overfishing behavior", idText: "Mengurangi perilaku penangkapan berlebih" },
  { id: "effect_water", en: "Improves water quality", idText: "Meningkatkan kualitas air" },
  { id: "effect_biodiv", en: "Increases marine biodiversity", idText: "Meningkatkan keanekaragaman hati laut" },
];

const FACTORS = [
  { id: "factor_fish", en: "High fishing intensity", idText: "Intensitas penangkapan ikan tinggi" },
  { id: "factor_aware", en: "High community awareness", idText: "Kesadaran masyarakat tinggi" },
  { id: "factor_waste", en: "Good waste management", idText: "Pengelolaan limbah yang baik" },
  { id: "factor_cons", en: "Strong conservation", idText: "Upaya konservasi yang kuat" },
];

const Unit7Pisa = ({ onExit }: Unit7PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";

  const [currentStep, setCurrentStep] = useState(0);

  // Simulation Controls — Qualitative
  const [fishingIntensity, setFishingIntensity] = useState("Medium");
  const [awareness, setAwareness] = useState("Medium");
  const [waste, setWaste] = useState("Moderate");
  const [conservation, setConservation] = useState("Partial");

  // Output State (Updated on "Run Simulation")
  const [outputs, setOutputs] = useState({
    fish: "Medium",
    biodiversity: "Medium",
    water: "Medium",
    sustainability: "Medium",
  });

  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [showWritingGuide, setShowWritingGuide] = useState(false);

  // Responses
  const [matches, setMatches] = useState<Record<string, string>>({}); // factorId -> itemText
  const [q2Choice, setQ2Choice] = useState("");
  const [q3Choice, setQ3Choice] = useState("");
  const [q3Explanation, setQ3Explanation] = useState("");
  const [q4Choice, setQ4Choice] = useState("");
  const [q4Explanation, setQ4Explanation] = useState("");
  const [q5Choice, setQ5Choice] = useState("");
  const [q5Explanation, setQ5Explanation] = useState("");

  const [isDragging, setIsDragging] = useState(false);

  // Logic: Calculate simulation outputs
  const calculateResult = () => {
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
  };

  const handleRecordData = () => {
    setHistory(prev => [
      ...prev,
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
    ]);
  };

  const handleClearData = () => setHistory([]);

  // Drag and Drop helpers
  const onDragStart = (e: React.DragEvent, text: string) => {
    e.dataTransfer.setData("text/plain", text);
    e.dataTransfer.dropEffect = "move";
    setIsDragging(true);
  };

  const handleDrop = (factorId: string, itemText: string) => {
    setMatches(prev => ({ ...prev, [factorId]: itemText }));
    setIsDragging(false);
  };

  const resetMatches = () => setMatches({});

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const statusColor = (status: string) => {
    if (status === "High" || status === "Strong" || status === "Good" || status === "Full") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Medium" || status === "Moderate" || status === "Partial") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;

  return (
    <div className="flex flex-col h-screen bg-[#f3f6f9] text-slate-900 font-sans overflow-hidden">
      {/* ── MAIN NAVIGATION HEADER ── */}
      <header className="h-10 bg-[#34495e] flex items-center justify-between px-4 shrink-0 z-20 text-white">
        <div className="flex items-center gap-4">
           <span className="text-[11px] font-bold uppercase tracking-widest">{isId ? "UNIT 7: NADRAN" : "UNIT 7: NADRAN"}</span>
           <div className="flex items-center gap-1 ml-4">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`w-6 h-1 rounded-full ${currentStep >= s ? "bg-white" : "bg-white/20"}`} />
              ))}
           </div>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{stepLabels[currentStep]}</span>
            <button
               onClick={() => {
                 saveCompletedSession(7, { matches, q2Choice, q3Choice, q3Explanation, q4Choice, q4Explanation, q5Choice, q5Explanation, history }, 0, 5);
                 onExit?.();
               }}
               className="text-[9px] font-bold uppercase hover:underline"
            >
              {isId ? "KELUAR" : "EXIT"}
            </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT COLUMN: Questions ── */}
        <div className="w-[42%] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Sub Header for Question Area */}
          <div className="h-12 bg-[#7fa1c3] flex items-center px-6 shrink-0 text-white">
             <div className="flex flex-col">
                <span className="text-[13px] font-bold leading-tight">{isId ? "Nadran dan Perikanan Berkelanjutan" : "Nadran and Sustainable Fishing"}</span>
                <span className="text-[9px] font-bold uppercase opacity-80">{isId ? `Pertanyaan ${currentStep} / 5` : `Question ${currentStep} / 5`}</span>
             </div>
          </div>

          <div className="p-6 overflow-y-auto h-full flex flex-col exam-scrollbar bg-slate-50/50">
            
            {currentStep === 0 && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-slate-800">{isId ? "Ritual Nadran di Cirebon" : "Nadran Ritual in Cirebon"}</h1>
                <div className="text-[13px] leading-relaxed text-slate-700 space-y-3">
                  <p>
                    {isId 
                      ? "Nadran adalah upacara tradisional masyarakat nelayan Cirebon sebagai wujud syukur atas hasil laut. Tradisi ini melibatkan partisipasi kolektif dan mencerminkan hubungan budaya yang erat antara nelayan dan laut."
                      : "Nadran is a traditional ceremony of the Cirebon fishing community as a form of gratitude for sea products. It involves collective participation and reflects the close cultural relationship between fishermen and the sea."}
                  </p>
                </div>
                <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-200 relative group">
                   <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest opacity-50 bg-gradient-to-br from-slate-800 to-slate-950">
                     UNIT VIDEO
                   </div>
                </div>
                <button onClick={() => setCurrentStep(1)} className="w-full py-3 bg-sky-600 text-white font-bold rounded-xl shadow-lg hover:bg-sky-700 transition-all uppercase tracking-widest text-xs mt-4">
                  {isId ? "MULAI UNIT" : "START UNIT"}
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <p className="text-[13px] font-medium text-slate-700 leading-relaxed italic border-l-4 border-sky-300 pl-4">
                  {isId 
                    ? "Gunakan drag and drop untuk memasangkan setiap faktor dengan dampak utamanya."
                    : "Use drag and drop to match each factor with its main effect."}
                </p>
                
                <div className="flex gap-4">
                  {/* Drop Zones Column */}
                  <div className="flex-1 space-y-3">
                    {FACTORS.map(f => (
                      <div key={f.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-sky-400" />
                           <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{isId ? f.idText : f.en}</span>
                        </div>
                        <div 
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                          onDrop={e => {
                            e.preventDefault();
                            const text = e.dataTransfer.getData("text/plain");
                            handleDrop(f.id, text);
                          }}
                          className={`min-h-[48px] border-2 border-dashed rounded-xl flex items-center justify-center transition-all px-3 py-2 ${matches[f.id] ? "border-sky-500 bg-sky-50 shadow-inner" : "border-slate-300 bg-white hover:border-sky-300"}`}
                        >
                          {matches[f.id] ? (
                            <div className="text-center text-[10px] font-bold text-sky-700 leading-tight">
                              {matches[f.id]}
                            </div>
                          ) : (
                            <span className="text-[9px] uppercase font-bold text-slate-400 opacity-60 italic">{isId ? "Lepas di sini" : "Drop here"}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Draggable Items Column */}
                  <div className="w-[180px] flex flex-col gap-3 pt-5">
                    {MATCH_DRAGGABLES.map(item => {
                      const text = isId ? item.idText : item.en;
                      const isUsed = Object.values(matches).includes(text);
                      return (
                        <div 
                          key={item.id}
                          draggable={!isUsed}
                          onDragStart={e => onDragStart(e, text)}
                          onDragEnd={() => setIsDragging(false)}
                          className={`p-3 rounded-xl border shadow-sm text-[10px] font-bold leading-tight cursor-grab active:cursor-grabbing transition-all ${isUsed ? "opacity-20 cursor-not-allowed bg-slate-100 border-slate-200 grayscale" : "bg-white border-slate-300 hover:border-sky-400 hover:shadow-md text-slate-700 active:scale-95"}`}
                        >
                          {text}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-200">
                   <button className="flex-1 py-2.5 bg-sky-700 text-white text-[11px] font-bold rounded-lg hover:bg-sky-800 shadow-md transition-all">{isId ? "Check Answer" : "Check Answer"}</button>
                   <button onClick={resetMatches} className="px-5 py-2.5 border border-slate-300 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-white transition-all">{isId ? "Reset Matches" : "Reset Matches"}</button>
                </div>
              </div>
            )}

            {(currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5) && (
              <div className="space-y-5">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[13px] font-medium text-slate-800 leading-relaxed">
                    {currentStep === 2 && (isId ? "Sesuaikan variabel di panel simulasi. Jika intensitas penangkapan tinggi namun kesadaran rendah, apa yang paling langsung menyebabkan penurunan populasi ikan?" : "Adjust the variables in the simulation panel. If fishing intensity is high but awareness is low, what most directly causes the decrease in fish population?")}
                    {currentStep === 3 && (isId ? "Dalam simulasi, peningkatan kesadaran masyarakat menyebabkan populasi ikan meningkat seiring waktu. Mengapa peningkatan kesadaran masyarakat dapat meningkatkan populasi ikan?" : "In the simulation, increasing community awareness leads to improved fish population over time. Why does increasing community awareness improve fish population?")}
                    {currentStep === 4 && (isId ? "Gunakan perbandingan di bawah dan data simulasi Anda untuk menjawab. Kesimpulan manakah yang paling baik menjelaskan perbedaan tersebut?" : "Use the comparison below and your simulation data to answer. Which conclusion best explains the difference?")}
                    {currentStep === 5 && (isId ? "Berdasarkan hasil simulasi dan tradisi Nadran, strategi manakah yang paling efektif untuk meningkatkan keberlanjutan laut?" : "Based on simulation results and Nadran tradition, which strategy would be most effective to improve marine sustainability?")}
                  </p>
                </div>

                {currentStep === 4 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-2.5 text-left font-bold text-slate-500 uppercase">{isId ? "Komunitas" : "Community"}</th>
                          <th className="p-2.5 font-bold text-slate-500 uppercase">{isId ? "Fishing" : "Fishing"}</th>
                          <th className="p-2.5 font-bold text-slate-500 uppercase">{isId ? "Awareness" : "Awareness"}</th>
                          <th className="p-2.5 font-bold text-slate-500 uppercase">{isId ? "Result" : "Result"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 italic">
                        <tr>
                          <td className="p-2.5 font-bold text-slate-700">A</td>
                          <td className="p-2.5 text-center text-slate-600 font-medium">{isId ? "Tinggi" : "High"}</td>
                          <td className="p-2.5 text-center text-slate-600 font-medium">{isId ? "Rendah" : "Low"}</td>
                          <td className="p-2.5 text-center font-bold text-rose-600">{isId ? "Populasi Turun" : "Fish decline"}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-700">B</td>
                          <td className="p-2.5 text-center text-slate-600 font-medium">{isId ? "Sedang" : "Medium"}</td>
                          <td className="p-2.5 text-center text-slate-600 font-medium">{isId ? "Tinggi" : "High"}</td>
                          <td className="p-2.5 text-center font-bold text-emerald-600">{isId ? "Populasi Stabil" : "Fish stable"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="space-y-2">
                  {[
                    currentStep === 2 ? [
                      { label: "A", en: "Poor waste management", idText: "Pengelolaan limbah yang buruk" },
                      { label: "B", en: "High fishing intensity", idText: "Intensitas penangkapan ikan yang tinggi" },
                      { label: "C", en: "Natural traditions", idText: "Tradisi budaya" },
                      { label: "D", en: "Sea salt levels", idText: "Kadar garam laut" },
                    ] : 
                    currentStep === 3 ? [
                      { label: "A", en: "It increases reproduction naturally", idText: "Meningkatkan reproduksi secara alami" },
                      { label: "B", en: "It reduces overfishing behavior", idText: "Mengurangi perilaku penangkapan berlebih" },
                      { label: "C", en: "It raises water salinity", idText: "Meningkatkan salinitas air" },
                      { label: "D", en: "It removes marine predators", idText: "Menghilangkan predator laut" },
                    ] :
                    currentStep === 4 ? [
                      { label: "A", en: "Intensity has no effect", idText: "Intensitas tidak berpengaruh" },
                      { label: "B", en: "Cultural awareness influences behavior", idText: "Kesadaran budaya memengaruhi perilaku" },
                      { label: "C", en: "Only natural factors control reefs", idText: "Hanya faktor alam yang mengontrol terumbu" },
                      { label: "D", en: "Traditions cannot affect environment", idText: "Tradisi tidak bisa memengaruhi lingkungan" },
                    ] : [
                      { label: "A", en: "Increase intensity for short-term production", idText: "Tingkatkan intensitas untuk produksi pendek" },
                      { label: "B", en: "Promote Nadran via education and conservation", idText: "Promosikan Nadran melalui edukasi & konservasi" },
                      { label: "C", en: "Focus only on harvesting volume", idText: "Fokus hanya pada volume tangkapan" },
                      { label: "D", en: "Remove conservation rules", idText: "Hapus aturan konservasi" },
                    ]
                  ].flat().map(opt => {
                    const selected = (currentStep === 2 ? q2Choice : currentStep === 3 ? q3Choice : currentStep === 4 ? q4Choice : q5Choice) === opt.label;
                    return (
                      <button 
                        key={opt.label}
                        onClick={() => {
                          if (currentStep === 2) setQ2Choice(opt.label);
                          if (currentStep === 3) setQ3Choice(opt.label);
                          if (currentStep === 4) setQ4Choice(opt.label);
                          if (currentStep === 5) setQ5Choice(opt.label);
                        }}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${selected ? "border-sky-500 bg-sky-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-sky-500 bg-sky-500" : "border-slate-300"}`}>
                           {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-[13px] text-slate-700 font-bold">{opt.label}.</span>
                        <span className="text-[13px] text-slate-700 font-medium">{isId ? opt.idText : opt.en}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200">
                   <button disabled={!(currentStep === 2 ? q2Choice : currentStep === 3 ? q3Choice : currentStep === 4 ? q4Choice : q5Choice)} className="flex-1 py-3 bg-slate-800 text-white text-[11px] font-bold rounded-xl shadow-md disabled:opacity-30">
                     {isId ? "Kirim Jawaban" : "Check Answer"}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Simulation / Explanation Panel ── */}
        <div className="flex-1 bg-[#f8fafd] flex flex-col overflow-hidden">
          {/* Sub Header for Side Area */}
          <div className="h-12 bg-[#5c88b0] flex items-center px-6 shrink-0 text-white">
             <div className="flex flex-col">
                <span className="text-[12px] font-bold uppercase tracking-widest">
                   {(currentStep === 1 || currentStep === 2) ? (isId ? "Marine Sustainability Simulation" : "Marine Sustainability Simulation") : (currentStep === 3 ? (isId ? "Short Scientific Explanation" : "Short Scientific Explanation") : (isId ? "Evidence-Based Reasoning" : "Evidence-Based Reasoning"))}
                </span>
             </div>
          </div>

          <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto exam-scrollbar">
            
            <p className="text-[11px] text-slate-500 font-bold leading-tight uppercase tracking-wider bg-white/50 p-2 rounded border border-slate-200/50">
                {(currentStep === 1 || currentStep === 2) 
                  ? (isId ? "Adjust variables, run the simulation, and record your data." : "Adjust variables, run the simulation, and record your data.")
                  : (isId ? "Explain how culture or awareness can affect marine ecosystems..." : "Explain how culture or awareness can affect marine ecosystems...")}
            </p>

            {/* Questions 1 & 2: Full Simulation Engine */}
            {(currentStep === 0 || currentStep === 1 || currentStep === 2) && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-500">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Controls */}
                  <div className="flex-1 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{isId ? "Controls" : "Controls"}</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{isId ? "Fishing Intensity" : "Fishing Intensity"}</label>
                        <select value={fishingIntensity} onChange={e => setFishingIntensity(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-sky-500 outline-none text-slate-700">
                          <option value="Low">{isId ? "Low" : "Low"}</option>
                          <option value="Medium">{isId ? "Medium" : "Medium"}</option>
                          <option value="High">{isId ? "High" : "High"}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{isId ? "Community Awareness (influenced by Nadran)" : "Community Awareness (influenced by Nadran)"}</label>
                        <select value={awareness} onChange={e => setAwareness(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-sky-500 outline-none text-slate-700">
                          <option value="Low">{isId ? "Low" : "Low"}</option>
                          <option value="Medium">{isId ? "Medium" : "Medium"}</option>
                          <option value="High">{isId ? "High" : "High"}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{isId ? "Waste Management" : "Waste Management"}</label>
                        <select value={waste} onChange={e => setWaste(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-sky-500 outline-none text-slate-700">
                          <option value="Poor">{isId ? "Poor" : "Poor"}</option>
                          <option value="Moderate">{isId ? "Moderate" : "Moderate"}</option>
                          <option value="Good">{isId ? "Good" : "Good"}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{isId ? "Conservation Effort" : "Conservation Effort"}</label>
                        <select value={conservation} onChange={e => setConservation(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-sky-500 outline-none text-slate-700">
                          <option value="None">{isId ? "None" : "None"}</option>
                          <option value="Partial">{isId ? "Partial" : "Partial"}</option>
                          <option value="Full">{isId ? "Full" : "Full"}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                       <button onClick={calculateResult} className="flex-1 py-3 bg-sky-600 text-white text-[11px] font-bold rounded-xl shadow-lg hover:bg-sky-700 transition-all uppercase tracking-wider">{isId ? "Run Simulation" : "Run Simulation"}</button>
                       <button onClick={handleRecordData} className="flex-1 py-3 bg-[#718c00] text-white text-[11px] font-bold rounded-xl shadow-lg hover:opacity-90 transition-all uppercase tracking-wider">{isId ? "Record Data" : "Record Data"}</button>
                    </div>
                    <button onClick={handleClearData} className="w-full py-2.5 bg-[#4e5d6c] text-white text-[10px] font-bold rounded-lg hover:bg-slate-700 shadow-sm uppercase tracking-widest">{isId ? "Clear Data" : "Clear Data"}</button>
                  </div>

                  {/* Outputs */}
                  <div className="flex-1 flex flex-col gap-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{isId ? "Outputs" : "Outputs"}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: isId ? "Fish Population" : "Fish Population", val: outputs.fish },
                        { label: isId ? "Marine Biodiversity" : "Marine Biodiversity", val: outputs.biodiversity },
                        { label: isId ? "Water Quality" : "Water Quality", val: outputs.water },
                        { label: isId ? "Sustainability Score" : "Sustainability Score", val: outputs.sustainability },
                      ].map(out => (
                        <div key={out.label} className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 transition-all shadow-sm bg-white border-slate-200`}>
                          <span className="text-[8px] font-bold uppercase text-slate-400 leading-tight">{out.label}</span>
                          <span className={`text-lg font-black italic ${out.val === 'Low' || out.val === 'Poor' ? 'text-rose-600' : out.val === 'High' || out.val === 'Good' ? 'text-emerald-600' : 'text-amber-600'}`}>
                             {out.val}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 border-dashed flex items-center justify-center">
                      <p className="text-[10px] text-slate-400 text-center italic leading-relaxed">{isId ? "Tip: compare runs by changing one variable at a time. Then press Record Data." : "Tip: compare runs by changing one variable at a time. Then press Record Data."}</p>
                    </div>
                  </div>
                </div>

                {/* Recorded Data Table below simulation */}
                <div className="flex flex-col gap-3 min-h-[140px]">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{isId ? "Recorded Data" : "Recorded Data"}</p>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-y-auto exam-scrollbar">
                    <table className="w-full text-[10px] text-slate-900">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <th className="p-2.5 text-left font-bold uppercase truncate">#</th>
                          <th className="p-2.5 text-left font-bold uppercase truncate">{isId ? "Fishing" : "Fishing"}</th>
                          <th className="p-2.5 text-left font-bold uppercase truncate">{isId ? "Awareness" : "Awareness"}</th>
                          <th className="p-2.5 text-left font-bold uppercase truncate">{isId ? "Waste" : "Waste"}</th>
                          <th className="p-2.5 text-left font-bold uppercase truncate">{isId ? "Conservation" : "Conserv."}</th>
                          <th className="p-2.5 text-left font-bold uppercase truncate">{isId ? "Fish Pop." : "Fish Pop."}</th>
                          <th className="p-2.5 text-left font-bold uppercase truncate">{isId ? "Biodiversity" : "Biodiv."}</th>
                          <th className="p-2.5 text-left font-bold uppercase truncate">{isId ? "Water Quality" : "Water"}</th>
                          <th className="p-2.5 text-left font-bold uppercase truncate">{isId ? "Sustainability" : "Sustain."}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.length === 0 ? (
                           <tr>
                             <td colSpan={9} className="p-6 text-center text-slate-400 italic font-medium">{isId ? "No data recorded yet." : "No data recorded yet."}</td>
                           </tr>
                        ) : history.map((row, i) => (
                          <tr key={row.id}>
                            <td className="p-2.5 text-slate-400 font-bold">{row.id}</td>
                            <td className="p-2.5 text-slate-600 font-semibold">{row.fishing}</td>
                            <td className="p-2.5 text-slate-600 font-semibold">{row.awareness}</td>
                            <td className="p-2.5 text-slate-600 font-semibold">{row.waste}</td>
                            <td className="p-2.5 text-slate-600 font-semibold">{row.conservation}</td>
                            <td className="p-2.5 font-bold text-slate-700">{row.fish}</td>
                            <td className="p-2.5 font-bold text-slate-700">{row.biodiversity}</td>
                            <td className="p-2.5 font-bold text-slate-700">{row.water}</td>
                            <td className="p-2.5 font-bold text-slate-700 uppercase">{row.sustain}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Questions 3, 4, 5: Explanation UI */}
            {(currentStep === 3 || currentStep === 4 || currentStep === 5) && (
              <div className="flex-1 flex flex-col gap-5 min-h-0 animate-in slide-in-from-right-4 duration-500">
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                  <textarea
                    value={currentStep === 3 ? q3Explanation : currentStep === 4 ? q4Explanation : q5Explanation}
                    onChange={e => {
                      if (currentStep === 3) setQ3Explanation(e.target.value);
                      if (currentStep === 4) setQ4Explanation(e.target.value);
                      if (currentStep === 5) setQ5Explanation(e.target.value);
                    }}
                    placeholder={isId ? "Write a short explanation of how culture or awareness can affect marine ecosystems..." : "Write a short explanation of how culture or awareness can affect marine ecosystems..."}
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-[13px] outline-none focus:ring-1 focus:ring-sky-500 transition-all resize-none text-slate-800 shadow-inner leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <button onClick={() => setShowWritingGuide(!showWritingGuide)} className="px-6 py-3 bg-sky-600 text-white font-bold text-[10px] rounded-lg shadow-md hover:bg-sky-700 transition-all uppercase tracking-widest active:scale-95">
                      {isId ? "Show Writing Guide" : "Show Writing Guide"}
                    </button>
                  </div>
                </div>
                
                {showWritingGuide && (
                  <div className="bg-sky-50 border border-sky-200 p-5 rounded-2xl text-[12px] text-sky-800 italic animate-in slide-in-from-top-2 duration-300 shadow-sm">
                    {isId 
                      ? "Tip: Use data from the simulation to strengthen your reasoning. Focus on how the Nadran tradition can reduce overfishing."
                      : "Tip: Use data from the simulation to strengthen your reasoning. Focus on how the Nadran tradition can reduce overfishing."}
                  </div>
                )}

                {/* Recorded Data Table below explanation */}
                <div className="flex flex-col gap-3 min-h-[160px]">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{isId ? "Recorded Data" : "Recorded Data"}</p>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-y-auto exam-scrollbar">
                    <table className="w-full text-[10px] text-slate-900 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <th className="p-2.5 text-left font-bold uppercase">#</th>
                          <th className="p-2.5 text-left font-bold uppercase">{isId ? "Fishing" : "Fishing"}</th>
                          <th className="p-2.5 text-left font-bold uppercase">{isId ? "Awareness" : "Awareness"}</th>
                          <th className="p-2.5 text-left font-bold uppercase">{isId ? "Waste" : "Waste"}</th>
                          <th className="p-2.5 text-left font-bold uppercase">{isId ? "Conserv." : "Conserv."}</th>
                          <th className="p-2.5 text-left font-bold uppercase">{isId ? "Fish Pop." : "Fish Pop."}</th>
                          <th className="p-2.5 text-left font-bold uppercase">{isId ? "Biodiv." : "Biodiv."}</th>
                          <th className="p-2.5 text-left font-bold uppercase">{isId ? "Water" : "Water"}</th>
                          <th className="p-2.5 text-left font-bold uppercase">{isId ? "Sustain." : "Sustain."}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.length === 0 ? (
                           <tr>
                              <td colSpan={9} className="p-6 text-center text-slate-400 italic">No data recorded.</td>
                           </tr>
                        ) : history.map((row, i) => (
                          <tr key={row.id}>
                            <td className="p-2.5 text-slate-400 font-bold">{row.id}</td>
                            <td className="p-2.5 text-slate-600 font-semibold">{row.fishing}</td>
                            <td className="p-2.5 text-slate-600 font-semibold">{row.awareness}</td>
                            <td className="p-2.5 text-slate-600 font-semibold">{row.waste}</td>
                            <td className="p-2.5 text-slate-600 font-semibold">{row.conservation}</td>
                            <td className="p-2.5 font-bold text-slate-700">{row.fish}</td>
                            <td className="p-2.5 font-bold text-slate-700">{row.biodiversity}</td>
                            <td className="p-2.5 font-bold text-slate-700">{row.water}</td>
                            <td className="p-2.5 font-bold text-slate-800 uppercase">{row.sustain}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── BOTTOM NAVIGATION ── */}
      <footer className="h-16 bg-[#f3f6f9] border-t border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
           {/* No Back button visible in user screenshot, but I'll keep it functional */}
           <button 
             onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
             className="px-6 py-2 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest disabled:opacity-0"
             disabled={currentStep === 0}
           >
             Back
           </button>
        </div>

        <button 
          onClick={() => {
            if (currentStep < 5) setCurrentStep(prev => prev + 1);
            else {
               saveCompletedSession(7, { matches, q2Choice, q3Choice, q3Explanation, q4Choice, q4Explanation, q5Choice, q5Explanation, history }, 0, 5);
               onExit?.();
            }
          }}
          className="flex items-center gap-2 px-8 py-2.5 rounded bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all shadow-md active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {currentStep === 0 ? "Mulai Unit" : currentStep < 5 ? (isId ? "Next Question" : "Next Question") : (isId ? "Selesai" : "Finish")}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </footer>
    </div>
  );
};

export default Unit7Pisa;
