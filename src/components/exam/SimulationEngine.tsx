import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────

const SimCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-border/50 shadow-sm ${className}`}>
    {children}
  </div>
);

const SliderRow = ({ label, value, min, max, step = 1, onChange, color, unit = "%", note }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; color?: string; unit?: string; note?: string;
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-foreground leading-tight">{label}</span>
        <div className="flex items-center gap-2">
          {note && <span className="text-[10px] text-muted-foreground">{note}</span>}
          <span className="text-[13px] font-bold text-primary min-w-[40px] text-right">{value}{unit}</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="sim-slider w-full"
        style={{ background: `linear-gradient(to right, ${color || "#6366f1"} ${pct}%, #e5e7eb ${pct}%)` }}
      />
    </div>
  );
};

const BarChart = ({ data, height = 120 }: { data: { label: string; value: number; color?: string }[]; height?: number }) => (
  <div className="flex items-end gap-2" style={{ height }}>
    {data.map((d, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <span className="text-[10px] font-semibold text-foreground">{d.value}</span>
        <div
          className={`w-full rounded-t-lg transition-all duration-700 ${d.color || "bg-primary/70"}`}
          style={{ height: `${d.value}%`, minHeight: 4 }}
        />
        <span className="text-[8px] text-muted-foreground text-center leading-tight">{d.label}</span>
      </div>
    ))}
  </div>
);

const GaugeChart = ({ value, max = 100, label, color, size = 80 }: {
  value: number; max?: number; label: string; color: string; size?: number;
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = 36; const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="40" y="36" textAnchor="middle" className="text-[14px] font-bold fill-foreground">{value}</text>
        <text x="40" y="48" textAnchor="middle" className="text-[8px] fill-muted-foreground">{max}</text>
      </svg>
      <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{label}</span>
    </div>
  );
};

const StatCard = ({ label, value, sub, bg }: {
  label: string; value: number | string; sub: string; bg?: string;
}) => (
  <div className={`rounded-xl border border-border/50 p-3 text-center ${bg || "bg-white"}`}>
    <div className="text-[10px] text-muted-foreground mb-0.5 leading-tight">{label}</div>
    <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
    <div className={`text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" || sub === "Good" ? "bg-emerald-600" : sub === "Medium" ? "bg-amber-500" : sub === "Low" || sub === "High Risk" ? "bg-red-500" : "bg-slate-500"}`}>{sub}</div>
  </div>
);

