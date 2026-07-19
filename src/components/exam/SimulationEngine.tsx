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

const MindfulTip = ({ tipId, tipEn }: { tipId: string, tipEn: string }) => {
  const { lang } = useLanguage();
  return (
    <div className="bg-slate-50 border-l-4 border-slate-900 p-4 rounded-r-xl mt-4 animate-in fade-in slide-in-from-left duration-700">
      <div className="flex gap-3">
        <div className="w-6 h-6 rounded-full bg-slate-900/10 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
        </div>
        <p className="text-[12px] text-slate-600 font-medium leading-relaxed italic">
          {lang === "id" ? tipId : tipEn}
        </p>
      </div>
    </div>
  );
};

const SliderRow = ({ label, value, min, max, step = 1, onChange, color, unit = "%", note }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; color?: string; unit?: string; note?: string;
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5 group/slider">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-slate-700 leading-tight group-hover/slider:text-primary transition-colors">{label}</span>
        <div className="flex items-center gap-2">
          {note && <span className="text-[10px] text-muted-foreground font-bold">{note}</span>}
          <span className="text-[14px] font-black text-primary min-w-[40px] text-right">{value}{unit}</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="sim-slider w-full cursor-grab active:cursor-grabbing transition-all"
        style={{ 
          background: `linear-gradient(to right, ${color || "#6366f1"} ${pct}%, #f1f5f9 ${pct}%)`,
          height: '6px'
        }}
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
      <SimCard className="p-0 overflow-hidden relative">
        <div className="bg-white flex items-center justify-between p-4 border-b border-border/30">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {isId ? "Visualisasi Pengemasan" : "Packaging Visualization"}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
            packType === "teak" ? "bg-emerald-600" : packType === "paper" ? "bg-amber-500" : "bg-blue-500"
          }`}>
            {packType === "teak" ? (isId ? "Daun Jati" : "Teak Leaf") : packType === "paper" ? (isId ? "Kertas" : "Paper") : (isId ? "Plastik" : "Plastic")}
          </span>
        </div>

        <div ref={animRef} className="relative h-52 bg-white rounded-xl overflow-hidden border border-border/30">
          {/* ── 2D ARTIST QUALITY NASI JAMBLANG SCENE ── */}
          <svg viewBox="0 0 320 200" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nj-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF8E7"/>
                <stop offset="100%" stopColor="#FFF0C8"/>
              </linearGradient>
              <linearGradient id="nj-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B6914"/>
                <stop offset="100%" stopColor="#5C3D0C"/>
              </linearGradient>
              <radialGradient id="nj-plate" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FEFCE8"/>
                <stop offset="100%" stopColor="#FEF08A"/>
              </radialGradient>
              <filter id="nj-shadow">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.18"/>
              </filter>
            </defs>

            {/* Sky background */}
            <rect width="320" height="200" fill="url(#nj-sky)"/>

            {/* Sun with rays */}
            <circle cx="272" cy="32" r="20" fill="#FFC107" filter="url(#nj-shadow)"/>
            {[0,45,90,135,180,225,270,315].map((a,i) => (
              <line key={i}
                x1={272 + Math.cos(a*Math.PI/180)*23}
                y1={32 + Math.sin(a*Math.PI/180)*23}
                x2={272 + Math.cos(a*Math.PI/180)*30}
                y2={32 + Math.sin(a*Math.PI/180)*30}
                stroke="#FFD54F" strokeWidth={i%2===0?"2.5":"1.8"} strokeLinecap="round"/>
            ))}

            {/* Wooden table surface */}
            <rect x="0" y="130" width="320" height="70" fill="url(#nj-ground)"/>
            {[0,30,60,90,120,150,180,210,240,270,300].map(x => (
              <line key={x} x1={x} y1="130" x2={x+20} y2="200" stroke="#4A2800" strokeWidth="0.8" opacity="0.3"/>
            ))}
            <rect x="0" y="128" width="320" height="5" fill="#A07830" opacity="0.8"/>

            {/* Banana leaf placemat */}
            <ellipse cx="160" cy="140" rx="85" ry="20" fill="#4CAF50" opacity="0.85"/>
            <ellipse cx="160" cy="140" rx="85" ry="20" fill="none" stroke="#2E7D32" strokeWidth="1.5"/>
            <line x1="82" y1="140" x2="238" y2="140" stroke="#1B5E20" strokeWidth="1.2" opacity="0.5"/>

            {/* Rice plate (nasi) */}
            <ellipse cx="145" cy="132" rx="40" ry="12" fill="#E8E0D0" stroke="#C8B090" strokeWidth="1.5" filter="url(#nj-shadow)"/>
            {/* Rice mound */}
            <ellipse cx="145" cy="126" rx="34" ry="14" fill="url(#nj-plate)" stroke="#D4C090" strokeWidth="1"/>
            {/* Individual rice grains */}
            {[
              [138,120],[145,118],[152,120],[140,124],[148,122],[156,124],
              [135,126],[142,124],[150,123],[158,125],[136,128],[143,126],[151,125],[160,127],
              [138,130],[146,129],[154,128],[162,130],[140,132],[148,131],[156,130],[165,132],
            ].map(([cx,cy],i) => (
              <ellipse key={i} cx={cx} cy={cy} rx="3.2" ry="1.6"
                fill={i%3===0?"#FFF9E6":i%3===1?"#FFF3CC":"#FFFDE7"}
                stroke="#D4B896" strokeWidth="0.3"
                transform={`rotate(${(i*37)%180} ${cx} ${cy})`}/>
            ))}

            {/* Side dishes (lauk) */}
            {/* Fried tofu */}
            <rect x="195" y="120" width="24" height="20" rx="4" fill="#D4A017" stroke="#B8860B" strokeWidth="1.2" filter="url(#nj-shadow)"/>
            <rect x="198" y="123" width="8" height="8" rx="2" fill="#E8B820" opacity="0.6"/>
            <rect x="208" y="127" width="7" height="6" rx="2" fill="#C8900A" opacity="0.5"/>

            {/* Sambal (red sauce) */}
            <ellipse cx="228" cy="134" rx="16" ry="8" fill="#C0392B" stroke="#922B21" strokeWidth="1" filter="url(#nj-shadow)"/>
            <ellipse cx="224" cy="133" rx="5" ry="3" fill="#E74C3C" opacity="0.5"/>

            {/* Tempe goreng */}
            <rect x="85" y="121" width="28" height="16" rx="3" fill="#8B6914" stroke="#6B4F14" strokeWidth="1.2" filter="url(#nj-shadow)"/>
            {[90,96,102,108].map(x => (
              <circle key={x} cx={x} cy="129" r="2.5" fill="#6B4A10" opacity="0.5"/>
            ))}

            {/* Teak leaf wrapping (main feature) */}
            {packType === "teak" && (
              <g>
                {/* Teak leaf wrap with tip + curved veins */}
                <path d="M84,108 Q96,72 160,64 Q224,72 236,108 Q212,142 160,147 Q108,142 84,108 Z"
                  fill="#388E3C" stroke="#1B5E20" strokeWidth="1.5" opacity="0.9" filter="url(#nj-shadow)"/>
                <path d="M84,108 Q96,72 160,64 Q224,72 236,108 Q212,142 160,147 Q108,142 84,108 Z"
                  fill="url(#nj-leafshine)" opacity="0.3"/>
                {/* Leaf tip (petiole) */}
                <path d="M160,64 Q156,50 160,44 Q164,50 160,64 Z" fill="#2E7D32"/>
                {/* Midrib */}
                <path d="M160,48 Q158,100 160,144" stroke="#1B5E20" strokeWidth="1.6" fill="none" opacity="0.5"/>
                {/* Curved side veins */}
                {[-46,-30,-14,4,20,36,52].map((a,i) => {
                  const rad = a * Math.PI / 180;
                  const y0 = 70 + i * 9;
                  return <path key={i} d={`M160,${y0} Q${160+Math.cos(rad)*30},${y0+6} ${160+Math.cos(rad)*58},${y0+Math.sin(rad)*30+10}`} stroke="#1B5E20" strokeWidth="0.7" fill="none" opacity="0.32"/>;
                })}
                <text x="160" y="168" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#2E7D32" fontFamily="sans-serif">
                  {isId ? "Dibungkus Daun Jati" : "Teak Leaf Wrap"}
                </text>
                {/* Leaf shine */}
                <defs><linearGradient id="nj-leafshine" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#A5D6A7" stopOpacity="0.6"/><stop offset="100%" stopColor="#1B5E20" stopOpacity="0"/></linearGradient></defs>
              </g>
            )}
            {packType === "plastic" && (
              <g>
                <path d="M88,102 Q160,68 232,102 Q235,145 160,152 Q85,145 88,102 Z"
                  fill="#90CAF9" stroke="#1565C0" strokeWidth="1.5" opacity="0.6" filter="url(#nj-shadow)"/>
                <path d="M88,102 Q160,68 232,102 Q235,145 160,152 Q85,145 88,102 Z"
                  fill="none" stroke="white" strokeWidth="0.8" opacity="0.4"/>
                {/* Plastic shine */}
                <path d="M110,90 Q130,82 150,88 Q130,95 110,90 Z" fill="white" opacity="0.3"/>
                <text x="160" y="168" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1565C0" fontFamily="sans-serif">
                  {isId ? "Plastik — 500 Thn Terurai" : "Plastic — 500 Yrs to Decompose"}
                </text>
              </g>
            )}
            {packType === "paper" && (
              <g>
                <path d="M92,105 Q160,74 228,105 Q225,143 160,148 Q95,143 92,105 Z"
                  fill="#FFF8E1" stroke="#F9A825" strokeWidth="1.5" opacity="0.85" filter="url(#nj-shadow)"/>
                {/* Paper texture lines */}
                {[108,120,132,144,156,168,180,192,204,216].map(x => (
                  <line key={x} x1={x} y1="105" x2={x+2} y2="148" stroke="#F9A825" strokeWidth="0.5" opacity="0.3"/>
                ))}
                <text x="160" y="168" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#E65100" fontFamily="sans-serif">
                  {isId ? "Kertas — 150 Hari Terurai" : "Paper — 150 Days to Decompose"}
                </text>
              </g>
            )}

            {/* Thermometer left */}
            <g transform="translate(14,30)">
              <rect x="0" y="0" width="10" height="60" rx="5" fill="#F5F5F5" stroke="#9E9E9E" strokeWidth="1"/>
              <rect x="2" y={60 - Math.round(((temp-15)/30)*54)} width="6" height={Math.round(((temp-15)/30)*54)} rx="3"
                fill={temp>35?"#E53935":temp>28?"#FF7043":"#42A5F5"}/>
              <circle cx="5" cy="63" r="7" fill={temp>35?"#E53935":temp>28?"#FF7043":"#42A5F5"} stroke="#9E9E9E" strokeWidth="1"/>
              <text x="5" y="78" textAnchor="middle" fontSize="7" fontWeight="bold"
                fill={temp>35?"#B71C1C":temp>28?"#BF360C":"#1565C0"} fontFamily="sans-serif">{temp}°C</text>
            </g>

            {/* Label banner bottom */}
            <rect x="30" y="182" width="260" height="14" rx="7" fill="#FFF9C4" stroke="#F9A825" strokeWidth="1" opacity="0.9"/>
            <text x="160" y="192" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#E65100" fontFamily="sans-serif">
              {isId ? `Penyimpanan: ${storageDays} hari` : `Storage: ${storageDays} days`}
            </text>
          </svg>
        </div>

        {/* Packaging selector */}
        <div className="flex gap-2 p-4">
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
        <button onClick={handleRun} className="w-full mt-2 py-2.5 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary/90 transition-all btn-3d">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics & Tip */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <StatCard label={isId ? "Kesegaran" : "Freshness"} value={calc.freshness} sub={calc.freshnessLabel} bg="bg-white" />
          <StatCard label={isId ? "Dampak Lingkungan" : "Env. Impact"} value={calc.envImpact} sub={calc.envLabel} bg="bg-white" />
          <StatCard label={isId ? "Limbah" : "Waste"} value={calc.waste} sub={calc.wasteLabel} bg="bg-white" />
        </div>

        <MindfulTip 
          tipId="Daun jati memiliki pori-pori alami yang membiarkan nasi 'bernapas' sehingga tidak cepat basi. Ia juga ramah lingkungan karena mudah hancur jadi pupuk!"
          tipEn="Teak leaves have natural pores that allow rice to 'breathe', preventing it from spoiling. They are also eco-friendly as they easily decompose into fertilizer!"
        />
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

        <div ref={animRef} className="relative h-52 bg-white rounded-xl overflow-hidden border border-border/30">
          {/* ── 2D ARTIST TERASI FERMENTATION SCENE ── */}
          <svg viewBox="0 0 320 200" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tr-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF8E1"/>
                <stop offset="100%" stopColor="#FFE0B2"/>
              </linearGradient>
              <linearGradient id="tr-jar-body" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5F5F0"/>
                <stop offset="100%" stopColor="#E8E4D8"/>
              </linearGradient>
              <radialGradient id="tr-content" cx="50%" cy="80%" r="60%">
                <stop offset="0%" stopColor={hygieneVal>60?"#D4891A":"#8B1A1A"}/>
                <stop offset="50%" stopColor={hygieneVal>60?"#A0522D":"#6B0000"}/>
                <stop offset="100%" stopColor={hygieneVal>60?"#6B3310":"#4A0000"}/>
              </radialGradient>
              <linearGradient id="tr-lid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#9E9E9E"/>
                <stop offset="100%" stopColor="#757575"/>
              </linearGradient>
              <radialGradient id="tr-cake" cx="42%" cy="35%" r="75%">
                <stop offset="0%" stopColor="#A04A28"/>
                <stop offset="60%" stopColor="#7A2E1A"/>
                <stop offset="100%" stopColor="#5E1E0E"/>
              </radialGradient>
              <filter id="tr-shadow">
                <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* Background scene: coastal processing area */}
            <rect width="320" height="200" fill="url(#tr-bg)"/>
            {/* Floor */}
            <rect x="0" y="155" width="320" height="45" fill="#BCAAA4" opacity="0.5"/>
            <rect x="0" y="153" width="320" height="5" fill="#A1887F" opacity="0.6"/>

            {/* Sun + heat indication */}
            <circle cx="280" cy="30" r="22" fill="#FFC107"/>
            {[0,45,90,135,180,225,270,315].map((a,i) => (
              <line key={i}
                x1={280+Math.cos(a*Math.PI/180)*25} y1={30+Math.sin(a*Math.PI/180)*25}
                x2={280+Math.cos(a*Math.PI/180)*32} y2={30+Math.sin(a*Math.PI/180)*32}
                stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round"/>
            ))}
            <text x="280" y="62" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#E65100" fontFamily="sans-serif">{temp}°C</text>

            {/* ── MAIN JAR (earthenware style) ── */}
            <g transform="translate(108,30)" filter="url(#tr-shadow)">
              {/* Jar lid */}
              <ellipse cx="52" cy="12" rx="42" ry="10" fill="url(#tr-lid)" stroke="#616161" strokeWidth="1.5"/>
              <ellipse cx="52" cy="10" rx="42" ry="8" fill="#BDBDBD" stroke="#9E9E9E" strokeWidth="1"/>
              {/* Lid knob */}
              <ellipse cx="52" cy="6" rx="10" ry="5" fill="#9E9E9E" stroke="#757575" strokeWidth="1"/>

              {/* Jar body outline — classic amphora shape */}
              <path d="M15,18 Q8,30 10,65 Q10,108 30,118 Q52,124 74,118 Q94,108 94,65 Q96,30 89,18 Z"
                fill="url(#tr-jar-body)" stroke="#A1887F" strokeWidth="2"/>
              {/* Jar body texture */}
              <path d="M15,18 Q8,30 10,65 Q10,108 30,118 Q52,124 74,118 Q94,108 94,65 Q96,30 89,18 Z"
                fill="none" stroke="#D7CCC8" strokeWidth="0.8" opacity="0.6"/>
              {/* Horizontal rings on jar */}
              {[35,55,75,95].map(y => (
                <path key={y} d={`M${15+(y-18)*0.15},${y} Q52,${y-3} ${89-(y-18)*0.15},${y}`}
                  fill="none" stroke="#BCAAA4" strokeWidth="1" opacity="0.5"/>
              ))}

              {/* Fermentation content fill */}
              <clipPath id="tr-jar-clip">
                <path d="M15,18 Q8,30 10,65 Q10,108 30,118 Q52,124 74,118 Q94,108 94,65 Q96,30 89,18 Z"/>
              </clipPath>
              <rect x="10" y={120 - Math.round(40 + calc.fermentation * 0.6)} width="84" height={40 + Math.round(calc.fermentation * 0.6)}
                fill="url(#tr-content)" clipPath="url(#tr-jar-clip)" opacity="0.9"/>

              {/* Surface shimmer on content */}
              <ellipse cx="52" cy={120 - Math.round(40 + calc.fermentation * 0.6)}
                rx="38" ry="5"
                fill={hygieneVal>60?"#D4891A":"#8B1A1A"} opacity="0.5"
                clipPath="url(#tr-jar-clip)"/>

              {/* Real terasi cakes (buletan terasi) stacked inside the jar */}
              <g clipPath="url(#tr-jar-clip)">
                {[
                  { x:34, y:112, rx:15, ry:6.5 },
                  { x:54, y:114, rx:16, ry:7 },
                  { x:73, y:111, rx:14, ry:6 },
                  { x:44, y:101, rx:14, ry:6 },
                  { x:63, y:102, rx:15, ry:6.5 },
                  { x:53, y:91, rx:13, ry:5.5 },
                ].map((c, i) => (
                  <g key={i}>
                    <ellipse cx={c.x} cy={c.y + 2.5} rx={c.rx} ry={c.ry} fill="#4a160a" />
                    <ellipse cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill="url(#tr-cake)" stroke="#3a1207" strokeWidth="0.5" />
                    <ellipse cx={c.x} cy={c.y} rx={c.rx * 0.22} ry={c.ry * 0.22} fill="#5e1e0e" />
                    {[[-0.4, -0.1], [0.3, 0.1], [-0.1, 0.4], [0.45, -0.3], [0, -0.5], [0.15, 0.45]].map(([dx, dy], k) => (
                      <circle key={k} cx={c.x + dx * c.rx} cy={c.y + dy * c.ry} r={0.9} fill="#3a1207" opacity={0.6} />
                    ))}
                    <ellipse cx={c.x - c.rx * 0.35} cy={c.y - c.ry * 0.4} rx={c.rx * 0.3} ry={c.ry * 0.3} fill="#C8703E" opacity={0.4} />
                  </g>
                ))}
              </g>

              {/* Bubbles when fermenting */}
              {calc.fermentation > 20 && [20,35,50,65,78].map((bx,i) => (
                <circle key={i}
                  cx={bx} cy={115 - Math.round(calc.fermentation * 0.5) - i*8}
                  r={2+i%3}
                  fill={hygieneVal>60?"#FFA726":"#EF5350"}
                  opacity={0.5+i*0.05}
                  className="ferm-bubble"
                  style={{animation:`bounce ${1+i*0.3}s ease-in-out infinite alternate`}}/>
              ))}

              {/* Danger bacteria if low hygiene */}
              {hygieneVal < 40 && (
                <g clipPath="url(#tr-jar-clip)">
                  {[22,45,68].map((bx,i) => (
                    <g key={i} transform={`translate(${bx},${100-i*12})`} opacity="0.7">
                      <circle cx="0" cy="0" r="5" fill="#EF5350"/>
                      <circle cx="-4" cy="-3" r="2" fill="#EF5350"/>
                      <circle cx="4" cy="-3" r="2" fill="#EF5350"/>
                      <circle cx="0" cy="-6" r="2" fill="#EF5350"/>
                    </g>
                  ))}
                </g>
              )}

              {/* Steam when hot fermentation */}
              {calc.fermentation > 50 && [38,52,66].map((sx,i) => (
                <path key={i} d={`M${sx},12 Q${sx-4+i*4},4 ${sx+2},${-4}`}
                  fill="none" stroke="#CFD8DC" strokeWidth="2.5" strokeLinecap="round"
                  opacity="0.6"
                  style={{animation:`steam-rise ${2+i*0.5}s ease-in-out infinite`}}/>
              ))}

              {/* Quality badge on jar */}
              {hygieneVal >= 60 && (
                <g transform="translate(72,8)">
                  <circle cx="0" cy="0" r="12" fill="#43A047" stroke="#2E7D32" strokeWidth="1.5"/>
                  <path d="M-5,0 L-2,4 L6,-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </g>
              )}
              {hygieneVal < 40 && (
                <g transform="translate(72,8)">
                  <polygon points="0,-12 12,8 -12,8" fill="#E53935" stroke="#B71C1C" strokeWidth="1.5"/>
                  <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">!</text>
                </g>
              )}
            </g>

            {/* Salt crystals scattered */}
            {saltVal > 40 && [70,90,200,215,230].map((sx,i) => (
              <g key={i} transform={`translate(${sx},158)`}>
                <rect x="-3" y="-3" width="6" height="6" fill="white" stroke="#B0BEC5" strokeWidth="0.8" rx="1"
                  transform={`rotate(${i*25})`} opacity="0.85"/>
                <rect x="-1.5" y="-1.5" width="3" height="3" fill="white" opacity="0.5"
                  transform={`rotate(${i*25+15})`}/>
              </g>
            ))}

            {/* Labels */}
            <rect x="10" y="165" width="90" height="16" rx="8" fill="#FFE0B2" stroke="#FF8F00" strokeWidth="1" opacity="0.9"/>
            <text x="55" y="176" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#E65100" fontFamily="sans-serif">
              {isId ? `Garam: ${saltVal}%` : `Salt: ${saltVal}%`}
            </text>
            <rect x="220" y="165" width="90" height="16" rx="8" fill="#E8F5E9" stroke="#43A047" strokeWidth="1" opacity="0.9"/>
            <text x="265" y="176" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#2E7D32" fontFamily="sans-serif">
              {isId ? `Kebersihan: ${hygieneVal}%` : `Hygiene: ${hygieneVal}%`}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-[9px] text-muted-foreground">
          <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-1 align-middle"></span>Bakteri berbahaya tinggi</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-1 align-middle"></span>Fermentasi baik</span>
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
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary/90 transition-all btn-3d">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics & Tip */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <StatCard label={isId ? "Risiko Keamanan" : "Safety Risk"} value={calc.safetyRisk} sub={calc.riskLabel} bg="bg-white" />
          <StatCard label={isId ? "Kualitas" : "Quality"} value={calc.quality} sub={calc.qualityLabel} bg="bg-white" />
          <StatCard label={isId ? "Fermentasi" : "Fermentation"} value={calc.fermentation} sub={calc.fermLabel} bg="bg-white" />
        </div>

        <MindfulTip 
          tipId="Garam berfungsi sebagai pengawet alami yang menghambat bakteri pembusuk (patogen) sambil membiarkan bakteri fermentasi yang baik bekerja!"
          tipEn="Salt acts as a natural preservative that inhibits decaying bacteria (pathogens) while allowing the beneficial fermentation bacteria to work!"
        />
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
        <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-2xl p-8 space-y-8">
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
            <button onClick={handleRecord} className="flex-1 py-5 bg-slate-900 text-white font-bold rounded-full btn-3d hover:scale-[1.02] active:scale-[0.98] transition-all text-xs tracking-widest uppercase">
               {isId ? "CATAT DATA" : "RECORD DATA"}
            </button>
            <button onClick={handleClear} className="px-6 py-5 bg-slate-100 text-slate-400 font-bold rounded-full btn-3d hover:bg-slate-200 transition-all text-xs tracking-widest uppercase">
               {isId ? "HAPUS" : "CLEAR"}
            </button>
          </div>
        </div>

        {/* Stunning Visual Pot Scene */}
        <div className="w-full lg:w-[420px] bg-white rounded-[40px] shadow-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group border border-slate-100">
          <div className="absolute inset-0 bg-white opacity-60" />
          
          {/* Subtle thermal glow behind the pot */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-all duration-300" 
            style={{ 
              width: `${150 + heatInput}px`, 
              height: `${150 + heatInput}px`, 
              backgroundColor: `rgba(245, 158, 11, ${heatInput / 200})` 
            }} 
          />
          
          <div className="relative w-full aspect-[4/5] flex flex-col items-center justify-center">
            
            {/* STEAM EFFECT */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-32 h-48 pointer-events-none z-20">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bottom-0 left-1/2 w-8 h-8 bg-slate-400/20 rounded-full blur-xl"
                  style={{
                    left: `${40 + Math.random() * 20}%`,
                    animation: `steam-rise ${2 + Math.random() * 2}s infinite linear`,
                    animationDelay: `${i * 0.5}s`,
                    opacity: heatInput > 20 ? (heatInput / 100) * 0.6 : 0,
                    transform: `scale(${0.5 + Math.random()})`
                  }}
                />
              ))}
            </div>

            {/* REAL POT ASSET + INTERACTIVE FIRE */}
            <div className="relative z-10 w-64 h-72 flex flex-col items-center justify-end group-hover:scale-105 transition-transform duration-700">
              <img
                src={potType === "clay" ? "/images/units/3/pot-brown.png" : "/images/units/3/pot-gray.png"}
                alt={potType === "clay" ? "Clay pot" : "Metal pot"}
                className="relative z-20 w-56 h-auto object-contain drop-shadow-2xl select-none pointer-events-none"
                style={{
                  filter: `drop-shadow(0 0 ${8 + heatInput / 8}px rgba(249,115,22,${0.15 + heatInput / 250}))`,
                }}
              />
              {/* Live fire under pot */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-44 h-28">
                <svg viewBox="0 0 200 112" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="egFlameR" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#dc2626" />
                      <stop offset="55%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#fb923c" />
                    </linearGradient>
                    <linearGradient id="egFlameO" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="60%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#fde047" />
                    </linearGradient>
                    <linearGradient id="egFlameY" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#fffbeb" />
                    </linearGradient>
                    <radialGradient id="egFlameGlow" cx="50%" cy="85%" r="60%">
                      <stop offset="0%" stopColor="#fdba74" stopOpacity={heatInput > 5 ? 0.7 : 0.15} />
                      <stop offset="100%" stopColor="#fdba74" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="100" cy="100" rx="92" ry="34" fill="url(#egFlameGlow)" />
                  {[
                    { x: 40, h: 44 }, { x: 62, h: 64 }, { x: 84, h: 82 }, { x: 100, h: 92 },
                    { x: 116, h: 80 }, { x: 138, h: 62 }, { x: 160, h: 44 }, { x: 72, h: 40 }, { x: 128, h: 42 },
                  ].map((f, i) => {
                    const ph = heatInput > 5 ? Math.max(10, (heatInput / 100) * f.h) : 6;
                    return (
                      <g key={i} transform={`translate(${f.x}, 104)`}>
                        <path d={`M0,0 C-9,-6 -11,-18 -5,-${ph} C-3,-${ph + 5} 3,-${ph + 5} 5,-${ph} C11,-18 9,-6 0,0 Z`}
                          fill="url(#egFlameR)" opacity={heatInput > 5 ? 0.95 : 0.3}
                          style={{ animation: heatInput > 5 ? `fire-flicker ${0.35 + (i % 3) * 0.1}s ease-in-out infinite alternate` : "none", animationDelay: `${i * 0.06}s`, transformOrigin: "0px 0px" }} />
                        <path d={`M0,0 C-5,-4 -6,-12 -3,-${ph * 0.7} C-1.5,-${ph * 0.7 + 3} 1.5,-${ph * 0.7 + 3} 3,-${ph * 0.7} C6,-12 5,-4 0,0 Z`}
                          fill="url(#egFlameO)" opacity={heatInput > 5 ? 0.9 : 0.3}
                          style={{ animation: heatInput > 5 ? `fire-flicker ${0.42 + (i % 3) * 0.1}s ease-in-out infinite alternate` : "none", animationDelay: `${i * 0.09}s`, transformOrigin: "0px 0px" }} />
                        <path d={`M0,0 C-2.5,-3 -3,-7 -1.5,-${ph * 0.42} C-0.5,-${ph * 0.42 + 2} 0.5,-${ph * 0.42 + 2} 1.5,-${ph * 0.42} C3,-7 2.5,-3 0,0 Z`}
                          fill="url(#egFlameY)" opacity={heatInput > 5 ? 0.95 : 0.3}
                          style={{ animation: heatInput > 5 ? `fire-flicker ${0.5 + (i % 3) * 0.1}s ease-in-out infinite alternate` : "none", animationDelay: `${i * 0.11}s`, transformOrigin: "0px 0px" }} />
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-3 bg-black/25 rounded-full blur-md" />
              {/* Ember sparks */}
              {heatInput > 40 && [...Array(5)].map((_, i) => (
                <div
                  key={`spark-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-amber-300"
                  style={{
                    left: `${35 + i * 8}%`,
                    bottom: `${12 + (i % 3) * 6}%`,
                    animation: `spark-rise ${1.2 + i * 0.3}s ease-out infinite`,
                    animationDelay: `${i * 0.4}s`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>

            </div>
          
          <div className="absolute top-6 left-8 flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-ping ${heatInput > 66 ? 'bg-red-500' : heatInput > 33 ? 'bg-orange-400' : 'bg-blue-400'}`} />
             <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">
               {heatInput > 66 ? (isId ? "Status: PANAS" : "Status: HOT") : heatInput > 33 ? (isId ? "Status: HANGAT" : "Status: WARM") : (isId ? "Status: DINGIN" : "Status: COLD")}
             </span>
          </div>
        </div>
      </div>

      {/* Outcome Bento Grid & Tip */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: isId ? "Retensi Panas" : "Heat Retention", v: Math.round(calc.retention), s: calc.retention > 60 ? (isId ? "Tinggi" : "High") : (isId ? "Normal" : "Normal"), c: "amber" },
            { l: isId ? "Efisiensi Energi" : "Energy Efficiency", v: Math.round(calc.efficiency), s: calc.efficiency > 60 ? (isId ? "Optimal" : "Optimal") : (isId ? "Rendah" : "Low"), c: "emerald" },
            { l: isId ? "Kehilangan Panas" : "Heat Loss", v: Math.round(calc.heatLoss), s: calc.heatLoss < 30 ? (isId ? "Minimal" : "Low") : (isId ? "Kritis" : "Critical"), c: "rose" },
            { l: isId ? "Dataset Log" : "Dataset Log", v: runs.length, s: isId ? "Data Aktif" : "Active Records", c: "indigo" },
          ].map(st => (
            <div key={st.l} className="group p-8 bg-white rounded-[40px] border border-slate-200 shadow-xl flex flex-col justify-between hover:bg-slate-900 hover:text-white transition-all duration-500 overflow-hidden relative">
               <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${st.c}-500/10 rounded-full blur-[40px] group-hover:bg-white/5`} />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">{st.l}</span>
               <div className="mt-4 flex items-baseline gap-2 relative z-10">
                  <span className={`text-4xl font-bold ${st.v > 70 ? 'text-emerald-500' : 'text-slate-900 group-hover:text-white'}`}>{st.v}</span>
                  <span className="text-[11px] font-bold uppercase opacity-40">{st.s}</span>
               </div>
            </div>
          ))}
        </div>

        <MindfulTip 
          tipId="Kuali tanah liat memiliki kapasitas kalor yang tinggi, artinya ia menyerap panas perlahan tapi menyimpannya lebih lama. Masakan matang merata tanpa boros energi!"
          tipEn="Clay pots have high specific heat capacity; they absorb heat slowly but retain it much longer. This ensures even cooking while saving energy!"
        />
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

        <div ref={animRef} className="relative h-52 bg-gradient-to-b from-stone-800 via-stone-900 to-black rounded-xl overflow-hidden border border-border/30">
          {/* Interactive wok / pan with fire */}
          <svg viewBox="0 0 320 200" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="wokMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="35%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="wokInside" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="sandFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="oilFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id="flameR" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="55%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
              <linearGradient id="flameO" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="60%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
              <linearGradient id="flameY" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#fffbeb" />
              </linearGradient>
              <radialGradient id="flameGlow" cx="50%" cy="85%" r="60%">
                <stop offset="0%" stopColor="#fdba74" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#fdba74" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="krFill" cx="40%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#FBF6E9" />
                <stop offset="65%" stopColor="#F0E6CE" />
                <stop offset="100%" stopColor="#DFCEA6" />
              </radialGradient>
            </defs>

            {/* Heat glow */}
            <ellipse cx="160" cy="158" rx="80" ry="40" fill="url(#flameGlow)" opacity={0.4 + fryTemp / 400} />

            {/* Stove base */}
            <ellipse cx="160" cy="184" rx="94" ry="9" fill="#0b1220" />
            <rect x="66" y="160" width="188" height="24" rx="5" fill="#334155" />
            <rect x="76" y="162" width="168" height="6" rx="3" fill="#475569" />
            <ellipse cx="160" cy="160" rx="48" ry="9" fill="#111827" stroke="#0f172a" strokeWidth="1" />

            {/* Wok (rounded bowl with rim + handle) */}
            <path d="M46,90 C52,124 100,150 160,150 C220,150 268,124 274,90 C260,102 200,110 160,110 C120,110 62,102 46,90 Z" fill="url(#wokMetal)" stroke="#0f172a" strokeWidth="2" />
            <ellipse cx="160" cy="90" rx="114" ry="23" fill="url(#wokInside)" stroke="#64748b" strokeWidth="2" />
            <ellipse cx="160" cy="90" rx="114" ry="23" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
            {/* Cooking medium */}
            <ellipse cx="160" cy="90" rx="103" ry="17" fill={fryMedium === "sand" ? "url(#sandFill)" : "url(#oilFill)"} opacity="0.96" />
            {fryMedium === "sand"
              ? [...Array(20)].map((_, i) => (
                  <circle key={i} className="particle" cx={66 + (i * 12) % 188} cy={86 + ((i * 7) % 3) * 4} r={1.1 + (i % 3) * 0.4} fill="#92400e"
                    style={{ animation: `float-sand ${1.2 + (i % 4) * 0.25}s ease-in-out infinite alternate`, animationDelay: `${(i % 5) * 0.15}s` }} />
                ))
              : [...Array(9)].map((_, i) => (
                  <circle key={i} cx={78 + i * 18} cy={86 + ((i * 5) % 3) * 4} r={2 + (i % 2)} fill="#fef3c7" opacity="0.5"
                    style={{ animation: `fry-shake ${0.4 + (i % 3) * 0.1}s infinite`, animationDelay: `${i * 0.1}s` }} />
                ))}
            {/* Kerupuk pieces shaking — real textured crackers */}
            <g className="food-item" style={{ transformOrigin: "160px 90px" }}>
              {/* Kerupuk 1 (round, irregular edge) */}
              <g>
                <path d="M135,67 C145,66 152,72 152,83 C152,94 145,101 135,101 C125,101 119,94 119,83 C119,72 126,68 135,67 Z" fill="url(#krFill)" stroke="#C9B58C" strokeWidth="1" />
                <path d="M135,67 C145,66 152,72 152,83 C152,94 145,101 135,101 C125,101 119,94 119,83 C119,72 126,68 135,67 Z" fill="none" stroke="#D9A441" strokeWidth="1.6" opacity="0.45" />
                {[[128,79],[139,75],[132,90],[143,88],[125,88],[140,95],[133,83]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r={1} fill="#8B5A2B" opacity={0.65} />
                ))}
                <ellipse cx="129" cy="77" rx="6" ry="3" fill="#FFFFFF" opacity="0.35" />
              </g>
              {/* Kerupuk 2 (oval, slightly tilted) */}
              <g transform="rotate(-12 175 88)">
                <path d="M175,80 C184,79 190,83 190,88 C190,94 184,98 175,98 C166,98 160,94 160,88 C160,83 166,81 175,80 Z" fill="url(#krFill)" stroke="#C9B58C" strokeWidth="1" />
                <path d="M175,80 C184,79 190,83 190,88 C190,94 184,98 175,98 C166,98 160,94 160,88 C160,83 166,81 175,80 Z" fill="none" stroke="#D9A441" strokeWidth="1.6" opacity="0.45" />
                {[[169,86],[180,83],[172,92],[182,90],[167,90],[177,95]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r={0.9} fill="#8B5A2B" opacity={0.6} />
                ))}
                <ellipse cx="170" cy="84" rx="5" ry="2.5" fill="#FFFFFF" opacity="0.35" />
              </g>
              {/* Kerupuk 3 (small round) */}
              <g>
                <path d="M155,89 C162,88 167,92 167,97 C167,102 162,106 155,106 C148,106 144,102 144,97 C144,92 149,90 155,89 Z" fill="url(#krFill)" stroke="#C9B58C" strokeWidth="1" />
                <path d="M155,89 C162,88 167,92 167,97 C167,102 162,106 155,106 C148,106 144,102 144,97 C144,92 149,90 155,89 Z" fill="none" stroke="#D9A441" strokeWidth="1.4" opacity="0.45" />
                {[[150,95],[159,93],[153,101],[160,99],[148,99]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r={0.8} fill="#8B5A2B" opacity={0.6} />
                ))}
                <ellipse cx="151" cy="93" rx="4" ry="2" fill="#FFFFFF" opacity={0.35} />
              </g>
            </g>
            {/* Flames (realistic tongues) — IN FRONT of the wok, wrapping its lower body */}
            <g>
              {/* Outer red tongues */}
              {[...Array(9)].map((_, i) => {
                const x = 92 + i * 17;
                return (
                  <path key={`fr-${i}`}
                    d={`M${x},160 q-9,-26 ${8 - (i % 2) * 4},-44 q9,22 ${4 + (i % 2) * 2},44 Z`}
                    fill="url(#flameR)" opacity="0.85"
                    style={{ animation: `fire-flicker ${0.35 + (i % 3) * 0.1}s ease-in-out infinite alternate`, animationDelay: `${i * 0.06}s`, transformOrigin: "0px 0px" }} />
                );
              })}
              {/* Mid orange tongues */}
              {[...Array(8)].map((_, i) => {
                const x = 104 + i * 17;
                return (
                  <path key={`fo-${i}`}
                    d={`M${x},162 q-7,-22 ${6 - (i % 2) * 3},-38 q7,18 ${3 + (i % 2) * 2},38 Z`}
                    fill="url(#flameO)" opacity="0.9"
                    style={{ animation: `fire-flicker ${0.42 + (i % 3) * 0.1}s ease-in-out infinite alternate`, animationDelay: `${i * 0.09}s`, transformOrigin: "0px 0px" }} />
                );
              })}
              {/* Inner yellow cores */}
              {[...Array(7)].map((_, i) => {
                const x = 118 + i * 17;
                return (
                  <path key={`fy-${i}`}
                    d={`M${x},163 q-5,-17 ${4 - (i % 2) * 2},-30 q5,14 ${2 + (i % 2) * 2},30 Z`}
                    fill="url(#flameY)" opacity="0.95"
                    style={{ animation: `fire-flicker ${0.5 + (i % 3) * 0.1}s ease-in-out infinite alternate`, animationDelay: `${i * 0.11}s`, transformOrigin: "0px 0px" }} />
                );
              })}
            </g>
            {/* Heat shimmer lines */}
            {[0, 1, 2].map((i) => (
              <path key={`shim-${i}`} d={`M${130 + i * 25} 64 Q${135 + i * 25} 50 ${140 + i * 25} 36`} fill="none" stroke="#fdba74" strokeWidth="1.5" opacity={0.2 + fryTemp / 500}
                style={{ animation: `steam-rise ${1.5 + i * 0.4}s linear infinite`, animationDelay: `${i * 0.3}s` }} />
            ))}
            {/* Handle */}
            <path d="M274 88 L312 78" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
            <circle cx="313" cy="77" r="5" fill="#334155" stroke="#0f172a" strokeWidth="1" />
          </svg>
          <div className="absolute top-2 left-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-[9px] font-bold tracking-widest uppercase">
            {fryTemp}°C · {fryTime}{isId ? " mnt" : " min"} · {fryMedium === "sand" ? (isId ? "Pasir Panas" : "Hot Sand") : (isId ? "Minyak" : "Oil")}
          </div>
          {fryMedium === "oil" && calc.oilAbsorption > 40 && (
            <div className="absolute top-3 right-3 text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg px-2 py-1 animate-pulse">
              {isId ? "Penyerapan Tinggi!" : "High Oil Absorption!"}
            </div>
          )}
          {fryMedium === "sand" && (
            <div className="absolute top-3 right-3 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1">
              {isId ? "Rendah Minyak!" : "Low Oil!"}
            </div>
          )}
        </div>

        {/* Medium selector */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setFryMedium("sand")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-full border-2 transition-all btn-3d ${fryMedium === "sand" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><circle cx="12" cy="5" r="3" fill="#fbbf24"/><path d="M3 21h18" stroke="#d97706" strokeWidth="2"/><path d="M3 21 Q12,17 21,21" fill="#fbbf24"/></svg>{isId ? "Pasir Panas" : "Hot Sand"}
          </button>
          <button onClick={() => setFryMedium("oil")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-full border-2 transition-all btn-3d ${fryMedium === "oil" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-border/40 bg-white text-muted-foreground"}`}>
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
        <button onClick={handleRun} className="w-full py-2.5 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary/90 transition-all btn-3d">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics & Tip */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <StatCard label={isId ? "Serap Minyak" : "Oil Absorb"} value={Math.round(calc.oilAbsorption)} sub={calc.oilLabel} bg="bg-white" />
          <StatCard label={isId ? "Kerenyahan" : "Crispiness"} value={Math.round(calc.crispiness)} sub={calc.crispLabel} bg="bg-white" />
          <StatCard label={isId ? "Energi" : "Energy"} value={Math.round(calc.energy)} sub={calc.energyLabel} bg="bg-white" />
          <StatCard label={isId ? "Keberlanjutan" : "Sustain."} value={Math.round(calc.sustainability)} sub={calc.sustLabel} bg="bg-white" />
        </div>

        <MindfulTip 
          tipId="Goreng pasir menggunakan radiasi panas dari butiran pasir kering. Teknik ini menghasilkan kerupuk renyah tanpa tambahan lemak jenuh (kolesterol)!"
          tipEn="Sand frying uses heat radiation from dry sand grains. This technique produces crispy crackers without adding saturated fats (cholesterol)!"
        />
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
      <div className="bg-white border-2 border-amber-300 rounded-xl px-4 py-3 flex items-start gap-3">
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
                {calc.tempOptimal ? "OK" : "!"}
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
            className={`flex-1 py-2 text-[11px] font-bold rounded-full border-2 transition-all btn-3d ${packaging === "banana" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border/40 bg-white text-muted-foreground"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><path d="M5 20 Q3 14 6 9 Q9 5 15 4 Q19 3.5 20 5 Q20 7 17 8 Q12 9 8 14 Q6 17 6 20 Z" fill="#fde047"/><path d="M6 19 Q4 14 7 10 Q10 6 15 5" stroke="#eab308" strokeWidth="1" strokeLinecap="round" fill="none"/></svg>{isId ? "Daun Pisang" : "Banana Leaf"}
          </button>
          <button onClick={() => setPackaging("plastic")}
            className={`flex-1 py-2 text-[11px] font-bold rounded-full border-2 transition-all btn-3d ${packaging === "plastic" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border/40 bg-white text-muted-foreground"}`}>
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
                className={`flex-1 py-2 text-[11px] font-bold rounded-full border-2 transition-all btn-3d ${starterQuality === s ? (s === "good" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : s === "medium" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-red-500 bg-red-50 text-red-700") : "border-border/40 bg-white text-muted-foreground"}`}>
                {s === "good" ? (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><circle cx="12" cy="12" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#92400e">1</text></svg>) : s === "medium" ? (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><circle cx="12" cy="12" r="9" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#6b7280">2</text></svg>) : (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="inline mr-1"><circle cx="12" cy="12" r="9" fill="#cd7c32" stroke="#92400e" strokeWidth="1.5"/><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#78350f">3</text></svg>)} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleRun} className="w-full mt-1 py-2.5 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary/90 transition-all btn-3d">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1"><rect x="2" y="14" width="20" height="8" rx="2" fill="white"/><rect x="4" y="18" width="4" height="4" rx="1" fill="#6366f1"/><rect x="10" y="15" width="4" height="7" rx="1" fill="#6366f1"/><rect x="16" y="11" width="4" height="11" rx="1" fill="#6366f1"/><path d="M5 12l4-4 4 2 6-6" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/></svg>{isId ? "Simpan Data" : "Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics & Tip */}
      <SimCard className="p-4 space-y-4">
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

        <MindfulTip 
          tipId="Fermentasi adalah proses bioteknologi tradisional di mana mikroorganisme (ragi) memecah pati menjadi gula dan alkohol secara perlahan."
          tipEn="Fermentation is a traditional biotechnology process where microorganisms (yeast) slowly break down starch into sugar and alcohol."
        />
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
      (t as HTMLElement).style.transform = `scale(${(0.4 + (mangroveCover / 100) * 0.6) * 1.5})`;
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
            style={{ height: `${mangroveCover * 0.34}px`, transition: "height 0.8s ease" }}>
            {/* Tree canopies */}
            {mangroveCover > 12 && [...Array(Math.ceil(mangroveCover / 14))].map((_, i) => {
              const treeSize = 18 + mangroveCover / 9;
              return (
                <div key={i} className="mangrove-tree absolute" style={{ bottom: 0, left: `${3 + i * 8}%` }}>
                  <svg width={treeSize} height={treeSize} viewBox="0 0 48 48" fill="none">
                    {/* canopy */}
                    <ellipse cx="24" cy="15" rx="17" ry="13" fill="#15803d"/>
                    <ellipse cx="17" cy="12" rx="10" ry="9" fill="#22c55e"/>
                    <ellipse cx="31" cy="14" rx="9" ry="8" fill="#16a34a"/>
                    <ellipse cx="24" cy="8" rx="8" ry="7" fill="#4ade80" opacity="0.7"/>
                    {/* trunk */}
                    <path d="M22,26 Q21,34 23,42 L25,42 Q27,34 26,26 Z" fill="#5b3a1b"/>
                    {/* prop / stilt roots */}
                    <path d="M23,38 L13,46 M24,39 L24,47 M25,38 L35,46 M21,35 L16,44 M27,35 L32,44"
                      stroke="#6b4423" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
              );
            })}
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
        <SliderRow label={isId ? "Tutupan Mangrove" : "Mangrove Cover"} value={mangroveCover} min={0} max={100} color="#10b981" onChange={setMangroveCover} note="%" />
        <SliderRow label={isId ? "Kekuatan Gelombang" : "Wave Strength"} value={waveStrength} min={10} max={100} color="#3b82f6" onChange={setWaveStrength} note="%" />
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-foreground">{isId ? "Penggunaan Lahan Pesisir" : "Coastal Land Use"}</div>
          <div className="flex gap-2">
            {([["natural", isId?"Alami":"Natural"], ["housing", isId?"Pemukiman":"Housing"], ["ponds", isId?"Tambak":"Ponds"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setCoastalUse(val)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-full border-2 transition-all btn-3d flex items-center justify-center gap-1 ${coastalUse === val ? (val === "natural" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : val === "housing" ? "border-slate-500 bg-slate-50 text-slate-700" : "border-blue-500 bg-blue-50 text-blue-700") : "border-border/40 bg-white text-muted-foreground"}`}>
                {val === "natural" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>}
                {val === "housing" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                {val === "ponds" && <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>}
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleRun} className="w-full mt-1 py-3 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary/90 transition-all btn-3d uppercase tracking-[0.2em]">
          {isId ? "Simpan Data" : "Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics & Tip */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-1.5">
          <StatCard label={isId ? "Abrasi" : "Erosion"} value={Math.round(calc.erosion)} sub={calc.erosionLabel} bg="bg-white" />
          <StatCard label={isId ? "Ikan" : "Fish"} value={Math.round(calc.fishProduction)} sub={calc.fishLabel} bg="bg-white" />
          <StatCard label={isId ? "Karbon" : "Carbon"} value={Math.round(calc.carbonStorage)} sub={calc.carbonLabel} bg="bg-white" />
          <StatCard label={isId ? "Biodiv." : "Biodiv."} value={Math.round(calc.biodiversity)} sub={calc.biodivLabel} bg="bg-white" />
          <StatCard label={isId ? "Risiko Banjir" : "Flood"} value={Math.round(calc.floodRisk)} sub={calc.floodLabel} bg="bg-white" />
        </div>

        <MindfulTip 
          tipId="Mangrove adalah 'benteng hijau' alami. Akarnya menahan tanah dari abrasi dan menjadi rumah bagi ribuan spesies laut kecil untuk berkembang biak."
          tipEn="Mangroves are natural 'green fortresses'. Their roots hold the soil against erosion and provide a safe nursery for thousands of marine species."
        />
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
          {/* ── 2D ARTIST NADRAN MARINE SCENE ── */}
          <svg viewBox="0 0 320 175" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nd-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#87CEEB"/>
                <stop offset="100%" stopColor="#4FC3F7"/>
              </linearGradient>
              <linearGradient id="nd-sea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={calc.waterQuality > 50 ? "#29B6F6" : "#546E7A"}/>
                <stop offset="100%" stopColor={calc.waterQuality > 50 ? "#0277BD" : "#263238"}/>
              </linearGradient>
              <filter id="nd-sh"><feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.2"/></filter>
            </defs>
            <rect width="320" height="175" fill="url(#nd-sky)"/>
            <circle cx="275" cy="28" r="18" fill="#FFC107"/>
            {[0,45,90,135,180,225,270,315].map((a,i) => (
              <line key={i} x1={275+Math.cos(a*Math.PI/180)*21} y1={28+Math.sin(a*Math.PI/180)*21}
                x2={275+Math.cos(a*Math.PI/180)*27} y2={28+Math.sin(a*Math.PI/180)*27}
                stroke="#FFD54F" strokeWidth="2" strokeLinecap="round"/>
            ))}
            <g opacity="0.85">
              <ellipse cx="60" cy="22" rx="38" ry="14" fill="white"/>
              <ellipse cx="40" cy="26" rx="24" ry="12" fill="white"/>
              <ellipse cx="82" cy="25" rx="26" ry="11" fill="white"/>
              <ellipse cx="190" cy="18" rx="30" ry="12" fill="white" opacity="0.7"/>
              <ellipse cx="168" cy="22" rx="20" ry="10" fill="white" opacity="0.7"/>
              <ellipse cx="212" cy="21" rx="22" ry="10" fill="white" opacity="0.7"/>
            </g>
            <path d="M0,78 Q40,72 80,76 Q120,80 160,74 Q200,68 240,72 Q280,76 320,70 L320,80 Z" fill="#4CAF50" opacity="0.6"/>
            {[30,60,95,130].map((x,i) => (
              <g key={i} transform={`translate(${x},70)`}>
                <rect x="-1.5" y="-14" width="3" height="14" fill="#2E7D32"/>
                <ellipse cx="0" cy="-16" rx={7+i%3} ry={8+i%2} fill="#388E3C" opacity="0.85"/>
                <ellipse cx="-4" cy="-12" rx={4+i%2} ry={5+i%2} fill="#43A047"/>
              </g>
            ))}
            <path d="M0,76 Q80,70 160,76 Q240,82 320,74 L320,175 L0,175 Z" fill="url(#nd-sea)"/>
            {[0,1,2,3].map(i => (
              <path key={i}
                d={`M${-20+i*5},${93+i*18} Q${60+i*5},${88+i*18} ${120+i*5},${93+i*18} Q${180+i*5},${98+i*18} ${240+i*5},${93+i*18} Q${300+i*5},${88+i*18} ${340+i*5},${93+i*18}`}
                fill="none" stroke="white" strokeWidth={1.5-i*0.2} opacity={0.3-i*0.05}
                style={{animation:`wave-move ${3+i*0.5}s ease-in-out infinite alternate`}}/>
            ))}
            {fishingIntensity <= 70 && (
              <g transform="translate(135,78)" filter="url(#nd-sh)" style={{animation:"boat-sway 3s ease-in-out infinite alternate"}}>
                <path d="M-28,10 Q-28,18 0,22 Q28,18 28,10 L20,-2 Q0,-6 -20,-2 Z" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5"/>
                <rect x="-15" y="-2" width="30" height="10" rx="2" fill="#FFCC02" stroke="#F9A825" strokeWidth="1"/>
                {[-12,-4,4,12].map((fx,fi) => (
                  <g key={fi}>
                    <line x1={fx} y1="-2" x2={fx} y2="-14" stroke="#555" strokeWidth="1"/>
                    <polygon points={`${fx+1},-14 ${fx+9},-10 ${fx+1},-6`} fill={["#EF5350","#42A5F5","#66BB6A","#FFA726"][fi]}/>
                  </g>
                ))}
                <circle cx="-8" cy="2" r="3" fill="#FF80AB" opacity="0.8"/>
                <circle cx="0" cy="0" r="3.5" fill="#FFB74D" opacity="0.8"/>
                <circle cx="8" cy="2" r="3" fill="#81D4FA" opacity="0.8"/>
                <line x1="0" y1="-2" x2="0" y2="-28" stroke="#5D4037" strokeWidth="2"/>
                <polygon points="1,-28 18,-20 1,-12" fill="#EF5350"/>
              </g>
            )}
            {fishingIntensity > 30 && [65, 200, 245].slice(0, Math.ceil(fishingIntensity/34)).map((bx,bi) => (
              <g key={bi} transform={`translate(${bx},83)`} filter="url(#nd-sh)"
                style={{animation:`boat-sway ${2.5+bi*0.4}s ease-in-out infinite alternate`}}>
                <path d="M-18,7 Q0,14 18,7 L12,-4 Q0,-8 -12,-4 Z" fill="#5D4037" stroke="#3E2723" strokeWidth="1.2"/>
                <line x1="0" y1="-4" x2="0" y2="-22" stroke="#6D4C41" strokeWidth="1.8"/>
                <polygon points="1,-22 16,-10 1,-4" fill="#ECEFF1" stroke="#90A4AE" strokeWidth="0.8"/>
              </g>
            ))}
            {Array.from({length:Math.round(calc.fishPopulation/8)}, (_,i) => {
              const fx = 15 + (i * 63) % 290;
              const fy = 108 + (i * 17) % 50;
              const flip = i%2===0;
              const color = i%3===0?"#FFA726":i%3===1?"#29B6F6":"#66BB6A";
              return (
                <g key={i} transform={`translate(${fx},${fy}) ${flip?"":"scale(-1,1) translate(-0,0)"}`}
                  style={{animation:`boat-sway ${1.5+(i%4)*0.5}s ease-in-out infinite alternate`, opacity: calc.waterQuality>30?1:0.3}}>
                  <ellipse cx="0" cy="0" rx="8" ry="4" fill={color}/>
                  <path d="M8,0 L13,-4 L13,4 Z" fill={color} opacity="0.8"/>
                  <circle cx="-4" cy="-1" r="1.5" fill="#1A237E"/>
                  <circle cx="-4.3" cy="-1.3" r="0.6" fill="white"/>
                </g>
              );
            })}
            {calc.waterQuality < 40 && (
              <g opacity="0.6">
                <ellipse cx="160" cy="125" rx="30" ry="8" fill="#546E7A"/>
                <ellipse cx="200" cy="140" rx="22" ry="6" fill="#37474F"/>
              </g>
            )}
            {calc.waterQuality > 60 && [40,80,240,270].map((cx,ci) => (
              <g key={ci} transform={`translate(${cx},158)`} opacity="0.8">
                <ellipse cx="0" cy="0" rx="6" ry="10" fill={["#EF5350","#FF8A65","#FFA726","#AB47BC"][ci]} opacity="0.7"/>
                <ellipse cx="-5" cy="3" rx="4" ry="7" fill={["#E53935","#F4511E","#FB8C00","#9C27B0"][ci]} opacity="0.5"/>
                <ellipse cx="5" cy="3" rx="4" ry="7" fill={["#FFCDD2","#FFCCBC","#FFE0B2","#E1BEE7"][ci]} opacity="0.5"/>
              </g>
            ))}
            <rect x="5" y="152" width="76" height="16" rx="8" fill="rgba(0,0,0,0.4)" opacity="0.85"/>
            <text x="43" y="163" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" fontFamily="sans-serif">
              {isId ? `Ikan: ${Math.round(calc.fishPopulation)}%` : `Fish: ${Math.round(calc.fishPopulation)}%`}
            </text>
            <rect x="239" y="152" width="76" height="16" rx="8" fill="rgba(0,0,0,0.4)" opacity="0.85"/>
            <text x="277" y="163" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" fontFamily="sans-serif">
              {isId ? `Tangkap: ${fishingIntensity}%` : `Fishing: ${fishingIntensity}%`}
            </text>
          </svg>
        </div>


      </SimCard>

      {/* Controls */}
      <SimCard className="p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</p>
        <SliderRow label={isId ? "Intensitas Penangkapan" : "Fishing Intensity"} value={fishingIntensity} min={10} max={100} color="#3b82f6" onChange={setFishingIntensity} note="%" />
        <SliderRow label={isId ? "Kesadaran Masyarakat" : "Community Awareness"} value={communityAwareness} min={0} max={100} color="#10b981" onChange={setCommunityAwareness} note="%" />
        <SliderRow label={isId ? "Pengelolaan Limbah" : "Waste Management"} value={wasteManagement} min={0} max={100} color="#8b5cf6" onChange={setWasteManagement} note="%" />
        <SliderRow label={isId ? "Upaya Konservasi" : "Conservation Efforts"} value={conservationEfforts} min={0} max={100} color="#f59e0b" onChange={setConservationEfforts} note="%" />
        <button onClick={handleRun} className="w-full mt-1 py-3 bg-primary text-white text-[13px] font-bold rounded-full hover:bg-primary/90 transition-all btn-3d uppercase tracking-[0.2em]">
          {isId ? "Simpan Data" : "Record Data"}
        </button>
      </SimCard>

      {/* Live Metrics & Tip */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <StatCard label={isId ? "Populasi Ikan" : "Fish Pop."} value={Math.round(calc.fishPopulation)} sub={calc.fishLabel} bg="bg-white" />
          <StatCard label={isId ? "Kualitas Air" : "Water Quality"} value={Math.round(calc.waterQuality)} sub={calc.waterLabel} bg="bg-white" />
          <StatCard label={isId ? "Keanekaragaman" : "Biodiv."} value={Math.round(calc.marineBiodiversity)} sub={calc.biodivLabel} bg="bg-white" />
          <StatCard label={isId ? "Skor Keberlanjutan" : "Sustainability"} value={Math.round(calc.sustainabilityScore)} sub={calc.sustLabel} bg="bg-white" />
        </div>

        <MindfulTip 
          tipId="Menjaga ekosistem laut berarti menjaga masa depan. Kesadaran kita untuk tidak membuang sampah ke laut sangat menentukan keberlangsungan hidup biota laut!"
          tipEn="Protecting the marine ecosystem means protecting the future. Our awareness to not throw waste into the sea is crucial for the survival of marine life!"
        />
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
    case 1: return <NasiJamblangSim key="u1" onRun={onRun || (() => {})} />;
    case 2: return <TerasiSim key="u2" onRun={onRun || (() => {})} />;
    case 3: return <EmpalGentongSim key="u3" onRun={onRun || (() => {})} />;
    case 4: return <KerupukMelaratSim key="u4" onRun={onRun || (() => {})} />;
    case 5: return <TapeKetanSim key="u5" onRun={onRun || (() => {})} />;
    case 6: return <MangroveSim key="u6" onRun={onRun || (() => {})} />;
    case 7: return <NadranSim key="u7" onRun={onRun || (() => {})} />;
    default: return null;
  }
};
