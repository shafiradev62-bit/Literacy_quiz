import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCompletedSession } from "@/hooks/useExamSession";

interface Unit7PisaProps {
  onGoTo?: (index: number) => void;
  onExit?: () => void;
}

const STEP_LABELS_EN = ["Introduction", "Question 1", "Question 2", "Question 3", "Question 4", "Question 5"];
const STEP_LABELS_ID = ["Pendahuluan", "Soal 1", "Soal 2", "Soal 3", "Soal 4", "Soal 5"];

const WRITING_GUIDE_Q5_EN = "A strong answer recommends improving awareness, reducing harmful fishing, strengthening conservation, and improving waste management. It should explain how these actions improve fish population, water quality, biodiversity, and sustainability.";
const WRITING_GUIDE_Q5_ID = "Jawaban yang kuat merekomendasikan peningkatan kesadaran masyarakat, pengurangan praktik penangkapan ikan yang merusak, penguatan upaya konservasi, serta perbaikan pengelolaan limbah. Jawaban juga harus menjelaskan bagaimana tindakan-tindakan tersebut dapat meningkatkan populasi ikan, kualitas air, keanekaragaman hayati, dan keberlanjutan.";

const Unit7Pisa = ({ onExit }: Unit7PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";

  const [currentStep, setCurrentStep] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);

  // Simulation controls — Nadran theme
  const [fishingIntensity, setFishingIntensity] = useState(50);
  const [communityAwareness, setCommunityAwareness] = useState(50);
  const [wasteManagement, setWasteManagement] = useState(50);
  const [conservationEfforts, setConservationEfforts] = useState(50);

  // Simulation outputs
  const calc = React.useMemo(() => {
    const fishPop = Math.max(0, Math.min(100, 80 - fishingIntensity * 0.6 + communityAwareness * 0.2 + conservationEfforts * 0.2 - (100 - wasteManagement) * 0.1));
    const waterQuality = Math.max(0, Math.min(100, wasteManagement * 0.6 + communityAwareness * 0.2 + conservationEfforts * 0.1));
    const biodiversity = Math.max(0, Math.min(100, conservationEfforts * 0.5 + communityAwareness * 0.2 + (100 - fishingIntensity) * 0.2));
    const sustainability = Math.round((fishPop + waterQuality + biodiversity) / 3);
    return { fishPop, waterQuality, biodiversity, sustainability };
  }, [fishingIntensity, communityAwareness, wasteManagement, conservationEfforts]);

  const [history, setHistory] = useState<Record<string, any>[]>([]);
  const [showWritingGuide, setShowWritingGuide] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  const [q1Answer, setQ1Answer] = useState("");
  const [q2Choice, setQ2Choice] = useState("");
  const [q3Choice, setQ3Choice] = useState("");
  const [q4Answer, setQ4Answer] = useState("");
  const [q5Answer, setQ5Answer] = useState("");

  // AUTO-SAVE
  React.useEffect(() => {
    const data = {
      q1Answer, q2Choice, q3Choice, q4Answer, q5Answer,
      history, currentStep,
      fishingIntensity, communityAwareness, wasteManagement, conservationEfforts,
    };
    localStorage.setItem(`unit7_autosave`, JSON.stringify(data));
  }, [q1Answer, q2Choice, q3Choice, q4Answer, q5Answer, history, currentStep, fishingIntensity, communityAwareness, wasteManagement, conservationEfforts]);

  // LOAD AUTO-SAVE
  React.useEffect(() => {
    const saved = localStorage.getItem(`unit7_autosave`);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.q1Answer !== undefined) setQ1Answer(d.q1Answer);
        if (d.q2Choice !== undefined) setQ2Choice(d.q2Choice);
        if (d.q3Choice !== undefined) setQ3Choice(d.q3Choice);
        if (d.q4Answer !== undefined) setQ4Answer(d.q4Answer);
        if (d.q5Answer !== undefined) setQ5Answer(d.q5Answer);
        if (d.history !== undefined) setHistory(d.history);
        if (d.currentStep !== undefined) setCurrentStep(d.currentStep);
        if (d.fishingIntensity !== undefined) setFishingIntensity(d.fishingIntensity);
        if (d.communityAwareness !== undefined) setCommunityAwareness(d.communityAwareness);
        if (d.wasteManagement !== undefined) setWasteManagement(d.wasteManagement);
        if (d.conservationEfforts !== undefined) setConservationEfforts(d.conservationEfforts);
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
    if (currentStep === 1) return getWordCount(q1Answer) >= 15;
    if (currentStep === 2) return !!q2Choice;
    if (currentStep === 3) return !!q3Choice;
    if (currentStep === 4) return !!q4Choice;
    if (currentStep === 5) return getWordCount(q5Answer) >= 15;
    return true;
  };

  const handleRecordData = () => {
    setHistory(prev => [
      ...prev,
      {
        id: prev.length + 1,
        fishing: fishingIntensity,
        awareness: communityAwareness,
        waste: wasteManagement,
        conservation: conservationEfforts,
        fish: Math.round(calc.fishPop),
        water: Math.round(calc.waterQuality),
        biodiversity: Math.round(calc.biodiversity),
        sustain: calc.sustainability,
      },
    ]);
  };

  const handleClearData = () => setHistory([]);

  const metricColor = (val: number, type: "pos" | "neg") => {
    if (type === "pos") {
      if (val >= 70) return "text-emerald-600 bg-emerald-50 border-emerald-200";
      if (val >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
      return "text-rose-600 bg-rose-50 border-rose-200";
    } else {
      if (val >= 70) return "text-rose-600 bg-rose-50 border-rose-200";
      if (val >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    }
  };

  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;
  const writingGuide = isId ? WRITING_GUIDE_Q5_ID : WRITING_GUIDE_Q5_EN;

  // Q1 matching state
  const [match1, setMatch1] = useState(""); // High fishing intensity → ?
  const [match2, setMatch2] = useState(""); // High community awareness → ?
  const [match3, setMatch3] = useState(""); // Good waste management → ?
  const [match4, setMatch4] = useState(""); // Strong conservation → ?
  const [q4Choice, setQ4Choice] = useState("");

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* ── NAVIGATION HEADER ── */}
      <header className="h-14 bg-white border-b border-border/60 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">7</div>
            <span className="font-bold text-sm tracking-tight text-foreground uppercase">
              {isId ? "Unit 7: Nadran" : "Unit 7: Nadran"}
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
              const score = [!!q2Choice, !!q3Choice, !!q4Choice, getWordCount(q5Answer) >= 15].filter(Boolean).length;
              if (!sessionSaved) {
                saveCompletedSession(7, { q1Answer: { match1, match2, match3, match4 }, q2Choice, q3Choice, q4Choice, q5Answer, history }, score, 5);
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
        <div className="w-[45%] bg-blue-50/60 border-r border-blue-200 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-4 exam-scrollbar">

            {/* ── STEP 0: Introduction ── */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-[10px]">
                    {isId ? "Pendahuluan" : "Introduction"}
                  </h2>
                  <h1 className="text-xl font-bold text-foreground leading-tight">
                    {isId ? "NADRAN DI CIREBON" : "NADRAN IN CIREBON"}
                  </h1>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {isId ? "Ritual Nadran, kerja sama masyarakat, dan ekosistem pesisir" : "Nadran ritual, community cooperation, and the coastal ecosystem"}
                  </p>
                </div>
                <div className="text-[13px] leading-[1.8] text-foreground/80 space-y-3">
                  <p>
                    {isId
                      ? "Nadran adalah ritual tradisional yang dipraktikkan oleh masyarakat pesisir di Cirebon sebagai ungkapan rasa syukur atas sumber daya laut dan doa untuk keselamatan di laut. Ritual ini melibatkan partisipasi bersama dan mencerminkan hubungan budaya yang erat antara nelayan dan laut."
                      : "Nadran is a traditional ritual practiced by coastal communities in Cirebon as an expression of gratitude for marine resources and a prayer for safety at sea. It involves collective participation and reflects the close cultural relationship between fishermen and the sea."}
                  </p>
                  <p>
                    {isId
                      ? "Studi tentang Nadran di Cirebon dan wilayah pesisir sekitarnya menunjukkan bahwa tradisi ini mengandung nilai-nilai rasa syukur, kerja sama, identitas budaya, dan kesadaran ekologis. Beberapa peneliti berpendapat bahwa tradisi seperti ini dapat mendorong perilaku penangkapan ikan yang bertanggung jawab serta konservasi ekosistem laut."
                      : "Studies about Nadran in Cirebon and nearby coastal regions show that the tradition contains values of gratitude, cooperation, cultural identity, and ecological awareness. Some researchers suggest that such traditions may help encourage responsible fishing behavior and marine ecosystem conservation."}
                  </p>
                  <p>
                    {isId
                      ? "Dalam unit ini, kamu akan menyelidiki bagaimana intensitas penangkapan ikan, kesadaran masyarakat, pengelolaan limbah, dan upaya konservasi dapat memengaruhi keberlanjutan laut. Kamu akan menggunakan simulasi interaktif untuk mengeksplorasi sistem tersebut."
                      : "In this unit, you will investigate how fishing intensity, community awareness, waste management, and conservation efforts may influence marine sustainability. You will use an interactive simulation to explore the system."}
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
                    <div className="p-2 bg-primary/5 rounded text-primary shrink-0 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
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

            {/* ── STEP 1: Question 1/5 — Matching ── */}
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
                    ? "Para peneliti ingin memahami bagaimana faktor sosial dan lingkungan memengaruhi keberlanjutan laut di wilayah pesisir Cirebon.\nPasangkan setiap faktor berikut dengan dampak utamanya yang paling tepat."
                    : "Researchers want to understand how social and environmental factors influence marine sustainability in coastal Cirebon.\nMatch each factor with its most direct effect."}
                </p>

                <div className="bg-white rounded-xl border border-border/50 p-4 space-y-4">
                  {/* Factor rows */}
                  {[
                    { num: "1", label: isId ? "Intensitas penangkapan ikan tinggi" : "High fishing intensity", matchKey: "match1", choices: ["A","B","C","D"] },
                    { num: "2", label: isId ? "Kesadaran masyarakat tinggi" : "High community awareness", matchKey: "match2", choices: ["A","B","C","D"] },
                    { num: "3", label: isId ? "Pengelolaan limbah yang baik" : "Good waste management", matchKey: "match3", choices: ["A","B","C","D"] },
                    { num: "4", label: isId ? "Upaya konservasi yang kuat" : "Strong conservation efforts", matchKey: "match4", choices: ["A","B","C","D"] },
                  ].map(f => (
                    <div key={f.num} className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                        {f.num}
                      </span>
                      <span className="text-[12px] text-foreground/80 flex-1 leading-tight">{f.label}</span>
                      <span className="text-[12px] text-muted-foreground shrink-0">→</span>
                      <div className="flex gap-1 shrink-0">
                        {f.choices.map(c => (
                          <button key={c} onClick={() => {
                            if (f.matchKey === "match1") setMatch1(c);
                            if (f.matchKey === "match2") setMatch2(c);
                            if (f.matchKey === "match3") setMatch3(c);
                            if (f.matchKey === "match4") setMatch4(c);
                          }}
                            className={`w-7 h-7 text-[11px] font-bold rounded-lg border transition-all ${
                              (f.matchKey === "match1" ? match1 : f.matchKey === "match2" ? match2 : f.matchKey === "match3" ? match3 : match4) === c
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-border/50 text-foreground/70 hover:border-primary/40"
                            }`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Effect legend */}
                <div className="bg-muted/30 border border-border/40 rounded-lg p-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Dampak:" : "Effects:"}</p>
                  {[
                    { letter: "A", en: "Reduces fish population", id: "Mengurangi populasi ikan" },
                    { letter: "B", en: "Reduces overfishing behavior", id: "Mengurangi perilaku penangkapan berlebih" },
                    { letter: "C", en: "Improves water quality", id: "Meningkatkan kualitas air" },
                    { letter: "D", en: "Increases marine biodiversity", id: "Meningkatkan keanekaragaman hayati laut" },
                  ].map(e => (
                    <div key={e.letter} className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-primary w-4">{e.letter}.</span>
                      <span className="text-[11px] text-foreground/70">{isId ? e.id : e.en}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-muted-foreground italic">
                  {isId
                    ? "Petunjuk: Tuliskan pasangan yang sesuai (misalnya: 1–A, 2–B, dst.)"
                    : "Instructions: Write the correct matches (e.g., 1–A, 2–B, etc.)"}
                </p>
                <textarea
                  value={q1Answer}
                  onChange={e => setQ1Answer(e.target.value)}
                  className="w-full h-24 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? "1-A, 2-B, 3-C, 4-D" : "1-A, 2-B, 3-C, 4-D"}
                />
              </div>
            )}

            {/* ── STEP 2: Question 2/5 — MCQ ── */}
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
                    ? "Seorang siswa menjalankan simulasi dengan pengaturan berikut:\n• Intensitas penangkapan ikan: Tinggi\n• Kesadaran masyarakat: Rendah\n• Pengelolaan limbah: Buruk\n\nHasil menunjukkan bahwa populasi ikan menurun secara signifikan. Faktor manakah yang paling langsung menyebabkan penurunan populasi ikan?"
                    : "A student sets the simulation as follows:\n• Fishing intensity: High\n• Community awareness: Low\n• Waste management: Poor\n\nThe result shows that fish population decreases strongly. Which factor most directly caused the decrease in fish population?"}
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "A", textEn: "Poor waste management", textId: "Pengelolaan limbah yang buruk" },
                    { label: "B", textEn: "High fishing intensity", textId: "Intensitas penangkapan ikan yang tinggi" },
                    { label: "C", textEn: "Cultural traditions", textId: "Tradisi budaya" },
                    { label: "D", textEn: "Water entering from the sea", textId: "Air yang masuk dari laut" },
                  ].map((opt, i) => (
                    <label key={opt.label} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q2" className="w-4 h-4 accent-primary" checked={q2Choice === opt.label} onChange={() => setQ2Choice(opt.label)} />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.label}</span>
                      <span className="text-[13px] text-foreground/70">{isId ? opt.textId : opt.textEn}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Question 3/5 — MCQ ── */}
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
                    ? "Dalam simulasi lain, peningkatan kesadaran masyarakat menyebabkan populasi ikan meningkat seiring waktu. Mengapa peningkatan kesadaran masyarakat dapat meningkatkan populasi ikan?"
                    : "In another simulation, increasing community awareness leads to improved fish population over time. Why does increasing community awareness improve fish population?"}
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "A", textEn: "It directly increases fish reproduction without changing human behavior.", textId: "Hal ini secara langsung meningkatkan reproduksi ikan tanpa mengubah perilaku manusia." },
                    { label: "B", textEn: "It reduces overfishing behavior and supports more responsible use of marine resources.", textId: "Hal ini mengurangi perilaku penangkapan berlebih (overfishing) dan mendukung pemanfaatan sumber daya laut yang lebih bertanggung jawab." },
                    { label: "C", textEn: "It raises salinity so fish can live longer.", textId: "Hal ini meningkatkan salinitas sehingga ikan dapat hidup lebih lama." },
                    { label: "D", textEn: "It removes all predators from the ecosystem.", textId: "Hal ini menghilangkan semua predator dari ekosistem." },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q3" className="w-4 h-4 accent-primary" checked={q3Choice === opt.label} onChange={() => setQ3Choice(opt.label)} />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.label}</span>
                      <span className="text-[13px] text-foreground/70">{isId ? opt.textId : opt.textEn}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4: Question 4/5 — MCQ comparison ── */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">4</div>
                  <h2 className="text-base font-bold text-foreground">
                    {isId ? "Soal 4 / 5" : "Question 4 / 5"}
                  </h2>
                </div>

                {/* Comparison table */}
                <div className="bg-white rounded-xl border border-border/50 overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border/50">
                        <th className="p-2 text-left font-bold text-muted-foreground">{isId ? "Komunitas" : "Community"}</th>
                        <th className="p-2 text-center font-bold text-muted-foreground">{isId ? "Penangkapan" : "Fishing"}</th>
                        <th className="p-2 text-center font-bold text-muted-foreground">{isId ? "Kesadaran" : "Awareness"}</th>
                        <th className="p-2 text-center font-bold text-muted-foreground">{isId ? "Hasil" : "Result"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/30">
                        <td className="p-2 font-semibold">A</td>
                        <td className="p-2 text-center">{isId ? "Tinggi" : "High"}</td>
                        <td className="p-2 text-center">{isId ? "Rendah" : "Low"}</td>
                        <td className="p-2 text-center text-rose-600 font-semibold">{isId ? "Populasi ikan menurun" : "Fish decline"}</td>
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="p-2 font-semibold">B</td>
                        <td className="p-2 text-center">{isId ? "Sedang" : "Medium"}</td>
                        <td className="p-2 text-center">{isId ? "Tinggi" : "High"}</td>
                        <td className="p-2 text-center text-emerald-600 font-semibold">{isId ? "Populasi ikan stabil" : "Fish stable"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">
                  {isId
                    ? "Berdasarkan data tersebut, kesimpulan manakah yang paling tepat untuk menjelaskan perbedaan tersebut?"
                    : "Which conclusion best explains the difference?"}
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "A", textEn: "Fishing intensity has no effect on fish population.", textId: "Intensitas penangkapan ikan tidak berpengaruh terhadap populasi ikan." },
                    { label: "B", textEn: "Cultural awareness can influence fishing behavior and marine sustainability.", textId: "Kesadaran budaya dapat memengaruhi perilaku penangkapan ikan dan keberlanjutan laut." },
                    { label: "C", textEn: "Marine ecosystems are controlled only by natural factors.", textId: "Ekosistem laut hanya dikendalikan oleh faktor alam." },
                    { label: "D", textEn: "Community traditions cannot affect the environment.", textId: "Tradisi masyarakat tidak dapat memengaruhi lingkungan." },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q4" className="w-4 h-4 accent-primary" checked={q4Choice === opt.label} onChange={() => setQ4Choice(opt.label)} />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.label}</span>
                      <span className="text-[13px] text-foreground/70">{isId ? opt.textId : opt.textEn}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 5: Question 5/5 — Open Policy Recommendation ── */}
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
                    ? "Pertanyaan terakhir ini meminta kamu untuk membuat keputusan berdasarkan bukti.\n\nPemerintah daerah di Cirebon ingin meningkatkan keberlanjutan laut. Strategi manakah yang paling efektif berdasarkan hasil simulasi?"
                    : "This final question asks you to make a decision using evidence.\n\nThe local government in Cirebon wants to improve marine sustainability. Which strategy would be most effective based on the simulation?"}
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: "A", textEn: "Increase fishing intensity to improve short-term production.", textId: "Meningkatkan intensitas penangkapan ikan untuk meningkatkan produksi jangka pendek." },
                    { label: "B", textEn: "Promote Nadran together with environmental education and conservation programs.", textId: "Mempromosikan tradisi Nadran bersama dengan pendidikan lingkungan dan program konservasi." },
                    { label: "C", textEn: "Ignore community behavior and focus only on harvesting more fish.", textId: "Mengabaikan perilaku masyarakat dan hanya fokus pada peningkatan hasil tangkapan ikan." },
                    { label: "D", textEn: "Remove conservation rules to make fishing easier.", textId: "Menghapus aturan konservasi agar penangkapan ikan menjadi lebih mudah." },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q5" className="w-4 h-4 accent-primary" checked={q4Choice === opt.label} onChange={() => setQ4Choice(opt.label)} />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.label}</span>
                      <span className="text-[13px] text-foreground/70">{isId ? opt.textId : opt.textEn}</span>
                    </label>
                  ))}
                </div>

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
                  <div className="bg-muted/40 border border-border p-4 rounded-lg">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                      {isId ? "Panduan Menulis" : "Writing Guide"}
                    </p>
                    <p className="text-[12px] text-foreground/70 leading-relaxed italic">{writingGuide}</p>
                  </div>
                )}

                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">
                  {isId
                    ? "Tulis rekomendasi kebijakan singkat berdasarkan bukti dari simulasi."
                    : "Write a short policy recommendation using evidence from the simulation."}
                </p>
                <textarea
                  value={q5Answer}
                  onChange={e => setQ5Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId
                    ? "Ketik rekomendasi kebijakanmu di sini...\n\nJawaban yang baik merekomendasikan peningkatan kesadaran, pengurangan penangkapan berlebih, penguatan konservasi, dan perbaikan pengelolaan limbah."
                    : "Type your policy recommendation here...\n\nA strong answer recommends improving awareness, reducing harmful fishing, strengthening conservation, and improving waste management."}
                />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q5Answer) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q5Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
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
                {stepLabels[currentStep]} · {currentStep}/5
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
                    const score = [!!q2Choice, !!q3Choice, !!q4Choice, getWordCount(q5Answer) >= 15].filter(Boolean).length;
                    if (!sessionSaved) {
                      saveCompletedSession(7, { q1Answer: { match1, match2, match3, match4 }, q2Choice, q3Choice, q4Choice, q5Answer, history }, score, 5);
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

        {/* ── RIGHT COLUMN: Marine Sustainability Simulation ── */}
        <div className="flex-1 bg-blue-50/50 flex flex-col overflow-hidden">
          <div className="p-6 h-full flex flex-col gap-5 overflow-y-auto exam-scrollbar">

            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isId ? "Simulasi Keberlanjutan Laut" : "Marine Sustainability Simulation"}
                </h3>
              </div>
            </div>

            {/* ── SVG SCENE ── */}
            <div className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
              <p className="absolute top-3 left-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {isId ? "DIAGRAM SISTEM LAUT" : "MARINE SYSTEM DIAGRAM"}
              </p>
              <svg viewBox="0 0 340 160" className="w-full h-40 mt-4" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="skyGrad7" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#bae6fd" />
                  </linearGradient>
                  <linearGradient id="seaGrad7" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>
                  <filter id="shadow7" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2"/>
                  </filter>
                </defs>

                {/* Sky */}
                <rect width="340" height="160" fill="url(#skyGrad7)" />
                {/* Sun */}
                <circle cx="290" cy="30" r="22" fill="#fef3c7" opacity="0.8"/>
                <circle cx="290" cy="30" r="16" fill="#fde68a"/>

                {/* Clouds */}
                <g opacity="0.7">
                  <path d="M30 35 Q45 20 60 35 Q75 25 85 40 Q95 35 100 50 L20 50 Q15 40 30 35Z" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
                  <path d="M150 20 Q162 10 175 20 Q188 12 195 28 Q202 22 205 35 L140 35 Q138 25 150 20Z" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
                </g>

                {/* Ocean */}
                <rect x="0" y="65" width="340" height="95" fill="url(#seaGrad7)" />
                {/* Wave lines */}
                {[1,2,3].map(i => (
                  <path key={i} d={`M0,${75+i*22} Q85,${70+i*22-4} 170,${75+i*22} Q255,${80+i*22+4} 340,${75+i*22}`}
                    fill="none" stroke="white" strokeWidth="1" opacity="0.25" />
                ))}

                {/* Fishing boats */}
                {fishingIntensity > 30 && (
                  <g>
                    {[0,1,2].slice(0, Math.ceil(fishingIntensity / 33)).map(i => (
                      <g key={i} transform={`translate(${60 + i * 80}, 58)`}>
                        <path d="M0 0 L20 0 L18 8 L2 8Z" fill="#475569" stroke="#1e293b" strokeWidth="0.5"/>
                        <path d="M10 0 L10 -12" stroke="#64748b" strokeWidth="1"/>
                        <path d="M10 -12 L25 -6 L10 -3Z" fill="#94a3b8" stroke="#64748b" strokeWidth="0.5"/>
                      </g>
                    ))}
                  </g>
                )}

                {/* Fish population */}
                <g>
                  {[...Array(12)].map((_, i) => (
                    <g key={i} transform={`translate(${15 + (i % 6) * 28}, ${85 + Math.floor(i / 6) * 28})`}>
                      <ellipse rx={calc.fishPop > 50 ? 7 : 5} ry={calc.fishPop > 50 ? 4 : 3}
                        fill={calc.fishPop > 60 ? "#fbbf24" : calc.fishPop > 30 ? "#f97316" : "#ef4444"}
                        opacity={i < calc.fishPop / 8.5 ? 0.9 : 0.2} />
                    </g>
                  ))}
                </g>

                {/* Coral / biodiversity */}
                {calc.biodiversity > 40 && (
                  <g transform="translate(20, 130)">
                    <path d="M0 0 L5 -15 L10 0" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M12 0 L17 -20 L22 0" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M24 0 L29 -12 L34 0" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </g>
                )}

                {/* Waste indicator */}
                {calc.waterQuality < 50 && (
                  <g transform="translate(280, 90)">
                    <rect x="-4" y="-4" width="28" height="28" rx="4" fill="#fee2e2" opacity="0.7"/>
                    <circle r="5" fill="#fca5a5"/>
                    <path d="M-2,-2 L2,2 M2,-2 L-2,2" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                  </g>
                )}

                {/* Community / conservation label */}
                <g transform="translate(260, 115)">
                  <rect x="0" y="0" width="60" height="22" rx="4" fill={communityAwareness > 60 ? "#dcfce7" : communityAwareness > 30 ? "#fef9c3" : "#fee2e2"} stroke={communityAwareness > 60 ? "#16a34a" : communityAwareness > 30 ? "#ca8a04" : "#dc2626"} strokeWidth="1"/>
                  <text x="30" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill={communityAwareness > 60 ? "#166534" : communityAwareness > 30 ? "#92400e" : "#991b1b"}>
                    {isId ? "Sadar" : "Aware"} {communityAwareness}%
                  </text>
                </g>
              </svg>
            </div>

            {/* ── CONTROLS ── */}
            <style>{`.pisa7-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:9999px;outline:none;cursor:pointer;background:#e5e7eb}.pisa7-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#1a1a1a;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer}`}</style>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4 shadow-sm">
              {[
                { label: isId ? "Intensitas Penangkapan Ikan" : "Fishing Intensity", value: fishingIntensity, set: setFishingIntensity, color: "#ef4444" },
                { label: isId ? "Kesadaran Masyarakat" : "Community Awareness", value: communityAwareness, set: setCommunityAwareness, color: "#22c55e" },
                { label: isId ? "Pengelolaan Limbah" : "Waste Management", value: wasteManagement, set: setWasteManagement, color: "#3b82f6" },
                { label: isId ? "Upaya Konservasi" : "Conservation Efforts", value: conservationEfforts, set: setConservationEfforts, color: "#a855f7" },
              ].map(({ label, value, set, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-medium text-gray-700">{label}</label>
                    <span className="text-[12px] font-bold text-gray-900 tabular-nums tabular-nums">{value}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={1} value={value}
                    onChange={e => set(Number(e.target.value))}
                    className="pisa7-slider"
                    style={{ background: `linear-gradient(to right, ${color} ${value}%, #e5e7eb ${value}%)` }}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button onClick={handleRecordData} className="flex-1 py-2.5 bg-foreground text-background text-[12px] font-bold rounded-xl hover:opacity-90 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {isId ? "Catat Data" : "Record Data"}
                </button>
                <button onClick={handleClearData} className="px-3 py-2.5 text-gray-400 hover:text-gray-600 transition-colors" title={isId ? "Hapus" : "Clear"}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            {/* ── 4-OUTPUT GRID ── */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: isId ? "Populasi Ikan" : "Fish Population", val: calc.fishPop, type: "pos" as const },
                { label: isId ? "Kualitas Air" : "Water Quality", val: calc.waterQuality, type: "pos" as const },
                { label: isId ? "Keanekaragaman Hayati" : "Biodiversity", val: calc.biodiversity, type: "pos" as const },
                { label: isId ? "Keberlanjutan" : "Sustainability", val: calc.sustainability, type: "pos" as const },
              ].map(({ label, val, type }) => (
                <div key={label} className={`rounded-xl border-2 p-4 transition-all duration-500 ${metricColor(val, type)}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-2">{label}</div>
                  <div className="text-2xl font-extrabold mb-2">{Math.round(val)}</div>
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-current transition-all duration-700 ease-out opacity-70"
                      style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── RECORDED DATA TABLE ── */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">{isId ? "Tabel Data Tercatat" : "Recorded Data Table"}</span>
                  <button onClick={handleClearData} className="text-[11px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-wider">{isId ? "Hapus" : "Clear"}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["#", isId?"Tangkapan":"Fishing", isId?"Sadar":"Aware", isId?"Limbah":"Waste", isId?"Konservasi":"Conserv.", isId?"Ikan":"Fish", isId?"Air":"Water", isId?"Biodiv.":"Biodiv.", isId?"Keberlanjutan":"Sustain."].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((row, i) => (
                        <tr key={row.id} className={i % 2 === 1 ? "bg-gray-50/60" : ""}>
                          <td className="px-3 py-2.5 text-gray-400 font-medium">{row.id}</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900">{row.fishing}%</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.awareness}%</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.waste}%</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.conservation}%</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900">{row.fish}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.water}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.biodiversity}</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900">{row.sustain}%</td>
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

export default Unit7Pisa;