const DataTable = ({ runs, columns }: {
  runs: Record<string, unknown>[];
  columns: { key: string; label: string; color?: string }[];
}) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  if (!runs.length) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-muted/60">
            {columns.map(c => (
              <th key={c.key} className="p-2 text-left font-semibold border-b border-border/40 text-muted-foreground">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((r, i) => (
            <tr key={i} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
              {columns.map(c => (
                <td key={c.key} className="p-2 text-foreground/80">
                  {c.color ? (
                    <span className={`font-bold ${
                      Number(r[c.key]) >= 67 ? "text-emerald-600" :
                      Number(r[c.key]) >= 34 ? "text-amber-600" :
                      "text-red-500"
                    }`}>{r[c.key]}</span>
                  ) : String(r[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────
// UNIT 1: NASI JAMBLANG — Teak Leaf vs Plastic
// ─────────────────────────────────────────────

const NasiJamblangSim = ({ onRun }: { onRun: (d: Record<string, unknown>) => void }) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [packType, setPackType] = useState<"teak" | "plastic" | "paper">("teak");
  const [storageDays, setStorageDays] = useState(7);
  const [temp, setTemp] = useState(25);
  const animRef = useRef<HTMLDivElement>(null);

  const calc = useMemo(() => {
    const isTeak = packType === "teak";
    const isPaper = packType === "paper";
    const decompTime = isTeak ? 21 : isPaper ? 105 : 300;
    const freshness = Math.max(0, Math.min(100,
      100 - (storageDays * (isTeak ? 4 : isPaper ? 6 : 1)) - (temp > 30 ? 10 : 0)
    ));
    const envImpact = Math.max(0, Math.min(100,
      isTeak ? 15 : isPaper ? 45 : 95 - (storageDays > 7 ? 10 : 0)
    ));
    const waste = Math.max(0, Math.min(100,
      isTeak ? 5 : isPaper ? 30 : 90 - freshness * 0.3
    ));
    const label = (v: number) => v >= 67 ? (isId ? "Baik" : "Good") : v >= 34 ? (isId ? "Sedang" : "Medium") : (isId ? "Rendah" : "Low");
    return { decompTime, freshness, envImpact, waste, freshnessLabel: label(freshness), envLabel: label(100 - envImpact), wasteLabel: label(100 - waste) };
  }, [packType, storageDays, temp, isId]);

  useEffect(() => {
    if (!animRef.current) return;
    const el = animRef.current;
    el.querySelectorAll(".rot-leaf").forEach((leaf, i) => {
      (leaf as HTMLElement).style.animationDelay = `${i * 0.5}s`;
    });
  }, [packType]);

  const handleRun = () => {
    onRun({ pack: packType, storage: storageDays, temp, freshness: calc.freshness, env: calc.envImpact, waste: calc.waste });
  };

  return (
    <div className="space-y-4">
      {/* Visual Scene */}
      <SimCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {isId ? "Visualisasi Pengemasan" : "Packaging Visualization"}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
            packType === "teak" ? "bg-emerald-600" : packType === "paper" ? "bg-amber-500" : "bg-blue-500"
          }`}>
            {packType === "teak" ? (isId ? "Daun Jati" : "Teak Leaf") : packType === "paper" ? (isId ? "Kertas" : "Paper") : (isId ? "Plastik" : "Plastic")}
          </span>
        </div>

        <div ref={animRef} className="relative h-48 bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 rounded-xl overflow-hidden border border-border/30">
          {/* Sky */}
          <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center">
            <div className="flex gap-1">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" style={{ animationDelay: `${i * 0.3}s`, opacity: 0.6 + i * 0.06 }} />
              ))}
            </div>
          </div>

          {/* Sun */}
          <div className="absolute top-3 right-6 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200 to-amber-400 shadow-lg shadow-amber-200 animate-pulse" style={{ animationDuration: "3s" }} />

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-200 to-amber-100">
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
          </div>

          {/* Rice/food item */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Plate */}
            <div className="w-20 h-4 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full shadow-md" />
            {/* Rice mound */}
            <div className="w-16 h-8 bg-gradient-to-b from-white to-amber-50 rounded-t-full shadow-sm -mt-1" />
            {/* Packaging wrapper */}
            {packType === "teak" && (
              <>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-12 flex items-center justify-center">
                  <div className="rot-leaf w-28 h-10 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 rounded-2xl shadow-lg flex items-center justify-center animate-[sway_3s_ease-in-out_infinite]" style={{ transformOrigin: "bottom center" }}>
                    <svg width="40" height="8" viewBox="0 0 40 8" className="opacity-40">
                      {[...Array(5)].map((_, i) => <line key={i} x1={i * 10} y1="0" x2={i * 10 + 5} y2="8" stroke="#166534" strokeWidth="0.8" />)}
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-700 whitespace-nowrap">
                  🍃 {isId ? "Daun Jati Alami" : "Natural Teak Leaf"}
                </div>
                {/* Pores / texture dots */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute w-1 h-1 rounded-full bg-emerald-900/30"
                    style={{ top: `${8 + (i % 4) * 3}px`, left: `${50 + (i % 2 === 0 ? -1 : 1) * (10 + i * 4)}px` }} />
                ))}
              </>
            )}
            {packType === "plastic" && (
              <>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-14 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 rounded-lg shadow-lg border-2 border-blue-400 flex items-center justify-center opacity-90">
                  <div className="w-16 h-1 bg-blue-400/60 rounded mb-1" />
                  <div className="w-12 h-1 bg-blue-400/40 rounded" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-600 whitespace-nowrap">
                  🛍️ {isId ? "Plastik - 500 tahun terurai" : "Plastic - 500 yrs to decompose"}
                </div>
                {/* Shine */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-white/30 rounded-r-full" />
              </>
            )}
            {packType === "paper" && (
              <>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg shadow-md border border-amber-300 flex items-center justify-center">
                  <div className="w-16 h-1 bg-amber-400/50 rounded mb-1" />
                  <div className="w-10 h-1 bg-amber-400/30 rounded" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-600 whitespace-nowrap">
                  📄 {isId ? "Kertas - 150 hari terurai" : "Paper - 150 days to decompose"}
                </div>
              </>
            )}
          </div>

          {/* Decay particles */}
          {packType === "plastic" && (
            <div className="absolute top-24 right-8 flex gap-1">
              {[1,2,3].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-blue-400/40 animate-ping" style={{ animationDelay: `${i * 0.8}s` }} />
              ))}
              <span className="text-[9px] text-blue-400 font-bold ml-1 mt-0.5">⚠️</span>
            </div>
          )}
          {packType === "teak" && (
            <div className="absolute top-24 left-8 flex gap-1 items-center">
              {[1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: `${i * 0.6}s` }} />
              ))}
              <span className="text-[9px] text-emerald-500 font-bold">♻️</span>
            </div>
          )}

          {/* Moisture/air arrows for teak */}
          {packType === "teak" && (
            <div className="absolute bottom-16 right-10 flex flex-col gap-1">
              <svg width="16" height="20" viewBox="0 0 16 20">
                <path d="M8 0 L8 14 M4 10 L8 14 L12 10" stroke="#94a3b8" strokeWidth="1.5" fill="none" className="animate-pulse" />
              </svg>
              <span className="text-[8px] text-slate-400">air</span>
            </div>
          )}

          {/* Thermometer */}
          <div className="absolute bottom-16 left-4 flex flex-col items-center">
            <div className="relative w-4 h-14 bg-gradient-to-b from-slate-100 to-slate-200 rounded-full border border-slate-300 overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-400 to-red-300 transition-all duration-500" style={{ height: `${Math.min(100, ((temp - 15) / 45) * 100)}%` }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-red-500" style={{ height: `${Math.min(90, ((temp - 15) / 45) * 90)}%` }} />
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-400 rounded-full border border-red-500" />
            </div>
            <span className="text-[9px] text-slate-500 font-medium mt-0.5">{temp}°C</span>
          </div>
        </div>

        {/* Packaging selector */}
        <div className="flex gap-2 mt-3">
          {(["teak", "paper", "plastic"] as const).map(p => (
            <button key={p} onClick={() => setPackType(p)}
              className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${
                packType === p ? (p === "teak" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : p === "paper" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-blue-500 bg-blue-50 text-blue-700") : "border-border/40 bg-white text-muted-foreground hover:bg-muted"
              }`}>
              {p === "teak" ? (isId ? "🍃 Daun Jati" : "🍃 Teak Leaf") : p === "paper" ? (isId ? "📄 Kertas" : "📄 Paper") : (isId ? "🛍️ Plastik" : "🛍️ Plastic")}
            </button>
          ))}
        </div>
      </SimCard>

      {/* Controls */}
      <SimCard className="p-4 space-y-4">
        <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</p>
        <SliderRow label={isId ? "Lama Penyimpanan" : "Storage Duration"} value={storageDays} min={1} max={30} unit={isId ? " hari" : " days"} color="#6366f1" onChange={setStorageDays} />
        <SliderRow label={isId ? "Suhu Penyimpanan" : "Storage Temperature"} value={temp} min={15} max={45} unit="°C" color="#ef4444" onChange={setTemp} />
        <button onClick={handleRun} className="w-full mt-2 py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          {isId ? "📊 Simpan Data" : "📊 Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={isId ? "Kesegaran" : "Freshness"} value={calc.freshness} sub={calc.freshnessLabel} bg="bg-white" />
        <StatCard label={isId ? "Dampak Lingkungan" : "Env. Impact"} value={calc.envImpact} sub={calc.envLabel} bg="bg-white" />
        <StatCard label={isId ? "Limbah" : "Waste"} value={calc.waste} sub={calc.wasteLabel} bg="bg-white" />
      </div>

      {/* Chart */}
      <SimCard className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{isId ? "Perbandingan Waktu Terurai" : "Decomposition Time Comparison"}</p>
        <BarChart height={100} data={[
          { label: isId ? "Daun Jati" : "Teak", value: Math.round((1 - calc.decompTime / 400) * 100), color: "bg-emerald-500" },
          { label: isId ? "Kertas" : "Paper", value: Math.round((1 - 105 / 400) * 100), color: "bg-amber-400" },
          { label: isId ? "Plastik" : "Plastic", value: Math.round((1 - 300 / 400) * 100), color: "bg-red-400" },
        ]} />
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-1">
          <span>{isId ? "Rendah = Ramah" : "Low = Eco-Friendly"}</span>
          <span>→</span>
          <span>{isId ? "Tinggi = Berbahaya" : "High = Harmful"}</span>
        </div>
      </SimCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// UNIT 2: TERASI — Fermentation Simulation
// ─────────────────────────────────────────────

const TerasiSim = ({ onRun }: { onRun: (d: Record<string, unknown>) => void }) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [saltVal, setSaltVal] = useState(50);
  const [dryingDays, setDryingDays] = useState(4);
  const [hygieneVal, setHygieneVal] = useState(70);
  const [temp, setTemp] = useState(30);
  const animRef = useRef<HTMLDivElement>(null);

  const calc = useMemo(() => {
    const safetyRisk = Math.min(100, Math.max(0,
      100 - saltVal * 0.6 - hygieneVal * 0.5 + (7 - dryingDays) * 4 - (temp > 35 ? 15 : 0)
    ));
    const quality = Math.min(100, Math.max(0,
      saltVal * 0.35 + hygieneVal * 0.4 + dryingDays * 5 + (temp > 25 && temp < 38 ? 15 : 0)
    ));
    const fermentation = Math.min(100, Math.max(0,
      saltVal * 0.2 + hygieneVal * 0.3 + dryingDays * 8 + temp * 0.5
    ));
    const label = (v: number) => v >= 67 ? (isId ? "Baik" : "Good") : v >= 34 ? (isId ? "Sedang" : "Medium") : (isId ? "Buruk" : "Low");
    return {
      safetyRisk, quality, fermentation,
      riskLabel: label(100 - safetyRisk),
      qualityLabel: label(quality),
      fermLabel: label(fermentation),
      riskColor: safetyRisk <= 25 ? "text-emerald-600" : safetyRisk <= 50 ? "text-amber-600" : "text-red-600",
    };
  }, [saltVal, dryingDays, hygieneVal, temp, isId]);

  useEffect(() => {
    if (!animRef.current) return;
    const bubbles = animRef.current.querySelectorAll(".bubble");
    bubbles.forEach((b, i) => {
      (b as HTMLElement).style.animationDelay = `${(i % 5) * 0.7}s`;
      (b as HTMLElement).style.left = `${10 + (i % 4) * 22}%`;
    });
  }, [calc.fermentation]);

  const handleRun = () => {
    onRun({ salt: saltVal, drying: dryingDays, hygiene: hygieneVal, temp, risk: calc.safetyRisk, quality: calc.quality, ferm: calc.fermentation });
  };

  return (
    <div className="space-y-4">
      {/* Animated Fermentation Jar */}
      <SimCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {isId ? "Visualisasi Fermentasi Terasi" : "Fermentation Visualization"}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${calc.riskLabel === "Buruk" || calc.riskLabel === "Low" ? "bg-red-500" : calc.riskLabel === "Sedang" || calc.riskLabel === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`}>
            {isId ? "Risiko: " : "Risk: "}{calc.riskLabel}
          </span>
        </div>

        <div ref={animRef} className="relative h-52 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-xl overflow-hidden border border-border/30">
          {/* Background sun/heat glow */}
          <div className="absolute top-2 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-orange-200 animate-pulse" style={{ animationDuration: `${2 + temp / 20}s` }} />
          <div className="text-[9px] text-orange-400 absolute top-12 right-3 font-bold">{temp}°C</div>

          {/* Fermentation Jar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            {/* Jar lid */}
            <div className="w-20 h-3 bg-gradient-to-b from-stone-300 to-stone-400 rounded-t-xl mx-auto shadow-sm border border-stone-500/20" />
            {/* Jar body */}
            <div className="w-24 h-28 bg-gradient-to-b from-slate-100 via-slate-50 to-white rounded-b-2xl shadow-lg border border-slate-300/50 relative overflow-hidden">
              {/* Content fill level */}
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-700 rounded-b-xl"
                style={{
                  height: `${20 + calc.fermentation * 0.7}%`,
                  background: hygieneVal > 60 ? "linear-gradient(to top, #92400e 0%, #b45309 60%, #d97706 100%)" : "linear-gradient(to top, #450a0a 0%, #7f1d1d 60%, #991b1b 100%)"
                }}
              />
              {/* Bubble animation */}
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bubble absolute w-2 h-2 rounded-full animate-bounce opacity-60"
                  style={{
                    bottom: `${20 + calc.fermentation * 0.6}%`,
                    background: hygieneVal > 60 ? "#f59e0b" : "#ef4444",
                    animationDuration: `${1.5 + i * 0.3}s`,
                    display: calc.fermentation > 20 ? "block" : "none"
                  }}
                />
              ))}
              {/* Bacteria symbols */}
              {hygieneVal < 40 && (
                <>
                  <div className="absolute top-4 left-3 text-[12px] animate-pulse">🦠</div>
                  <div className="absolute top-8 right-4 text-[10px] animate-pulse" style={{ animationDelay: "0.5s" }}>🦠</div>
                  <div className="absolute bottom-8 left-6 text-[11px] animate-pulse" style={{ animationDelay: "1s" }}>🦠</div>
                </>
              )}
              {hygieneVal >= 60 && (
                <>
                  <div className="absolute top-3 left-4 text-[11px]">🥇</div>
                  <div className="absolute top-6 right-3 text-[10px]">✨</div>
                </>
              )}
              {/* Salt crystals */}
              {saltVal > 40 && (
                <>
                  <div className="absolute bottom-2 left-3 text-[8px]">·</div>
                  <div className="absolute bottom-3 right-4 text-[8px]">·</div>
                </>
              )}
            </div>
            {/* Jar shadow */}
            <div className="w-24 h-3 bg-black/5 rounded-full mx-auto -mt-1" />
          </div>

          {/* Labels */}
          <div className="absolute bottom-4 left-3 text-[9px] font-bold text-amber-700">
            {isId ? "Garam: " : "Salt: "}{saltVal}%
          </div>
          <div className="absolute bottom-4 right-3 text-[9px] font-bold text-amber-700">
            {isId ? "Kebersihan: " : "Hygiene: "}{hygieneVal}%
          </div>

          {/* Steam */}
          {calc.fermentation > 50 && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-1.5 h-6 bg-white/40 rounded-full animate-ping" style={{ animationDelay: `${i * 0.5}s`, animationDuration: "1.5s" }} />
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-[9px] text-muted-foreground">
          <span>🦠 = Bakteri berbahaya tinggi</span>
          <span>🥇 = Fermentasi baik</span>
          <span>· = Kristal garam</span>
        </div>
      </SimCard>

      {/* Controls */}
      <SimCard className="p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</p>
        <SliderRow label={isId ? "Kadar Garam" : "Salt Level"} value={saltVal} min={0} max={100} color="#6366f1" onChange={setSaltVal} note={isId ? "(pengawetan)" : "(preservation)"} />
        <SliderRow label={isId ? "Waktu Pengeringan" : "Drying Time"} value={dryingDays} min={1} max={7} unit={isId ? " hari" : " days"} color="#f59e0b" onChange={setDryingDays} />
        <SliderRow label={isId ? "Tingkat Kebersihan" : "Hygiene Level"} value={hygieneVal} min={0} max={100} color="#10b981" onChange={setHygieneVal} />
        <SliderRow label={isId ? "Suhu Fermentasi" : "Fermentation Temp"} value={temp} min={20} max={45} unit="°C" color="#ef4444" onChange={setTemp} note="°C" />
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          {isId ? "📊 Simpan Data" : "📊 Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={isId ? "Risiko Keamanan" : "Safety Risk"} value={calc.safetyRisk} sub={calc.riskLabel} bg="bg-white" />
        <StatCard label={isId ? "Kualitas" : "Quality"} value={calc.quality} sub={calc.qualityLabel} bg="bg-white" />
        <StatCard label={isId ? "Fermentasi" : "Fermentation"} value={calc.fermentation} sub={calc.fermLabel} bg="bg-white" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// UNIT 3: EMPAL GENTONG — Clay Pot Cooking
// ─────────────────────────────────────────────

const EmpalGentongSim = ({ onRun }: { onRun: (d: Record<string, unknown>) => void }) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [potType, setPotType] = useState<"clay" | "metal">("clay");
  const [wallThickness, setWallThickness] = useState(5);
  const [heatInput, setHeatInput] = useState(70);
  const [waterVolume, setWaterVolume] = useState(5);
  const [animTemp, setAnimTemp] = useState(0);
  const animRef = useRef<HTMLDivElement>(null);

  const calc = useMemo(() => {
    const isClay = potType === "clay";
    const retention = Math.min(100, Math.max(0, (isClay ? 45 : 20) + wallThickness * 3.5 + heatInput * 0.3 - waterVolume * 2));
    const efficiency = Math.min(100, Math.max(0, (isClay ? 70 : 40) + wallThickness * 2 - heatInput * 0.4 - waterVolume * 3));
    const cookingTime = Math.max(10, (isClay ? 85 : 55) + wallThickness * 3 + waterVolume * 4 - heatInput * 0.5);
    const envImpact = Math.min(100, (isClay ? 15 : 55) + waterVolume * 3 + heatInput * 0.2);
    const label = (v: number) => v >= 67 ? (isId ? "Baik" : "Good") : v >= 34 ? (isId ? "Sedang" : "Medium") : (isId ? "Rendah" : "Low");
    return {
      retention, efficiency, cookingTime, envImpact,
      retLabel: label(retention), effLabel: label(efficiency),
      envLabel: label(100 - envImpact), timeLabel: `${Math.round(cookingTime)} ${isId ? "menit" : "min"}`
    };
  }, [potType, wallThickness, heatInput, waterVolume, isId]);

  // Animate temperature changes
  useEffect(() => {
    let frame: number;
    const target = calc.efficiency;
    const animate = () => {
      setAnimTemp(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.08;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [calc.efficiency]);

  useEffect(() => {
    if (!animRef.current) return;
    const flames = animRef.current.querySelectorAll(".flame");
    flames.forEach((f, i) => {
      (f as HTMLElement).style.animationDelay = `${i * 0.2}s`;
    });
  }, [heatInput]);

  const handleRun = () => {
    onRun({ pot: potType, wall: wallThickness, heat: heatInput, water: waterVolume, retention: calc.retention, efficiency: calc.efficiency, env: calc.envImpact });
  };

  const fireIntensity = heatInput / 100;

  return (
    <div className="space-y-4">
      {/* Animated Cooking Scene */}
      <SimCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {isId ? "Visualisasi Memasak" : "Cooking Visualization"}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${potType === "clay" ? "bg-amber-600" : "bg-slate-600"}`}>
            {potType === "clay" ? (isId ? "🏺 Gentong Tanah Liat" : "🏺 Clay Pot") : (isId ? "🍳 Panci Logam" : "🍳 Metal Pot")}
          </span>
        </div>

        <div ref={animRef} className="relative h-52 bg-gradient-to-b from-orange-50 via-amber-50 to-stone-100 rounded-xl overflow-hidden border border-border/30">
          {/* Fire / heat source */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            {/* Wood fire */}
            <div className="flex items-end gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flame w-3 bg-gradient-to-t from-red-700 via-orange-500 to-yellow-300 rounded-t-full animate-pulse"
                  style={{ height: `${15 + fireIntensity * 25 + i * 2}px`, animationDuration: `${0.3 + i * 0.1}s` }} />
              ))}
            </div>
          </div>

          {/* Stove */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-5 bg-gradient-to-b from-stone-400 to-stone-600 rounded-t-xl shadow-md" />

          {/* Clay/Metal Pot */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            {potType === "clay" ? (
              <div className="relative">
                {/* Clay pot body */}
                <div className="w-28 h-20 bg-gradient-to-b from-amber-200 via-amber-100 to-orange-100 rounded-b-3xl shadow-lg border border-amber-300 relative overflow-hidden">
                  {/* Wall thickness visual */}
                  <div className="absolute inset-1 border border-amber-400/30 rounded-b-3xl" style={{ margin: `${(10 - wallThickness) * 0.5}px` }} />
                  {/* Heat glow from fire */}
                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-orange-400/60 to-transparent transition-opacity" style={{ opacity: fireIntensity * 0.8 }} />
                  {/* Steam */}
                  {calc.efficiency > 50 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-1.5 h-4 bg-gray-300/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${1 + i * 0.3}s` }} />
                      ))}
                    </div>
                  )}
                  {/* Food (empal) */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
                    <div className="w-4 h-2 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full shadow-sm" />
                    <div className="w-3 h-2 bg-gradient-to-r from-amber-300 to-amber-400 rounded-full shadow-sm" />
                  </div>
                  {/* Broth */}
                  <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-amber-800/80 to-amber-600/60 rounded-b-2xl" />
                </div>
                {/* Clay label */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-700 whitespace-nowrap">
                  🏺 {isId ? "Gentong Tanah Liat" : "Clay Pot"} | {isId ? "Dinding: " : "Wall: "}{wallThickness}
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Metal pot body */}
                <div className="w-28 h-20 bg-gradient-to-b from-slate-200 via-slate-100 to-gray-200 rounded-b-2xl shadow-lg border border-slate-400 relative overflow-hidden">
                  {/* Shine */}
                  <div className="absolute top-1 left-2 w-4 h-12 bg-white/40 rounded-r-full" />
                  {/* Heat escaping */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-red-400/40 to-transparent" />
                  {calc.efficiency < 50 && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1">
                      {[1,2].map(i => (
                        <div key={i} className="w-1 h-3 bg-red-300/50 rounded-full animate-ping" style={{ animationDelay: `${i * 0.3}s` }} />
                      ))}
                    </div>
                  )}
                  {/* Broth */}
                  <div className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-amber-800/80 to-amber-600/60 rounded-b-xl" />
                </div>
                {/* Metal label */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600 whitespace-nowrap">
                  🍳 {isId ? "Panci Logam Tipis" : "Thin Metal Pot"} | {isId ? "Dinding: " : "Wall: "}{wallThickness}
                </div>
              </div>
            )}
          </div>

          {/* Thermometer on side */}
          <div className="absolute right-3 bottom-12 flex flex-col items-center">
            <div className="relative w-5 h-16 bg-gradient-to-b from-slate-100 to-slate-200 rounded-full border border-slate-300 overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-400 to-red-300 transition-all duration-700"
                style={{ height: `${Math.min(100, animTemp)}%` }}
              />
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-400 rounded-full border border-red-500" />
            </div>
            <span className="text-[9px] font-bold text-red-500 mt-0.5">{Math.round(animTemp)}%</span>
            <span className="text-[8px] text-muted-foreground">{isId ? "Panas" : "Heat"}</span>
          </div>

          {/* Energy gauge */}
          <div className="absolute top-3 left-3">
            <GaugeChart value={Math.round(calc.efficiency)} label={isId ? "Efisiensi" : "Efficiency"} color="#10b981" size={60} />
          </div>

          {/* Heat input indicator */}
          <div className="absolute top-3 right-3 flex flex-col items-center">
            <div className="text-[9px] font-bold text-orange-500 mb-1">{isId ? "Panas Masuk" : "Heat In"}</div>
            <div className="w-6 h-6 rounded-full border-2 border-orange-400 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-orange-400 animate-pulse" style={{ opacity: fireIntensity }} />
            </div>
          </div>
        </div>
      </SimCard>

      {/* Controls */}
      <SimCard className="p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</p>
        <div className="flex gap-2">
          <button onClick={() => setPotType("clay")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${potType === "clay" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            🏺 {isId ? "Tanah Liat" : "Clay"}
          </button>
          <button onClick={() => setPotType("metal")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${potType === "metal" ? "border-slate-500 bg-slate-50 text-slate-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            🍳 {isId ? "Logam" : "Metal"}
          </button>
        </div>
        <SliderRow label={isId ? "Ketebalan Dinding" : "Wall Thickness"} value={wallThickness} min={1} max={10} color="#92400e" onChange={setWallThickness} />
        <SliderRow label={isId ? "Besar Panas" : "Heat Input"} value={heatInput} min={20} max={100} unit="" color="#ef4444" onChange={setHeatInput} />
        <SliderRow label={isId ? "Volume Air" : "Water Volume"} value={waterVolume} min={1} max={10} color="#3b82f6" onChange={setWaterVolume} />
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          {isId ? "📊 Simpan Data" : "📊 Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={isId ? "Retensi Panas" : "Heat Retention"} value={Math.round(calc.retention)} sub={calc.retLabel} bg="bg-white" />
        <StatCard label={isId ? "Efisiensi Energi" : "Energy Efficiency"} value={Math.round(calc.efficiency)} sub={calc.effLabel} bg="bg-white" />
        <StatCard label={isId ? "Waktu Masak" : "Cook Time"} value={calc.timeLabel} sub={calc.envLabel} bg="bg-white" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// UNIT 4: KERUPUK MELARAT — Sand Frying
// ─────────────────────────────────────────────

const KerupukMelaratSim = ({ onRun }: { onRun: (d: Record<string, unknown>) => void }) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [fryMedium, setFryMedium] = useState<"sand" | "oil">("sand");
  const [fryTemp, setFryTemp] = useState(170);
  const [fryTime, setFryTime] = useState(3);
  const [isReused, setIsReused] = useState(false);
  const animRef = useRef<HTMLDivElement>(null);

  const calc = useMemo(() => {
    const isSand = fryMedium === "sand";
    const oilAbsorption = Math.max(0, Math.min(100,
      isSand ? 8 + fryTemp * 0.05 + fryTime * 1.5 : 35 + fryTemp * 0.12 + fryTime * 3 - (isReused && !isSand ? 5 : 0)
    ));
    const crispiness = Math.min(100, Math.max(0,
      (isSand ? 45 : 35) + fryTemp * 0.25 + fryTime * 5 - (isReused && isSand ? 3 : 0)
    ));
    const energy = Math.min(100, Math.max(0,
      fryTemp * 0.35 + fryTime * 6 - (isSand ? 8 : 0) - (isReused ? 10 : 0)
    ));
    const sustainability = Math.min(100, Math.max(0,
      (isSand ? 75 : 30) + (isReused ? 15 : 0) - fryTemp * 0.08
    ));
    const label = (v: number) => v >= 67 ? (isId ? "Tinggi" : "High") : v >= 34 ? (isId ? "Sedang" : "Medium") : (isId ? "Rendah" : "Low");
    return {
      oilAbsorption, crispiness, energy, sustainability,
      oilLabel: label(oilAbsorption),
      crispLabel: label(crispiness),
      energyLabel: label(energy),
      sustLabel: label(sustainability),
      oilColor: oilAbsorption <= 25 ? "text-emerald-600" : oilAbsorption <= 55 ? "text-amber-600" : "text-red-600",
    };
  }, [fryMedium, fryTemp, fryTime, isReused, isId]);

  useEffect(() => {
    if (!animRef.current) return;
    const particles = animRef.current.querySelectorAll(".particle");
    const shake = animRef.current.querySelector(".food-item");
    particles.forEach((p, i) => {
      (p as HTMLElement).style.animationDelay = `${(i % 4) * 0.4}s`;
    });
    if (shake) {
      (shake as HTMLElement).style.animation = calc.crispiness > 50 ? "fry-shake 0.3s infinite" : "none";
    }
  }, [calc.crispiness, fryMedium]);

  const handleRun = () => {
    onRun({ medium: fryMedium, temp: fryTemp, time: fryTime, reused: isReused, oil: calc.oilAbsorption, crisp: calc.crispiness, energy: calc.energy });
  };

  return (
    <div className="space-y-4">
      {/* Animated Frying Scene */}
      <SimCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {isId ? "Visualisasi Penggorengan" : "Frying Visualization"}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${fryMedium === "sand" ? "bg-amber-600" : "bg-yellow-500"}`}>
            {fryMedium === "sand" ? "🏖️ Pasir" : "🛢️ Minyak"}
          </span>
        </div>

        <div ref={animRef} className="relative h-44 bg-gradient-to-b from-orange-50 via-amber-50 to-amber-100 rounded-xl overflow-hidden border border-border/30">
          {/* Heat source */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="flex gap-1 mb-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-2 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-300 rounded-t-full animate-pulse"
                  style={{ height: `${10 + (fryTemp / 100) * 18}px`, animationDuration: `${0.3 + i * 0.08}s` }} />
              ))}
            </div>
          </div>

          {/* Fryer / Pan */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className={`w-32 h-14 rounded-2xl shadow-lg border-2 ${
              fryMedium === "sand"
                ? "bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 border-amber-500"
                : "bg-gradient-to-b from-yellow-100 via-yellow-200 to-amber-300 border-yellow-400"
            }`}>
              {/* Sand particles */}
              {fryMedium === "sand" && (
                <div className="relative w-full h-full overflow-hidden rounded-2xl">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="particle absolute w-2 h-1.5 bg-gradient-to-br from-amber-600 to-amber-800 rounded-sm"
                      style={{
                        top: `${20 + (i % 3) * 20}%`,
                        left: `${5 + i * 8}%`,
                        animation: `float-sand ${1.5 + i * 0.2}s ease-in-out infinite alternate`,
                        animationDelay: `${(i % 4) * 0.3}s`
                      }}
                    />
                  ))}
                  {/* Heat shimmer over sand */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-amber-400/20" />
                </div>
              )}
              {/* Oil surface */}
              {fryMedium === "oil" && (
                <div className="relative w-full h-full overflow-hidden rounded-2xl">
                  <div className="absolute inset-1 bg-gradient-to-b from-yellow-200/80 via-yellow-300/90 to-yellow-500 rounded-xl animate-pulse" style={{ animationDuration: "2s" }} />
                  {/* Oil shimmer */}
                  {[...Array(3)].map(i => (
                    <div key={i} className="absolute w-6 h-1 bg-yellow-200/50 rounded-full animate-ping" style={{ top: `${20 + i * 25}%`, left: `${10 + i * 25}%`, animationDelay: `${i * 0.5}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Food item (cracker) being fried */}
          <div className="food-item absolute left-1/2 -translate-x-1/2"
            style={{ bottom: fryMedium === "sand" ? "80px" : "80px" }}>
            <div className={`w-10 h-8 flex items-center justify-center text-[18px] transition-all ${
              fryMedium === "sand" ? "opacity-90" : ""
            }`}>
              {fryMedium === "sand" ? "🍘" : "🥠"}
            </div>
            {/* Oil dripping for oil frying */}
            {fryMedium === "oil" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
                {[1,2,3].map(i => (
                  <div key={i} className="w-1 h-2 bg-yellow-300/70 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
            )}
          </div>

          {/* Temperature indicator */}
          <div className="absolute top-3 left-3 flex flex-col items-center">
            <div className="relative w-4 h-14 bg-gradient-to-b from-slate-100 to-slate-200 rounded-full border border-slate-300 overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-500 to-orange-400 transition-all duration-700"
                style={{ height: `${Math.min(100, ((fryTemp - 100) / 80) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-red-500 mt-0.5">{fryTemp}°C</span>
          </div>

          {/* Oil absorption warning */}
          {fryMedium === "oil" && calc.oilAbsorption > 40 && (
            <div className="absolute top-3 right-3 text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg px-2 py-1 animate-pulse">
              ⚠️ {isId ? "Penyerapan Tinggi!" : "High Oil Absorption!"}
            </div>
          )}
          {fryMedium === "sand" && (
            <div className="absolute top-3 right-3 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
              ✅ {isId ? "Rendah Minyak!" : "Low Oil!"}
            </div>
          )}
        </div>

        {/* Medium selector */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setFryMedium("sand")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${fryMedium === "sand" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            🏖️ {isId ? "Pasir Panas" : "Hot Sand"}
          </button>
          <button onClick={() => setFryMedium("oil")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${fryMedium === "oil" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            🛢️ {isId ? "Minyak Goreng" : "Cooking Oil"}
          </button>
        </div>
      </SimCard>

      {/* Controls */}
      <SimCard className="p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</p>
        <SliderRow label={isId ? "Suhu Goreng" : "Frying Temperature"} value={fryTemp} min={120} max={220} unit="°C" color="#ef4444" onChange={setFryTemp} />
        <SliderRow label={isId ? "Waktu Goreng" : "Frying Time"} value={fryTime} min={1} max={8} unit={isId ? " menit" : " min"} color="#f59e0b" onChange={setFryTime} />
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-foreground">{isId ? "Media digunakan ulang" : "Reuse medium"}</span>
          <button
            onClick={() => setIsReused(!isReused)}
            className={`w-12 h-6 rounded-full transition-all relative ${isReused ? "bg-emerald-500" : "bg-slate-300"}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all ${isReused ? "left-6" : "left-0.5"}`} />
          </button>
        </div>
        <button onClick={handleRun} className="w-full py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          {isId ? "📊 Simpan Data" : "📊 Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label={isId ? "Serap Minyak" : "Oil Absorb"} value={Math.round(calc.oilAbsorption)} sub={calc.oilLabel} bg="bg-white" />
        <StatCard label={isId ? "Kerenyahan" : "Crispiness"} value={Math.round(calc.crispiness)} sub={calc.crispLabel} bg="bg-white" />
        <StatCard label={isId ? "Energi" : "Energy"} value={Math.round(calc.energy)} sub={calc.energyLabel} bg="bg-white" />
        <StatCard label={isId ? "Keberlanjutan" : "Sustain."} value={Math.round(calc.sustainability)} sub={calc.sustLabel} bg="bg-white" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// UNIT 5: TAPE KETAN — Fermentation Animation
// ─────────────────────────────────────────────

const TapeKetanSim = ({ onRun }: { onRun: (d: Record<string, unknown>) => void }) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [fermTime, setFermTime] = useState(36);
  const [fermTemp, setFermTemp] = useState(28);
  const [packaging, setPackaging] = useState<"banana" | "plastic">("banana");
  const [starterQuality, setStarterQuality] = useState<"good" | "medium" | "poor">("good");
  const animRef = useRef<HTMLDivElement>(null);

  const calc = useMemo(() => {
    const starterMult = starterQuality === "good" ? 1.2 : starterQuality === "medium" ? 0.8 : 0.4;
    const tempOptimal = fermTemp >= 25 && fermTemp <= 32;
    const sweetness = Math.min(100, Math.max(0, (fermTime <= 48 ? fermTime * 1.5 : 72 - (fermTime - 48) * 2) * starterMult + (tempOptimal ? 15 : -10)));
    const acidity = Math.min(100, Math.max(0, fermTime > 48 ? (fermTime - 48) * 1.5 + (tempOptimal ? 0 : 10) : fermTime * 0.5));
    const shelfLife = Math.min(100, Math.max(0, 80 - acidity * 0.6 + (packaging === "banana" ? 10 : 0)));
    const aroma = Math.min(100, Math.max(0, sweetness * 0.5 + acidity * 0.3 + starterMult * 20));
    const label = (v: number) => v >= 67 ? (isId ? "Baik" : "Good") : v >= 34 ? (isId ? "Sedang" : "Medium") : (isId ? "Buruk" : "Low");
    return {
      sweetness, acidity, shelfLife, aroma,
      sweetLabel: label(sweetness),
      acidLabel: label(acidity),
      shelfLabel: label(shelfLife),
      tempOptimal,
    };
  }, [fermTime, fermTemp, packaging, starterQuality, isId]);

  useEffect(() => {
    if (!animRef.current) return;
    const bubbles = animRef.current.querySelectorAll(".ferm-bubble");
    const yeasts = animRef.current.querySelectorAll(".yeast");
    bubbles.forEach((b, i) => {
      (b as HTMLElement).style.animationDelay = `${(i % 6) * 0.5}s`;
      (b as HTMLElement).style.left = `${10 + (i % 5) * 18}%`;
    });
    yeasts.forEach((y, i) => {
      (y as HTMLElement).style.animationDelay = `${i * 0.8}s`;
    });
  }, [calc.sweetness, calc.aroma]);

  const handleRun = () => {
    onRun({ time: fermTime, temp: fermTemp, packaging, starter: starterQuality, sweet: calc.sweetness, acid: calc.acidity, shelf: calc.shelfLife });
  };

  return (
    <div className="space-y-4">
      {/* How-to banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-2xl shrink-0">🍚</span>
        <div>
          <p className="text-[11px] font-bold text-amber-800 mb-1">{isId ? "Cara Menggunakan Simulasi Tape Ketan" : "How to Use the Tape Ketan Simulation"}</p>
          <ol className="text-[10px] text-amber-700 space-y-0.5 list-decimal pl-3">
            <li>{isId ? "Atur waktu fermentasi, suhu, kemasan, dan kualitas ragi" : "Set fermentation time, temperature, packaging, and starter quality"}</li>
            <li>{isId ? "Lihat perubahan pada grafik Manis / Asam / Daya Simpan" : "Watch the Sweetness / Acidity / Shelf Life metrics change"}</li>
            <li>{isId ? "Klik 'Simpan Data' untuk mencatat hasil ke tabel" : "Click 'Record Data' to save results to the table"}</li>
            <li>{isId ? "Gunakan data untuk menjawab soal" : "Use the data to answer the questions"}</li>
          </ol>
        </div>
      </div>
      {/* Animated Tape Fermentation */}
      <SimCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {isId ? "Visualisasi Fermentasi Tape" : "Fermentation Visualization"}
          </p>
          <div className="flex gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${packaging === "banana" ? "bg-emerald-500" : "bg-blue-500"}`}>
              {packaging === "banana" ? "🍌🍃" : "🛍️"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${starterQuality === "good" ? "bg-emerald-500" : starterQuality === "medium" ? "bg-amber-500" : "bg-red-500"}`}>
              {starterQuality}
            </span>
          </div>
        </div>

        <div ref={animRef} className="relative h-44 bg-gradient-to-b from-green-50 via-emerald-50 to-lime-50 rounded-xl overflow-hidden border border-border/30">
          {/* Banana leaf base */}
          {packaging === "banana" && (
            <div className="absolute inset-0 flex items-end justify-center">
              {/* Banana leaf shape */}
              <div className="w-40 h-20 bg-gradient-to-t from-emerald-800 via-emerald-600 to-emerald-500 rounded-t-full shadow-lg relative overflow-hidden">
                {/* Leaf veins */}
                <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 160 80">
                  {[...Array(8)].map((_, i) => (
                    <line key={i} x1="80" y1="80" x2={10 + i * 20} y2="0" stroke="#166534" strokeWidth="1" />
                  ))}
                </svg>
                {/* Tape rice inside */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-28 h-10 bg-gradient-to-b from-white via-stone-50 to-stone-100 rounded-lg shadow-inner border border-stone-200 overflow-hidden">
                  {/* Fermentation bubbles */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="ferm-bubble absolute w-2 h-2 rounded-full animate-bounce"
                      style={{
                        bottom: `${5 + i * 3}%`,
                        background: calc.sweetness > 50 ? "#fbbf24" : calc.sweetness > 25 ? "#f59e0b" : "#92400e",
                        opacity: calc.sweetness > 10 ? 0.6 : 0.2,
                        animationDuration: `${1.5 + i * 0.3}s`
                      }}
                    />
                  ))}
                  {/* Yeast bloom */}
                  {calc.aroma > 50 && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="yeast w-1.5 h-1.5 rounded-full bg-white/70 animate-ping"
                          style={{ animationDuration: `${2 + i * 0.5}s` }} />
                      ))}
                    </div>
                  )}
                  {/* Sweet scent lines */}
                  {calc.sweetness > 60 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
                      <span className="text-[10px] animate-bounce" style={{ animationDuration: "1s" }}>🍚</span>
                      <span className="text-[10px] animate-bounce" style={{ animationDelay: "0.3s" }}>✨</span>
                      <span className="text-[10px] animate-bounce" style={{ animationDelay: "0.6s" }}>🍚</span>
                    </div>
                  )}
                </div>
                {/* Label */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-700 whitespace-nowrap">
                  🍌🍃 {isId ? "Daun Pisang Alami" : "Natural Banana Leaf"}
                </div>
              </div>
            </div>
          )}

          {/* Plastic wrap alternative */}
          {packaging === "plastic" && (
            <div className="absolute inset-0 flex items-end justify-center">
              <div className="relative w-36 h-16 mb-4">
                <div className="w-full h-full bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 rounded-lg shadow-md border border-blue-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-200/20" />
                  {/* Shine */}
                  <div className="absolute top-1 left-2 w-3 h-10 bg-white/40 rounded-r-full" />
                  {/* Rice inside */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-8 bg-stone-100 rounded border border-stone-200 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="ferm-bubble absolute w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ bottom: `${10 + i * 20}%`, left: `${20 + i * 15}%`, background: "#d97706", opacity: calc.sweetness > 10 ? 0.5 : 0.2 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-600 whitespace-nowrap">
                  🛍️ {isId ? "Plastik" : "Plastic"} ⚠️
                </div>
              </div>
            </div>
          )}

          {/* Temperature indicator */}
          <div className="absolute top-3 left-3">
            <div className="text-[9px] font-bold text-orange-500 mb-0.5">{fermTemp}°C</div>
            <div className={`text-[8px] ${calc.tempOptimal ? "text-emerald-500" : "text-red-400"}`}>
              {calc.tempOptimal ? "✅ Optimal" : "⚠️ " + (fermTemp < 25 ? (isId ? "Terlalu Dingin" : "Too Cold") : (isId ? "Terlalu Panas" : "Too Hot"))}
            </div>
          </div>

          {/* Timer */}
          <div className="absolute top-3 right-3 text-right">
            <div className="text-[12px] font-bold text-amber-700">{fermTime}h</div>
            <div className="text-[8px] text-muted-foreground">{isId ? "Waktu Fermentasi" : "Ferm. Time"}</div>
          </div>

          {/* Acidity warning */}
          {calc.acidity > 60 && (
            <div className="absolute top-12 right-3 text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
              ⚠️ {isId ? "Terlalu Asam!" : "Too Sour!"}
            </div>
          )}

          {/* Yeast bloom particles */}
          {calc.aroma > 40 && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-yellow-300/60 animate-ping"
                  style={{ animationDelay: `${i * 0.4}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Packaging selector */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setPackaging("banana")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${packaging === "banana" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            🍌🍃 {isId ? "Daun Pisang" : "Banana Leaf"}
          </button>
          <button onClick={() => setPackaging("plastic")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${packaging === "plastic" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            🛍️ {isId ? "Plastik" : "Plastic"}
          </button>
        </div>
      </SimCard>

      {/* Controls */}
      <SimCard className="p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</p>
        <SliderRow label={isId ? "Waktu Fermentasi" : "Fermentation Time"} value={fermTime} min={12} max={96} unit="h" color="#10b981" onChange={setFermTime} />
        <SliderRow label={isId ? "Suhu Fermentasi" : "Fermentation Temp"} value={fermTemp} min={15} max={45} unit="°C" color="#ef4444" onChange={setFermTemp} />
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-foreground">{isId ? "Kualitas Starter (Ragi)" : "Starter Quality"}</div>
          <div className="flex gap-2">
            {(["good", "medium", "poor"] as const).map(s => (
              <button key={s} onClick={() => setStarterQuality(s)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${starterQuality === s ? (s === "good" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : s === "medium" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-red-500 bg-red-50 text-red-700") : "border-border/40 bg-white text-muted-foreground"}`}>
                {s === "good" ? "🥇" : s === "medium" ? "🥈" : "🥉"} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          {isId ? "📊 Simpan Data" : "📊 Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics with progress bars */}
      <SimCard className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{isId ? "Hasil Fermentasi Saat Ini" : "Current Fermentation Results"}</p>
        <div className="space-y-3">
          {[
            { label: isId ? "🍬 Rasa Manis" : "🍬 Sweetness", value: Math.round(calc.sweetness), color: "bg-amber-400", textColor: "text-amber-700" },
            { label: isId ? "🍋 Keasaman" : "🍋 Acidity", value: Math.round(calc.acidity), color: "bg-red-400", textColor: "text-red-700" },
            { label: isId ? "📦 Daya Simpan" : "📦 Shelf Life", value: Math.round(calc.shelfLife), color: "bg-emerald-500", textColor: "text-emerald-700" },
          ].map(({ label, value, color, textColor }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-foreground">{label}</span>
                <span className={`text-[13px] font-bold ${textColor}`}>{value}/100</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 italic">
          {isId ? "💡 Fermentasi optimal: 36–48 jam, suhu 25–32°C, ragi baik, kemasan daun pisang" : "💡 Optimal: 36–48h, 25–32°C, good starter, banana leaf packaging"}
        </p>
      </SimCard>
    </div>
  );
};

// ─────────────────────────────────────────────
// UNIT 6: MANGROVE ECOSYSTEM
// ─────────────────────────────────────────────

const MangroveSim = ({ onRun }: { onRun: (d: Record<string, unknown>) => void }) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [mangroveCover, setMangroveCover] = useState(70);
  const [waveStrength, setWaveStrength] = useState(50);
  const [coastalUse, setCoastalUse] = useState<"natural" | "housing" | "ponds">("natural");
  const animRef = useRef<HTMLDivElement>(null);

  const calc = useMemo(() => {
    const erosion = Math.max(0, Math.min(100,
      waveStrength * 0.7 + (100 - mangroveCover) * 0.5 - (coastalUse === "natural" ? 20 : coastalUse === "housing" ? 10 : 5)
    ));
    const fishProduction = Math.min(100, Math.max(0,
      mangroveCover * 0.65 - waveStrength * 0.2 + (coastalUse === "natural" ? 20 : coastalUse === "housing" ? 5 : -10)
    ));
    const carbonStorage = Math.min(100, Math.max(0, mangroveCover * 0.8 + (coastalUse === "natural" ? 15 : 0)));
    const biodiversity = Math.min(100, Math.max(0,
      mangroveCover * 0.6 - (coastalUse !== "natural" ? 25 : 0)
    ));
    const floodRisk = Math.max(0, Math.min(100, (100 - mangroveCover) * 0.7 + waveStrength * 0.3 + (coastalUse === "ponds" ? 15 : 0)));
    const label = (v: number) => v >= 67 ? (isId ? "Baik" : "Good") : v >= 34 ? (isId ? "Sedang" : "Medium") : (isId ? "Buruk" : "Low");
    const riskLabel = (v: number) => v >= 67 ? (isId ? "Tinggi" : "High") : v >= 34 ? (isId ? "Sedang" : "Medium") : (isId ? "Rendah" : "Low");
    return {
      erosion, fishProduction, carbonStorage, biodiversity, floodRisk,
      erosionLabel: label(100 - erosion),
      fishLabel: label(fishProduction),
      carbonLabel: label(carbonStorage),
      biodivLabel: label(biodiversity),
      floodLabel: riskLabel(floodRisk),
    };
  }, [mangroveCover, waveStrength, coastalUse, isId]);

  useEffect(() => {
    if (!animRef.current) return;
    const waves = animRef.current.querySelectorAll(".wave");
    const trees = animRef.current.querySelectorAll(".mangrove-tree");
    waves.forEach((w, i) => {
      (w as HTMLElement).style.animationDuration = `${4 - waveStrength / 30}s`;
      (w as HTMLElement).style.opacity = String(0.3 + waveStrength / 200);
    });
    trees.forEach((t, i) => {
      (t as HTMLElement).style.transform = `scale(${0.4 + (mangroveCover / 100) * 0.6})`;
    });
  }, [mangroveCover, waveStrength]);

  const handleRun = () => {
    onRun({ cover: mangroveCover, waves: waveStrength, use: coastalUse, erosion: calc.erosion, fish: calc.fishProduction, carbon: calc.carbonStorage, flood: calc.floodRisk });
  };

  return (
    <div className="space-y-4">
      {/* Animated Mangrove Coastline */}
      <SimCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {isId ? "Visualisasi Ekosistem Mangrove" : "Mangrove Ecosystem Visualization"}
          </p>
          <div className="flex gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${coastalUse === "natural" ? "bg-emerald-500" : coastalUse === "housing" ? "bg-slate-500" : "bg-blue-400"}`}>
              {coastalUse === "natural" ? "🌿" : coastalUse === "housing" ? "🏠" : "🐟"} {coastalUse}
            </span>
          </div>
        </div>

        <div ref={animRef} className="relative h-48 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 rounded-xl overflow-hidden border border-border/30">
          {/* Sky */}
          <div className="absolute top-2 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 shadow-lg animate-pulse" />

          {/* Ocean */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-200 to-blue-300 overflow-hidden">
            {/* Waves */}
            {[1,2,3,4].map(i => (
              <div key={i} className="wave absolute w-full h-6 bg-gradient-to-t from-blue-300/60 to-transparent rounded-full"
                style={{ top: `${4 + i * 4}px`, animation: `wave-move ${3 + i * 0.5}s ease-in-out infinite alternate` }}
              />
            ))}
            {/* Fish */}
            {calc.fishProduction > 40 && (
              <div className="absolute top-8 left-6 text-[16px] animate-bounce" style={{ animationDuration: "2s" }}>🐟</div>
            )}
            {calc.fishProduction > 70 && (
              <div className="absolute top-12 left-16 text-[14px] animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>🐠</div>
            )}
            {calc.fishProduction < 30 && (
              <div className="absolute top-8 left-8 text-[12px] opacity-40">🐟</div>
            )}
          </div>

          {/* Mangrove forest */}
          <div className="absolute top-14 left-0 right-0 h-24 bg-gradient-to-t from-emerald-800 via-emerald-700 to-emerald-600 overflow-hidden"
            style={{ height: `${mangroveCover * 0.24}px`, transition: "height 0.8s ease" }}>
            {/* Tree canopies */}
            {mangroveCover > 20 && [...Array(Math.ceil(mangroveCover / 15))].map((_, i) => (
              <div key={i} className="mangrove-tree absolute text-[20px]" style={{ bottom: 0, left: `${5 + i * 8}%`, fontSize: `${14 + mangroveCover / 10}px` }}>
                🌳
              </div>
            ))}
            {/* Pneumatophores (mangrove roots) */}
            {mangroveCover > 40 && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-around">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-0.5 bg-emerald-900" style={{ height: `${8 + (mangroveCover / 10)}px` }} />
                ))}
              </div>
            )}
            {/* Birds */}
            {mangroveCover > 60 && (
              <div className="absolute top-1 right-8 text-[12px] animate-bounce" style={{ animationDuration: "3s" }}>🐦</div>
            )}
          </div>

          {/* Shoreline / coast */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-amber-300 to-amber-200">
            {/* Coastal use indicators */}
            {coastalUse === "housing" && (
              <div className="absolute bottom-1 right-4 text-[16px]">🏠</div>
            )}
            {coastalUse === "ponds" && (
              <div className="absolute bottom-1 left-1/3 text-[14px]">🐟🐟</div>
            )}
            {coastalUse === "natural" && (
              <div className="absolute bottom-1 right-6 text-[12px]">🐚</div>
            )}
            {/* Erosion cracks */}
            {calc.erosion > 50 && (
              <div className="absolute top-1 left-4 flex flex-col gap-0.5">
                <div className="w-3 h-0.5 bg-amber-600 rounded" />
                <div className="w-2 h-0.5 bg-amber-600/60 rounded" />
                <div className="w-4 h-0.5 bg-amber-600/40 rounded" />
              </div>
            )}
          </div>

          {/* Mangrove coverage label */}
          <div className="absolute top-3 left-3">
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5 border border-emerald-200">
              🌿 {mangroveCover}%
            </div>
          </div>

          {/* Wave strength */}
          <div className="absolute top-3 left-20">
            <div className="text-[10px] font-bold text-blue-600 bg-blue-100 rounded px-1.5 py-0.5 border border-blue-200">
              🌊 {waveStrength}%
            </div>
          </div>
        </div>
      </SimCard>

      {/* Controls */}
      <SimCard className="p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</p>
        <SliderRow label={isId ? "Tutupan Mangrove" : "Mangrove Cover"} value={mangroveCover} min={0} max={100} color="#10b981" onChange={setMangroveCover} note="%">
          {(m)}
        </SliderRow>
        <SliderRow label={isId ? "Kekuatan Gelombang" : "Wave Strength"} value={waveStrength} min={10} max={100} color="#3b82f6" onChange={setWaveStrength} note="%" />
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-foreground">{isId ? "Penggunaan Lahan Pesisir" : "Coastal Land Use"}</div>
          <div className="flex gap-2">
            {([["natural", "🌿 Natural"], ["housing", "🏠 Housing"], ["ponds", "🐟 Ponds"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setCoastalUse(val)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${coastalUse === val ? (val === "natural" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : val === "housing" ? "border-slate-500 bg-slate-50 text-slate-700" : "border-blue-500 bg-blue-50 text-blue-700") : "border-border/40 bg-white text-muted-foreground"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          {isId ? "📊 Simpan Data" : "📊 Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics */}
      <div className="grid grid-cols-5 gap-1.5">
        <StatCard label={isId ? "Abrasi" : "Erosion"} value={Math.round(calc.erosion)} sub={calc.erosionLabel} bg="bg-white" />
        <StatCard label={isId ? "Ikan" : "Fish"} value={Math.round(calc.fishProduction)} sub={calc.fishLabel} bg="bg-white" />
        <StatCard label={isId ? "Karbon" : "Carbon"} value={Math.round(calc.carbonStorage)} sub={calc.carbonLabel} bg="bg-white" />
        <StatCard label={isId ? "Biodiv." : "Biodiv."} value={Math.round(calc.biodiversity)} sub={calc.biodivLabel} bg="bg-white" />
        <StatCard label={isId ? "Risiko Banjir" : "Flood"} value={Math.round(calc.floodRisk)} sub={calc.floodLabel} bg="bg-white" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// UNIT 7: NADRAN — Marine Sustainability
// ─────────────────────────────────────────────

const NadranSim = ({ onRun }: { onRun: (d: Record<string, unknown>) => void }) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [fishingIntensity, setFishingIntensity] = useState(50);
  const [communityAwareness, setCommunityAwareness] = useState(60);
  const [wasteManagement, setWasteManagement] = useState(50);
  const [conservationEfforts, setConservationEfforts] = useState(40);
  const animRef = useRef<HTMLDivElement>(null);

  const calc = useMemo(() => {
    const awarenessReducesFishing = communityAwareness > 60 ? 20 : communityAwareness > 30 ? 10 : 0;
    const effectiveFishing = Math.max(0, Math.min(100, fishingIntensity - awarenessReducesFishing));
    const fishPopulation = Math.max(0, Math.min(100,
      100 - effectiveFishing * 0.8 + conservationEfforts * 0.3 - (100 - wasteManagement) * 0.2
    ));
    const waterQuality = Math.max(0, Math.min(100,
      wasteManagement * 0.6 + conservationEfforts * 0.3 + (100 - fishingIntensity) * 0.1
    ));
    const marineBiodiversity = Math.max(0, Math.min(100,
      fishPopulation * 0.5 + conservationEfforts * 0.4 + waterQuality * 0.3
    ));
    const sustainabilityScore = Math.round((fishPopulation + waterQuality + marineBiodiversity + (100 - effectiveFishing)) / 4);
    const label = (v: number) => v >= 67 ? (isId ? "Baik" : "Good") : v >= 34 ? (isId ? "Sedang" : "Medium") : (isId ? "Buruk" : "Low");
    return {
      fishPopulation, waterQuality, marineBiodiversity, sustainabilityScore, effectiveFishing,
      fishLabel: label(fishPopulation),
      waterLabel: label(waterQuality),
      biodivLabel: label(marineBiodiversity),
      sustLabel: label(sustainabilityScore),
    };
  }, [fishingIntensity, communityAwareness, wasteManagement, conservationEfforts, isId]);

  useEffect(() => {
    if (!animRef.current) return;
    const fish = animRef.current.querySelectorAll(".sim-fish");
    const boats = animRef.current.querySelectorAll(".boat");
    fish.forEach((f, i) => {
      (f as HTMLElement).style.animationDuration = `${3 + i * 0.7}s`;
      (f as HTMLElement).style.opacity = calc.fishPopulation > 60 ? "1" : calc.fishPopulation > 30 ? "0.5" : "0.2";
    });
    boats.forEach((b, i) => {
      (b as HTMLElement).style.transform = `translateX(${(fishingIntensity / 100) * 20 - 10}px)`;
    });
  }, [calc.fishPopulation, fishingIntensity]);

  const handleRun = () => {
    onRun({ fishing: fishingIntensity, awareness: communityAwareness, waste: wasteManagement, conservation: conservationEfforts, fish: calc.fishPopulation, water: calc.waterQuality, biodiv: calc.marineBiodiversity });
  };

  return (
    <div className="space-y-4">
      {/* Animated Marine Ecosystem */}
      <SimCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {isId ? "Visualisasi Ekosistem Laut Cirebon" : "Cirebon Marine Ecosystem"}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${communityAwareness > 60 ? "bg-emerald-500" : communityAwareness > 30 ? "bg-amber-500" : "bg-red-500"}`}>
            👁️ {communityAwareness}%
          </span>
        </div>

        <div ref={animRef} className="relative h-44 bg-gradient-to-b from-sky-300 via-sky-200 to-blue-400 rounded-xl overflow-hidden border border-border/30">
          {/* Sun */}
          <div className="absolute top-2 right-3 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 shadow-lg animate-pulse" />

          {/* Clouds */}
          <div className="absolute top-2 left-4 text-[14px] opacity-60 animate-bounce" style={{ animationDuration: "4s" }}>☁️</div>
          <div className="absolute top-4 left-20 text-[10px] opacity-40 animate-bounce" style={{ animationDuration: "5s" }}>☁️</div>

          {/* Fishing boats */}
          {fishingIntensity > 30 && (
            <div className="absolute top-6 flex gap-4">
              {[1,2,3].slice(0, Math.ceil(fishingIntensity / 33)).map(i => (
                <div key={i} className="boat text-[18px] transition-transform duration-700"
                  style={{ animation: `boat-sway ${2 + i * 0.3}s ease-in-out infinite alternate` }}>
                  🚤
                </div>
              ))}
            </div>
          )}

          {/* Ocean water */}
          <div className="absolute top-14 left-0 right-0 bottom-0 bg-gradient-to-b from-blue-300/80 to-blue-500/90 overflow-hidden">
            {/* Wave lines */}
            {[1,2,3].map(i => (
              <div key={i} className="absolute w-full h-1 bg-blue-200/30 rounded-full"
                style={{ top: `${10 + i * 20}%`, animation: `wave-move 3s ease-in-out infinite alternate`, animationDelay: `${i * 0.5}s` }} />
            ))}

            {/* Fish population visualization */}
            <div className="absolute bottom-4 left-0 right-0 flex items-end justify-center gap-1 px-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="sim-fish text-[10px] animate-bounce transition-opacity"
                  style={{
                    opacity: i < calc.fishPopulation / 5 ? 1 : 0.15,
                    animationDuration: `${2 + (i % 4) * 0.5}s`,
                    animationDelay: `${(i % 5) * 0.3}s`,
                    transform: i % 2 === 0 ? "scaleX(1)" : "scaleX(-1)"
                  }}>
                  🐟
                </div>
              ))}
            </div>

            {/* Coral / reef */}
            {calc.waterQuality > 50 && (
              <div className="absolute bottom-0 left-4 text-[16px]">🪸</div>
            )}
            {calc.waterQuality > 70 && (
              <div className="absolute bottom-0 right-8 text-[14px]">🦀</div>
            )}

            {/* Waste indicator */}
            {(100 - calc.waterQuality) > 40 && (
              <div className="absolute top-2 right-4 text-[12px] animate-pulse">🗑️⚠️</div>
            )}

            {/* Conservation indicator */}
            {calc.marineBiodiversity > 60 && (
              <div className="absolute top-2 left-4 text-[12px]">🐠🦈🐙</div>
            )}
          </div>

          {/* Labels */}
          <div className="absolute bottom-10 left-3 text-[9px] font-bold text-white bg-black/30 rounded px-1.5 py-0.5">
            🐟 {isId ? "Populasi: " : "Fish: "}{Math.round(calc.fishPopulation)}%
          </div>
          <div className="absolute bottom-10 right-3 text-[9px] font-bold text-white bg-black/30 rounded px-1.5 py-0.5">
            🌊 {isId ? "Ikan Tangkap: " : "Fishing: "}{fishingIntensity}%
          </div>
        </div>
      </SimCard>

      {/* Controls */}
      <SimCard className="p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</p>
        <SliderRow label={isId ? "Intensitas Penangkapan" : "Fishing Intensity"} value={fishingIntensity} min={10} max={100} color="#3b82f6" onChange={setFishingIntensity} note="%" />
        <SliderRow label={isId ? "Kesadaran Masyarakat" : "Community Awareness"} value={communityAwareness} min={0} max={100} color="#10b981" onChange={setCommunityAwareness} note="%" />
        <SliderRow label={isId ? "Pengelolaan Limbah" : "Waste Management"} value={wasteManagement} min={0} max={100} color="#8b5cf6" onChange={setWasteManagement} note="%" />
        <SliderRow label={isId ? "Upaya Konservasi" : "Conservation Efforts"} value={conservationEfforts} min={0} max={100} color="#f59e0b" onChange={setConservationEfforts} note="%" />
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          {isId ? "📊 Simpan Data" : "📊 Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard label={isId ? "Populasi Ikan" : "Fish Pop."} value={Math.round(calc.fishPopulation)} sub={calc.fishLabel} bg="bg-white" />
        <StatCard label={isId ? "Kualitas Air" : "Water Quality"} value={Math.round(calc.waterQuality)} sub={calc.waterLabel} bg="bg-white" />
        <StatCard label={isId ? "Keanekaragaman" : "Biodiv."} value={Math.round(calc.marineBiodiversity)} sub={calc.biodivLabel} bg="bg-white" />
        <StatCard label={isId ? "Skor Keberlanjutan" : "Sustainability"} value={Math.round(calc.sustainabilityScore)} sub={calc.sustLabel} bg="bg-white" />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export const SimulationEngine = ({ unit, onRun }: {
  unit: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onRun?: (unitData: Record<string, unknown>) => void;
}) => {
  switch (unit) {
    case 1: return <NasiJamblangSim onRun={onRun || (() => {})} />;
    case 2: return <TerasiSim onRun={onRun || (() => {})} />;
    case 3: return <EmpalGentongSim onRun={onRun || (() => {})} />;
    case 4: return <KerupukMelaratSim onRun={onRun || (() => {})} />;
    case 5: return <TapeKetanSim onRun={onRun || (() => {})} />;
    case 6: return <MangroveSim onRun={onRun || (() => {})} />;
    case 7: return <NadranSim onRun={onRun || (() => {})} />;
    default: return null;
  }
};
