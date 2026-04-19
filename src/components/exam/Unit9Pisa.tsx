import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDeviceId, saveCompletedSession } from "@/hooks/useExamSession";

interface Unit9PisaProps { onExit?: () => void; studentId?: string; }

type DyeType = "Synthetic" | "Natural";
type WaterLevel = "Low" | "Medium" | "High";
type TreatmentLevel = "None" | "Partial" | "Full";
type ScaleLevel = "Small" | "Medium" | "Large";
type Quality = "Good" | "Medium" | "Poor";
type RiskLevel = "Low" | "Medium" | "High";

interface SimResult { waterQuality: Quality; ecosystemRisk: RiskLevel; productionFeasibility: RiskLevel; }

// 2D lookup table: [dye][water][treatment] -> SimResult
const SIM_TABLE: Record<DyeType, Record<WaterLevel, Record<TreatmentLevel, SimResult>>> = {
  Synthetic: {
    Low:    { None: {waterQuality:"Poor",  ecosystemRisk:"High",   productionFeasibility:"High"},  Partial:{waterQuality:"Medium",ecosystemRisk:"Medium",productionFeasibility:"Medium"}, Full:{waterQuality:"Good",  ecosystemRisk:"Low",    productionFeasibility:"Low"}  },
    Medium: { None: {waterQuality:"Poor",  ecosystemRisk:"High",   productionFeasibility:"High"},  Partial:{waterQuality:"Medium",ecosystemRisk:"Medium",productionFeasibility:"Medium"}, Full:{waterQuality:"Good",  ecosystemRisk:"Low",    productionFeasibility:"Low"}  },
    High:   { None: {waterQuality:"Poor",  ecosystemRisk:"High",   productionFeasibility:"High"},  Partial:{waterQuality:"Poor",  ecosystemRisk:"High",  productionFeasibility:"Medium"}, Full:{waterQuality:"Medium",ecosystemRisk:"Medium",productionFeasibility:"Low"}  },
  },
  Natural: {
    Low:    { None: {waterQuality:"Medium",ecosystemRisk:"Medium", productionFeasibility:"High"},  Partial:{waterQuality:"Good",  ecosystemRisk:"Low",   productionFeasibility:"Medium"}, Full:{waterQuality:"Good",  ecosystemRisk:"Low",    productionFeasibility:"Low"}  },
    Medium: { None: {waterQuality:"Medium",ecosystemRisk:"Medium", productionFeasibility:"High"},  Partial:{waterQuality:"Medium",ecosystemRisk:"Medium",productionFeasibility:"Medium"}, Full:{waterQuality:"Good",  ecosystemRisk:"Low",    productionFeasibility:"Low"}  },
    High:   { None: {waterQuality:"Poor",  ecosystemRisk:"High",   productionFeasibility:"High"},  Partial:{waterQuality:"Medium",ecosystemRisk:"Medium",productionFeasibility:"Medium"}, Full:{waterQuality:"Medium",ecosystemRisk:"Medium",productionFeasibility:"Low"}  },
  },
};

const STEP_LABELS_EN = ["Introduction","Question 1","Question 2","Question 3","Question 4","Question 5"];
const STEP_LABELS_ID = ["Pendahuluan","Soal 1","Soal 2","Soal 3","Soal 4","Soal 5"];

const q1Items = [
  {key:"synth_no_treat", en:"Using synthetic dyes with no wastewater treatment.",       id:"Menggunakan pewarna sintetis tanpa pengolahan limbah."},
  {key:"less_water",     en:"Using less water in the process.",                          id:"Menggunakan lebih sedikit air dalam proses."},
  {key:"untreated_river",en:"Releasing untreated dye wastewater into a river.",          id:"Membuang limbah pewarna tanpa pengolahan ke sungai."},
  {key:"full_treat",     en:"Applying full wastewater treatment before disposal.",       id:"Menerapkan pengolahan limbah penuh sebelum dibuang."},
];

