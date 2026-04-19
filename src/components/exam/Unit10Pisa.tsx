import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/hooks/useExamSession";

interface Unit10PisaProps { onExit?: () => void; studentId?: string; }

type ProteinSource = "Plant-based" | "Animal-based";
type IngredientDistance = "Local" | "Non-local" | "Mixed";
type WasteTreatment = "None" | "Partial" | "Full";
type PortionSize = "Small" | "Medium" | "Large";
type PressureLevel = "Low" | "Medium" | "High";

interface SimResult { resourceUse: PressureLevel; waterPollutionRisk: PressureLevel; sustainability: PressureLevel; }

const SIM_TABLE: Record<ProteinSource, Record<IngredientDistance, Record<WasteTreatment, SimResult>>> = {
  "Plant-based": {
    Local:      { None:{resourceUse:"Low",   waterPollutionRisk:"High",  sustainability:"Medium"}, Partial:{resourceUse:"Low",   waterPollutionRisk:"Medium",sustainability:"High"},   Full:{resourceUse:"Low",   waterPollutionRisk:"Low",  sustainability:"High"}   },
    "Non-local":{ None:{resourceUse:"Medium",waterPollutionRisk:"High",  sustainability:"Low"},    Partial:{resourceUse:"Medium",waterPollutionRisk:"Medium",sustainability:"Medium"}, Full:{resourceUse:"Medium",waterPollutionRisk:"Low",  sustainability:"Medium"} },
    Mixed:      { None:{resourceUse:"Low",   waterPollutionRisk:"High",  sustainability:"Low"},    Partial:{resourceUse:"Low",   waterPollutionRisk:"Medium",sustainability:"Medium"}, Full:{resourceUse:"Low",   waterPollutionRisk:"Low",  sustainability:"High"}   },
  },
  "Animal-based": {
    Local:      { None:{resourceUse:"High",  waterPollutionRisk:"High",  sustainability:"Low"},    Partial:{resourceUse:"High",  waterPollutionRisk:"Medium",sustainability:"Low"},    Full:{resourceUse:"High",  waterPollutionRisk:"Low",  sustainability:"Medium"} },
    "Non-local":{ None:{resourceUse:"High",  waterPollutionRisk:"High",  sustainability:"Low"},    Partial:{resourceUse:"High",  waterPollutionRisk:"High",  sustainability:"Low"},    Full:{resourceUse:"High",  waterPollutionRisk:"Medium",sustainability:"Low"}   },
    Mixed:      { None:{resourceUse:"High",  waterPollutionRisk:"High",  sustainability:"Low"},    Partial:{resourceUse:"High",  waterPollutionRisk:"Medium",sustainability:"Low"},    Full:{resourceUse:"Medium",waterPollutionRisk:"Low",  sustainability:"Medium"} },
  },
};

const STEP_LABELS_EN = ["Introduction","Question 1","Question 2","Question 3","Question 4","Question 5"];
const STEP_LABELS_ID = ["Pendahuluan","Soal 1","Soal 2","Soal 3","Soal 4","Soal 5"];

