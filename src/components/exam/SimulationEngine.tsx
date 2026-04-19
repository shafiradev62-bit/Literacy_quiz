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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-700 whitespace-nowrap flex items-center gap-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="#22c55e"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/></svg>
                  {isId ? "Daun Jati Alami" : "Natural Teak Leaf"}
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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-600 whitespace-nowrap flex items-center gap-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="#3b82f6"/><line x1="3" y1="6" x2="21" y2="6" stroke="#1d4ed8" strokeWidth="2"/><path d="M16 10a4 4 0 0 1-8 0" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/></svg>
                  {isId ? "Plastik - 500 tahun terurai" : "Plastic - 500 yrs to decompose"}
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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-600 whitespace-nowrap flex items-center gap-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f1f5f9"/><polyline points="14,2 14,8 20,8" fill="#e2e8f0"/><line x1="8" y1="13" x2="16" y2="13" stroke="#cbd5e1" strokeWidth="1.5"/><line x1="8" y1="17" x2="13" y2="17" stroke="#cbd5e1" strokeWidth="1.5"/></svg>
                  {isId ? "Kertas - 150 hari terurai" : "Paper - 150 days to decompose"}
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
              <span className="text-[9px] text-blue-400 font-bold ml-1 mt-0.5 flex items-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#f59e0b"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="white"/></svg></span>
            </div>
          )}
          {packType === "teak" && (
            <div className="absolute top-24 left-8 flex gap-1 items-center">
              {[1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: `${i * 0.6}s` }} />
              ))}
              <span className="text-[9px] text-emerald-500 font-bold flex items-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 3l-1.5 4.5L7 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3z" fill="#22c55e"/><path d="M5.6 11.5L2 15l3.5 1.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/><path d="M18.4 11.5L22 15l-3.5 1.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 17l-3 3.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 17l3 3.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/></svg></span>
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
              {p === "teak" ? (isId ? "Daun Jati" : "Teak Leaf") : p === "paper" ? (isId ? "Kertas" : "Paper") : (isId ? "Plastik" : "Plastic")}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
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
  const [heatInput, setHeatInput] = useState(80);
  const [waterVolume, setWaterVolume] = useState(4);
  const [runs, setRuns] = useState<Record<string, unknown>[]>([]);

  const calc = useMemo(() => {
    const isClay = potType === "clay";
    const retention = Math.min(100, Math.max(0, (isClay ? 45 : 20) + wallThickness * 3.5 + heatInput * 0.3 - waterVolume * 2));
    const efficiency = Math.min(100, Math.max(0, (isClay ? 70 : 40) + wallThickness * 2 - heatInput * 0.4 - waterVolume * 3));
    const heatLoss = Math.max(0, 100 - retention);
    return { retention, efficiency, heatLoss };
  }, [potType, wallThickness, heatInput, waterVolume]);

  const handleRecord = () => {
    const data = {
      pot: potType === "clay" ? (isId ? "Tanah Liat" : "Clay") : (isId ? "Logam" : "Metal"),
      wall: wallThickness,
      heat: heatInput,
      water: waterVolume,
      retention: Math.round(calc.retention),
      efficiency: Math.round(calc.efficiency)
    };
    onRun(data);
    setRuns(prev => [data, ...prev.slice(0, 3)]);
  };

  const handleClear = () => setRuns([]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Modern Bento Control Card */}
        <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-200 shadow-2xl p-8 space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-slate-900 tracking-tight">{isId ? "Simulasi Konsep Kalor" : "Heat Concept Simulation"}</h3>
             <div className="px-3 py-1 bg-amber-100 rounded-full text-[10px] font-bold text-amber-600 uppercase">Unit 03</div>
          </div>
          
          <div className="space-y-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{isId ? "Konfigurasi Wadah" : "Vessel Configuration"}</p>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button 
                onClick={() => setPotType("clay")}
                className={`py-3 rounded-xl text-[11px] font-bold uppercase transition-all ${potType === 'clay' ? "bg-white text-amber-700 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
              >
                {isId ? "Tanah Liat" : "Clay Pot"}
              </button>
              <button 
                onClick={() => setPotType("metal")}
                className={`py-3 rounded-xl text-[11px] font-bold uppercase transition-all ${potType === 'metal' ? "bg-white text-slate-700 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
              >
                {isId ? "Logam" : "Metal Pot"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[
              { l: isId ? "Ketebalan Dinding" : "Wall Thickness", v: wallThickness, set: setWallThickness, min: 1, max: 10, u: "cm", c: "amber" },
              { l: isId ? "Intensitas Panas" : "Heat Intensity", v: heatInput, set: setHeatInput, min: 0, max: 100, u: "%", c: "orange" },
              { l: isId ? "Volume Kaldu" : "Broth Volume", v: waterVolume, set: setWaterVolume, min: 1, max: 10, u: "L", c: "blue" },
            ].map(s => (
              <div key={s.l} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.l}</span>
                  <span className="text-[16px] font-bold text-slate-900">{s.v}<small className="text-[10px] ml-1 opacity-40 uppercase font-bold">{s.u}</small></span>
                </div>
                <input 
                  type="range" min={s.min} max={s.max} value={s.v} 
                  onChange={e => s.set(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button onClick={handleRecord} className="flex-1 py-5 bg-slate-900 text-white font-bold rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-widest uppercase">
               {isId ? "CATAT DATA" : "RECORD DATA"}
            </button>
            <button onClick={handleClear} className="px-6 py-5 bg-slate-100 text-slate-400 font-bold rounded-3xl hover:bg-slate-200 transition-all text-xs tracking-widest uppercase">
               {isId ? "HAPUS" : "CLEAR"}
            </button>
          </div>
        </div>

        {/* Stunning Visual Pot Scene */}
        <div className="w-full lg:w-[420px] bg-slate-900 rounded-[40px] shadow-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-60" />
          {/* Subtle glow behind the pot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
          
          <svg viewBox="0 0 200 240" className="w-full h-full relative z-10 drop-shadow-2xl translate-y-4" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="premium-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={potType==='clay'?"#a16207":"#94a3b8"} />
                <stop offset="60%" stopColor={potType==='clay'?"#713f12":"#475569"} />
                <stop offset="100%" stopColor={potType==='clay'?"#451a03":"#1e293b"} />
              </linearGradient>
              <radialGradient id="rimGlow" cx="50%" cy="0%" r="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="liquidSurfaceGrad" cx="50%" cy="20%" r="80%">
                <stop offset="0%" stopColor="#451a03" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1c0d02" stopOpacity="0.8" />
              </radialGradient>
              <radialGradient id="fireOuter">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#b45309" />
                <stop offset="100%" stopColor="#451a03" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Premium Fire Animation */}
            <g transform={`translate(100, 215) scale(${0.8 + heatInput/200})`}>
               <circle r="40" fill="url(#fireOuter)" className="animate-pulse" opacity="0.4" />
               <path d="M-20,0 Q0,-60 20,0 Z" fill="#ea580c" className="animate-bounce" style={{ animationDuration: '1.2s' }} />
               <path d="M-12,0 Q0,-45 12,0 Z" fill="#fbbf24" className="animate-bounce" style={{ animationDuration: '0.8s' }} />
               <path d="M-6,0 Q0,-25 6,0 Z" fill="#fef08a" className="animate-bounce" style={{ animationDuration: '0.5s' }} />
            </g>

            {/* Modern Anatomy Labels */}
            <g className="text-[7px] font-black fill-white/30 uppercase tracking-widest" style={{ pointerEvents: 'none' }}>
               <path d="M140 40 L110 65" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
               <text x="145" y="42">{isId ? "RUANG MASAK" : "COOKING SPACE"}</text>
               
               <path d="M140 120 L120 120" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
               <text x="145" y="122">{potType==='clay' ? (isId ? "TANAH LIAT" : "CLAY WALL") : (isId ? "LOGAM" : "METAL WALL")}</text>

               <path d="M50 190 L65 210" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
               <text x="15" y="185" textAnchor="start">{isId ? "SUMBER PANAS" : "HEAT SOURCE"}</text>
            </g>

            {/* Stand */}
            <path d="M60 185 L140 185 M140 185 L155 220 M60 185 L45 220" stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />

            {/* Premium Pot Visualization (2.5D Game Asset Style) */}
            <g transform="translate(100, 115)">
               {/* External Body Drop Shadow */}
               <path d="M-62,-40 A62,52 0 0,0 62,-40 L62,45 A62,52 0 0,1 -62,45 Z" fill="black" opacity="0.4" transform="translate(6, 6)" filter="blur(4px)" />
               
               {/* Main Pot Body */}
               <path d="M-60,-40 A60,50 0 0,0 60,-40 L60,40 A60,50 0 0,1 -60,40 Z" fill="url(#bodyGrad)" stroke="#1e293b" strokeWidth="0.5" />
               
               {/* 2.5D Recessed Opening Logic */}
               <g>
                  {/* The thickness/depth of the wall cut */}
                  <ellipse cx="0" cy="0" rx="50" ry="33" fill="#1c0d02" /> 
                  <ellipse cx="0" cy="2" rx="48" ry="31" fill="#3b1901" /> {/* Deep shadow rim */}
                  
                  {/* The actual liquid/inner floor */}
                  <ellipse cx="0" cy="4" rx="45" ry="28" fill="#2d1305" />
                  
                  {/* Surface highlights / Liquid glow */}
                  <ellipse cx="0" cy="4" rx="45" ry="28" fill="url(#liquidSurfaceGrad)" />
                  
                  {/* Top Rim Highlight (2.5D effect) */}
                  <path d="M-50,0 A50,33 0 0,1 50,0" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.2" />
               </g>

               {/* Top Rim Highlight */}
               <ellipse cx="0" cy="-45" rx="58" ry="14" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.3" />
               <ellipse cx="0" cy="-45" rx="55" ry="12" fill="url(#bodyGrad)" stroke="black" strokeWidth="0.5" strokeOpacity="0.2" />
               
               {/* Lid Handle */}
               <circle cx="0" cy="-62" r="10" fill="url(#bodyGrad)" stroke="black" strokeWidth="0.5" strokeOpacity="0.3" />
               <circle cx="0" cy="-65" r="4" fill="white" opacity="0.1" />
            </g>

            {/* Temperature Indicator */}
            <g transform="translate(170, 210)">
               <rect width="25" height="20" rx="8" fill="white" opacity="0.1" />
               <text x="12.5" y="14" textAnchor="middle" fontSize="10" fontWeight="900" fill="white" opacity="0.8">100°</text>
            </g>
          </svg>
          
          <div className="absolute top-6 left-8 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-ping" />
             <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.4em]">Live Thermal Feed</span>
          </div>
        </div>
      </div>

      {/* Outcome Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: isId ? "Retensi Panas" : "Heat Retention", v: Math.round(calc.retention), s: calc.retention > 60 ? (isId ? "Tinggi" : "High") : (isId ? "Normal" : "Normal"), c: "amber" },
          { l: isId ? "Efisiensi Energi" : "Energy Efficiency", v: Math.round(calc.efficiency), s: calc.efficiency > 60 ? (isId ? "Optimal" : "Optimal") : (isId ? "Rendah" : "Low"), c: "emerald" },
          { l: isId ? "Kehilangan Panas" : "Heat Loss", v: Math.round(calc.heatLoss), s: calc.heatLoss < 30 ? (isId ? "Minimal" : "Low") : (isId ? "Kritis" : "Critical"), c: "rose" },
          { l: isId ? "Dataset Log" : "Dataset Log", v: runs.length, s: isId ? "Data Aktif" : "Active Records", c: "indigo" },
        ].map(st => (
          <div key={st.l} className="group p-8 bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-200 shadow-xl flex flex-col justify-between hover:bg-slate-900 hover:text-white transition-all duration-500 overflow-hidden relative">
             <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${st.c}-500/10 rounded-full blur-[40px] group-hover:bg-white/5`} />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">{st.l}</span>
             <div className="mt-4 flex items-baseline gap-2 relative z-10">
                <span className={`text-4xl font-bold ${st.v > 70 ? 'text-emerald-500' : 'text-slate-900 group-hover:text-white'}`}>{st.v}</span>
                <span className="text-[11px] font-bold uppercase opacity-40">{st.s}</span>
             </div>
          </div>
        ))}
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
            {fryMedium === "sand" ? (
              <span className="flex items-center gap-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="3" fill="#fbbf24"/><path d="M3 21h18" stroke="#d97706" strokeWidth="2"/><path d="M3 21 Q12,17 21,21" fill="#fbbf24"/></svg>Pasir</span>
            ) : (
              <span className="flex items-center gap-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="16" rx="3" fill="#78716c"/><rect x="5" y="4" width="14" height="4" rx="2" fill="#57534e"/></svg>Minyak</span>
            )}
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
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="inline mr-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#ef4444"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="white"/></svg> {isId ? "Penyerapan Tinggi!" : "High Oil Absorption!"}
            </div>
          )}
          {fryMedium === "sand" && (
            <div className="absolute top-3 right-3 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="inline mr-0.5"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="8,12 11,15 16,9" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg> {isId ? "Rendah Minyak!" : "Low Oil!"}
            </div>
          )}
        </div>

        {/* Medium selector */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setFryMedium("sand")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${fryMedium === "sand" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><circle cx="12" cy="5" r="3" fill="#fbbf24"/><path d="M3 21h18" stroke="#d97706" strokeWidth="2"/><path d="M3 21 Q12,17 21,21" fill="#fbbf24"/></svg>{isId ? "Pasir Panas" : "Hot Sand"}
          </button>
          <button onClick={() => setFryMedium("oil")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${fryMedium === "oil" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="5" y="4" width="14" height="16" rx="3" fill="#78716c"/><rect x="5" y="4" width="14" height="4" rx="2" fill="#57534e"/><ellipse cx="12" cy="8" rx="5" ry="1.5" fill="#a8a29e"/></svg>{isId ? "Minyak Goreng" : "Cooking Oil"}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
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
        <span className="text-2xl shrink-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="14" rx="9" ry="5" fill="#fde68a"/><ellipse cx="12" cy="12" rx="7" ry="4" fill="#fef3c7"/><ellipse cx="9" cy="10" rx="2.5" ry="1.5" fill="#fde68a"/><ellipse cx="13" cy="9" rx="2" ry="1.3" fill="#fef9c3"/><ellipse cx="16" cy="11" rx="2.3" ry="1.4" fill="#fde68a"/></svg></span>
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
              {packaging === "banana" ? (
                <span className="flex items-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 20 Q3 14 6 9 Q9 5 15 4 Q19 3.5 20 5 Q20 7 17 8 Q12 9 8 14 Q6 17 6 20 Z" fill="#fde047"/></svg></span>
              ) : (
                <span className="flex items-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="#3b82f6"/><line x1="3" y1="6" x2="21" y2="6" stroke="#1d4ed8" strokeWidth="2"/><path d="M16 10a4 4 0 0 1-8 0" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/></svg></span>
              )}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${starterQuality === "good" ? "bg-emerald-500" : starterQuality === "medium" ? "bg-amber-500" : "bg-red-500"}`}>
              {starterQuality}
            </span>
          </div>
        </div>

        {/* ── REALISTIC SVG SCENE ── */}
        <div ref={animRef} className="rounded-xl overflow-hidden border border-border/30 bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#d1fae5]">
          <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <defs>
              {/* Banana leaf gradient */}
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#16a34a"/>
                <stop offset="40%" stopColor="#15803d"/>
                <stop offset="100%" stopColor="#14532d"/>
              </linearGradient>
              <linearGradient id="leafShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#166534" stopOpacity="0"/>
              </linearGradient>
              {/* Rice grain gradient */}
              <radialGradient id="riceGrain" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#fffbeb"/>
                <stop offset="60%" stopColor="#fef3c7"/>
                <stop offset="100%" stopColor="#fde68a"/>
              </radialGradient>
              {/* Fermented rice tint — yellower as sweetness rises */}
              <radialGradient id="riceFerm" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={calc.sweetness > 60 ? "#fef08a" : calc.sweetness > 30 ? "#fef9c3" : "#ffffff"} stopOpacity="0.7"/>
                <stop offset="100%" stopColor={calc.sweetness > 60 ? "#fde047" : "#fef3c7"} stopOpacity="0.3"/>
              </radialGradient>
              {/* Plastic bag gradient */}
              <linearGradient id="plasticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe"/>
                <stop offset="50%" stopColor="#bfdbfe"/>
                <stop offset="100%" stopColor="#93c5fd"/>
              </linearGradient>
              {/* Steam gradient */}
              <linearGradient id="steamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#d1fae5" stopOpacity="0"/>
              </linearGradient>
              <filter id="softBlur">
                <feGaussianBlur stdDeviation="0.8"/>
              </filter>
              <filter id="grainShadow">
                <feDropShadow dx="0.3" dy="0.5" stdDeviation="0.4" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* ── BACKGROUND WOOD TABLE ── */}
            <rect x="0" y="155" width="320" height="45" fill="#92400e" opacity="0.15" rx="4"/>
            <rect x="0" y="158" width="320" height="3" fill="#78350f" opacity="0.2"/>
            {[0,40,80,120,160,200,240,280].map(x => (
              <line key={x} x1={x} y1="158" x2={x+30} y2="200" stroke="#78350f" strokeWidth="0.5" opacity="0.1"/>
            ))}

            {packaging === "banana" ? (
              <g>
                {/* ── BANANA LEAF (bottom layer, folded) ── */}
                {/* Left fold */}
                <path d="M60,160 Q80,100 160,90 Q240,100 260,160 Q220,170 160,172 Q100,170 60,160 Z"
                  fill="url(#leafGrad)" opacity="0.95"/>
                {/* Leaf shine overlay */}
                <path d="M60,160 Q80,100 160,90 Q240,100 260,160 Q220,170 160,172 Q100,170 60,160 Z"
                  fill="url(#leafShine)"/>
                {/* Main leaf veins */}
                <line x1="160" y1="90" x2="160" y2="172" stroke="#166534" strokeWidth="1.5" opacity="0.5"/>
                {[...Array(7)].map((_, i) => {
                  const angle = -60 + i * 20;
                  const rad = angle * Math.PI / 180;
                  return (
                    <line key={i}
                      x1="160" y1={130}
                      x2={160 + Math.cos(rad) * 55}
                      y2={130 + Math.sin(rad) * 30}
                      stroke="#166534" strokeWidth="0.8" opacity="0.35"
                    />
                  );
                })}
                {/* Leaf edge texture dots */}
                {[70,90,110,130,150,170,190,210,230,250].map((x, i) => (
                  <circle key={i} cx={x} cy={160 + Math.sin(i) * 3} r="1" fill="#14532d" opacity="0.3"/>
                ))}

                {/* ── RICE MOUND on leaf ── */}
                {/* Base mound shape */}
                <ellipse cx="160" cy="138" rx="62" ry="28" fill="url(#riceGrain)" filter="url(#softBlur)"/>
                <ellipse cx="160" cy="138" rx="62" ry="28" fill="url(#riceFerm)"/>

                {/* ── INDIVIDUAL RICE GRAINS (realistic oval shapes) ── */}
                {[
                  // Row 1 — top center
                  [148,118],[158,115],[168,118],[178,121],[138,121],
                  // Row 2
                  [132,126],[142,123],[152,121],[162,120],[172,122],[182,125],[192,128],
                  // Row 3 — widest
                  [120,132],[130,129],[140,127],[150,126],[160,125],[170,126],[180,128],[190,130],[200,133],
                  // Row 4
                  [118,138],[128,135],[138,133],[148,132],[158,131],[168,132],[178,134],[188,136],[198,139],
                  // Row 5
                  [122,144],[132,141],[142,139],[152,138],[162,137],[172,138],[182,140],[192,143],
                  // Row 6 — bottom
                  [130,150],[140,147],[150,145],[160,144],[170,145],[180,147],[190,150],
                  // Row 7 — very bottom
                  [140,155],[150,153],[160,152],[170,153],[180,155],
                ].map(([cx, cy], i) => {
                  // Each grain: small rotated ellipse, slightly varied
                  const rot = (i * 37) % 180;
                  const w = 4.5 + (i % 3) * 0.5;
                  const h = 2.2 + (i % 2) * 0.3;
                  // Color varies: white → cream → pale yellow based on fermentation
                  const fermPct = calc.sweetness / 100;
                  const r = Math.round(255);
                  const g = Math.round(243 + fermPct * 12);
                  const b = Math.round(220 - fermPct * 80);
                  return (
                    <ellipse key={i} cx={cx} cy={cy} rx={w} ry={h}
                      fill={`rgb(${r},${g},${b})`}
                      stroke="#d97706" strokeWidth="0.3" opacity="0.92"
                      transform={`rotate(${rot},${cx},${cy})`}
                      filter="url(#grainShadow)"
                    />
                  );
                })}

                {/* Fermentation liquid sheen — amber puddle between grains */}
                {calc.sweetness > 30 && (
                  <ellipse cx="160" cy="148" rx={40 * (calc.sweetness / 100)} ry={6 * (calc.sweetness / 100)}
                    fill="#fbbf24" opacity={0.15 + calc.sweetness * 0.002}/>
                )}

                {/* ── FERMENTATION BUBBLES rising from rice ── */}
                {calc.aroma > 20 && [145,155,160,168,175].map((bx, i) => (
                  <circle key={i} cx={bx} cy={120 - i * 6}
                    r={1.5 + (i % 2)}
                    fill={calc.sweetness > 50 ? "#fde047" : "#fef9c3"}
                    opacity={0.5 + i * 0.08}
                    className="ferm-bubble"
                    style={{ animation: `bounce ${1.2 + i * 0.3}s ease-in-out infinite alternate` }}
                  />
                ))}

                {/* ── STEAM / AROMA WISPS ── */}
                {calc.aroma > 40 && [148,160,172].map((sx, i) => (
                  <path key={i}
                    d={`M${sx},112 Q${sx - 4 + i * 4},104 ${sx + 2},96 Q${sx + 6},88 ${sx - 2},80`}
                    fill="none" stroke="#d1fae5" strokeWidth="2.5" strokeLinecap="round"
                    opacity={0.4 + i * 0.1}
                    style={{ animation: `pulse ${2 + i * 0.5}s ease-in-out infinite` }}
                  />
                ))}

                {/* ── LEAF FOLD FLAP (top) ── */}
                <path d="M100,90 Q130,70 160,68 Q190,70 220,90 Q200,85 160,83 Q120,85 100,90 Z"
                  fill="#15803d" opacity="0.85"/>
                <path d="M100,90 Q130,70 160,68 Q190,70 220,90 Q200,85 160,83 Q120,85 100,90 Z"
                  fill="url(#leafShine)" opacity="0.5"/>
                {/* Top flap vein */}
                <line x1="160" y1="68" x2="160" y2="90" stroke="#166534" strokeWidth="1" opacity="0.4"/>

                {/* ── BANANA LEAF TIE STRING ── */}
                <path d="M110,155 Q160,162 210,155" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                <circle cx="160" cy="162" r="3" fill="#78350f" opacity="0.5"/>

                {/* Label */}
                <text x="160" y="185" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#166534" fontFamily="sans-serif">
                  {isId ? "Tape Ketan - Daun Pisang" : "Tape Ketan - Banana Leaf"}
                </text>
              </g>
            ) : (
              <g>
                {/* ── PLASTIC BAG ── */}
                <path d="M95,155 Q90,100 100,75 Q130,65 160,63 Q190,65 220,75 Q230,100 225,155 Q195,165 160,167 Q125,165 95,155 Z"
                  fill="url(#plasticGrad)" opacity="0.75"/>
                {/* Plastic shine */}
                <path d="M105,80 Q108,72 120,70 Q115,85 108,95 Z" fill="white" opacity="0.35"/>
                <path d="M200,82 Q205,74 215,73 Q212,88 205,97 Z" fill="white" opacity="0.2"/>
                {/* Plastic seal top */}
                <rect x="110" y="68" width="100" height="6" rx="3" fill="#93c5fd" opacity="0.8"/>
                <rect x="115" y="69" width="90" height="3" rx="1.5" fill="white" opacity="0.4"/>

                {/* Rice grains inside plastic */}
                {[
                  [148,110],[158,107],[168,110],[178,113],[138,113],
                  [132,118],[142,115],[152,113],[162,112],[172,114],[182,117],
                  [128,124],[138,121],[148,119],[158,118],[168,119],[178,121],[188,124],
                  [126,130],[136,127],[146,125],[156,124],[166,125],[176,127],[186,130],
                  [130,136],[140,133],[150,131],[160,130],[170,131],[180,133],[190,136],
                  [136,142],[146,139],[156,138],[166,138],[176,139],[186,142],
                  [142,148],[152,145],[162,144],[172,145],[182,148],
                ].map(([cx, cy], i) => {
                  const rot = (i * 41) % 180;
                  const w = 4.2 + (i % 3) * 0.4;
                  const h = 2.0 + (i % 2) * 0.3;
                  const fermPct = calc.sweetness / 100;
                  const r = 255; const g = Math.round(243 + fermPct * 10); const b = Math.round(220 - fermPct * 70);
                  return (
                    <ellipse key={i} cx={cx} cy={cy} rx={w} ry={h}
                      fill={`rgb(${r},${g},${b})`}
                      stroke="#d97706" strokeWidth="0.25" opacity="0.88"
                      transform={`rotate(${rot},${cx},${cy})`}
                    />
                  );
                })}

                {/* Condensation droplets on plastic */}
                {[105,115,200,210,108,205].map((dx, i) => (
                  <circle key={i} cx={dx} cy={90 + i * 12} r={1.5} fill="white" opacity="0.4"/>
                ))}

                {/* Fermentation bubbles */}
                {calc.aroma > 20 && [148,158,168].map((bx, i) => (
                  <circle key={i} cx={bx} cy={108 - i * 5} r={1.5 + i * 0.5}
                    fill="#fde047" opacity={0.4 + i * 0.1}
                    style={{ animation: `bounce ${1.5 + i * 0.4}s ease-in-out infinite alternate` }}
                  />
                ))}

                <text x="160" y="185" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1d4ed8" fontFamily="sans-serif">
                  {isId ? "Tape Ketan - Plastik" : "Tape Ketan - Plastic"}
                </text>
              </g>
            )}

            {/* ── THERMOMETER (left) ── */}
            <g transform="translate(18, 30)">
              <rect x="0" y="0" width="12" height="80" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1"/>
              <rect x="2" y={80 - Math.round(((fermTemp - 15) / 30) * 70)}
                width="8" height={Math.round(((fermTemp - 15) / 30) * 70)}
                rx="4"
                fill={fermTemp > 35 ? "#ef4444" : fermTemp > 25 ? "#f97316" : "#3b82f6"}/>
              <circle cx="6" cy="84" r="7"
                fill={fermTemp > 35 ? "#ef4444" : fermTemp > 25 ? "#f97316" : "#3b82f6"}
                stroke="#94a3b8" strokeWidth="1"/>
              <text x="6" y="100" textAnchor="middle" fontSize="7" fontWeight="bold"
                fill={fermTemp > 35 ? "#dc2626" : fermTemp > 25 ? "#ea580c" : "#2563eb"}
                fontFamily="sans-serif">{fermTemp}°C</text>
              <text x="6" y="110" textAnchor="middle" fontSize="6" fill="#64748b" fontFamily="sans-serif">
                {calc.tempOptimal ? "✓ OK" : "⚠"}
              </text>
            </g>

            {/* ── CLOCK / TIMER (right) ── */}
            <g transform="translate(278, 30)">
              <circle cx="12" cy="12" r="14" fill="white" stroke="#d97706" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="1.5" fill="#92400e"/>
              {/* Clock hands */}
              <line x1="12" y1="12" x2="12" y2="3" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="12"
                x2={12 + Math.cos((fermTime / 96 * 360 - 90) * Math.PI / 180) * 8}
                y2={12 + Math.sin((fermTime / 96 * 360 - 90) * Math.PI / 180) * 8}
                stroke="#d97706" strokeWidth="1.2" strokeLinecap="round"/>
              <text x="12" y="36" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#92400e" fontFamily="sans-serif">{fermTime}h</text>
              <text x="12" y="45" textAnchor="middle" fontSize="6" fill="#64748b" fontFamily="sans-serif">
                {isId ? "Waktu" : "Time"}
              </text>
            </g>

            {/* ── FERMENTATION STAGE LABEL ── */}
            <rect x="90" y="8" width="140" height="22" rx="11" fill="white" stroke="#d97706" strokeWidth="1" opacity="0.9"/>
            <text x="160" y="23" textAnchor="middle" fontSize="8.5" fontWeight="bold"
              fill={calc.sweetness > 60 ? "#16a34a" : calc.sweetness > 30 ? "#d97706" : "#64748b"}
              fontFamily="sans-serif">
              {calc.sweetness > 60
                ? (isId ? "Fermentasi Optimal!" : "Optimal Fermentation!")
                : calc.sweetness > 30
                ? (isId ? "Sedang Fermentasi..." : "Fermenting...")
                : (isId ? "Awal Fermentasi" : "Early Stage")}
            </text>
          </svg>
        </div>

        {/* Packaging selector */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setPackaging("banana")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${packaging === "banana" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><path d="M5 20 Q3 14 6 9 Q9 5 15 4 Q19 3.5 20 5 Q20 7 17 8 Q12 9 8 14 Q6 17 6 20 Z" fill="#fde047"/><path d="M6 19 Q4 14 7 10 Q10 6 15 5" stroke="#eab308" strokeWidth="1" strokeLinecap="round" fill="none"/></svg>{isId ? "Daun Pisang" : "Banana Leaf"}
          </button>
          <button onClick={() => setPackaging("plastic")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all ${packaging === "plastic" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="#3b82f6"/><line x1="3" y1="6" x2="21" y2="6" stroke="#1d4ed8" strokeWidth="2"/><path d="M16 10a4 4 0 0 1-8 0" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Plastik" : "Plastic"}
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
                {s === "good" ? (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><circle cx="12" cy="12" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#92400e">1</text></svg>) : s === "medium" ? (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><circle cx="12" cy="12" r="9" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#6b7280">2</text></svg>) : (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><circle cx="12" cy="12" r="9" fill="#cd7c32" stroke="#92400e" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#78350f">3</text></svg>)} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics with progress bars */}
      <SimCard className="p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{isId ? "Hasil Fermentasi Saat Ini" : "Current Fermentation Results"}</p>
        <div className="space-y-3">
          {[
            { label: isId ? "Rasa Manis" : "Sweetness", value: Math.round(calc.sweetness), color: "bg-amber-400", textColor: "text-amber-700" },
            { label: isId ? "Keasaman" : "Acidity", value: Math.round(calc.acidity), color: "bg-red-400", textColor: "text-red-700" },
            { label: isId ? "Daya Simpan" : "Shelf Life", value: Math.round(calc.shelfLife), color: "bg-emerald-500", textColor: "text-emerald-700" },
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1 shrink-0"><path d="M9 18h6M10 22h4" stroke="#a16207" strokeWidth="2" strokeLinecap="round"/><path d="M12 2a7 7 0 0 1 5 11.9V16a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2.1A7 7 0 0 1 12 2z" fill="#fbbf24"/><path d="M9 22h6" stroke="#a16207" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Fermentasi optimal: 36–48 jam, suhu 25–32°C, ragi baik, kemasan daun pisang" : "Optimal: 36–48h, 25–32°C, good starter, banana leaf packaging"}
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
              {coastalUse === "natural" ? (
                <span className="flex items-center gap-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="#22c55e"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/></svg>Natural</span>
              ) : coastalUse === "housing" ? (
                <span className="flex items-center gap-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" fill="#a8a29e"/></svg>Housing</span>
              ) : (
                <span className="flex items-center gap-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><ellipse cx="11" cy="12" rx="8" ry="5" fill="#38bdf8"/><polygon points="19,12 23,8 23,16" fill="#38bdf8"/><circle cx="7" cy="11" r="1.5" fill="#1e3a5f"/></svg>Ponds</span>
              )}
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
              <div className="absolute top-8 left-6 animate-bounce" style={{ animationDuration: "2s" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><ellipse cx="11" cy="12" rx="8" ry="5" fill="#38bdf8"/><polygon points="19,12 23,8 23,16" fill="#38bdf8"/><circle cx="7" cy="11" r="1.5" fill="#1e3a5f"/></svg></div>
            )}
            {calc.fishProduction > 70 && (
              <div className="absolute top-12 left-16 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><ellipse cx="11" cy="12" rx="8" ry="5" fill="#f97316"/><polygon points="19,12 23,8 23,16" fill="#f97316"/><circle cx="7" cy="11" r="1.5" fill="#7c2d12"/><path d="M11 9 Q13 10 13 12 Q13 14 11 15" stroke="#fdba74" strokeWidth="1" fill="none"/></svg></div>
            )}
            {calc.fishProduction < 30 && (
              <div className="absolute top-8 left-8 opacity-40"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><ellipse cx="11" cy="12" rx="8" ry="5" fill="#38bdf8"/><polygon points="19,12 23,8 23,16" fill="#38bdf8"/><circle cx="7" cy="11" r="1.5" fill="#1e3a5f"/></svg></div>
            )}
          </div>

          {/* Mangrove forest */}
          <div className="absolute top-14 left-0 right-0 h-24 bg-gradient-to-t from-emerald-800 via-emerald-700 to-emerald-600 overflow-hidden"
            style={{ height: `${mangroveCover * 0.24}px`, transition: "height 0.8s ease" }}>
            {/* Tree canopies */}
            {mangroveCover > 20 && [...Array(Math.ceil(mangroveCover / 15))].map((_, i) => (
              <div key={i} className="mangrove-tree absolute" style={{ bottom: 0, left: `${5 + i * 8}%` }}>
                <svg width={14 + mangroveCover / 10} height={14 + mangroveCover / 10} viewBox="0 0 24 24" fill="none">
                  <rect x="11" y="16" width="2" height="8" fill="#4E342E"/>
                  <polygon points="12,2 2,16 22,16" fill="#16a34a"/>
                  <polygon points="12,6 4,16 20,16" fill="#22c55e"/>
                </svg>
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
              <div className="absolute top-1 right-8 animate-bounce" style={{ animationDuration: "3s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Shoreline / coast */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-amber-300 to-amber-200">
            {/* Coastal use indicators */}
            {coastalUse === "housing" && (
              <div className="absolute bottom-1 right-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
            )}
            {coastalUse === "ponds" && (
              <div className="absolute bottom-1 left-1/3 flex gap-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="#fff" stroke="#d97706"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="#fff" stroke="#d97706"/></svg>
              </div>
            )}
            {coastalUse === "natural" && (
              <div className="absolute bottom-1 right-6">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-4-3-9-6-9-12A9 9 0 0 1 21 10c0 6-5 9-9 12z"/></svg>
              </div>
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
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5 border border-emerald-200 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
              {mangroveCover}%
            </div>
          </div>

          {/* Wave strength */}
          <div className="absolute top-3 left-20">
            <div className="text-[10px] font-bold text-blue-600 bg-blue-100 rounded px-1.5 py-0.5 border border-blue-200 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/><path d="M2 17c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/><path d="M2 7c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/></svg>
              {waveStrength}%
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
            {([["natural", isId?"Alami":"Natural"], ["housing", isId?"Pemukiman":"Housing"], ["ponds", isId?"Tambak":"Ponds"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setCoastalUse(val)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-1 ${coastalUse === val ? (val === "natural" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : val === "housing" ? "border-slate-500 bg-slate-50 text-slate-700" : "border-blue-500 bg-blue-50 text-blue-700") : "border-border/40 bg-white text-muted-foreground"}`}>
                {val === "natural" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>}
                {val === "housing" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                {val === "ponds" && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>}
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
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
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex items-center gap-1 ${communityAwareness > 60 ? "bg-emerald-500" : communityAwareness > 30 ? "bg-amber-500" : "bg-red-500"}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {communityAwareness}%
          </span>
        </div>

        <div ref={animRef} className="relative h-44 bg-gradient-to-b from-sky-300 via-sky-200 to-blue-400 rounded-xl overflow-hidden border border-border/30">
          {/* Sun */}
          <div className="absolute top-2 right-3 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 shadow-lg animate-pulse" />

          {/* Clouds */}
          <div className="absolute top-2 left-4 opacity-60 animate-bounce" style={{ animationDuration: "4s" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            </svg>
          </div>
          <div className="absolute top-4 left-20 opacity-40 animate-bounce" style={{ animationDuration: "5s" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
            </svg>
          </div>

          {/* Fishing boats */}
          {fishingIntensity > 30 && (
            <div className="absolute top-6 flex gap-4">
              {[1,2,3].slice(0, Math.ceil(fishingIntensity / 33)).map(i => (
                <div key={i} className="boat transition-transform duration-700"
                  style={{ animation: `boat-sway ${2 + i * 0.3}s ease-in-out infinite alternate` }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                    <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
                    <path d="M12 10V4"/>
                    <path d="M12 4l7 4"/>
                    <path d="M12 4L5 8"/>
                  </svg>
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
                <div key={i} className="sim-fish animate-bounce transition-opacity"
                  style={{
                    opacity: i < calc.fishPopulation / 5 ? 1 : 0.15,
                    animationDuration: `${2 + (i % 4) * 0.5}s`,
                    animationDelay: `${(i % 5) * 0.3}s`,
                    transform: i % 2 === 0 ? "scaleX(1)" : "scaleX(-1)"
                  }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="#fff" stroke="#d97706"/></svg>
                </div>
              ))}
            </div>

            {/* Coral / reef */}
            {calc.waterQuality > 50 && (
              <div className="absolute bottom-0 left-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3M9 6l3-4 3 4M7 10l5 4 5-4"/>
                </svg>
              </div>
            )}
            {calc.waterQuality > 70 && (
              <div className="absolute bottom-0 right-8">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626" stroke="#991b1b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="#fff" strokeWidth="2"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="#fff" strokeWidth="2"/>
                </svg>
              </div>
            )}

            {/* Waste indicator */}
            {(100 - calc.waterQuality) > 40 && (
              <div className="absolute top-2 right-4 animate-pulse flex items-center gap-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            )}

            {/* Conservation indicator */}
            {calc.marineBiodiversity > 60 && (
              <div className="absolute top-2 left-4 flex items-center gap-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#f97316" stroke="#c2410c" strokeWidth="1"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><path d="M22 12c-1.5 1-3.5 1.5-5.5 1.5-3 0-5.5-1-7.5-2.5"/><circle cx="12" cy="12" r="2"/></svg>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v14M7 9l5 2 5-2M7 15l5-2 5 2"/></svg>
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="absolute bottom-10 left-3 text-[9px] font-bold text-white bg-black/30 rounded px-1.5 py-0.5 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>
            {isId ? "Populasi: " : "Fish: "}{Math.round(calc.fishPopulation)}%
          </div>
          <div className="absolute bottom-10 right-3 text-[9px] font-bold text-white bg-black/30 rounded px-1.5 py-0.5 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/><path d="M2 17c1.5-1.5 3-2 5-2s3.5.5 5 2 3 2 5 2 3.5-.5 5-2"/></svg>
            {isId ? "Ikan Tangkap: " : "Fishing: "}{fishingIntensity}%
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
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