const Unit9Pisa = ({ onExit, studentId }: Unit9PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [currentStep, setCurrentStep] = useState(0);

  const [showWritingGuide, setShowWritingGuide] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  // Controls
  const [dyeType,   setDyeType]   = useState<DyeType>("Synthetic");
  const [waterUse,  setWaterUse]  = useState<WaterLevel>("High");
  const [treatment, setTreatment] = useState<TreatmentLevel>("None");
  const [scale,     setScale]     = useState<ScaleLevel>("Medium");

  // Outputs (start with defaults matching Synthetic/High/None)
  const [outputs, setOutputs] = useState<SimResult>({waterQuality:"Poor", ecosystemRisk:"High", productionFeasibility:"High"});
  const [simRan, setSimRan] = useState(false);
  const [history, setHistory] = useState<Array<{id:number;dye:DyeType;water:WaterLevel;treatment:TreatmentLevel;scale:ScaleLevel}&SimResult>>([]);

  // Answers
  const [q1Answers, setQ1Answers] = useState<Record<string,string>>({});
  const [q2Answer,  setQ2Answer]  = useState("");
  const [q3Choice,  setQ3Choice]  = useState("");
  const [q4Answer,  setQ4Answer]  = useState("");
  const [q5Answer,  setQ5Answer]  = useState("");

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };



  const isStepValid = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return Object.keys(q1Answers).length >= 4;
    if (currentStep === 2) {
      const count = getWordCount(q2Answer);
      return count >= 15 ;
    }
    if (currentStep === 3) return !!q3Choice;
    if (currentStep === 4) {
      const count = getWordCount(q4Answer);
      return count >= 15;
    }
    if (currentStep === 5) {
      const count = getWordCount(q5Answer);
      return count >= 15;
    }
    return false;
  };

  // AUTO-SYNC / AUTO-SAVE
  const deviceId = getDeviceId();
  useEffect(() => {
    const data = {
      q1Answers, q2Answer, q3Choice, q4Answer, q5Answer, currentStep,
      dyeType, waterUse, treatment, scale, outputs, history, simRan
    };
    localStorage.setItem(`unit9_autosave_${deviceId}`, JSON.stringify(data));
  }, [q1Answers, q2Answer, q3Choice, q4Answer, q5Answer, currentStep, history, dyeType, waterUse, treatment, scale, outputs, simRan]);

  // LOAD AUTO-SAVE
  useEffect(() => {
    const saved = localStorage.getItem(`unit9_autosave_${deviceId}`);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.q1Answers !== undefined) setQ1Answers(d.q1Answers);
        if (d.q2Answer !== undefined) setQ2Answer(d.q2Answer);
        if (d.q3Choice !== undefined) setQ3Choice(d.q3Choice);
        if (d.q4Answer !== undefined) setQ4Answer(d.q4Answer);
        if (d.q5Answer !== undefined) setQ5Answer(d.q5Answer);
        if (d.currentStep !== undefined) setCurrentStep(d.currentStep);
        if (d.dyeType !== undefined) setDyeType(d.dyeType);
        if (d.waterUse !== undefined) setWaterUse(d.waterUse);
        if (d.treatment !== undefined) setTreatment(d.treatment);
        if (d.scale !== undefined) setScale(d.scale);
        if (d.outputs !== undefined) setOutputs(d.outputs);
        if (d.history !== undefined) setHistory(d.history);
        if (d.simRan !== undefined) setSimRan(d.simRan);
      } catch (e) {
        console.error("Failed to load unit9 autosave", e);
      }
    }
  }, []);

  const runSimulation = () => {
    const base = SIM_TABLE[dyeType][waterUse][treatment];
    // Scale affects feasibility: Large scale boosts feasibility, Full treatment reduces it
    let feas = base.productionFeasibility;
    if (scale === "Large" && feas === "Low")    feas = "Medium";
    if (scale === "Small" && feas === "High")   feas = "Medium";
    setOutputs({ ...base, productionFeasibility: feas });
    setSimRan(true);
  };

  const handleRecord = () => {
    if (!simRan) return;
    setHistory(prev => [...prev, { id: prev.length + 1, dye: dyeType, water: waterUse, treatment, scale, ...outputs }]);
  };

  // Color helpers
  const qColor = (v: Quality) => v === "Good" ? "text-primary bg-primary/10 border-primary/30" : v === "Poor" ? "text-foreground/50 bg-muted/50 border-border" : "text-foreground/70 bg-muted/30 border-border";
  const rColor = (v: RiskLevel, inv = false) => {
    if (!inv) { if (v==="High") return "text-foreground/50 bg-muted/50 border-border"; if (v==="Low") return "text-primary bg-primary/10 border-primary/30"; return "text-foreground/70 bg-muted/30 border-border"; }
    if (v==="High") return "text-primary bg-primary/10 border-primary/30"; if (v==="Low") return "text-foreground/50 bg-muted/50 border-border"; return "text-foreground/70 bg-muted/30 border-border";
  };

  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;

  // SVG flow diagram colors
  const riverColor   = treatment === "Full" ? "#4a7c59" : treatment === "Partial" ? "#6b7280" : "#9ca3af";
  const arrowColor   = treatment === "None" ? "#9ca3af" : treatment === "Partial" ? "#6b7280" : "#4a7c59";
  const treatVisible = treatment !== "None";

  // ── SHARED WRITING GUIDE BUTTON ──
  const WritingGuideBtn = ({ text }: { text: string }) => (
    <>
      <button onClick={() => setShowWritingGuide(!showWritingGuide)}
        className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors text-[11px] font-bold text-foreground/70">
        {isId ? "Tampilkan Panduan Menulis" : "Show Writing Guide"}
        <svg className={`w-3 h-3 ml-auto transition-transform ${showWritingGuide ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      </button>
      {showWritingGuide && (
        <div className="bg-muted/40 border border-border p-4 rounded-lg">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Panduan Menulis" : "Writing Guide"}</p>
          <p className="text-[12px] text-foreground/70 leading-relaxed italic">{text}</p>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">

      {/* ── HEADER ── */}
      <header className="h-14 bg-white border-b border-border/60 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">9</div>
            <span className="font-bold text-sm tracking-tight text-foreground uppercase">
              {isId ? "Unit 9: Produksi Batik Berkelanjutan" : "Unit 9: Sustainable Batik Production"}
            </span>
          </div>
          <div className="h-6 w-px bg-border/60" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(s => (
                <div key={s} className="flex flex-col items-center gap-0.5">
                  <div className={`w-7 h-1.5 rounded-full transition-all ${currentStep >= s ? "bg-primary" : "bg-border"}`} />
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${currentStep >= s ? "text-primary" : "text-muted-foreground/40"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentStep(p => Math.max(0, p-1))} disabled={currentStep === 0}
            className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button onClick={() => setCurrentStep(p => Math.min(5, p+1))} disabled={currentStep === 5 || !isStepValid()}
            className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/60 px-2 py-1 rounded">{stepLabels[currentStep]}</span>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <button onClick={() => {
            // Validate before submission
            const wordCount2 = q2Answer.trim() ? q2Answer.trim().split(/\s+/).length : 0;
            const wordCount4 = q4Answer.trim() ? q4Answer.trim().split(/\s+/).length : 0;
            const wordCount5 = q5Answer.trim() ? q5Answer.trim().split(/\s+/).length : 0;
            
            if (wordCount2 > 0 && wordCount2 < 15) {
              alert(isId ? "Soal 2 memerlukan minimal 15 kata." : "Question 2 requires at least 15 words.");
              return;
            }
            if (wordCount4 > 0 && wordCount4 < 15) {
              alert(isId ? "Soal 4 memerlukan minimal 15 kata." : "Question 4 requires at least 15 words.");
              return;
            }
            if (wordCount5 > 0 && wordCount5 < 15) {
              alert(isId ? "Soal 5 memerlukan minimal 15 kata." : "Question 5 requires at least 15 words.");
              return;
            }
            
            const score = [
              Object.keys(q1Answers).length >= 4,
              q2Answer.trim().length > 0,
              q3Choice.trim().length > 0,
              q4Answer.trim().length > 0,
              q5Answer.trim().length > 0
            ].filter(Boolean).length;
            saveCompletedSession(9, { q1Answers, q2Answer, q3Choice, q4Answer, q5Answer, history }, score, 5);
            onExit?.();
          }} className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded border border-emerald-700 hover:bg-emerald-700 transition-colors uppercase tracking-wider">
            {isId ? "Kirim & Kembali" : "Submit & Back"}
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Questions ── */}
        <div className="w-[45%] bg-violet-100 border-r border-violet-200 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-4 exam-scrollbar">

            {/* ── STEP 0: Introduction ── */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-[10px]">{isId ? "Pendahuluan" : "Introduction"}</h2>
                  <h1 className="text-xl font-bold text-foreground leading-tight">{isId ? "PRODUKSI BATIK BERKELANJUTAN" : "SUSTAINABLE BATIK PRODUCTION"}</h1>
                  <p className="text-[11px] text-muted-foreground font-medium">{isId ? "Batik Trusmi, Cirebon" : "Batik Trusmi, Cirebon"}</p>
                </div>
                <div className="text-[13px] leading-[1.8] text-foreground/80 space-y-3">
                  <p>{isId
                    ? "Batik Trusmi adalah salah satu industri batik tradisional yang paling terkenal di Cirebon. Produksi batik penting bagi budaya lokal dan menyediakan lapangan kerja serta pendapatan bagi masyarakat."
                    : "Batik Trusmi is one of the best-known traditional batik industries in Cirebon. Batik production is important for local culture and provides jobs and income for the community."}</p>
                  <p>{isId
                    ? "Namun, produksi batik juga menggunakan air dan pewarna dalam jumlah besar. Selama proses pewarnaan dan pencucian, limbah cair dapat mengandung sisa pewarna, lilin, senyawa organik, dan logam berat."
                    : "However, batik production also uses large amounts of water and dyes. During dyeing and washing, wastewater can contain leftover dyes, wax, organic compounds, and heavy metals."}</p>
                  <p>{isId
                    ? "Jika limbah cair dibuang tanpa pengolahan yang tepat, dapat mengurangi kualitas air dan merusak ekosistem perairan. Dalam penyelidikan ini, siswa memeriksa tiga faktor penting: jenis pewarna, penggunaan air, dan pengolahan limbah."
                    : "If wastewater is released without proper treatment, it can reduce water quality and harm aquatic ecosystems. In this investigation, students examine three important factors: dye type, water use, and waste treatment."}</p>
                  <div className="rounded-xl overflow-hidden border border-border/40 bg-black/5">
                    <video
                      src="/videos/unit9-batik.mp4"
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full aspect-video"
                      onEnded={() => setVideoWatched(true)}
                    />
                  </div>
                  {videoWatched && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-semibold w-fit">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      {isId ? "Video selesai ditonton" : "Video watched"}
                    </div>
                  )}
                  <div className="bg-muted/40 border border-border p-4 rounded-lg flex items-start gap-4">
                    <div className="p-2 bg-primary/5 rounded text-primary shrink-0">
                    </div>
                    <div>
                      <p className="text-[12px] text-foreground/70 mb-4">{isId
                        ? "Baca pendahuluan dengan saksama. Gunakan simulasi di sebelah kanan untuk membantu menjawab pertanyaan. Klik tombol di bawah atau tanda panah di atas untuk memulai."
                        : "Read the introduction carefully. Use the simulation on the right to help answer the questions. Click the button below or the arrows above to begin."}</p>
                      <button 
                        onClick={() => setCurrentStep(1)}
                        className="w-full py-2.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        {isId ? "MULAI PENILAIAN" : "START ASSESSMENT"}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Q1 — Yes/No Grid ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 1 / 5" : "Question 1 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Data Produksi Batik" : "Batik Production Data"}</p>
                  <p>{isId
                    ? "Produksi batik dapat menggunakan pewarna sintetis atau pewarna alami. Kedua jenis tersebut dapat memengaruhi lingkungan jika penggunaan air tinggi dan limbah tidak diolah dengan baik."
                    : "Batik production can use synthetic dyes or natural dyes. Both types can affect the environment if water use is high and wastewater is not treated properly."}</p>
                  <table className="w-full text-[11px] border-collapse mt-2">
                    <thead><tr className="bg-muted/50">
                      <th className="border border-border/40 px-2 py-1 text-left">{isId ? "Faktor produksi" : "Production factor"}</th>
                      <th className="border border-border/40 px-2 py-1 text-left">{isId ? "Dampak lingkungan yang mungkin terjadi" : "Possible environmental effect"}</th>
                    </tr></thead>
                    <tbody>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Pewarna sintetis":"Synthetic dye"}</td><td className="border border-border/40 px-2 py-1">{isId?"Dapat menambahkan bahan kimia persisten dan kadang logam berat ke limbah":"Can add persistent chemicals and sometimes heavy metals to wastewater"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Pewarna alami":"Natural dye"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tetap dapat meningkatkan limbah organik di air jika digunakan berlebihan":"Can still increase organic waste in water if used excessively"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Penggunaan air tinggi":"High water use"}</td><td className="border border-border/40 px-2 py-1">{isId?"Menghasilkan lebih banyak limbah cair":"Produces more wastewater"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Tanpa pengolahan":"No treatment"}</td><td className="border border-border/40 px-2 py-1">{isId?"Meningkatkan risiko pencemaran di sungai":"Raises pollution risk in rivers"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId
                  ? "Tabel berikut menunjukkan beberapa kondisi produksi batik. Apakah setiap kondisi tersebut akan meningkatkan risiko pencemaran lingkungan? Pilih Ya atau Tidak untuk setiap kondisi."
                  : "The table below lists possible batik production conditions. Would each condition increase environmental pollution risk? Choose Yes or No for each condition."}</p>
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-[12px] border-collapse">
                    <thead><tr className="bg-muted/60">
                      <th className="border-b border-border/40 px-3 py-2.5 text-left font-bold text-[10px] uppercase tracking-wide text-muted-foreground">{isId ? "Kondisi produksi" : "Production condition"}</th>
                      <th className="border-b border-l border-border/40 px-4 py-2.5 text-center font-bold text-[10px] uppercase tracking-wide text-primary w-16">{isId ? "Ya" : "Yes"}</th>
                      <th className="border-b border-l border-border/40 px-4 py-2.5 text-center font-bold text-[10px] uppercase tracking-wide text-muted-foreground w-16">{isId ? "Tidak" : "No"}</th>
                    </tr></thead>
                    <tbody>
                      {q1Items.map((item, i) => (
                        <tr key={item.key} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                          <td className="border-b border-border/30 px-3 py-3 text-[12px] text-foreground/80">{isId ? item.id : item.en}</td>
                          <td className="border-b border-l border-border/30 px-4 py-3 text-center">
                            <input type="radio" name={`q1_${item.key}`} className="w-4 h-4 accent-primary" checked={q1Answers[item.key]==="yes"} onChange={() => setQ1Answers(p => ({...p,[item.key]:"yes"}))}/>
                          </td>
                          <td className="border-b border-l border-border/30 px-4 py-3 text-center">
                            <input type="radio" name={`q1_${item.key}`} className="w-4 h-4 accent-primary" checked={q1Answers[item.key]==="no"} onChange={() => setQ1Answers(p => ({...p,[item.key]:"no"}))}/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── STEP 2: Q2 — Open (natural dye misconception) ── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 2 / 5" : "Question 2 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Produksi Batik" : "Batik Production"}</p>
                  <p>{isId
                    ? "Produksi batik dapat menggunakan pewarna sintetis atau pewarna alami. Kedua jenis tersebut dapat memengaruhi lingkungan jika penggunaan air tinggi dan limbah tidak diolah dengan baik."
                    : "Batik production can use synthetic dyes or natural dyes. Both types can affect the environment if water use is high and wastewater is not treated properly."}</p>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Beberapa pengrajin batik berpendapat bahwa menggunakan pewarna alami selalu aman bagi lingkungan, terlepas dari seberapa banyak air yang mereka gunakan. Mengapa pendapat ini tidak sepenuhnya benar?"
                  : "Some batik craftspeople think that using natural dyes is always environmentally safe, regardless of how much water they use. Why is this opinion not entirely correct?"}</p>
                <WritingGuideBtn text={isId ? "Jawaban yang kuat menjelaskan bahwa pewarna alami dalam konsentrasi tinggi masih dapat mengganggu ekosistem karena limbah organik yang berlebihan, dan penggunaan air yang tinggi tetap menghasilkan volume limbah yang besar." : "A strong answer explains that natural dyes in high concentrations can still disrupt ecosystems due to excessive organic waste, and high water use still generates large volumes of waste."} />
                <textarea value={q2Answer} onChange={e => setQ2Answer(e.target.value)} className="w-full h-32 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q2Answer) >= 15  ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q2Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
              </div>
            )}

            {/* ── STEP 3: Q3 — MCQ ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 3 / 5" : "Question 3 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Perbandingan Produksi" : "Production Comparison"}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                      <thead><tr className="bg-muted/50">
                        <th className="border border-border/40 px-2 py-1">{isId?"Metode":"Method"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Jenis pewarna":"Dye type"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Penggunaan air":"Water use"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Pengolahan":"Treatment"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Hasil yang diharapkan":"Expected result"}</th>
                      </tr></thead>
                      <tbody>
                        <tr><td className="border border-border/40 px-2 py-1 text-center font-bold">A</td><td className="border border-border/40 px-2 py-1">{isId?"Sintetis":"Synthetic"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tinggi":"High"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tidak ada":"None"}</td><td className="border border-border/40 px-2 py-1">{isId?"Risiko pencemaran tertinggi":"Highest pollution risk"}</td></tr>
                        <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1 text-center font-bold">B</td><td className="border border-border/40 px-2 py-1">{isId?"Alami":"Natural"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tinggi":"High"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tidak ada":"None"}</td><td className="border border-border/40 px-2 py-1">{isId?"Risiko pencemaran tetap tinggi":"Pollution risk remains high"}</td></tr>
                        <tr><td className="border border-border/40 px-2 py-1 text-center font-bold">C</td><td className="border border-border/40 px-2 py-1">{isId?"Sintetis":"Synthetic"}</td><td className="border border-border/40 px-2 py-1">{isId?"Rendah":"Low"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tidak ada":"None"}</td><td className="border border-border/40 px-2 py-1">{isId?"Risiko pencemaran berkurang sebagian":"Pollution risk decreases partly"}</td></tr>
                        <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1 text-center font-bold">D</td><td className="border border-border/40 px-2 py-1">{isId?"Alami":"Natural"}</td><td className="border border-border/40 px-2 py-1">{isId?"Rendah":"Low"}</td><td className="border border-border/40 px-2 py-1">{isId?"Penuh":"Full"}</td><td className="border border-border/40 px-2 py-1">{isId?"Risiko pencemaran terendah":"Lowest pollution risk"}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Sebuah workshop batik mengurangi penggunaan air tetapi masih menggunakan pewarna sintetis dan tidak melakukan pengolahan limbah.\n\nPernyataan manakah yang paling tepat menggambarkan hasilnya?"
                  : "A batik workshop reduces water use but still uses synthetic dyes and provides no wastewater treatment.\n\nWhich statement best describes the result?"}</p>
                <div className="space-y-2.5">
                  {[
                    {val:"A",en:"Environmental impact disappears completely.",id:"Dampak lingkungan hilang sepenuhnya."},
                    {val:"B",en:"Environmental impact decreases partly, but pollution can still occur.",id:"Dampak lingkungan berkurang sebagian, tetapi pencemaran masih dapat terjadi."},
                    {val:"C",en:"Environmental impact increases only because water use is lower.",id:"Dampak lingkungan meningkat hanya karena penggunaan air lebih rendah."},
                    {val:"D",en:"There is no relation between dye type and pollution.",id:"Tidak ada hubungan antara jenis pewarna dan pencemaran."},
                  ].map(opt => (
                    <label key={opt.val} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q3" className="w-4 h-4 accent-primary" checked={q3Choice===opt.val} onChange={() => setQ3Choice(opt.val)}/>
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.val}</span>
                      <span className="text-[13px] text-foreground/70">{isId ? opt.id : opt.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4: Q4 — Open (best combination) ── */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">4</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 4 / 5" : "Question 4 / 5"}</h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Pilih satu kombinasi: jenis pewarna, penggunaan air, dan pengolahan limbah yang memberikan keseimbangan terbaik antara keberlanjutan lingkungan dan kelayakan produksi.\n\nJelaskan mengapa pilihanmu merupakan opsi yang paling berkelanjutan."
                  : "Choose one combination of: dye type, water use, and waste treatment that gives the best balance between environmental sustainability and production feasibility.\n\nExplain why your choice is the most sustainable option."}</p>
                <WritingGuideBtn text={isId
                  ? "Jawaban yang baik biasanya memilih penggunaan air yang lebih rendah, pengolahan limbah minimal sebagian atau penuh, serta jenis pewarna yang lebih aman. Jawaban juga harus menjelaskan keseimbangan antara pengurangan pencemaran dan kebutuhan produksi yang praktis."
                  : "A strong answer usually chooses lower water use, at least partial or full treatment, and a safer dye option. It should explain the trade-off between lower pollution and practical production needs."} />
                <textarea value={q4Answer} onChange={e => setQ4Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q4Answer) >= 15  ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q4Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
              </div>
            )}

            {/* ── STEP 5: Q5 — Open (balance economy & environment) ── */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">5</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 5 / 5" : "Question 5 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Pengambilan Keputusan" : "Decision Making"}</p>
                  <table className="w-full text-[11px] border-collapse">
                    <thead><tr className="bg-muted/50"><th className="border border-border/40 px-2 py-1 text-left">{isId?"Tujuan":"Goal"}</th><th className="border border-border/40 px-2 py-1 text-left">{isId?"Mengapa penting":"Why it matters"}</th></tr></thead>
                    <tbody>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Mempertahankan produksi batik":"Maintain batik production"}</td><td className="border border-border/40 px-2 py-1">{isId?"Mendukung lapangan kerja, pendapatan, dan warisan budaya":"Supports local jobs, income, and cultural heritage"}</td></tr>
                      <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1">{isId?"Mengurangi pencemaran air":"Reduce water pollution"}</td><td className="border border-border/40 px-2 py-1">{isId?"Melindungi sungai, organisme air, dan kesehatan masyarakat":"Protects rivers, aquatic organisms, and community health"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Menggunakan teknologi pengolahan":"Use treatment technology"}</td><td className="border border-border/40 px-2 py-1">{isId?"Membantu mengurangi zat berbahaya sebelum dibuang":"Helps reduce harmful contaminants before disposal"}</td></tr>
                      <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1">{isId?"Meningkatkan efisiensi produksi":"Improve production efficiency"}</td><td className="border border-border/40 px-2 py-1">{isId?"Dapat mengurangi penggunaan air dan limbah":"Can reduce water use and waste generation"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Industri batik di Trusmi mendukung lapangan kerja dan perekonomian lokal, tetapi juga menimbulkan tantangan lingkungan.\n\nJelaskan mengapa penting untuk menyeimbangkan manfaat ekonomi dan perlindungan lingkungan dalam produksi batik."
                  : "The batik industry in Trusmi supports jobs and the local economy, but it also creates environmental challenges.\n\nExplain why it is important to balance economic benefits and environmental protection in batik production."}</p>
                <WritingGuideBtn text={isId
                  ? "Jawaban yang baik menjelaskan bahwa batik mendukung mata pencaharian dan warisan budaya, tetapi limbah yang tidak diolah dapat merusak sungai dan ekosistem. Metode berkelanjutan membantu melindungi pendapatan masyarakat sekaligus lingkungan dalam jangka panjang."
                  : "A strong answer explains that batik supports livelihoods and cultural heritage, but untreated wastewater can damage rivers and ecosystems. Sustainable methods help protect both community income and the environment in the long term."} />
                <textarea value={q5Answer} onChange={e => setQ5Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q5Answer) >= 15  ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q5Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
                <button
                  onClick={() => {
                    if (!isStepValid()) return;
                    const score = [
                      Object.keys(q1Answers).length >= 4,
                      q2Answer.trim().length > 0,
                      q3Choice.trim().length > 0,
                      q4Answer.trim().length > 0,
                      q5Answer.trim().length > 0
                    ].filter(Boolean).length;
                    saveCompletedSession(9, { q1Answers, q2Answer, q3Choice, q4Answer, q5Answer, history }, score, 5);
                    onExit?.();
                  }}
                  disabled={!isStepValid()}
                  className="w-full py-3 bg-emerald-600 text-white text-[12px] font-bold rounded-lg border border-emerald-700 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isId ? "KIRIM JAWABAN UNIT 9" : "SUBMIT UNIT 9 ANSWERS"}
                </button>
              </div>
            )}

          </div>
          {/* ── BOTTOM NAVIGATION ── */}
          <div className="px-6 py-4 border-t-2 border-primary/20 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)] shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentStep(p => Math.max(0, p-1))} disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border font-bold text-[13px] text-foreground bg-white hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
                {isId ? "Kembali" : "Back"}
              </button>
              <div className="flex-1 text-center text-[11px] font-bold text-muted-foreground">{stepLabels[currentStep]} · {currentStep}/5</div>
              {currentStep < 5 ? (
                <button onClick={() => setCurrentStep(p => Math.min(5, p+1))} disabled={!isStepValid()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
                  {isId ? "Soal Berikutnya" : "Next Question"}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </button>
              ) : (
                <button onClick={() => {
                  const score = [Object.keys(q1Answers).length >= 4, q2Answer.trim().length > 0, q3Choice.trim().length > 0, q4Answer.trim().length > 0, q5Answer.trim().length > 0].filter(Boolean).length;
                  saveCompletedSession(9, { q1Answers, q2Answer, q3Choice, q4Answer, q5Answer, history }, score, 5);
                  onExit?.();
                }} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] transition-all shadow-md">
                  {isId ? "Kirim & Selesai" : "Submit & Finish"}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* -- RIGHT: Simulation -- */}
        <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
          <div className="p-5 h-full flex flex-col gap-4 overflow-y-auto exam-scrollbar">

            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {isId ? "Simulasi Produksi Batik" : "Batik Production Simulation"}
              </h3>
            </div>

            {/* -- CONTROLS -- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
              {/* Dye Type */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{isId?"Jenis Pewarna":"Dye Type"}</p>
                <div className="flex gap-2">
                  {(["Synthetic","Natural"] as DyeType[]).map(v=>(
                    <button key={v} onClick={()=>{setDyeType(v);setSimRan(false);}}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-200 ${dyeType===v?"bg-primary text-white shadow-md scale-[1.02]":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      {v==="Synthetic"?(isId?"Sintetis":"Synthetic"):(isId?"Alami":"Natural")}
                    </button>
                  ))}
                </div>
              </div>
              {/* Water Use */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{isId?"Penggunaan Air":"Water Use"}</p>
                <div className="flex gap-2">
                  {(["Low","Medium","High"] as WaterLevel[]).map(v=>(
                    <button key={v} onClick={()=>{setWaterUse(v);setSimRan(false);}}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-200 ${waterUse===v?"bg-primary text-white shadow-md scale-[1.02]":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      {v==="Low"?(isId?"Rendah":"Low"):v==="Medium"?(isId?"Sedang":"Medium"):(isId?"Tinggi":"High")}
                    </button>
                  ))}
                </div>
              </div>
              {/* Waste Treatment */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{isId?"Pengolahan Limbah":"Waste Treatment"}</p>
                <div className="flex gap-2">
                  {(["None","Partial","Full"] as TreatmentLevel[]).map(v=>(
                    <button key={v} onClick={()=>{setTreatment(v);setSimRan(false);}}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-200 ${treatment===v?"bg-primary text-white shadow-md scale-[1.02]":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      {v==="None"?(isId?"Tidak Ada":"None"):v==="Partial"?(isId?"Sebagian":"Partial"):(isId?"Penuh":"Full")}
                    </button>
                  ))}
                </div>
              </div>
              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button onClick={runSimulation}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white text-[12px] font-black rounded-xl transition-all shadow-md active:scale-95 tracking-wide">
                  {isId?"JALANKAN SIMULASI":"RUN SIMULATION"}
                </button>
                <button onClick={handleRecord} disabled={!simRan}
                  className="px-5 py-2.5 bg-white text-slate-600 text-[11px] font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-30">
                  {isId?"CATAT":"RECORD"}
                </button>
              </div>
            </div>

            {/* -- VISUAL SIMULATION SCENE -- */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${simRan?"bg-emerald-400 animate-pulse":"bg-slate-300"}`}/>
                {isId?"Kondisi Lingkungan":"Environmental Condition"}
              </p>

              {/* RIVER SCENE SVG */}
              <svg viewBox="0 0 400 160" className="w-full rounded-xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="u9sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={outputs.waterQuality==="Good"?"#0ea5e9":outputs.waterQuality==="Poor"?"#64748b":"#38bdf8"}/>
                    <stop offset="100%" stopColor={outputs.waterQuality==="Good"?"#7dd3fc":outputs.waterQuality==="Poor"?"#e2e8f0":"#bfdbfe"}/>
                  </linearGradient>
                  <linearGradient id="u9river" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={outputs.waterQuality==="Good"?"#38bdf8":outputs.waterQuality==="Poor"?"#334155":"#64748b"}/>
                    <stop offset="50%" stopColor={outputs.waterQuality==="Good"?"#0284c7":outputs.waterQuality==="Poor"?"#1e293b":"#475569"}/>
                    <stop offset="100%" stopColor={outputs.waterQuality==="Good"?"#0369a1":outputs.waterQuality==="Poor"?"#0f172a":"#334155"}/>
                  </linearGradient>
                  <linearGradient id="u9wall" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0"/>
                    <stop offset="100%" stopColor="#64748b"/>
                  </linearGradient>
                  <linearGradient id="u9roof" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#475569"/>
                    <stop offset="100%" stopColor="#1e293b"/>
                  </linearGradient>
                  <linearGradient id="u9ground" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={outputs.ecosystemRisk==="High"?"#d97706":"#4ade80"}/>
                    <stop offset="100%" stopColor={outputs.ecosystemRisk==="High"?"#92400e":"#16a34a"}/>
                  </linearGradient>
                  <linearGradient id="u9ipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bbf7d0"/>
                    <stop offset="100%" stopColor="#4ade80"/>
                  </linearGradient>
                  <radialGradient id="u9sun" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="1"/>
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                  </radialGradient>
                  <linearGradient id="u9shimmer" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0"/>
                    <stop offset="45%" stopColor="white" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="white" stopOpacity="0"/>
                  </linearGradient>
                  <filter id="u9blur"><feGaussianBlur stdDeviation="3"/></filter>
                  <filter id="u9shadow"><feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.2"/></filter>
                  <filter id="u9haze"><feGaussianBlur stdDeviation="1"/></filter>
                </defs>

                {/* SKY */}
                <rect width="400" height="108" fill="url(#u9sky)"/>
                <rect width="400" height="108" fill="white" opacity="0.03"/>
                {/* Sun */}
                {outputs.waterQuality==="Good" && <g transform="translate(358,24)">
                  <circle r="24" fill="url(#u9sun)" opacity="0.7"/>
                  <circle r="12" fill="#fde68a" opacity="0.95"/>
                  <circle r="9" fill="#fbbf24"/>
                  <g style={{animation:"u9-sun-spin 12s linear infinite", transformOrigin:"358px 24px"}}>
                    {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
                      <line key={i} x1={13*Math.cos(a*Math.PI/180)} y1={13*Math.sin(a*Math.PI/180)} x2={19*Math.cos(a*Math.PI/180)} y2={19*Math.sin(a*Math.PI/180)} stroke="#fde68a" strokeWidth={i%2===0?"2":"1.2"} strokeLinecap="round" opacity="0.85"/>
                    ))}
                  </g>
                </g>}
                {/* Storm clouds */}
                {outputs.waterQuality==="Poor" && <g filter="url(#u9haze)">
                  <ellipse cx="68" cy="20" rx="34" ry="13" fill="#64748b" opacity="0.72"/>
                  <ellipse cx="92" cy="14" rx="24" ry="11" fill="#64748b" opacity="0.62"/>
                  <ellipse cx="46" cy="18" rx="19" ry="10" fill="#64748b" opacity="0.52"/>
                  <ellipse cx="218" cy="22" rx="27" ry="11" fill="#64748b" opacity="0.58"/>
                  <ellipse cx="242" cy="15" rx="19" ry="9" fill="#64748b" opacity="0.48"/>
                  <ellipse cx="338" cy="18" rx="21" ry="9" fill="#64748b" opacity="0.44"/>
                </g>}
                {/* Medium clouds */}
                {outputs.waterQuality==="Medium" && <g filter="url(#u9haze)" opacity="0.45">
                  <ellipse cx="158" cy="18" rx="21" ry="8" fill="#94a3b8"/>
                  <ellipse cx="176" cy="12" rx="15" ry="7" fill="#94a3b8"/>
                </g>}
                {/* Ground */}
                <rect x="0" y="100" width="400" height="14" fill="url(#u9ground)" opacity="0.88"/>
                <rect x="0" y="100" width="400" height="2" fill="#0f172a" opacity="0.07"/>
                {/* Grass tufts */}
                {outputs.ecosystemRisk!=="High" && [252,270,282,297,314,330,347,362,380].map((x,i)=>(
                  <g key={x} transform={`translate(${x},100)`}>
                    <path d={`M0,0 Q-3,-${5+i%3},-1,-${8+i%4}`} stroke="#4ade80" strokeWidth="1.2" fill="none" opacity="0.8"/>
                    <path d={`M0,0 Q2,-${6+i%2},1,-${9+i%3}`} stroke="#22c55e" strokeWidth="1.2" fill="none" opacity="0.7"/>
                    <path d={`M0,0 Q4,-${4+i%3},3,-${7+i%2}`} stroke="#4ade80" strokeWidth="1" fill="none" opacity="0.6"/>
                  </g>
                ))}

                {/* BG trees (hazy) */}
                <g opacity="0.3" filter="url(#u9haze)">
                  {[312,332,352,372,392].map((x,i)=>{
                    const h=[18,22,16,20,15][i];
                    const lf=outputs.ecosystemRisk==="High"?"#78350f":"#166534";
                    return <g key={x}><rect x={x+2} y={100-h} width="4" height={h} fill="#4b5563"/><ellipse cx={x+4} cy={100-h-8} rx={[9,11,8,10,8][i]} ry={[11,13,9,12,10][i]} fill={lf}/></g>;
                  })}
                </g>
                {/* Foreground trees */}
                {([
                  {x:266,h:40,r1:16,r2:11},
                  {x:290,h:32,r1:13,r2:9},
                  {x:314,h:38,r1:15,r2:10},
                  {x:338,h:28,r1:12,r2:8},
                ] as {x:number,h:number,r1:number,r2:number}[]).map((t,i)=>{
                  const ok=outputs.ecosystemRisk!=="High";
                  const c1=ok?["#15803d","#16a34a","#22c55e","#4ade80"][i]:["#b45309","#d97706","#b45309","#d97706"][i];
                  const c2=ok?["#166534","#15803d","#16a34a","#22c55e"][i]:["#92400e","#b45309","#92400e","#b45309"][i];
                  return <g key={i} filter="url(#u9shadow)">
                    <rect x={t.x+2} y={100-t.h} width="5" height={t.h} rx="2.5" fill={ok?"#92400e":"#78350f"}/>
                    <rect x={t.x+5} y={100-t.h} width="2" height={t.h} rx="1" fill="#0f172a" opacity="0.12"/>
                    <ellipse cx={t.x+4} cy={100-t.h-6} rx={t.r1} ry={t.r1*0.9} fill={c1} opacity={ok?0.92:0.55}/>
                    <ellipse cx={t.x+5} cy={100-t.h-15} rx={t.r2} ry={t.r2*1.1} fill={c2} opacity={ok?0.85:0.45}/>
                    <ellipse cx={t.x+7} cy={100-t.h-17} rx={t.r2*0.5} ry={t.r2*0.4} fill="white" opacity={ok?0.12:0.04}/>
                    {!ok && <>
                      <line x1={t.x+4} y1={100-t.h+5} x2={t.x-6} y2={100-t.h-4} stroke="#78350f" strokeWidth="1.5" opacity="0.7"/>
                      <line x1={t.x+4} y1={100-t.h+8} x2={t.x+14} y2={100-t.h} stroke="#78350f" strokeWidth="1.2" opacity="0.6"/>
                    </>}
                  </g>;
                })}

                {/* Factory */}
                <g transform="translate(14,38)" filter="url(#u9shadow)">
                  <ellipse cx="32" cy="62" rx="36" ry="5" fill="#0f172a" opacity="0.15"/>
                  <rect x="10" y="-18" width="9" height="32" rx="3" fill="#475569"/>
                  <rect x="10" y="-18" width="4" height="32" rx="2" fill="#64748b"/>
                  <rect x="28" y="-12" width="8" height="26" rx="3" fill="#475569"/>
                  <rect x="28" y="-12" width="3" height="26" rx="1.5" fill="#64748b"/>
                  <rect x="8" y="-20" width="13" height="5" rx="2" fill="#334155"/>
                  <rect x="26" y="-14" width="12" height="4" rx="2" fill="#334155"/>
                  <rect x="0" y="14" width="62" height="48" rx="3" fill="url(#u9wall)"/>
                  <rect x="48" y="14" width="14" height="48" rx="3" fill="#0f172a" opacity="0.1"/>
                  <polygon points="0,14 31,2 62,14" fill="url(#u9roof)"/>
                  <polygon points="48,14 31,2 62,14" fill="#0f172a" opacity="0.12"/>
                  <rect x="6" y="22" width="12" height="9" rx="1.5" fill="#bae6fd" opacity="0.8"/>
                  <rect x="6" y="22" width="6" height="9" rx="1" fill="white" opacity="0.15"/>
                  <rect x="22" y="22" width="12" height="9" rx="1.5" fill="#bae6fd" opacity="0.8"/>
                  <rect x="22" y="22" width="6" height="9" rx="1" fill="white" opacity="0.15"/>
                  <rect x="38" y="22" width="12" height="9" rx="1.5" fill="#bae6fd" opacity="0.8"/>
                  <rect x="38" y="22" width="6" height="9" rx="1" fill="white" opacity="0.15"/>
                  <rect x="24" y="38" width="14" height="24" rx="2" fill="#1e293b"/>
                  <rect x="24" y="38" width="7" height="24" rx="1" fill="#0f172a" opacity="0.18"/>
                  <circle cx="36" cy="50" r="1.5" fill="#94a3b8"/>
                  <rect x="8" y="34" width="14" height="6" rx="1" fill="#1e293b" opacity="0.7"/>
                  <text x="15" y="39" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#94a3b8">BATIK</text>
                  <rect x="28" y="62" width="8" height="4" rx="1" fill="#475569"/>
                </g>
                {/* Smoke */}
                <g filter="url(#u9blur)">
                  {dyeType==="Synthetic" && <>
                    <ellipse cx="28" cy="28" rx="10" ry="8" fill="#475569" opacity="0.52" style={{animation:"u9-smoke-rise 2.5s ease-out infinite"}}/>
                    <ellipse cx="32" cy="18" rx="13" ry="10" fill="#64748b" opacity="0.4" style={{animation:"u9-smoke-rise 2.5s ease-out infinite 0.4s"}}/>
                    <ellipse cx="27" cy="8" rx="15" ry="11" fill="#64748b" opacity="0.28" style={{animation:"u9-smoke-rise 2.5s ease-out infinite 0.8s"}}/>
                    <ellipse cx="33" cy="0" rx="17" ry="12" fill="#94a3b8" opacity="0.16" style={{animation:"u9-smoke-rise 2.5s ease-out infinite 1.2s"}}/>
                    <ellipse cx="46" cy="32" rx="8" ry="6" fill="#475569" opacity="0.42" style={{animation:"u9-smoke2-rise 3s ease-out infinite 0.2s"}}/>
                    <ellipse cx="50" cy="22" rx="10" ry="8" fill="#64748b" opacity="0.3" style={{animation:"u9-smoke2-rise 3s ease-out infinite 0.7s"}}/>
                    <ellipse cx="48" cy="13" rx="12" ry="9" fill="#94a3b8" opacity="0.2" style={{animation:"u9-smoke2-rise 3s ease-out infinite 1.1s"}}/>
                  </>}
                  {dyeType==="Natural" && <>
                    <ellipse cx="28" cy="28" rx="6" ry="5" fill="#94a3b8" opacity="0.2" style={{animation:"u9-smoke-rise 4s ease-out infinite"}}/>
                    <ellipse cx="30" cy="20" rx="8" ry="6" fill="#94a3b8" opacity="0.13" style={{animation:"u9-smoke-rise 4s ease-out infinite 1s"}}/>
                    <ellipse cx="46" cy="30" rx="5" ry="4" fill="#94a3b8" opacity="0.16" style={{animation:"u9-smoke2-rise 4.5s ease-out infinite 0.5s"}}/>
                  </>}
                </g>
                {/* Pipe */}
                <line x1="50" y1="100" x2="50" y2="114" stroke={treatment==="None"?"#ef4444":"#22c55e"} strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="50" y1="114" x2={treatment!=="None"?96:148} y2="114" stroke={treatment==="None"?"#ef4444":"#22c55e"} strokeWidth="3.5" strokeLinecap="round"/>
                {treatment==="None" && <line x1="148" y1="114" x2="148" y2="120" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round"/>}
                {/* IPAL */}
                {treatment!=="None" && <g transform="translate(96,88)" filter="url(#u9shadow)">
                  <ellipse cx="24" cy="26" rx="26" ry="4" fill="#0f172a" opacity="0.13"/>
                  <rect width="48" height="28" rx="5" fill="url(#u9ipal)" stroke="#22c55e" strokeWidth="1.5"/>
                  <rect x="0" y="0" width="24" height="28" rx="5" fill="white" opacity="0.07"/>
                  <rect x="5" y="5" width="16" height="16" rx="3" fill="#dcfce7" stroke="#4ade80" strokeWidth="1"/>
                  <rect x="27" y="5" width="16" height="16" rx="3" fill="#dcfce7" stroke="#4ade80" strokeWidth="1"/>
                  <circle cx="13" cy="13" r="4" fill="#4ade80" opacity="0.55"/>
                  <circle cx="35" cy="13" r="4" fill="#4ade80" opacity="0.55"/>
                  <circle cx="13" cy="13" r="2" fill="#16a34a" opacity="0.8"/>
                  <circle cx="35" cy="13" r="2" fill="#16a34a" opacity="0.8"/>
                  <text x="24" y="36" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#166534">IPAL</text>
                  <line x1="48" y1="14" x2="60" y2="14" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="60" y1="14" x2="60" y2="32" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
                </g>}

                {/* River */}
                <rect x="0" y="118" width="400" height="42" fill="url(#u9river)"/>
                <rect x="0" y="118" width="400" height="42" fill="url(#u9shimmer)"/>
                <path d="M0,122 Q50,116 100,122 Q150,128 200,122 Q250,116 300,122 Q350,128 400,122" fill="none" stroke="white" strokeWidth="1.8" opacity="0.25" style={{animation:"u9-wave-shift 3s linear infinite"}}/>
                <path d="M0,132 Q50,126 100,132 Q150,138 200,132 Q250,126 300,132 Q350,138 400,132" fill="none" stroke="white" strokeWidth="1.1" opacity="0.15" style={{animation:"u9-wave-shift 4s linear infinite 0.5s"}}/>
                <path d="M0,142 Q60,137 120,142 Q180,147 240,142 Q300,137 360,142 Q380,144 400,142" fill="none" stroke="white" strokeWidth="0.7" opacity="0.09" style={{animation:"u9-wave-shift 5s linear infinite 1s"}}/>
                <ellipse cx="320" cy="130" rx="45" ry="6" fill="white" opacity="0.06" style={{animation:"u9-shimmer-move 4s ease-in-out infinite"}}/>
                {/* Discharge plume */}
                {treatment==="None" && <g filter="url(#u9blur)" opacity="0.75">
                  <ellipse cx="148" cy="122" rx="22" ry="7" fill={dyeType==="Synthetic"?"#3b82f6":"#92400e"} opacity="0.55"/>
                  <ellipse cx="168" cy="127" rx="16" ry="5" fill={dyeType==="Synthetic"?"#1d4ed8":"#78350f"} opacity="0.4"/>
                  <ellipse cx="188" cy="132" rx="12" ry="4" fill={dyeType==="Synthetic"?"#1e40af":"#451a03"} opacity="0.25"/>
                </g>}
                {/* Fish 1 */}
                {outputs.waterQuality!=="Poor" && <g style={{animation:"u9-fish-swim 4s ease-in-out infinite", transformOrigin:"158px 131px"}}>
                  <g transform="translate(158,131)">
                    <ellipse cx="0" cy="0" rx="11" ry="5.5" fill="#fbbf24"/>
                    <ellipse cx="-2" cy="-1" rx="5" ry="3" fill="#fde68a" opacity="0.45"/>
                    <path d="M11,0 L18,-5 L18,5 Z" fill="#f59e0b"/>
                    <circle cx="-6" cy="-1" r="1.8" fill="#1e293b"/>
                    <circle cx="-6.5" cy="-1.3" r="0.7" fill="white"/>
                    <path d="M-3,-4 Q2,-7 7,-4" stroke="#f59e0b" strokeWidth="1.2" fill="none" opacity="0.55"/>
                    <path d="M2,3 Q5,6 8,3" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.45"/>
                  </g>
                </g>}
                {/* Fish 2 */}
                {outputs.waterQuality==="Good" && <g style={{animation:"u9-fish2-swim 6s ease-in-out infinite", transformOrigin:"222px 143px"}}>
                  <g transform="translate(222,143)">
                    <ellipse cx="0" cy="0" rx="8" ry="4" fill="#34d399"/>
                    <ellipse cx="-1" cy="-0.5" rx="3.5" ry="2" fill="#6ee7b7" opacity="0.45"/>
                    <path d="M8,0 L13,-4 L13,4 Z" fill="#10b981"/>
                    <circle cx="-4" cy="-0.5" r="1.4" fill="#1e293b"/>
                    <circle cx="-4.4" cy="-0.8" r="0.5" fill="white"/>
                  </g>
                </g>}
                {/* Pollution */}
                {outputs.waterQuality==="Poor" && <g filter="url(#u9blur)" opacity="0.8">
                  <ellipse cx="132" cy="126" rx="18" ry="7" fill="#1e293b" opacity="0.58" style={{animation:"u9-pollution-pulse 2s ease-in-out infinite"}}/>
                  <ellipse cx="212" cy="134" rx="14" ry="6" fill="#0f172a" opacity="0.52" style={{animation:"u9-pollution-pulse 2.5s ease-in-out infinite 0.4s"}}/>
                  <ellipse cx="292" cy="128" rx="16" ry="6" fill="#1e293b" opacity="0.48" style={{animation:"u9-pollution-pulse 3s ease-in-out infinite 0.8s"}}/>
                  <circle cx="172" cy="132" r="5" fill="#0f172a" opacity="0.42" style={{animation:"u9-bubble 2s ease-out infinite 0.3s"}}/>
                  <circle cx="252" cy="138" r="4" fill="#0f172a" opacity="0.38" style={{animation:"u9-bubble 2.5s ease-out infinite 1s"}}/>
                </g>}
                <text x="378" y="154" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white" opacity="0.45" letterSpacing="1.5">{isId?"SUNGAI":"RIVER"}</text>
              </svg>
              {/* 3 RESULT ROWS */}
              <div className="space-y-2 pt-1">
                {(()=>{
                  const wq=outputs.waterQuality;
                  const isGood=wq==="Good",isBad=wq==="Poor";
                  const pct=isGood?90:isBad?15:50;
                  const barCol=isGood?"bg-sky-400":isBad?"bg-rose-400":"bg-amber-400";
                  const label=isId?"Kualitas Air":"Water Quality";
                  const display=isId?({Good:"Baik",Medium:"Sedang",Poor:"Buruk"} as Record<string,string>)[wq]:wq;
                  const textCol=isGood?"text-sky-600":isBad?"text-rose-600":"text-amber-600";
                  return(
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                          <path d="M12 2C8 8 4 12 4 16a8 8 0 0016 0c0-4-4-8-8-14z" fill={isGood?"#38bdf8":isBad?"#64748b":"#94a3b8"}/>
                          {isGood&&<path d="M9 16l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                          <span className={`text-[11px] font-black ${textCol}`}>{display}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${barCol}`} style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {(()=>{
                  const er=outputs.ecosystemRisk;
                  const isLow=er==="Low",isHigh=er==="High";
                  const pct=isHigh?85:isLow?10:45;
                  const barCol=isHigh?"bg-rose-400":isLow?"bg-emerald-400":"bg-amber-400";
                  const label=isId?"Risiko Ekosistem":"Ecosystem Risk";
                  const display=isId?({Low:"Rendah",Medium:"Sedang",High:"Tinggi"} as Record<string,string>)[er]:er;
                  const textCol=isLow?"text-emerald-600":isHigh?"text-rose-600":"text-amber-600";
                  return(
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                          <path d="M12 3C9 7 5 10 5 14a7 7 0 0014 0c0-4-4-7-7-11z" fill={isLow?"#4ade80":isHigh?"#fca5a5":"#fcd34d"}/>
                          <rect x="11" y="17" width="2" height="3" rx="1" fill={isLow?"#166534":isHigh?"#9f1239":"#92400e"}/>
                          {isHigh&&<path d="M9 9l6 6M15 9l-6 6" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                          <span className={`text-[11px] font-black ${textCol}`}>{display}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${barCol}`} style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {(()=>{
                  const pf=outputs.productionFeasibility;
                  const isLow=pf==="Low",isHigh=pf==="High";
                  const pct=isHigh?85:isLow?15:50;
                  const barCol=isHigh?"bg-emerald-400":isLow?"bg-rose-400":"bg-amber-400";
                  const label=isId?"Kelayakan Produksi":"Production Feasibility";
                  const display=isId?({Low:"Rendah",Medium:"Sedang",High:"Tinggi"} as Record<string,string>)[pf]:pf;
                  const textCol=isHigh?"text-emerald-600":isLow?"text-rose-600":"text-amber-600";
                  return(
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                          <rect x="3" y="12" width="4" height="9" rx="1" fill={isHigh?"#10b981":isLow?"#ef4444":"#f59e0b"}/>
                          <rect x="10" y="8" width="4" height="13" rx="1" fill={isHigh?"#10b981":isLow?"#ef4444":"#f59e0b"} opacity="0.8"/>
                          <rect x="17" y="4" width="4" height="17" rx="1" fill={isHigh?"#10b981":isLow?"#ef4444":"#f59e0b"} opacity="0.6"/>
                          {isHigh&&<path d="M4 10l7-5 7-3" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                          <span className={`text-[11px] font-black ${textCol}`}>{display}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${barCol}`} style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isId
                  ? "Kelayakan produksi mengacu pada kemudahan proses produksi (biaya, kecepatan, dan operasional), bukan kualitas air."
                  : "Production feasibility refers to practicality of production (cost, speed, and operations), not water quality."}
              </p>

              {!simRan&&<p className="text-[10px] text-slate-400 text-center italic pt-1">{isId?"Klik 'Jalankan Simulasi' untuk melihat hasil.":"Click 'Run Simulation' to see results."}</p>}
            </div>

            {/* ── RECORDED DATA TABLE ── */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{isId?"Data Tercatat":"Recorded Data"}</span>
                  <button onClick={()=>setHistory([])} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider">{isId?"Hapus":"Clear"}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["#",isId?"Pewarna":"Dye",isId?"Air":"Water",isId?"Pengolahan":"Treatment",isId?"Kualitas Air":"Water Q.",isId?"Risiko":"Eco Risk",isId?"Kelayakan":"Feasibility"].map(h=>(
                          <th key={h} className="px-3 py-2 text-left text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.map((row,i)=>(
                        <tr key={row.id} className={i%2===1?"bg-slate-50/60":""}>
                          <td className="px-3 py-2 text-slate-400 font-medium">{row.id}</td>
                          <td className="px-3 py-2 text-slate-600">{isId?{Synthetic:"Sintetis",Natural:"Alami"}[row.dye]:row.dye}</td>
                          <td className="px-3 py-2 text-slate-600">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.water]:row.water}</td>
                          <td className="px-3 py-2 text-slate-600">{isId?{None:"Tidak Ada",Partial:"Sebagian",Full:"Penuh"}[row.treatment]:row.treatment}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{isId?{Good:"Baik",Medium:"Sedang",Poor:"Buruk"}[row.waterQuality]:row.waterQuality}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.ecosystemRisk]:row.ecosystemRisk}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.productionFeasibility]:row.productionFeasibility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Unit9Pisa;