const Unit10Pisa = ({ onExit, studentId }: Unit10PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [currentStep, setCurrentStep] = useState(0);
  const [showWritingGuide, setShowWritingGuide] = useState(false);
  const [showWritingGuide5, setShowWritingGuide5] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  const [protein, setProtein] = useState<ProteinSource>("Plant-based");
  const [distance, setDistance] = useState<IngredientDistance>("Local");
  const [treatment, setTreatment] = useState<WasteTreatment>("None");
  const [portion, setPortion] = useState<PortionSize>("Small");

  const [outputs, setOutputs] = useState<SimResult>({ resourceUse:"Low", waterPollutionRisk:"High", sustainability:"Medium" });
  const [simRan, setSimRan] = useState(false);
  const [history, setHistory] = useState<Array<{id:number;protein:ProteinSource;distance:IngredientDistance;treatment:WasteTreatment;portion:PortionSize}&SimResult>>([]);

  const [q1Answers, setQ1Answers] = useState<Record<string,string>>({});
  const [q2Choice, setQ2Choice] = useState("");
  const [q3Choice, setQ3Choice] = useState("");
  const [q4Answer, setQ4Answer] = useState("");
  const [q5Answer, setQ5Answer] = useState("");

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const isQ1Correct = () =>
    q1Answers.tofu === "input" &&
    q1Answers.sauce === "prep" &&
    q1Answers.waste === "treat";

  const isStepValid = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return isQ1Correct();
    if (currentStep === 2) return !!q2Choice;
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

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  // Supabase session management
  const sessionIdRef = useRef<string | null>(null);
  const deviceId = getDeviceId();

  // Create session on mount
  useEffect(() => {
    const create = async () => {
      try {
        const { data, error } = await supabase
          .from("exam_sessions")
          .insert({ device_id: deviceId, unit: 10, answers: {}, completed: false, student_id: studentId ?? null })
          .select("id")
          .single();
        if (!error && data) sessionIdRef.current = data.id;
      } catch {
        // Table may not exist yet — session runs locally only
      }
    };
    create();
  }, []);



  // Auto-save answers every time they change
  useEffect(() => {
    if (!sessionIdRef.current) return;
    const save = async () => {
      try {
        const answers = {
          q1Answers,
          q2Choice,
          q3Choice,
          q4Answer,
          q5Answer,
          currentStep,
          simHistory: JSON.stringify(history),
        };
        await supabase
          .from("exam_sessions")
          .update({ answers, updated_at: new Date().toISOString() })
          .eq("id", sessionIdRef.current!);
      } catch { /* graceful */ }
    };
    const timer = setTimeout(save, 800);
    return () => clearTimeout(timer);
  }, [q1Answers, q2Choice, q3Choice, q4Answer, q5Answer, currentStep, history]);

  // Helper to get dropped item name
  const getDroppedItemName = (key: string) => {
    const items: Record<string, {en: string; id: string}> = {
      tofu: {en: "Tofu", id: "Tahu"},
      sauce: {en: "Sauce", id: "Kuah"},
      waste: {en: "Treatment", id: "Pengolahan"},
    };
    const item = items[key];
    return item ? (isId ? item.id : item.en) : "";
  };

  // Drag handlers
  const handleDrop = (target: string) => {
    if (draggedItem) {
      setQ1Answers(prev => ({...prev, [draggedItem]: target}));
      setDraggedItem(null);
    }
  };

  const runSimulation = () => {
    const base = SIM_TABLE[protein][distance][treatment];
    let sus = base.sustainability;
    if (portion === "Large" && sus === "High") sus = "Medium";
    if (portion === "Small" && sus === "Low") sus = "Medium";
    setOutputs({ ...base, sustainability: sus });
    setSimRan(true);
  };

  const handleRecord = () => {
    if (!simRan) return;
    setHistory(prev => [...prev, { id: prev.length + 1, protein, distance, treatment, portion, ...outputs }]);
  };

  const pColor = (v: PressureLevel, invert = false) => {
    if (v === "High") return invert ? "text-primary bg-primary/10 border-primary/30" : "text-foreground/50 bg-muted/50 border-border";
    if (v === "Low") return invert ? "text-foreground/50 bg-muted/50 border-border" : "text-primary bg-primary/10 border-primary/30";
    return "text-foreground/70 bg-muted/30 border-border";
  };

  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;

  const WritingGuideBtn = ({ text, open, setOpen }: { text: string; open: boolean; setOpen: (v:boolean)=>void }) => (
    <>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors text-[11px] font-bold text-foreground/70">
        {isId ? "Tampilkan Panduan Menulis" : "Show Writing Guide"}
        <svg className={`w-3 h-3 ml-auto transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <div className="bg-muted/40 border border-border p-4 rounded-lg">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Panduan Menulis" : "Writing Guide"}</p>
          <p className="text-[12px] text-foreground/70 leading-relaxed italic">{text}</p>
        </div>
      )}
    </>
  );

  // ── SIMULATION PANEL ──
  const SimPanel = () => (
    <div className="h-full flex flex-col overflow-y-auto exam-scrollbar p-6 space-y-5" style={{ maxHeight: '100%' }}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">{isId ? "Simulasi Keberlanjutan" : "Sustainability Simulation"}</p>
        <p className="text-[11px] text-muted-foreground mb-4">{isId ? "Atur variabel dan jalankan simulasi untuk melihat hasilnya." : "Adjust variables and run the simulation to see outcomes."}</p>
      </div>

      {/* Food System Diagram */}
      <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
        <p className="absolute top-3 left-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {isId ? "DIAGRAM SISTEM PANGAN" : "FOOD SYSTEM DIAGRAM"}
        </p>
        <svg viewBox="0 0 340 120" className="w-full h-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur stdDeviation="2" result="blur" />
               <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="shadow-u10" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
               <feOffset dx="0.5" dy="1" result="offsetblur" />
               <feComponentTransfer><feFuncA type="linear" slope="0.15"/></feComponentTransfer>
               <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background / Floor */}
          <rect y="80" width="340" height="40" fill="#f8fafc" opacity="0.5"/>
          <line x1="0" y1="80" x2="340" y2="80" stroke="#e2e8f0" strokeWidth="1"/>

          {/* Input Stage (Logistics) - organic shape */}
          <g transform="translate(10, 20)" filter="url(#shadow-u10)">
            <path d="M14,0 Q75,0 75,14 Q75,70 61,70 Q37.5,72 14,70 Q0,70 0,14 Q0,0 14,0" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5" />
            {distance === "Local" ? (
              <g transform="translate(22, 12) scale(0.6)">
                <path d="M10,40 L45,40 L45,20 L30,20 L10,30 Z" fill="#64748b" />
                <circle cx="15" cy="40" r="5" fill="#334155" />
                <circle cx="40" cy="40" r="5" fill="#334155" />
                <rect x="25" y="5" width="20" height="15" fill="#475569" />
              </g>
            ) : (
              <g transform="translate(22, 12) scale(0.6)">
                <path d="M5,25 L45,25 L50,15 L10,15 Z" fill="#64748b" />
                <path d="M20,25 L20,35 L15,35 L15,25 M35,25 L35,35 L30,35 L30,25" fill="#475569" />
              </g>
            )}
            <text x="37.5" y="60" textAnchor="middle" fontSize="6.5" fontWeight="black" fill="#64748b" style={{letterSpacing: '0.5px'}}>{isId ? "LOGISTIK" : "LOGISTICS"}</text>
            <text x="37.5" y="68" textAnchor="middle" fontSize="5.5" fill="#94a3b8" fontWeight="bold">{distance}</text>
          </g>

          {/* Prep Stage (Ingredients) - organic shape */}
          <g transform="translate(110, 20)" filter="url(#shadow-u10)">
            <path d="M14,0 Q42.5,0 71,0 Q85,0 85,14 Q85,70 71,70 Q42.5,72 14,70 Q0,70 0,14 Q0,0 14,0" fill={protein === "Plant-based" ? "#f0fdf4" : "#fff1f2"} stroke={protein === "Plant-based" ? "#86efac" : "#fca5a5"} strokeWidth="1.5" />
            {protein === "Plant-based" ? (
              <g transform="translate(27, 12) scale(0.7)">
                <rect x="5" y="5" width="30" height="30" rx="4" fill="#86efac" />
                <path d="M5,15 L35,15 M15,5 L15,35" stroke="#166534" strokeWidth="1" opacity="0.3" />
              </g>
            ) : (
              <g transform="translate(27, 12) scale(0.7)">
                <path d="M5,10 Q20,0 35,10 Q40,25 35,35 Q20,40 5,30 Q0,20 5,10" fill="#fca5a5" />
                <path d="M10,15 Q20,10 30,15" stroke="#991b1b" strokeWidth="2" fill="none" opacity="0.4" />
              </g>
            )}
            <text x="42.5" y="60" textAnchor="middle" fontSize="6.5" fontWeight="black" fill="#64748b" style={{letterSpacing: '0.5px'}}>{isId ? "PREPARASI" : "PREPARATION"}</text>
            <text x="42.5" y="68" textAnchor="middle" fontSize="5.5" fill="#94a3b8" fontWeight="bold">{portion} Portion</text>
          </g>

          {/* Treatment Stage - organic shape */}
          <g transform="translate(225, 20)" filter="url(#shadow-u10)">
            <path d="M14,0 Q52.5,0 91,0 Q105,0 105,14 Q105,70 91,70 Q52.5,72 14,70 Q0,70 0,14 Q0,0 14,0" fill={treatment === "Full" ? "#f0fdf4" : treatment === "Partial" ? "#fffbeb" : "#f8fafc"} stroke={treatment === "Full" ? "#22c55e" : treatment === "Partial" ? "#fbbf24" : "#e2e8f0"} strokeWidth="1.5" strokeDasharray={treatment === "None" ? "4" : "0"} />
            
            {/* Treatment Icons (Detailed) */}
            <g transform="translate(20, 28)">
               <circle r="11" fill={treatment === "None" ? "#fecaca" : "#bbf7d0"} opacity="0.8" />
               <line x1="-7" y1="-7" x2="7" y2="7" stroke={treatment === "None" ? "#dc2626" : "#16a34a"} strokeWidth="2" strokeLinecap="round"/>
               <line x1="7" y1="-7" x2="-7" y2="7" stroke={treatment === "None" ? "#dc2626" : "#16a34a"} strokeWidth="2" strokeLinecap="round"/>
            </g>
            <g transform="translate(52.5, 28)">
               <circle r="11" fill={treatment === "Partial" ? "#fef9c3" : treatment === "Full" ? "#bbf7d0" : "#f1f5f9"} opacity="0.8" />
               <polygon points="0,-8 8,6 -8,6" fill={treatment === "Partial" ? "#ca8a04" : treatment === "Full" ? "#16a34a" : "#94a3b8"} opacity="0.7"/>
            </g>
            <g transform="translate(85, 28)">
               <circle r="11" fill={treatment === "Full" ? "#bbf7d0" : "#f1f5f9"} opacity="0.8" />
               <path d="M-6,0 Q-6,-6 0,-6 Q6,-6 6,0 Q6,6 0,6 Q-6,6 -6,0" fill={treatment === "Full" ? "#16a34a" : "#94a3b8"} opacity="0.6"/>
            </g>

            <text x="52.5" y="60" textAnchor="middle" fontSize="6.5" fontWeight="black" fill="#64748b" style={{letterSpacing: '0.5px'}}>{isId ? "PENGOLAHAN" : "TREATMENT"}</text>
            <text x="52.5" y="68" textAnchor="middle" fontSize="5.5" fill="#94a3b8" fontWeight="bold">{treatment}</text>
          </g>

          {/* Arrows */}
          <path d="M90,55 L105,55" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arr)" />
          <path d="M200,55 L220,55" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arr)" />
          
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#cbd5e1"/>
            </marker>
          </defs>
        </svg>
        <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground italic flex items-center justify-center gap-1.5">
              {treatment === "None"
                ? <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    {isId ? "Risiko pencemaran air sangat tinggi tanpa pengolahan" : "High water pollution risk without treatment"}
                  </>
                : <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {isId ? "Pengolahan aktif melindungi ekosistem" : "Active treatment protects the ecosystem"}
                  </>}
            </p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Protein */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">{isId ? "Sumber Protein" : "Protein Source"}</label>
          <div className="flex gap-2">
            {(["Plant-based","Animal-based"] as ProteinSource[]).map(v => (
              <button key={v} onClick={() => { setProtein(v); setSimRan(false); }}
                className={`flex-1 py-2 text-[11px] font-medium rounded-lg transition-all active:scale-95 ${protein===v ? "bg-primary text-white shadow-sm" : "bg-white border border-border/60 text-foreground/70 hover:border-primary/40 hover:shadow-sm"}`}>
                {v === "Plant-based" ? (isId ? "Nabati" : "Plant-based") : (isId ? "Hewani" : "Animal-based")}
              </button>
            ))}
          </div>
        </div>
        {/* Distance */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">{isId ? "Jarak Bahan" : "Ingredient Distance"}</label>
          <div className="flex gap-2">
            {(["Local","Non-local","Mixed"] as IngredientDistance[]).map(v => (
              <button key={v} onClick={() => { setDistance(v); setSimRan(false); }}
                className={`flex-1 py-2 text-[11px] font-medium rounded-lg transition-all active:scale-95 ${distance===v ? "bg-primary text-white shadow-sm" : "bg-white border border-border/60 text-foreground/70 hover:border-primary/40 hover:shadow-sm"}`}>
                {v === "Local" ? (isId ? "Lokal" : "Local") : v === "Non-local" ? (isId ? "Non-lokal" : "Non-local") : (isId ? "Campuran" : "Mixed")}
              </button>
            ))}
          </div>
        </div>
        {/* Treatment */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">{isId ? "Pengolahan Limbah" : "Wastewater Treatment"}</label>
          <div className="flex gap-2">
            {(["None","Partial","Full"] as WasteTreatment[]).map(v => (
              <button key={v} onClick={() => { setTreatment(v); setSimRan(false); }}
                className={`flex-1 py-2 text-[11px] font-medium rounded-lg transition-all active:scale-95 ${treatment===v ? "bg-primary text-white shadow-sm" : "bg-white border border-border/60 text-foreground/70 hover:border-primary/40 hover:shadow-sm"}`}>
                {v === "None" ? (isId ? "Tidak Ada" : "None") : v === "Partial" ? (isId ? "Sebagian" : "Partial") : (isId ? "Penuh" : "Full")}
              </button>
            ))}
          </div>
        </div>
        {/* Portion */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">{isId ? "Ukuran Porsi" : "Portion Size"}</label>
          <div className="flex gap-2">
            {(["Small","Medium","Large"] as PortionSize[]).map(v => (
              <button key={v} onClick={() => { setPortion(v); setSimRan(false); }}
                className={`flex-1 py-2 text-[11px] font-medium rounded-lg transition-all active:scale-95 ${portion===v ? "bg-primary text-white shadow-sm" : "bg-white border border-border/60 text-foreground/70 hover:border-primary/40 hover:shadow-sm"}`}>
                {v === "Small" ? (isId ? "Kecil" : "Small") : v === "Medium" ? (isId ? "Sedang" : "Medium") : (isId ? "Besar" : "Large")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={runSimulation} 
          className="flex-1 py-2.5 bg-primary text-white text-[11px] font-semibold rounded-lg hover:bg-primary/90 active:scale-95 transition-all shadow-sm hover:shadow-md"
        >
          {isId ? "Jalankan Simulasi" : "Run Simulation"}
        </button>
        <button 
          onClick={handleRecord} 
          disabled={!simRan} 
          className="px-4 py-2.5 bg-white border border-border/60 text-[11px] font-semibold rounded-lg hover:bg-muted/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {isId ? "Catat" : "Record"}
        </button>
      </div>

      {/* ── HIGH-FIDELITY SVG FOOD SYSTEM SIMULATION ── */}
      <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm relative overflow-hidden group">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3 flex items-center gap-2">
          {isId ? "DIAGRAM SISTEM PANGAN" : "FOOD SYSTEM DIAGRAM"}
        </p>
        <svg viewBox="0 0 320 120" className="w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={outputs.waterPollutionRisk === "Low" ? "#38bdf8" : outputs.waterPollutionRisk === "Medium" ? "#94a3b8" : "#475569"} />
              <stop offset="100%" stopColor={outputs.waterPollutionRisk === "Low" ? "#0ea5e9" : outputs.waterPollutionRisk === "Medium" ? "#64748b" : "#1e293b"} />
            </linearGradient>
            <filter id="sim-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
              <feOffset dx="0.5" dy="1" />
              <feComponentTransfer><feFuncA type="linear" slope="0.15"/></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* 1. Input Source (Truck/Farm) - organic shape */}
          <g transform="translate(10, 35)" filter="url(#sim-glow)">
             <path d="M8,0 Q27.5,0 47,0 Q55,0 55,8 Q55,40 47,40 Q27.5,42 8,40 Q0,40 0,8 Q0,0 8,0" fill="url(#tankGrad)" stroke="#cbd5e1" strokeWidth="1" />
             <path d="M10,25 L25,10 L40,25 L40,35 L10,35 Z" fill="#94a3b8" opacity="0.6" />
             <text x="27.5" y="34" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#64748b">{distance === "Local" ? (isId ? "Lokal" : "Local") : (isId ? "Impor" : "Non-local")}</text>
             <text x="27.5" y="48" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#94a3b8" opacity="0.8 uppercase tracking-widest">{isId ? "SUMBER" : "SOURCE"}</text>
          </g>

          {/* Connect 1-2 */}
          <line x1="65" y1="55" x2="85" y2="55" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4,2" />

          {/* 2. Preparation (Kitchen/Factory) - organic shape */}
          <g transform="translate(90, 30)" filter="url(#sim-glow)">
             <path d="M10,0 Q32.5,0 55,0 Q65,0 65,10 Q65,50 55,50 Q32.5,52 10,50 Q0,50 0,10 Q0,0 10,0" fill="url(#tankGrad)" stroke="#cbd5e1" strokeWidth="1" />
             <circle cx="32.5" cy="20" r="12" fill={protein === "Plant-based" ? "#dcfce7" : "#fee2e2"} />
             {protein === "Plant-based"
               ? <g transform="translate(20.5, 8)">
                   <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="#22c55e" stroke="none"/>
                   <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#16a34a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                 </g>
               : <g transform="translate(20.5, 8)">
                   <path d="M6.5 22c0-5.5 4-8 6.5-8s6.5 2.5 6.5 8" fill="#f87171" stroke="#dc2626" strokeWidth="1"/>
                   <path d="M6.5 14c0-3 4-5 6.5-5s6.5 2 6.5 5" fill="#fca5a5" stroke="#dc2626" strokeWidth="1"/>
                   <circle cx="9.5" cy="18" r="2" fill="#fecaca"/>
                   <circle cx="16" cy="18" r="2" fill="#fecaca"/>
                 </g>}
             <text x="32.5" y="43" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#475569">{isId ? "PROSES" : "PROCESS"}</text>
          </g>

          {/* Connect 2-3 */}
          <line x1="155" y1="55" x2="175" y2="55" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4,2" />

          {/* 3. Output/Serving (Bowl) */}
          <g transform="translate(180, 40)" filter="url(#sim-glow)">
             <path d="M0,0 Q25,35 50,0 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
             <circle cx="25" cy="-5" r="8" fill="#d97706" opacity={portion === "Large" ? 1 : portion === "Medium" ? 0.7 : 0.4} />
             <text x="25" y="5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#475569" dy="15">{isId ? "PORSI" : "PORTION"}</text>
          </g>

          {/* Connect 3-4 (Waste) */}
          <path d="M230,55 Q245,55 245,70" fill="none" strokeWidth="2.5" strokeDasharray={treatment === "None" ? "4,2" : "0"} stroke={treatment === "None" ? "#ef4444" : "#22c55e"} />

          {/* 4. Treatment Tank - organic shape */}
          <g transform="translate(250, 45)" filter="url(#sim-glow)">
             <path d="M6,0 Q30,0 54,0 Q60,0 60,6 Q60,45 54,45 Q30,47 6,45 Q0,45 0,6 Q0,0 6,0" fill="#f8fafc" stroke={treatment === "Full" ? "#22c55e" : treatment === "Partial" ? "#fbbf24" : "#cbd5e1"} strokeWidth="1.5" />
             <rect x="3" y={treatment === "Full" ? 25 : treatment === "Partial" ? 15 : 5} width="54" height={treatment === "Full" ? 17 : treatment === "Partial" ? 27 : 37} rx="2" fill="url(#waterGrad)" />
             <text x="30" y="55" textAnchor="middle" fontSize="6" fontWeight="black" fill="#64748b" opacity="0.6 uppercase tracking-widest">{isId ? "LIMBAH" : "WASTE"}</text>
          </g>
        </svg>
      </div>

      {/* Outputs */}
      {simRan && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Hasil" : "Outcomes"}</p>
          <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-[12px] font-medium transition-all hover:scale-[1.02] ${pColor(outputs.resourceUse)}`}>
            <span>{isId ? "Penggunaan Sumber Daya" : "Resource Use"}</span>
            <span className="font-semibold">{isId ? (outputs.resourceUse==="Low"?"Rendah":outputs.resourceUse==="High"?"Tinggi":"Sedang") : outputs.resourceUse}</span>
          </div>
          <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-[12px] font-medium transition-all hover:scale-[1.02] ${pColor(outputs.waterPollutionRisk)}`}>
            <span>{isId ? "Risiko Pencemaran Air" : "Water Pollution Risk"}</span>
            <span className="font-semibold">{isId ? (outputs.waterPollutionRisk==="Low"?"Rendah":outputs.waterPollutionRisk==="High"?"Tinggi":"Sedang") : outputs.waterPollutionRisk}</span>
          </div>
          <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg border text-[12px] font-medium transition-all hover:scale-[1.02] ${pColor(outputs.sustainability, true)}`}>
            <span>{isId ? "Keberlanjutan" : "Sustainability"}</span>
            <span className="font-semibold">{isId ? (outputs.sustainability==="Low"?"Rendah":outputs.sustainability==="High"?"Tinggi":"Sedang") : outputs.sustainability}</span>
          </div>
        </div>
      )}

      {/* History table */}
      {history.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Riwayat Simulasi" : "Simulation History"}</p>
          <div className="overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-[10px] border-collapse">
              <thead><tr className="bg-muted/30">
                <th className="border-b border-border/30 px-2 py-2 text-left font-medium text-muted-foreground">#</th>
                <th className="border-b border-border/30 px-2 py-2 text-left font-medium text-muted-foreground">{isId?"Protein":"Protein"}</th>
                <th className="border-b border-border/30 px-2 py-2 text-left font-medium text-muted-foreground">{isId?"Jarak":"Dist."}</th>
                <th className="border-b border-border/30 px-2 py-2 text-left font-medium text-muted-foreground">{isId?"Limbah":"Waste"}</th>
                <th className="border-b border-border/30 px-2 py-2 text-left font-medium text-muted-foreground">{isId?"SDA":"Res."}</th>
                <th className="border-b border-border/30 px-2 py-2 text-left font-medium text-muted-foreground">{isId?"Air":"Water"}</th>
                <th className="border-b border-border/30 px-2 py-2 text-left font-medium text-muted-foreground">{isId?"Sustain.":"Sustain."}</th>
              </tr></thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className={h.id%2===0?"bg-muted/20":"bg-white"}>
                    <td className="border-b border-border/20 px-2 py-2 font-medium text-muted-foreground">{h.id}</td>
                    <td className="border-b border-border/20 px-2 py-2 text-foreground/80">{h.protein==="Plant-based"?(isId?"Nabati":"Plant"):(isId?"Hewani":"Animal")}</td>
                    <td className="border-b border-border/20 px-2 py-2 text-foreground/80">{h.distance==="Local"?(isId?"Lokal":"Local"):h.distance==="Non-local"?(isId?"Non-lok.":"Non-loc."):(isId?"Camp.":"Mixed")}</td>
                    <td className="border-b border-border/20 px-2 py-2 text-foreground/80">{h.treatment==="None"?(isId?"Tdk Ada":"None"):h.treatment==="Partial"?(isId?"Sebag.":"Part."):(isId?"Penuh":"Full")}</td>
                    <td className="border-b border-border/20 px-2 py-2 text-foreground/80">{isId?(h.resourceUse==="Low"?"Rendah":h.resourceUse==="High"?"Tinggi":"Sedang"):(h.resourceUse)}</td>
                    <td className="border-b border-border/20 px-2 py-2 text-foreground/80">{isId?(h.waterPollutionRisk==="Low"?"Rendah":h.waterPollutionRisk==="High"?"Tinggi":"Sedang"):(h.waterPollutionRisk)}</td>
                    <td className="border-b border-border/20 px-2 py-2 text-foreground/80">{isId?(h.sustainability==="Low"?"Rendah":h.sustainability==="High"?"Tinggi":"Sedang"):(h.sustainability)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">

      {/* HEADER */}
      <header className="h-14 bg-white border-b border-border/60 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">10</div>
            <span className="font-bold text-sm tracking-tight text-black uppercase">
              {isId ? "Unit 10: Sistem Pangan Lokal Berkelanjutan" : "Unit 10: Sustainable Local Food Systems"}
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
          <button onClick={onExit} className="px-3 py-1.5 bg-background text-foreground text-[10px] font-bold rounded border border-border hover:bg-muted transition-colors uppercase tracking-wider">
            {isId ? "Kembali" : "Back"}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

        {/* LEFT: Questions */}
        <div className="w-[45%] bg-orange-100 border-r border-orange-200 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-4 exam-scrollbar" style={{ maxHeight: '100%' }}>

            {/* STEP 0: Introduction */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-[10px]">{isId ? "Pendahuluan" : "Introduction"}</h2>
                  <h1 className="text-xl font-bold text-foreground leading-tight">{isId ? "TAHU GEJROT" : "TAHU GEJROT"}</h1>
                  <p className="text-[11px] text-muted-foreground font-medium">{isId ? "Sistem Pangan Lokal Berkelanjutan" : "Sustainable Local Food Systems"}</p>
                </div>
                <div className="text-[13px] leading-[1.8] text-foreground/80 space-y-3">
                  <p>{isId
                    ? "Tahu gejrot adalah makanan tradisional khas Cirebon yang terbuat dari tahu goreng yang disajikan dengan kuah yang terdiri dari gula merah, cuka, bawang merah, bawang putih, dan cabai. Makanan ini biasanya disajikan dalam porsi kecil dengan menggunakan bahan-bahan lokal yang sederhana."
                    : "Tahu gejrot is a traditional Cirebon dish made from fried tofu served with a sauce of palm sugar, vinegar, shallot, garlic, and chili. It is usually served in small portions using simple local ingredients."}</p>
                  <p>{isId
                    ? "Tahu merupakan sumber protein nabati. Dibandingkan dengan banyak makanan berbasis hewani, protein nabati umumnya menggunakan lebih sedikit sumber daya alam dan menghasilkan tekanan lingkungan yang lebih rendah."
                    : "Tofu is a plant-based protein. Compared with many animal-based foods, plant-based protein generally uses fewer natural resources and creates lower environmental pressure."}</p>
                  <p>{isId
                    ? "Namun, produksi tahu tetap dapat berdampak pada lingkungan. Proses pembuatan tahu menggunakan banyak air dan menghasilkan limbah cair yang kaya akan bahan organik. Jika limbah ini dibuang tanpa pengolahan, dapat meningkatkan BOD dan COD serta mencemari perairan."
                    : "However, tofu production can still affect the environment. Tofu processing uses large amounts of water and produces liquid waste rich in organic matter. If this waste is released without treatment, it can increase BOD and COD and pollute waterways."}</p>
                  <div className="rounded-xl overflow-hidden border border-border/40 bg-black/5">
                    <video
                      src="/videos/unit10-tahu-gejrot.mp4"
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

            {/* STEP 1: Q1 — Drag & Drop Matching */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 1 / 5" : "Question 1 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Diagram Sistem Pangan" : "Food System Diagram"}</p>
                  <p>{isId
                    ? "Diagram menunjukkan sistem pangan lokal sederhana untuk penyajian tahu gejrot. Bahan masuk ke dalam sistem pangan, makanan diproses, dan limbah cair keluar dari sistem."
                    : "The diagram shows a simplified local food system for serving tahu gejrot. Ingredients enter the food system, the dish is prepared, and wastewater leaves the system."}</p>
                  <div className="flex items-center justify-center gap-2 mt-3 py-3 bg-white rounded-lg border border-border/40">
                    {[
                      {label: isId?"Tangki Input":"Input Tank", sub: isId?"Bahan masuk":"Ingredients enter", id:"input"},
                      {label:"→", sub:"", id:"arrow1"},
                      {label: isId?"Tangki Persiapan":"Preparation Tank", sub: isId?"Makanan diproses":"Food prepared", id:"prep"},
                      {label:"→", sub:"", id:"arrow2"},
                      {label: isId?"Tangki Pengolahan":"Treatment Tank", sub: isId?"Air diolah":"Water treated", id:"treat"},
                    ].map((item, i) => item.label === "→"
                      ? <span key={i} className="text-muted-foreground font-bold text-lg">→</span>
                      : <div key={i}
                             className={`relative px-3 py-2 rounded-lg border text-center min-w-[120px] transition-all duration-200 ${
                               dragOverZone === item.id
                                 ? "border-primary border-2 bg-primary/10 shadow-md scale-105"
                                 : q1Answers[item.id]
                                 ? "border-2 border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 shadow-sm"
                                 : draggedItem
                                 ? "border-dashed border-2 border-primary/40 bg-primary/5"
                                 : "border-border/40 bg-white"
                             }`}
                             onDragOver={(e) => { e.preventDefault(); setDragOverZone(item.id); }}
                             onDragLeave={() => setDragOverZone(null)}
                             onDrop={() => { handleDrop(item.id); setDragOverZone(null); }}>
                          {dragOverZone === item.id && !q1Answers[item.id] && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-in fade-in zoom-in duration-200">{isId ? "Lepaskan di sini!" : "Drop here!"}</span>
                          )}
                          {q1Answers[item.id] && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-200">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                            </div>
                          )}
                          <p className={`text-[11px] font-bold ${q1Answers[item.id] ? "text-emerald-700" : "text-foreground"}`}>{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                          {q1Answers[item.id] && (
                            <p className="text-[9px] text-emerald-700 mt-1 font-semibold flex items-center justify-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                              {getDroppedItemName(q1Answers[item.id])}
                            </p>
                          )}
                          {!q1Answers[item.id] && draggedItem && (
                            <p className="text-[9px] text-primary/60 mt-1">{isId ? "Seret ke sini" : "Drag here"}</p>
                          )}
                        </div>
                    )}
                  </div>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId
                  ? "Seret setiap item berikut ke bagian sistem pangan yang sesuai. Pilih bagian yang paling tepat untuk setiap item."
                  : "Drag each item below to the correct part of the food system. Select the most appropriate part for each item."}</p>
                {/* Drag preview banner */}
                {draggedItem && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border-2 border-primary rounded-xl animate-pulse">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                    <span className="text-[12px] font-bold text-primary">
                      {isId ? `Sedang diseret: ${draggedItem === "tofu" ? "Tahu" : draggedItem === "sauce" ? "Kuah" : "Pengolahan"} — Lepaskan ke kotak yang sesuai!` : `Dragging: ${draggedItem === "tofu" ? "Tofu" : draggedItem === "sauce" ? "Sauce" : "Treatment"} — Drop it on the correct box!`}
                    </span>
                  </div>
                )}
                <div className="space-y-3">
                  {draggedItem && (
                    <p className="text-[11px] font-semibold text-primary">
                      {isId ? `Sedang diseret: ${getDroppedItemName(draggedItem)}` : `Dragging: ${getDroppedItemName(draggedItem)}`}
                    </p>
                  )}
                  {Object.keys(q1Answers).length >= 3 && (
                    <p className={`text-[11px] font-semibold ${isQ1Correct() ? "text-emerald-600" : "text-rose-600"}`}>
                      {isQ1Correct()
                        ? (isId ? "Semua pasangan benar." : "All matches are correct.")
                        : (isId ? "Masih ada pasangan yang salah. Cek lagi mapping input–proses–pengolahan." : "Some matches are incorrect. Recheck input–process–treatment mapping.")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {[
                      {key:"tofu",    en:"Tofu (plant protein)",          id:"Tahu (protein nabati)",          color:"bg-emerald-100 border-emerald-400 text-emerald-800"},
                      {key:"sauce",   en:"Palm sugar–vinegar sauce",       id:"Kuah gula merah dan cuka",       color:"bg-amber-100 border-amber-400 text-amber-800"},
                      {key:"waste",   en:"Wastewater treatment",           id:"Pengolahan limbah",              color:"bg-blue-100 border-blue-400 text-blue-800"},
                    ].map(item => {
                      const isPlaced = Object.values(q1Answers).includes(item.key);
                      return (
                        <div key={item.key}
                             draggable={!isPlaced}
                             onDragStart={() => !isPlaced && setDraggedItem(item.key)}
                             onDragEnd={() => setDraggedItem(null)}
                             className={`px-4 py-2.5 rounded-lg border-2 font-semibold text-[12px] transition-all select-none ${isPlaced ? "opacity-30 cursor-not-allowed line-through" : `${item.color} cursor-grab active:cursor-grabbing hover:scale-105 shadow-sm`} ${draggedItem === item.key ? "opacity-50 scale-95" : ""}`}>
                          {isId ? item.id : item.en}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    {Object.keys(q1Answers).length > 0 && (
                      <button 
                        onClick={() => setQ1Answers({})}
                        className="px-4 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-lg hover:bg-muted/30 transition-all">
                        {isId ? "Reset Jawaban" : "Reset Answers"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Q2 — MCQ */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 2 / 5" : "Question 2 / 5"}</h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Cara manakah yang paling efektif untuk mengurangi pencemaran limbah tahu?"
                  : "Which method is most effective to reduce tofu wastewater pollution?"}</p>
                <div className="space-y-2.5">
                  {[
                    { val: "A", id: "Membuang limbah cair langsung ke sungai", en: "Discharge wastewater directly to the river" },
                    { val: "B", id: "Menambah volume air agar limbah terlihat encer", en: "Add more water so waste looks diluted" },
                    { val: "C", id: "Mengolah limbah cair tahu sebelum dibuang", en: "Treat tofu wastewater before disposal" },
                    { val: "D", id: "Membuang limbah hanya pada malam hari", en: "Dispose waste only at night" },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q2-choice" className="w-4 h-4 accent-primary" checked={q2Choice === opt.val} onChange={() => setQ2Choice(opt.val)} />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.val}</span>
                      <span className="text-[13px] text-foreground/70">{isId ? opt.id : opt.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Q3 — MCQ simulation */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 3 / 5" : "Question 3 / 5"}</h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId
                  ? "Gunakan simulasi di sebelah kanan. Pengaturan sistem pangan manakah yang paling mungkin memiliki tekanan lingkungan keseluruhan paling rendah?"
                  : "Use the simulation on the right. Which food system setup is most likely to have the lowest overall environmental pressure?"}</p>
                <div className="space-y-2.5">
                  {[
                    {val:"A", en:"Animal-based protein, non-local ingredients, no treatment",       id:"Protein hewani, bahan non-lokal, tanpa pengolahan limbah"},
                    {val:"B", en:"Plant-based protein, local ingredients, full treatment",          id:"Protein nabati, bahan lokal, pengolahan limbah penuh"},
                    {val:"C", en:"Animal-based protein, local ingredients, no treatment",           id:"Protein hewani, bahan lokal, tanpa pengolahan limbah"},
                    {val:"D", en:"Plant-based protein, non-local ingredients, no treatment",        id:"Protein nabati, bahan non-lokal, tanpa pengolahan limbah"},
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

            {/* STEP 4: Q4 — Open (best combination) */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">4</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 4 / 5" : "Question 4 / 5"}</h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Gunakan simulasi. Pilih satu kombinasi: sumber protein, jarak bahan, pengolahan limbah cair, dan ukuran porsi yang memberikan keseimbangan terbaik antara keberlanjutan dan produksi pangan yang praktis untuk tahu gejrot.\n\nJelaskan mengapa kombinasi tersebut merupakan pilihan yang baik."
                  : "Use the simulation. Choose one combination of: protein source, ingredient distance, wastewater treatment, and portion size that gives the best balance between sustainability and practical food production for tahu gejrot.\n\nExplain why your combination is a good choice."}</p>
                <WritingGuideBtn
                  open={showWritingGuide}
                  setOpen={setShowWritingGuide}
                  text={isId
                    ? "Jawaban yang baik biasanya memilih protein nabati, bahan lokal, pengolahan limbah minimal sebagian atau penuh, serta ukuran porsi kecil atau sedang. Jawaban juga harus menjelaskan bagaimana pilihan tersebut mengurangi penggunaan sumber daya dan pencemaran sambil tetap memungkinkan produksi yang praktis."
                    : "A strong answer usually chooses plant-based protein, local ingredients, at least partial or full wastewater treatment, and a small or medium portion size. It should explain why these reduce resource use and pollution while keeping the food practical to produce."} />
                <textarea value={q4Answer} onChange={e => setQ4Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q4Answer) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q4Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
              </div>
            )}

            {/* STEP 5: Q5 — Open (decision making) */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">5</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 5 / 5" : "Question 5 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Pengambilan Keputusan" : "Decision Making"}</p>
                  <table className="w-full text-[11px] border-collapse">
                    <thead><tr className="bg-muted/50">
                      <th className="border border-border/40 px-2 py-1 text-left">{isId?"Pilihan desain":"Design choice"}</th>
                      <th className="border border-border/40 px-2 py-1 text-left">{isId?"Mengapa dapat mendukung keberlanjutan":"Why it may help sustainability"}</th>
                    </tr></thead>
                    <tbody>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Protein nabati":"Plant-based protein"}</td><td className="border border-border/40 px-2 py-1">{isId?"Dapat mengurangi kebutuhan sumber daya dibandingkan banyak makanan berbasis hewani":"Can reduce resource demand compared with many animal-based foods"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Bahan lokal":"Local ingredients"}</td><td className="border border-border/40 px-2 py-1">{isId?"Mendukung rantai pasok yang pendek dan produsen lokal":"Supports short supply chains and local producers"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Porsi kecil":"Small portions"}</td><td className="border border-border/40 px-2 py-1">{isId?"Dapat mengurangi penggunaan bahan dan limbah makanan":"Can reduce total material use and food waste"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Pengolahan limbah":"Wastewater treatment"}</td><td className="border border-border/40 px-2 py-1">{isId?"Membantu mencegah pencemaran perairan":"Helps prevent pollution of waterways"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Tahu gejrot merupakan makanan tradisional Cirebon sekaligus bagian dari perekonomian lokal. Jelaskan mengapa penggunaan bahan lokal, protein nabati, dan pengolahan limbah yang tepat dapat mendukung sistem pangan lokal yang lebih berkelanjutan."
                  : "Tahu gejrot is both a traditional Cirebon food and part of the local economy. Explain why using local ingredients, plant-based protein, and proper wastewater treatment can support a more sustainable local food system."}</p>
                <WritingGuideBtn
                  open={showWritingGuide5}
                  setOpen={setShowWritingGuide5}
                  text={isId
                    ? "Jawaban yang baik menjelaskan bahwa makanan berbasis nabati umumnya menggunakan lebih sedikit sumber daya dan menghasilkan jejak karbon yang lebih rendah dibandingkan makanan hewani. Bahan lokal mengurangi kebutuhan transportasi, yang juga menurunkan emisi karbon. Pengolahan limbah melindungi sungai dan ekosistem perairan. Jawaban juga sebaiknya menyebutkan dukungan terhadap produsen lokal dan perekonomian tradisional Cirebon, serta bagaimana sistem pangan berkelanjutan dapat menjaga warisan kuliner daerah sambil melindungi lingkungan."
                    : "A strong answer explains that plant-based foods generally use fewer resources and produce a lower carbon footprint than animal-based foods. Local ingredients reduce transport needs, which also lowers carbon emissions. Wastewater treatment protects rivers and aquatic ecosystems. It should also mention support for local producers and Cirebon's traditional economy, and how sustainable food systems can preserve regional culinary heritage while protecting the environment."} />
                <textarea value={q5Answer} onChange={e => setQ5Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q5Answer) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q5Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
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
                <button onClick={async () => {
                  const score = [isQ1Correct(), !!q2Choice, !!q3Choice, getWordCount(q4Answer) >= 15, getWordCount(q5Answer) >= 15].filter(Boolean).length;
                  try {
                    if (sessionIdRef.current) {
                      await supabase.from("exam_sessions").update({ answers: { q1Answers, q2Choice, q3Choice, q4Answer, q5Answer }, completed: true, score, total: 5 }).eq("id", sessionIdRef.current);
                    }
                  } catch {}
                  onExit?.();
                }} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] transition-all shadow-md">
                  {isId ? "Kirim & Selesai" : "Submit & Finish"}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Simulation */}
        <div className="flex-1 bg-slate-50 border-l border-amber-200 overflow-hidden">
          <SimPanel />
        </div>

      </main>
    </div>
  );
};

export default Unit10Pisa;
