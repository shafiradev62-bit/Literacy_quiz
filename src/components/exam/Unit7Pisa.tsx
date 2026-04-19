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
  { id: "effect_biodiv", en: "Increases marine biodiversity", idText: "Meningkatkan keanekaragaman hayati laut" },
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
  const [sessionSaved, setSessionSaved] = useState(false);

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
  const [videoWatched, setVideoWatched] = useState(false);

  // Responses
  const [matches, setMatches] = useState<Record<string, string>>({}); // factorId -> itemText
  const [q2Choice, setQ2Choice] = useState("");
  const [q3Choice, setQ3Choice] = useState("");
  const [q3Explanation, setQ3Explanation] = useState("");
  const [q4Choice, setQ4Choice] = useState("");
  const [q4Explanation, setQ4Explanation] = useState("");
  const [q5Choice, setQ5Choice] = useState("");
  const [q5Explanation, setQ5Explanation] = useState("");

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
  };

  const handleDrop = (factorId: string, itemText: string) => {
    setMatches(prev => ({ ...prev, [factorId]: itemText }));
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
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden text-slate-900">
      {/* ── NAVIGATION HEADER ── */}
      <header className="h-14 bg-white border-b border-border/60 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">7</div>
            <span className="font-bold text-sm tracking-tight text-foreground uppercase text-slate-900">
              {isId ? "Unit 7: Nadran" : "Unit 7: Nadran"}
            </span>
          </div>
          <div className="h-6 w-px bg-border/60" />
          <nav className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="flex flex-col items-center gap-0.5">
                  <div className={`w-8 h-1.5 rounded-full transition-all ${currentStep >= s ? "bg-primary" : "bg-border"}`} />
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${currentStep >= s ? "text-primary" : "text-muted-foreground/40"}`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentStep(p => Math.max(0, p - 1))} className="p-1.5 hover:bg-muted rounded-md border border-border disabled:opacity-30" disabled={currentStep === 0}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setCurrentStep(p => Math.min(5, p + 1))} className="p-1.5 hover:bg-muted rounded-md border border-border disabled:opacity-30" disabled={currentStep === 5}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border px-2 py-1 rounded bg-muted/30">
            {stepLabels[currentStep]}
          </span>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <button
            onClick={() => {
              saveCompletedSession(7, { matches, q2Choice, q3Choice, q3Explanation, q4Choice, q4Explanation, q5Choice, q5Explanation, history }, 0, 5);
              onExit?.();
            }}
            className="px-3 py-1.5 bg-background border border-slate-200 text-slate-900 text-[10px] font-bold rounded hover:bg-muted uppercase tracking-wider transition-colors"
          >
            {isId ? "Keluar" : "Exit"}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT COLUMN: Questions ── */}
        <div className="w-[45%] bg-sky-100 border-r border-sky-200 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full flex flex-col exam-scrollbar">
            
            <div className="mb-4">
              <h2 className="text-[14px] font-bold text-sky-800 uppercase tracking-tight mb-0.5 leading-tight">
                {isId ? "Nadran dan Perikanan Berkelanjutan" : "Nadran and Sustainable Fishing"}
              </h2>
              <p className="text-[11px] font-bold text-sky-600/70 uppercase">
                {isId ? `Pertanyaan ${currentStep} / 5` : `Question ${currentStep} / 5`}
              </p>
            </div>

            {currentStep === 0 && (
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-slate-800">{isId ? "Ritual Nadran di Cirebon" : "Nadran Ritual in Cirebon"}</h1>
                <div className="text-[13px] leading-relaxed text-slate-700 space-y-3">
                  <p>
                    {isId 
                      ? "Nadran adalah upacara tradisional masyarakat nelayan Cirebon sebagai wujud syukur atas hasil laut. Tradisi ini melibatkan partisipasi kolektif dan mencerminkan hubungan budaya yang erat antara nelayan dan laut."
                      : "Nadran is a traditional ceremony of the Cirebon fishing community as a form of gratitude for sea products. It involves collective participation and reflects the close cultural relationship between fishermen and the sea."}
                  </p>
                  <p>
                    {isId
                      ? "Beberapa peneliti berpendapat bahwa tradisi seperti ini dapat mendorong perilaku penangkapan ikan yang bertanggung jawab serta konservasi ekosistem laut."
                      : "Some researchers suggest that such traditions may help encourage responsible fishing behavior and marine ecosystem conservation."}
                  </p>
                </div>
                <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-200">
                   <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest opacity-50 bg-gradient-to-br from-slate-800 to-slate-950">
                     Video Intro Unit 7
                   </div>
                </div>
                <button onClick={() => setCurrentStep(1)} className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all">
                  {isId ? "MULAI UNIT" : "START UNIT"}
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-5">
                <p className="text-[13px] font-medium text-slate-800 leading-relaxed">
                  {isId 
                    ? "Gunakan drag and drop untuk memasangkan setiap faktor dengan dampak utamanya."
                    : "Use drag and drop to match each factor with its main effect."}
                </p>
                
                <div className="space-y-3">
                  {FACTORS.map(f => (
                    <div key={f.id} className="flex items-center gap-4">
                      <div className="w-[180px] p-3 bg-sky-200/50 border border-sky-300 rounded-lg text-xs font-bold text-sky-900 leading-tight">
                        {isId ? f.idText : f.en}
                      </div>
                      <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" /></svg>
                      <div 
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(f.id, e.dataTransfer.getData("text/plain"))}
                        className={`flex-1 min-h-[46px] border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${matches[f.id] ? "border-primary bg-primary/5 shadow-inner" : "border-slate-300 bg-white/40"}`}
                      >
                        {matches[f.id] ? (
                          <div className="p-2 text-center text-[11px] font-bold text-primary animate-in fade-in zoom-in duration-300">
                            {matches[f.id]}
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-slate-300">{isId ? "Lepas di sini" : "Drop here"}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {MATCH_DRAGGABLES.map(item => {
                      const text = isId ? item.idText : item.en;
                      const isUsed = Object.values(matches).includes(text);
                      return (
                        <div 
                          key={item.id}
                          draggable={!isUsed}
                          onDragStart={e => onDragStart(e, text)}
                          className={`px-3 py-2 rounded-lg border shadow-sm text-[11px] font-bold cursor-grab active:cursor-grabbing transition-all ${isUsed ? "opacity-20 cursor-not-allowed bg-slate-100 border-slate-200 grayscale" : "bg-white border-slate-300 hover:border-primary text-slate-700"}`}
                        >
                          {text}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                   <button className="flex-1 py-2.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg hover:opacity-90">{isId ? "Cek Jawaban" : "Check Answer"}</button>
                   <button onClick={resetMatches} className="px-4 py-2.5 border border-slate-300 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-white">{isId ? "Reset" : "Reset Matches"}</button>
                </div>
              </div>
            )}

            {(currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5) && (
              <div className="space-y-5">
                <p className="text-[13px] font-medium text-slate-800 leading-relaxed">
                  {currentStep === 2 && (isId ? "Sesuaikan variabel di panel simulasi. Jika intensitas penangkapan tinggi namun kesadaran rendah, apa yang paling langsung menyebabkan penurunan populasi ikan?" : "Adjust the variables in the simulation panel. If fishing intensity is high but awareness is low, what most directly causes the decrease in fish population?")}
                  {currentStep === 3 && (isId ? "Dalam simulasi, peningkatan kesadaran masyarakat menyebabkan populasi ikan meningkat seiring waktu. Mengapa peningkatan kesadaran masyarakat dapat meningkatkan populasi ikan?" : "In the simulation, increasing community awareness leads to improved fish population over time. Why does increasing community awareness improve fish population?")}
                  {currentStep === 4 && (isId ? "Gunakan perbandingan di bawah dan data simulasi Anda untuk menjawab. Kesimpulan manakah yang paling baik menjelaskan perbedaan tersebut?" : "Use the comparison below and your simulation data to answer. Which conclusion best explains the difference?")}
                  {currentStep === 5 && (isId ? "Berdasarkan hasil simulasi dan tradisi Nadran, strategi manakah yang paling efektif untuk meningkatkan keberlanjutan laut di Cirebon?" : "Based on simulation results and Nadran tradition, which strategy would be most effective to improve marine sustainability in Cirebon?")}
                </p>

                {currentStep === 4 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm my-2">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-900">
                          <th className="p-2 text-left font-bold text-slate-500 uppercase">{isId ? "Komunitas" : "Community"}</th>
                          <th className="p-2 font-bold text-slate-500 uppercase">{isId ? "Penangkapan" : "Fishing"}</th>
                          <th className="p-2 font-bold text-slate-500 uppercase">{isId ? "Kesadaran" : "Awareness"}</th>
                          <th className="p-2 font-bold text-slate-500 uppercase">{isId ? "Hasil" : "Result"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-900">
                        <tr>
                          <td className="p-2 font-bold text-slate-700">A</td>
                          <td className="p-2 text-center text-slate-600 font-medium">{isId ? "Tinggi" : "High"}</td>
                          <td className="p-2 text-center text-slate-600 font-medium">{isId ? "Rendah" : "Low"}</td>
                          <td className="p-2 text-center font-bold text-rose-600">{isId ? "Populasi Turun" : "Fish decline"}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-slate-700">B</td>
                          <td className="p-2 text-center text-slate-600 font-medium">{isId ? "Sedang" : "Medium"}</td>
                          <td className="p-2 text-center text-slate-600 font-medium">{isId ? "Tinggi" : "High"}</td>
                          <td className="p-2 text-center font-bold text-emerald-600">{isId ? "Populasi Stabil" : "Fish stable"}</td>
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
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selected ? "border-primary bg-primary/5 shadow-sm" : "border-slate-300 bg-white hover:border-slate-400"}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-primary bg-primary" : "border-slate-300"}`}>
                           {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-[13px] text-slate-700 font-bold">{opt.label}.</span>
                        <span className="text-[13px] text-slate-700 font-medium">{isId ? opt.idText : opt.en}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-4">
                   <button disabled={!(currentStep === 2 ? q2Choice : currentStep === 3 ? q3Choice : currentStep === 4 ? q4Choice : q5Choice)} className="flex-1 py-3 bg-slate-800 text-white text-[11px] font-bold rounded-xl shadow-md disabled:opacity-30">
                     {isId ? "Kirim Jawaban" : "Submit Answer"}
                   </button>
                   <button onClick={() => { setQ2Choice(""); setQ3Choice(""); setQ4Choice(""); setQ5Choice(""); }} className="px-4 py-3 border border-slate-300 text-slate-600 text-[11px] font-bold rounded-xl bg-white hover:bg-slate-50">{isId ? "Reset" : "Reset"}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Simulation / Explanation Panel ── */}
        <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
          <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto exam-scrollbar">
            
            {/* Header Content based on Step */}
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                {(currentStep === 1 || currentStep === 2) ? (isId ? "Simulasi Keberlanjutan Laut" : "Marine Sustainability Simulation") : (currentStep === 3 ? (isId ? "Penjelasan Ilmiah Singkat" : "Short Scientific Explanation") : (isId ? "Alasan Berbasis Bukti" : "Evidence-Based Reasoning"))}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                {(currentStep === 1 || currentStep === 2) 
                  ? (isId ? "Sesuaikan variabel, jalankan simulasi, dan catat datamu." : "Adjust variables, run the simulation, and record your data.")
                  : (isId ? "Jelaskan bagaimana budaya atau kesadaran dapat memengaruhi ekosistem laut..." : "Explain how culture or awareness can affect marine ecosystems...")}
              </p>
            </div>

            {/* Questions 1 & 2: Full Simulation Engine */}
            {(currentStep === 0 || currentStep === 1 || currentStep === 2) && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Controls */}
                  <div className="flex-1 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{isId ? "Kontrol" : "Controls"}</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-700">{isId ? "Intensitas Penangkapan Ikan" : "Fishing Intensity"}</label>
                        <select value={fishingIntensity} onChange={e => setFishingIntensity(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary outline-none text-slate-700">
                          <option value="Low">{isId ? "Rendah" : "Low"}</option>
                          <option value="Medium">{isId ? "Sedang" : "Medium"}</option>
                          <option value="High">{isId ? "Tinggi" : "High"}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-700">{isId ? "Kesadaran Masyarakat (Nadran)" : "Community Awareness (influenced by Nadran)"}</label>
                        <select value={awareness} onChange={e => setAwareness(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary outline-none text-slate-700">
                          <option value="Low">{isId ? "Rendah" : "Low"}</option>
                          <option value="Medium">{isId ? "Sedang" : "Medium"}</option>
                          <option value="High">{isId ? "Tinggi" : "High"}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-700">{isId ? "Pengelolaan Limbah" : "Waste Management"}</label>
                        <select value={waste} onChange={e => setWaste(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary outline-none text-slate-700">
                          <option value="Poor">{isId ? "Buruk" : "Poor"}</option>
                          <option value="Moderate">{isId ? "Cukup" : "Moderate"}</option>
                          <option value="Good">{isId ? "Baik" : "Good"}</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-slate-700">{isId ? "Upaya Konservasi" : "Conservation Effort"}</label>
                        <select value={conservation} onChange={e => setConservation(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-primary outline-none text-slate-700">
                          <option value="None">{isId ? "Tidak Ada" : "None"}</option>
                          <option value="Partial">{isId ? "Sebagian" : "Partial"}</option>
                          <option value="Full">{isId ? "Penuh" : "Full"}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                       <button onClick={calculateResult} className="flex-1 py-3 bg-primary text-white text-[12px] font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90">{isId ? "Run Simulation" : "Run Simulation"}</button>
                       <button onClick={handleRecordData} className="flex-1 py-3 bg-emerald-600 text-white text-[12px] font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:opacity-90">{isId ? "Record Data" : "Record Data"}</button>
                    </div>
                    <button onClick={handleClearData} className="w-full py-2.5 bg-slate-700 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 shadow-sm uppercase tracking-wider">{isId ? "Clear Data" : "Clear Data"}</button>
                  </div>

                  {/* Outputs */}
                  <div className="flex-1 flex flex-col gap-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{isId ? "Hasil Output" : "Outputs"}</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: isId ? "Populasi Ikan" : "Fish Population", val: outputs.fish },
                        { label: isId ? "Keanekaragaman" : "Marine Biodiversity", val: outputs.biodiversity },
                        { label: isId ? "Kualitas Air" : "Water Quality", val: outputs.water },
                        { label: isId ? "Skor Berkelanjutan" : "Sustainability Score", val: outputs.sustainability },
                      ].map(out => (
                        <div key={out.label} className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center text-center gap-1 transition-all shadow-sm ${statusColor(out.val)}`}>
                          <span className="text-[9px] font-bold uppercase opacity-60 leading-tight">{out.label}</span>
                          <span className="text-xl font-black italic">{out.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 border-dashed flex items-center justify-center">
                      <p className="text-[10px] text-slate-400 text-center italic leading-relaxed">{isId ? "Tip: bandingkan hasil dengan mengubah satu variabel setiap kali. Lalu tekan Record Data." : "Tip: compare runs by changing one variable at a time. Then press Record Data."}</p>
                    </div>
                  </div>
                </div>

                {/* Recorded Data Table below simulation */}
                {history.length > 0 && (
                  <div className="flex flex-col gap-3 min-h-[140px]">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{isId ? "Data Tercatat" : "Recorded Data"}</p>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-y-auto exam-scrollbar">
                      <table className="w-full text-[10px] text-slate-900">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase">#</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase italic">{isId ? "Tangkapan" : "Fishing"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase italic">{isId ? "Sadar" : "Aware"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase italic">{isId ? "Limbah" : "Waste"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase italic">{isId ? "Konservasi" : "Conserv."}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase underline italic">{isId ? "Ikan" : "Fish"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase underline italic">{isId ? "Biodiv." : "Biodiv."}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase underline italic">{isId ? "Air" : "Water"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase underline italic">{isId ? "Skor" : "Score"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {history.map((row, i) => (
                            <tr key={row.id}>
                              <td className="p-2.5 text-slate-400 font-bold">{row.id}</td>
                              <td className="p-2.5 text-slate-600 font-semibold italic">{row.fishing}</td>
                              <td className="p-2.5 text-slate-600 font-semibold italic">{row.awareness}</td>
                              <td className="p-2.5 text-slate-600 font-semibold italic">{row.waste}</td>
                              <td className="p-2.5 text-slate-600 font-semibold italic">{row.conservation}</td>
                              <td className="p-2.5"><span className={`px-2 py-0.5 rounded font-bold text-[9px] ${statusColor(row.fish)}`}>{row.fish}</span></td>
                              <td className="p-2.5"><span className={`px-2 py-0.5 rounded font-bold text-[9px] ${statusColor(row.biodiversity)}`}>{row.biodiversity}</span></td>
                              <td className="p-2.5"><span className={`px-2 py-0.5 rounded font-bold text-[9px] ${statusColor(row.water)}`}>{row.water}</span></td>
                              <td className="p-2.5 font-black text-slate-800 underline uppercase italic">{row.sustain}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Questions 3, 4, 5: Explanation UI */}
            {(currentStep === 3 || currentStep === 4 || currentStep === 5) && (
              <div className="flex-1 flex flex-col gap-5 min-h-0">
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                  <textarea
                    value={currentStep === 3 ? q3Explanation : currentStep === 4 ? q4Explanation : q5Explanation}
                    onChange={e => {
                      if (currentStep === 3) setQ3Explanation(e.target.value);
                      if (currentStep === 4) setQ4Explanation(e.target.value);
                      if (currentStep === 5) setQ5Explanation(e.target.value);
                    }}
                    placeholder={isId ? "Tuliskan penjelasan singkat Anda di sini..." : "Write a short explanation here..."}
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-[13px] outline-none focus:ring-1 focus:ring-primary transition-all resize-none text-slate-800 shadow-inner leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <button onClick={() => setShowWritingGuide(!showWritingGuide)} className="px-5 py-3 bg-sky-700 text-white font-bold text-[11px] rounded-xl shadow-md hover:bg-sky-800 transition-all uppercase tracking-widest active:scale-95">
                      {isId ? "PANDUAN MENULIS" : "SHOW WRITING GUIDE"}
                    </button>
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {getWordCount(currentStep === 3 ? q3Explanation : currentStep === 4 ? q4Explanation : q5Explanation)} / 15 words
                    </span>
                  </div>
                </div>
                
                {showWritingGuide && (
                  <div className="bg-sky-50 border border-sky-200 p-5 rounded-2xl text-[12px] text-sky-800 italic animate-in slide-in-from-top-2 duration-300 shadow-sm">
                    {isId 
                      ? "Tip: Gunakan data dari simulasi untuk memperkuat alasan Anda. Fokuslah pada bagaimana tradisi Nadran dapat mengurangi penangkapan berlebihan."
                      : "Tip: Use data from the simulation to strengthen your reasoning. Focus on how the Nadran tradition can reduce overfishing."}
                  </div>
                )}

                {/* Question 4 & 5: Show History Table below explanation */}
                {history.length > 0 && (
                  <div className="flex flex-col gap-3 min-h-[160px]">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{isId ? "Data Tercatat" : "Recorded Data"}</p>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-y-auto exam-scrollbar">
                      <table className="w-full text-[10px] text-slate-900">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase">#</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase italic">{isId ? "Tangkapan" : "Fishing"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase italic">{isId ? "Sadar" : "Aware"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase italic">{isId ? "Limbah" : "Waste"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase italic">{isId ? "Konservasi" : "Conserv."}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase underline italic">{isId ? "Ikan" : "Fish"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase underline italic">{isId ? "Biodiv." : "Biodiv."}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase underline italic">{isId ? "Air" : "Water"}</th>
                            <th className="p-2.5 text-left text-slate-500 font-bold uppercase underline italic">{isId ? "Skor" : "Score"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {history.map((row, i) => (
                            <tr key={row.id}>
                              <td className="p-2.5 text-slate-400 font-bold">{row.id}</td>
                              <td className="p-2.5 text-slate-600 font-semibold italic">{row.fishing}</td>
                              <td className="p-2.5 text-slate-600 font-semibold italic">{row.awareness}</td>
                              <td className="p-2.5 text-slate-600 font-semibold italic">{row.waste}</td>
                              <td className="p-2.5 text-slate-600 font-semibold italic">{row.conservation}</td>
                              <td className="p-2.5"><span className={`px-2 py-0.5 rounded font-bold text-[9px] ${statusColor(row.fish)}`}>{row.fish}</span></td>
                              <td className="p-2.5"><span className={`px-2 py-0.5 rounded font-bold text-[9px] ${statusColor(row.biodiversity)}`}>{row.biodiversity}</span></td>
                              <td className="p-2.5"><span className={`px-2 py-0.5 rounded font-bold text-[9px] ${statusColor(row.water)}`}>{row.water}</span></td>
                              <td className="p-2.5 font-black text-slate-800 underline uppercase italic">{row.sustain}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── BOTTOM NAVIGATION ── */}
      <footer className="h-20 border-t border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <button 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-20 transition-all uppercase tracking-widest text-[11px]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
            {isId ? "KEMBALI" : "BACK"}
          </button>
          <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] select-none">
             {stepLabels[currentStep]} · {currentStep}/5
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
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:opacity-90 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {currentStep < 5 ? (isId ? "SOAL BERIKUTNYA" : "NEXT QUESTION") : (isId ? "SELESAI" : "FINISH")}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </footer>
    </div>
  );
};

export default Unit7Pisa;
