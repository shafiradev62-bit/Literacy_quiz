import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCompletedSession } from "@/hooks/useExamSession";

interface Unit7PisaProps {
  onGoTo?: (index: number) => void;
  onExit?: () => void;
}

const STEP_LABELS_EN = ["Introduction", "Question 1", "Question 2", "Question 3", "Question 4", "Question 5"];
const STEP_LABELS_ID = ["Pendahuluan", "Soal 1", "Soal 2", "Soal 3", "Soal 4", "Soal 5"];

const WRITING_GUIDE_EN = "A strong answer explains that mangroves provide habitat, food, and nursery areas for fish and other organisms. When mangrove cover decreases, fewer young fish survive, so fish production can decline.";
const WRITING_GUIDE_ID = "Jawaban yang kuat menjelaskan bahwa mangrove menyediakan habitat, sumber makanan, dan area pembesaran bagi ikan serta organisme lainnya. Ketika tutupan mangrove berkurang, lebih sedikit ikan muda yang dapat bertahan hidup, sehingga produksi ikan dapat menurun.";

const Unit7Pisa = ({ onExit }: Unit7PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";

  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState("20:00");
  const [sessionSaved, setSessionSaved] = useState(false);

  // Timer countdown
  useEffect(() => {
    let minutes = 20;
    let seconds = 0;
    const interval = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
          return;
        }
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }
      setTimer(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulation controls
  const [mangroveCover, setMangroveCover] = useState(50);
  const [humanActivity, setHumanActivity] = useState<"None" | "Low" | "Medium" | "High">("Medium");
  const [waveStrength, setWaveStrength] = useState<"Small" | "Medium" | "Large">("Medium");
  const [restoration, setRestoration] = useState<"None" | "Moderate" | "Intensive">("Moderate");

  // Simulation outputs
  const [outputs, setOutputs] = useState({
    coastalErosion: "Medium" as "Low" | "Medium" | "High",
    biodiversity: "Medium" as "Low" | "Medium" | "High",
    fishProduction: "Medium" as "Low" | "Medium" | "High",
    floodRisk: "Medium" as "Low" | "Medium" | "High",
    carbonStorage: "Medium" as "Low" | "Medium" | "High",
    sustainability: 50,
  });

  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [showWritingGuide, setShowWritingGuide] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  
  // Animated outputs for smooth transitions
  const [animatedOutputs, setAnimatedOutputs] = useState(outputs);
  
  // Auto-animate when outputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedOutputs(outputs);
    }, 50);
    return () => clearTimeout(timer);
  }, [outputs]);

  // Helper functions for visual indicators
  const getMetricColor = (value: "Low" | "Medium" | "High", type: "positive" | "negative") => {
    if (type === "positive") {
      // For positive metrics (biodiversity, fish, carbon): High = green, Low = red
      if (value === "High") return "text-emerald-600 bg-emerald-50 border-emerald-200";
      if (value === "Medium") return "text-amber-600 bg-amber-50 border-amber-200";
      return "text-rose-600 bg-rose-50 border-rose-200";
    } else {
      // For negative metrics (erosion, flood): Low = green, High = red
      if (value === "Low") return "text-emerald-600 bg-emerald-50 border-emerald-200";
      if (value === "Medium") return "text-amber-600 bg-amber-50 border-amber-200";
      return "text-rose-600 bg-rose-50 border-rose-200";
    }
  };

  const getSustainabilityColor = (value: number) => {
    if (value >= 70) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (value >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getProgressWidth = (value: "Low" | "Medium" | "High") => {
    if (value === "High") return "100%";
    if (value === "Medium") return "60%";
    return "25%";
  };

  const getProgressColor = (value: "Low" | "Medium" | "High", type: "positive" | "negative") => {
    if (type === "positive") {
      if (value === "High") return "bg-emerald-500";
      if (value === "Medium") return "bg-amber-500";
      return "bg-rose-500";
    } else {
      if (value === "Low") return "bg-emerald-500";
      if (value === "Medium") return "bg-amber-500";
      return "bg-rose-500";
    }
  };

  const getMetricIcon = (value: "Low" | "Medium" | "High", type: "positive" | "negative") => {
    const isGood = type === "positive" ? value === "High" : value === "Low";
    const isBad = type === "positive" ? value === "Low" : value === "High";
    
    if (isGood) return "↑";
    if (isBad) return "↓";
    return "→";
  };

  // Open answer states for step 3
  const [q3Answer, setQ3Answer] = useState("");
  const [q4Row1, setQ4Row1] = useState("");
  const [q4Row2, setQ4Row2] = useState("");
  const [q5Answer, setQ5Answer] = useState("");

  // AUTO-SYNC / AUTO-SAVE
  React.useEffect(() => {
    const data = {
      q3Answer,
      q4Row1,
      q4Row2,
      q5Answer,
      history,
      currentStep,
      mangroveCover,
      humanActivity,
      waveStrength,
      restoration,
      outputs
    };
    localStorage.setItem(`unit7_autosave`, JSON.stringify(data));
  }, [q3Answer, q4Row1, q4Row2, q5Answer, history, currentStep, mangroveCover, humanActivity, waveStrength, restoration, outputs]);

  // LOAD AUTO-SAVE
  React.useEffect(() => {
    const saved = localStorage.getItem(`unit7_autosave`);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.q3Answer !== undefined) setQ3Answer(d.q3Answer);
        if (d.q4Row1 !== undefined) setQ4Row1(d.q4Row1);
        if (d.q4Row2 !== undefined) setQ4Row2(d.q4Row2);
        if (d.q5Answer !== undefined) setQ5Answer(d.q5Answer);
        if (d.history !== undefined) setHistory(d.history);
        if (d.currentStep !== undefined) setCurrentStep(d.currentStep);
        if (d.mangroveCover !== undefined) setMangroveCover(d.mangroveCover);
        if (d.humanActivity !== undefined) setHumanActivity(d.humanActivity);
        if (d.waveStrength !== undefined) setWaveStrength(d.waveStrength);
        if (d.restoration !== undefined) setRestoration(d.restoration);
        if (d.outputs !== undefined) setOutputs(d.outputs);
      } catch (e) {
        console.error("Failed to load unit7 autosave", e);
      }
    }
  }, []);

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const isStepValid = () => {
    if (currentStep === 3) return getWordCount(q3Answer) >= 15;
    if (currentStep === 4) return (getWordCount(q4Row1) >= 15) && (getWordCount(q4Row2) >= 15);
    return true;
  };

  const runSimulation = () => {
    let erosion: "Low" | "Medium" | "High" = "Medium";
    let bio: "Low" | "Medium" | "High" = "Medium";
    let fish: "Low" | "Medium" | "High" = "Medium";
    let flood: "Low" | "Medium" | "High" = "Medium";
    let carbon: "Low" | "Medium" | "High" = "Medium";
    let score = 50;

    // Mangrove cover base logic
    if (mangroveCover >= 70) {
      erosion = "Low";
      bio = "High";
      fish = "High";
      carbon = "High";
      flood = "Low";
      score += 25;
    } else if (mangroveCover >= 40) {
      erosion = "Medium";
      bio = "Medium";
      fish = "Medium";
      carbon = "Medium";
      flood = "Medium";
    } else if (mangroveCover >= 20) {
      erosion = "High";
      bio = "Low";
      fish = "Low";
      carbon = "Low";
      flood = "High";
      score -= 20;
    } else {
      erosion = "High";
      bio = "Low";
      fish = "Low";
      carbon = "Low";
      flood = "High";
      score -= 35;
    }

    // Wave strength adjustment
    if (waveStrength === "Large") {
      if (erosion === "Medium") erosion = "High";
      if (flood === "Low") flood = "Medium";
      if (flood === "Medium" && mangroveCover < 30) flood = "High";
      score -= 15;
    } else if (waveStrength === "Small") {
      if (erosion === "High") erosion = "Medium";
      if (flood === "High") flood = "Medium";
      score += 10;
    }

    // Human activity adjustment
    if (humanActivity === "High") {
      if (bio === "High") bio = "Medium";
      if (fish === "High") fish = "Medium";
      if (fish === "Medium") fish = "Low";
      score -= 15;
    } else if (humanActivity === "None") {
      if (bio === "Medium") bio = "High";
      if (fish === "Medium") fish = "High";
      score += 10;
    } else if (humanActivity === "Low") {
      score += 5;
    }

    // Restoration effort adjustment
    if (restoration === "Intensive") {
      if (erosion === "High") erosion = "Medium";
      if (bio === "Low") bio = "Medium";
      if (fish === "Low") fish = "Medium";
      if (carbon === "Low") carbon = "Medium";
      score += 15;
    } else if (restoration === "Moderate") {
      score += 7;
    }

    // Carbon scales directly with mangrove cover
    if (mangroveCover >= 80) carbon = "High";
    else if (mangroveCover >= 50) carbon = "Medium";
    else carbon = "Low";

    setOutputs({
      coastalErosion: erosion,
      biodiversity: bio,
      fishProduction: fish,
      floodRisk: flood,
      carbonStorage: carbon,
      sustainability: Math.max(0, Math.min(100, score)),
    });
  };

  const handleRecordData = () => {
    setHistory(prev => [
      ...prev,
      {
        id: prev.length + 1,
        mangrove: mangroveCover,
        human: humanActivity,
        wave: waveStrength,
        restoration,
        erosion: outputs.coastalErosion,
        biodiversity: outputs.biodiversity,
        fish: outputs.fishProduction,
        flood: outputs.floodRisk,
        carbon: outputs.carbonStorage,
        sustainability: outputs.sustainability,
      },
    ]);
  };

  const handleClearData = () => setHistory([]);

  const statusColor = (val: "Low" | "Medium" | "High") => {
    if (val === "High") return "text-foreground/50 bg-muted/50 border-border";
    if (val === "Low") return "text-primary bg-primary/10 border-primary/30";
    return "text-foreground/70 bg-muted/30 border-border";
  };

  const sustainabilityColor = (val: number) => {
    if (val >= 70) return "text-primary bg-primary/10 border-primary/30";
    if (val <= 30) return "text-foreground/50 bg-muted/50 border-border";
    return "text-foreground/70 bg-muted/30 border-border";
  };

  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;
  const writingGuide = isId ? WRITING_GUIDE_ID : WRITING_GUIDE_EN;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* ── NAVIGATION HEADER ── */}
      <header className="h-14 bg-white border-b border-border/60 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">7</div>
            <span className="font-bold text-sm tracking-tight text-foreground uppercase">
              {isId ? "Unit 7: Selamatkan Pesisir" : "Unit 7: Save the Coast"}
            </span>
          </div>
          <div className="h-6 w-px bg-border/60" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="flex flex-col items-center gap-0.5">
                  <div className={`w-7 h-1.5 rounded-full transition-all ${currentStep >= s ? "bg-primary" : "bg-border"}`} />
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${currentStep >= s ? "text-primary" : "text-muted-foreground/40"}`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30"
            disabled={currentStep === 0}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
            className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30"
            disabled={currentStep === 5 || !isStepValid()}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/60 px-2 py-1 rounded">
            {stepLabels[currentStep]}
          </span>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <button
            onClick={() => {
              // Score: Q1 MCQ, Q2 MCQ, Q3 open, Q4 open, Q5 MCQ
              // Count answered questions as score
              const score = [
                true, // Q1 always counted (MCQ with defaultChecked)
                true, // Q2 MCQ
                q3Answer.trim().length > 0,
                q4Row1.trim().length > 0 || q4Row2.trim().length > 0,
                true, // Q5 MCQ
              ].filter(Boolean).length;
              if (!sessionSaved) {
                saveCompletedSession(7, { q3Answer, q4Row1, q4Row2, q5Answer, history }, score, 5);
                setSessionSaved(true);
              }
              onExit?.();
            }}
            className="px-3 py-1.5 bg-background text-foreground text-[10px] font-bold rounded border border-border hover:bg-muted transition-colors uppercase tracking-wider"
          >
            {isId ? "Kembali" : "Back"}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex overflow-hidden">
        {/* ── LEFT COLUMN: Questions & Text ── */}
        <div className="w-[45%] bg-white border-r border-border/60 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-4 exam-scrollbar">

            {/* ── STEP 0: Introduction ── */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-[10px]">
                    {isId ? "Pendahuluan" : "Introduction"}
                  </h2>
                  <h1 className="text-xl font-bold text-foreground leading-tight">
                    {isId ? "SELAMATKAN PESISIR" : "SAVE THE COAST"}
                  </h1>
                </div>
                <div className="text-[13px] leading-[1.8] text-foreground/80 space-y-3">
                  <p className="font-semibold text-foreground">
                    {isId
                      ? "Hutan mangrove, ekosistem pesisir, dan erosi di Cirebon"
                      : "Mangrove forests, coastal ecosystems, and erosion in Cirebon"}
                  </p>
                  <p>
                    {isId
                      ? "Di wilayah pesisir Cirebon, beberapa komunitas telah melaporkan bahwa erosi pantai telah menjadi semakin parah. Para ilmuwan menyelidiki penyebabnya dan menemukan bahwa salah satu kemungkinan penyebabnya adalah berkurangnya hutan mangrove di sepanjang garis pantai."
                      : "In coastal areas of Cirebon, some communities have reported that shoreline erosion has become more severe. Scientists investigating the cause have found that one possible cause is the reduction of mangrove forests along the coastline."}
                  </p>
                  <p>
                    {isId
                      ? "Dalam unit ini, kamu akan menyelidiki bagaimana tutupan mangrove, kekuatan gelombang, aktivitas manusia, dan upaya restorasi dapat memengaruhi ekosistem pesisir. Kamu akan menggunakan simulasi interaktif untuk mengeksplorasi sistem ini."
                      : "In this unit, you will investigate how mangrove cover, wave strength, human activity, and restoration efforts may influence the coastal ecosystem. You will use an interactive simulation to explore this system."}
                  </p>
                  {/* ── VIDEO PLAYER ── */}
                  <div className="rounded-xl overflow-hidden border border-border/40 bg-black/5">
                    <video
                      src="/videos/unit7-nadran.mp4"
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
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[12px] text-foreground/70 mb-4">
                        {isId
                          ? "Baca pendahuluan dengan saksama. Gunakan simulasi di sebelah kanan untuk membantu menjawab pertanyaan. Klik tombol di bawah atau tanda panah di atas untuk memulai."
                          : "Read the introduction carefully. Use the simulation on the right to help answer the questions. Click the button below or the arrows above to begin."}
                      </p>
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

            {/* ── STEP 1: Question 1/5 ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div>
                  <h2 className="text-base font-bold text-foreground">
                    {isId ? "Soal 1 / 5" : "Question 1 / 5"}
                  </h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">
                  {isId
                    ? "Hutan mangrove dapat melindungi wilayah pesisir dari abrasi. Pernyataan manakah yang paling tepat menjelaskan bagaimana mangrove mengurangi abrasi pantai?"
                    : "Mangrove forests can protect coastal areas from erosion. Which statement best explains how mangroves reduce coastal erosion?"}
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "A", text: isId ? "Mangrove meningkatkan suhu air laut." : "Mangroves increase seawater temperature." },
                    { label: "B", text: isId ? "Akar mangrove menjebak sedimen dan mengurangi energi gelombang sebelum mencapai pantai." : "Mangrove roots trap sediment and reduce wave energy before it reaches the shore." },
                    { label: "C", text: isId ? "Mangrove meningkatkan salinitas sehingga garis pantai menjadi lebih keras." : "Mangroves increase salinity so that the coastline becomes harder." },
                    { label: "D", text: isId ? "Mangrove mempercepat pergerakan air pesisir menjauh dari daratan." : "Mangroves speed up the movement of coastal water away from the land." },
                  ].map((opt, i) => (
                    <label key={opt.label} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q1" className="w-4 h-4 accent-primary" defaultChecked={i === 1} />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.label}</span>
                      <span className="text-[13px] text-foreground/70">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2: Question 2/5 ── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
                  <h2 className="text-base font-bold text-foreground">
                    {isId ? "Soal 2 / 5" : "Question 2 / 5"}
                  </h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">
                  {isId
                    ? "Seorang siswa mengubah simulasi dari tutupan mangrove 70% menjadi 20%, sementara kekuatan gelombang dan variabel lainnya tetap sama. Perubahan apa yang paling mungkin terjadi?"
                    : "A student changes the simulation from 70% mangrove cover to 20% mangrove cover, while wave strength and other variables remain the same. What change is most likely to happen?"}
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "A", text: isId ? "Abrasi pantai berkurang dan keanekaragaman hayati meningkat." : "Coastal erosion decreases and biodiversity increases." },
                    { label: "B", text: isId ? "Risiko banjir meningkat dan produksi ikan dapat menurun." : "Flood risk increases and fish production may decrease." },
                    { label: "C", text: isId ? "Penyimpanan karbon meningkat karena jumlah pohon lebih sedikit." : "Carbon storage increases because fewer trees are present." },
                    { label: "D", text: isId ? "Tidak ada perubahan besar karena gelombang adalah satu-satunya faktor penting." : "There is no major change because waves are the only important factor." },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q2" className="w-4 h-4 accent-primary" />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.label}</span>
                      <span className="text-[13px] text-foreground/70">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Question 3/5 — Open Answer ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</div>
                  <h2 className="text-base font-bold text-foreground">
                    {isId ? "Soal 3 / 5" : "Question 3 / 5"}
                  </h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">
                  {isId
                    ? "Jelaskan hubungan antara tutupan mangrove dan produksi ikan di ekosistem pesisir. Penjelasanmu harus menggunakan konsep ilmiah."
                    : "Explain the relationship between mangrove cover and fish production in coastal ecosystems. Your explanation should use scientific ideas."}
                </p>
                <p className="text-[11px] text-muted-foreground italic">
                  {isId
                    ? "Pikirkan tentang peran mangrove sebagai habitat, tempat pembesaran (nursery ground), dan tempat berlindung bagi organisme laut."
                    : "Think about the role of mangroves as habitat, nursery grounds, and shelter for marine organisms."}
                </p>

                {/* Writing Guide Toggle */}
                <button
                  onClick={() => setShowWritingGuide(!showWritingGuide)}
                  className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors text-[11px] font-bold text-foreground/70"
                >
                  {isId ? "Tampilkan Panduan Menulis" : "Show Writing Guide"}
                  <svg className={`w-3 h-3 ml-auto transition-transform ${showWritingGuide ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showWritingGuide && (
                  <div className="bg-muted/40 border border-border p-4 rounded-lg space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      {isId ? "Panduan Menulis" : "Writing Guide"}
                    </p>
                    <p className="text-[12px] text-foreground/70 leading-relaxed italic">
                      {writingGuide}
                    </p>
                  </div>
                )}

                <textarea
                  value={q3Answer}
                  onChange={e => setQ3Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId
                    ? "Ketik jawabanmu di sini...\n\nJawaban yang baik menjelaskan bahwa mangrove menyediakan habitat, sumber makanan, dan area pembesaran bagi ikan serta organisme lainnya."
                    : "Type your answer here...\n\nA strong answer explains that mangroves provide habitat, food, and nursery areas for fish and other organisms."}
                />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q3Answer) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q3Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
              </div>
            )}

            {/* ── STEP 4: Question 4/5 — Open Answer ── */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">4</div>
                  <h2 className="text-base font-bold text-foreground">
                    {isId ? "Soal 4 / 5" : "Question 4 / 5"}
                  </h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">
                  {isId
                    ? "Sebuah komunitas ingin mengalihfungsikan lebih banyak lahan pesisir menjadi tambak dan perumahan. Bandingkan dua kondisi berikut dengan menggunakan simulasi:\n• Kondisi 1: Tutupan mangrove tinggi\n• Kondisi 2: Tutupan mangrove rendah\n\nJelaskan dampak jangka pendek dan jangka panjang dari kedua kondisi tersebut terhadap wilayah pesisir. Gunakan setidaknya dua bukti dari hasil simulasimu."
                    : "A community wants to convert more coastal land into ponds and housing. Compare two conditions using the simulation:\n• Condition 1: High mangrove cover\n• Condition 2: Low mangrove cover\n\nExplain the short-term and long-term effects of these conditions on the coast. Use at least two pieces of evidence from your simulation results."}
                </p>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {isId ? "Kondisi 1 — Tutupan Mangrove Tinggi" : "Condition 1 — High Mangrove Cover"}
                  </p>
                  <textarea
                    value={q4Row1}
                    onChange={e => setQ4Row1(e.target.value)}
                    className="w-full h-20 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder={isId
                      ? "Jelaskan dampak jangka pendek dan jangka panjang...\nGunakan data dari tabel simulasi sebagai bukti."
                      : "Explain short-term and long-term effects...\nUse data from the simulation table as evidence."}
                  />
                  <p className={`text-[10px] font-bold text-right ${getWordCount(q4Row1) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                    {getWordCount(q4Row1)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                    {isId ? "Kondisi 2 — Tutupan Mangrove Rendah" : "Condition 2 — Low Mangrove Cover"}
                  </p>
                  <textarea
                    value={q4Row2}
                    onChange={e => setQ4Row2(e.target.value)}
                    className="w-full h-20 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder={isId
                      ? "Jelaskan dampak jangka pendek dan jangka panjang...\nGunakan data dari tabel simulasi sebagai bukti."
                      : "Explain short-term and long-term effects...\nUse data from the simulation table as evidence."}
                  />
                  <p className={`text-[10px] font-bold text-right ${getWordCount(q4Row2) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                    {getWordCount(q4Row2)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 5: Question 5/5 ── */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">5</div>
                  <h2 className="text-base font-bold text-foreground">
                    {isId ? "Soal 5 / 5" : "Question 5 / 5"}
                  </h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">
                  {isId
                    ? "Pemerintah daerah di Cirebon ingin mengurangi abrasi pantai. Berdasarkan informasi yang tersedia dan hasil simulasimu, rekomendasikan tindakan kebijakan yang paling tepat.\n\nJawabanmu harus memuat:\n• satu strategi utama\n• satu alasan ilmiah\n• satu dampak jangka panjang terhadap ekosistem pesisir"
                    : "The local government in Cirebon wants to reduce coastal erosion. Based on the information and your simulation results, recommend the best policy action.\n\nYour answer should include:\n• one main strategy\n• a scientific reason\n• a long-term effect on the coastal ecosystem"}
                </p>
                <div className="space-y-2.5">
                  {[
                    {
                      label: "A",
                      textEn: "Increase fishing activity to boost the local economy.",
                      textId: "Meningkatkan aktivitas penangkapan ikan untuk meningkatkan ekonomi lokal.",
                    },
                    {
                      label: "B",
                      textEn: "Promote mangrove restoration and limit high-impact coastal development.",
                      textId: "Mempromosikan restorasi mangrove dan membatasi pembangunan pesisir yang berdampak tinggi.",
                    },
                    {
                      label: "C",
                      textEn: "Build more concrete sea walls along the entire coastline.",
                      textId: "Membangun lebih banyak tembok laut beton di sepanjang garis pantai.",
                    },
                    {
                      label: "D",
                      textEn: "Remove all human activity from coastal areas.",
                      textId: "Menghapus semua aktivitas manusia dari wilayah pesisir.",
                    },
                  ].map(opt => (
                    <label key={opt.label} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q5" className="w-4 h-4 accent-primary" defaultChecked={false} />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.label}</span>
                      <span className="text-[13px] text-foreground/70">{isId ? opt.textId : opt.textEn}</span>
                    </label>
                  ))}
                </div>

                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {isId ? "Penjelasan Kebijakan" : "Policy Explanation"}
                </p>
                <textarea
                  value={q5Answer}
                  onChange={e => setQ5Answer(e.target.value)}
                  className="w-full h-28 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId
                    ? "Berikan penjelasan tentang strategi utama, alasan ilmiah, dan dampak jangka panjang..."
                    : "Provide an explanation of the main strategy, scientific reason, and long-term effect..."}
                />
              </div>
            )}
          </div>
          {/* ── BOTTOM NAVIGATION ── */}
          <div className="px-6 py-4 border-t-2 border-primary/20 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)] shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border font-bold text-[13px] text-foreground bg-white hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
                {isId ? "Kembali" : "Back"}
              </button>
              <div className="flex-1 text-center text-[11px] font-bold text-muted-foreground">
                {stepLabels[currentStep]} · {currentStep}/{5}
              </div>
              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  {isId ? "Soal Berikutnya" : "Next Question"}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const score = [q3Answer, q4Row1, q5Answer].filter(v => v && v.trim().length > 0).length + 2;
                    if (!sessionSaved) {
                      saveCompletedSession(7, { q3Answer, q4Row1, q4Row2, q5Answer, history }, score, 5);
                      setSessionSaved(true);
                    }
                    onExit?.();
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] transition-all shadow-md"
                >
                  {isId ? "Kirim & Selesai" : "Submit & Finish"}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Mangrove Ecosystem Simulation ── */}
        <div className="flex-1 bg-muted/20 flex flex-col overflow-hidden">
          <div className="p-6 h-full flex flex-col gap-5 overflow-y-auto exam-scrollbar">

            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isId ? "Simulasi Ekosistem Mangrove" : "Mangrove Ecosystem Simulation"}
                </h3>
              </div>
            </div>

            {/* ── SIMULATION DIAGRAM ── */}
            <div className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
              <p className="absolute top-3 left-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{isId ? "DIAGRAM EKOSISTEM" : "ECOSYSTEM DIAGRAM"}</p>
              <svg viewBox="0 0 320 180" className="w-full h-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="1" dy="1" />
                    <feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer>
                    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#bae6fd" />
                  </linearGradient>
                  <linearGradient id="seaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>
                  <linearGradient id="sandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="100%" stopColor="#fde68a" />
                  </linearGradient>
                </defs>

                {/* Sky & Sea */}
                <rect width="320" height="180" fill="url(#skyGrad)" />
                <path d="M0,120 Q80,110 160,120 Q240,130 320,120 L320,180 L0,180 Z" fill="url(#seaGrad)" />
                
                {/* Shoreline */}
                <path d="M0,130 Q160,120 320,130" stroke="#fef3c7" strokeWidth="8" fill="none" opacity="0.5" />

                {/* Mangroves */}
                {[...Array(Math.floor(mangroveCover / 10))].map((_, i) => (
                  <g key={i} transform={`translate(${20 + i * 28 + (i % 2 * 10)}, 110)`} filter="url(#softShadow)">
                    {/* Roots */}
                    <path d="M0,10 Q-10,25 -15,35 M0,10 Q10,25 15,35 M0,10 Q-5,25 -5,40 M0,10 Q5,25 5,40" stroke="#451a03" strokeWidth="1.5" fill="none" />
                    {/* Trunk */}
                    <rect x="-2" y="-10" width="4" height="25" rx="1" fill="#451a03" />
                    {/* Canopy */}
                    <circle cy="-15" r="12" fill="#166534" />
                    <circle cx="-6" cy="-20" r="8" fill="#15803d" />
                    <circle cx="6" cy="-18" r="9" fill="#14532d" />
                  </g>
                ))}

                {/* Waves */}
                {waveStrength === "Large" && (
                  <g transform="translate(0, 5)">
                    <path d="M250,140 Q270,120 290,140 Q310,160 330,140" stroke="white" strokeWidth="3" fill="none" opacity="0.6">
                      <animate transform="translate(-50, 0)" attributeName="d" dur="2s" repeatCount="indefinite" />
                    </path>
                  </g>
                )}

                {/* Human Activity (Little Houses) */}
                {humanActivity !== "None" && (
                  <g transform="translate(240, 90)" filter="url(#softShadow)">
                    <rect width="20" height="20" fill="#94a3b8" />
                    <path d="M-5,0 L10,-10 L25,0 Z" fill="#475569" />
                    {humanActivity === "High" && (
                      <g transform="translate(25, 5)">
                        <rect width="15" height="15" fill="#94a3b8" />
                        <path d="M-3,0 L7.5,-8 L18,0 Z" fill="#475569" />
                      </g>
                    )}
                  </g>
                )}
              </svg>
            </div>

            {/* ── CONTROLS SECTION ── */}
            <style>{`.pisa-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:9999px;outline:none;cursor:pointer}.pisa-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:#1a1a1a;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer}.pisa-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#1a1a1a;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer}`}</style>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-5 shadow-sm">

              {/* Mangrove Cover Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-medium text-gray-700">
                    {isId ? "Tutupan Mangrove (%)" : "Mangrove Cover (%)"}
                  </label>
                  <span className="text-[13px] font-bold text-gray-900 tabular-nums">{mangroveCover}</span>
                </div>
                <input
                  type="range" min={0} max={100} step={1} value={mangroveCover}
                  onChange={e => setMangroveCover(Number(e.target.value))}
                  className="pisa-slider"
                  style={{ background: `linear-gradient(to right, #166534 ${mangroveCover}%, #e5e7eb ${mangroveCover}%)` }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              {/* Dropdown Controls Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "human",
                    label: isId ? "Aktivitas Manusia" : "Human Activity",
                    val: humanActivity,
                    set: setHumanActivity as any,
                    opts: ["None", "Low", "Medium", "High"] as const,
                  },
                  {
                    id: "wave",
                    label: isId ? "Kekuatan Gelombang" : "Wave Strength",
                    val: waveStrength,
                    set: setWaveStrength as any,
                    opts: ["Small", "Medium", "Large"] as const,
                  },
                  {
                    id: "restore",
                    label: isId ? "Upaya Restorasi" : "Restoration Effort",
                    val: restoration,
                    set: setRestoration as any,
                    opts: ["None", "Moderate", "Intensive"] as const,
                  },
                ].map(ctrl => (
                  <div key={ctrl.id} className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide leading-tight">
                      {ctrl.label}
                    </label>
                    <select
                      value={ctrl.val}
                      onChange={e => ctrl.set(e.target.value)}
                      className="w-full p-2 bg-muted/30 border border-border rounded text-[11px] font-semibold focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                    >
                      {ctrl.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1">
                <button onClick={runSimulation} className="flex-1 py-2.5 bg-green-800 hover:bg-green-700 text-white text-[13px] font-bold rounded-full transition-colors shadow-sm">
                  {isId ? "Jalankan Simulasi" : "Run Simulation"}
                </button>
                <button onClick={handleRecordData} className="px-5 py-2.5 bg-white text-gray-700 text-[13px] font-bold rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  {isId ? "Catat Data" : "Record Data"}
                </button>
                <button onClick={handleClearData} className="px-3 py-2.5 text-gray-400 hover:text-gray-600 transition-colors" title={isId ? "Hapus semua data" : "Clear all data"}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            {/* ── 6-OUTPUT GRID ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Coastal Erosion */}
              <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${getMetricColor(animatedOutputs.coastalErosion, "negative")}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {isId ? "Abrasi Pantai" : "Coastal Erosion"}
                  </span>
                  <span className="text-lg font-bold">{getMetricIcon(animatedOutputs.coastalErosion, "negative")}</span>
                </div>
                <div className="text-2xl font-extrabold mb-2">{animatedOutputs.coastalErosion}</div>
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(animatedOutputs.coastalErosion, "negative")}`}
                    style={{ width: getProgressWidth(animatedOutputs.coastalErosion) }}
                  />
                </div>
              </div>

              {/* Biodiversity */}
              <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${getMetricColor(animatedOutputs.biodiversity, "positive")}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {isId ? "Keanekaragaman Hayati" : "Biodiversity"}
                  </span>
                  <span className="text-lg font-bold">{getMetricIcon(animatedOutputs.biodiversity, "positive")}</span>
                </div>
                <div className="text-2xl font-extrabold mb-2">{animatedOutputs.biodiversity}</div>
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(animatedOutputs.biodiversity, "positive")}`}
                    style={{ width: getProgressWidth(animatedOutputs.biodiversity) }}
                  />
                </div>
              </div>

              {/* Fish Production */}
              <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${getMetricColor(animatedOutputs.fishProduction, "positive")}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {isId ? "Produksi Ikan" : "Fish Production"}
                  </span>
                  <span className="text-lg font-bold">{getMetricIcon(animatedOutputs.fishProduction, "positive")}</span>
                </div>
                <div className="text-2xl font-extrabold mb-2">{animatedOutputs.fishProduction}</div>
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(animatedOutputs.fishProduction, "positive")}`}
                    style={{ width: getProgressWidth(animatedOutputs.fishProduction) }}
                  />
                </div>
              </div>

              {/* Flood Risk */}
              <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${getMetricColor(animatedOutputs.floodRisk, "negative")}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {isId ? "Risiko Banjir" : "Flood Risk"}
                  </span>
                  <span className="text-lg font-bold">{getMetricIcon(animatedOutputs.floodRisk, "negative")}</span>
                </div>
                <div className="text-2xl font-extrabold mb-2">{animatedOutputs.floodRisk}</div>
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(animatedOutputs.floodRisk, "negative")}`}
                    style={{ width: getProgressWidth(animatedOutputs.floodRisk) }}
                  />
                </div>
              </div>

              {/* Carbon Storage */}
              <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${getMetricColor(animatedOutputs.carbonStorage, "positive")}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {isId ? "Penyimpanan Karbon" : "Carbon Storage"}
                  </span>
                  <span className="text-lg font-bold">{getMetricIcon(animatedOutputs.carbonStorage, "positive")}</span>
                </div>
                <div className="text-2xl font-extrabold mb-2">{animatedOutputs.carbonStorage}</div>
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(animatedOutputs.carbonStorage, "positive")}`}
                    style={{ width: getProgressWidth(animatedOutputs.carbonStorage) }}
                  />
                </div>
              </div>

              {/* Sustainability Score */}
              <div className={`rounded-xl border-2 p-4 transition-all duration-500 ${getSustainabilityColor(animatedOutputs.sustainability)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {isId ? "Keberlanjutan" : "Sustainability"}
                  </span>
                  <span className="text-lg font-bold">{animatedOutputs.sustainability >= 70 ? "↑" : animatedOutputs.sustainability >= 40 ? "→" : "↓"}</span>
                </div>
                <div className="text-2xl font-extrabold mb-2">{animatedOutputs.sustainability}%</div>
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-current transition-all duration-700 ease-out opacity-60"
                    style={{ width: `${animatedOutputs.sustainability}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── RECORDED DATA TABLE ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">{isId ? "Tabel Data Tercatat" : "Recorded Data Table"}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {["#", isId?"Mangrove %":"Mangrove %", isId?"Manusia":"Human", isId?"Gelombang":"Wave", isId?"Restorasi":"Restore", isId?"Abrasi":"Erosion", isId?"Biodiv.":"Biodiv.", isId?"Ikan":"Fish", isId?"Banjir":"Flood", isId?"Karbon":"Carbon", "Sustain."].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.length === 0 ? (
                      <tr><td colSpan={11} className="px-4 py-6 text-center text-[12px] text-gray-400 italic">{isId ? "Belum ada data. Jalankan simulasi dan klik Catat Data." : "No data yet. Run the simulation and click Record Data."}</td></tr>
                    ) : history.map((row, i) => (
                      <tr key={row.id} className={i % 2 === 1 ? "bg-gray-50/60" : ""}>
                        <td className="px-3 py-2.5 text-gray-400 font-medium">{row.id}</td>
                        <td className="px-3 py-2.5 font-semibold text-gray-900">{row.mangrove}%</td>
                        <td className="px-3 py-2.5 text-gray-700">{row.human}</td>
                        <td className="px-3 py-2.5 text-gray-700">{row.wave}</td>
                        <td className="px-3 py-2.5 text-gray-700">{row.restoration}</td>
                        <td className="px-3 py-2.5 font-semibold text-gray-900">{row.erosion}</td>
                        <td className="px-3 py-2.5 text-gray-700">{row.biodiversity}</td>
                        <td className="px-3 py-2.5 text-gray-700">{row.fish}</td>
                        <td className="px-3 py-2.5 font-semibold text-gray-900">{row.flood}</td>
                        <td className="px-3 py-2.5 text-gray-700">{row.carbon}</td>
                        <td className="px-3 py-2.5 font-semibold text-gray-900">{row.sustainability}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Unit7Pisa;
