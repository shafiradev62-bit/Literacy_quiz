import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCompletedSession } from "@/hooks/useExamSession";

interface Unit8PisaProps { onExit?: () => void; studentId?: string; }

const STEP_LABELS_EN = ["Introduction","Question 1","Question 2","Question 3","Question 4","Question 5"];
const STEP_LABELS_ID = ["Pendahuluan","Soal 1","Soal 2","Soal 3","Soal 4","Soal 5"];

const Unit8Pisa = ({ onExit, studentId }: Unit8PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [currentStep, setCurrentStep] = useState(0);
  const [showWritingGuide, setShowWritingGuide] = useState(false);
  const [harvestRate, setHarvestRate] = useState(50);
  const [replanting, setReplanting] = useState(50);
  const [wasteUse, setWasteUse] = useState(50);
  const [outputs, setOutputs] = useState({ biodiversity:"High" as "Low"|"Medium"|"High", localIncome:"Medium" as "Low"|"Medium"|"High", envImpact:"Medium" as "Low"|"Medium"|"High", sustainability:50 });
  const [history, setHistory] = useState<Record<string,any>[]>([]);
  const [q1Answer, setQ1Answer] = useState("");
  const [q2Choice, setQ2Choice] = useState("");
  const [q2Explain, setQ2Explain] = useState("");
  const [q3Choice, setQ3Choice] = useState("");
  const [q4Answer, setQ4Answer] = useState("");
  const [q5Answer, setQ5Answer] = useState("");
  const [sessionSaved, setSessionSaved] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const isStepValid = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) {
      const count = getWordCount(q1Answer);
      return count >= 15;
    }
    if (currentStep === 2) {
      const count = getWordCount(q2Explain);
      return !!q2Choice && count >= 15;
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
  React.useEffect(() => {
    const data = {
      currentStep, harvestRate, replanting, wasteUse, outputs, history,
      q1Answer, q2Choice, q2Explain, q3Choice, q4Answer, q5Answer
    };
    localStorage.setItem(`unit8_autosave`, JSON.stringify(data));
  }, [currentStep, harvestRate, replanting, wasteUse, outputs, history, q1Answer, q2Choice, q2Explain, q3Choice, q4Answer, q5Answer]);

  // LOAD AUTO-SAVE
  React.useEffect(() => {
    const saved = localStorage.getItem(`unit8_autosave`);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.currentStep !== undefined) setCurrentStep(d.currentStep);
        if (d.harvestRate !== undefined) setHarvestRate(d.harvestRate);
        if (d.replanting !== undefined) setReplanting(d.replanting);
        if (d.wasteUse !== undefined) setWasteUse(d.wasteUse);
        if (d.outputs !== undefined) setOutputs(d.outputs);
        if (d.history !== undefined) setHistory(d.history);
        if (d.q1Answer !== undefined) setQ1Answer(d.q1Answer);
        if (d.q2Choice !== undefined) setQ2Choice(d.q2Choice);
        if (d.q2Explain !== undefined) setQ2Explain(d.q2Explain);
        if (d.q3Choice !== undefined) setQ3Choice(d.q3Choice);
        if (d.q4Answer !== undefined) setQ4Answer(d.q4Answer);
        if (d.q5Answer !== undefined) setQ5Answer(d.q5Answer);
      } catch (e) { console.error("Failed to load unit8 autosave", e); }
    }
  }, []);

  const runSimulation = () => {
    let bio:"Low"|"Medium"|"High"="Medium", income:"Low"|"Medium"|"High"="Medium", env:"Low"|"Medium"|"High"="Medium", score=50;
    if(harvestRate>=70){bio="Low";env="High";score-=20;}else if(harvestRate<40){bio="High";env="Low";score+=15;}
    if(harvestRate>=70){income="High";score+=10;}else if(harvestRate<40){income="Low";score-=10;}
    if(replanting>=70){if(bio==="Low")bio="Medium";else if(bio==="Medium")bio="High";score+=15;}else if(replanting<=30){if(bio==="High")bio="Medium";score-=10;}
    if(wasteUse>=70){if(env==="High")env="Medium";score+=10;}else if(wasteUse<=30){if(env==="Low")env="Medium";else if(env==="Medium")env="High";score-=10;}
    setOutputs({biodiversity:bio,localIncome:income,envImpact:env,sustainability:Math.max(0,Math.min(100,score))});
  };

  const handleRecord = () => setHistory(prev=>[...prev,{id:prev.length+1,harvest:harvestRate,replanting,wasteUse,biodiversity:outputs.biodiversity,income:outputs.localIncome,env:outputs.envImpact,sustainability:outputs.sustainability}]);

  const handleExit = () => {
    if (!sessionSaved) {
      const score = [q1Answer, q2Choice, q3Choice, q4Answer, q5Answer].filter(v => v && v.trim().length > 0).length;
      saveCompletedSession(8, { q1Answer, q2Choice, q2Explain, q3Choice, q4Answer, q5Answer, history }, score, 5);
      setSessionSaved(true);
    }
    onExit?.();
  };

  const sc = (v:"Low"|"Medium"|"High",inv=false)=>{
    if(!inv){if(v==="High")return"text-primary bg-primary/10 border-primary/30";if(v==="Low")return"text-foreground/50 bg-muted/50 border-border";return"text-foreground/70 bg-muted/30 border-border";}
    if(v==="High")return"text-foreground/50 bg-muted/50 border-border";if(v==="Low")return"text-primary bg-primary/10 border-primary/30";return"text-foreground/70 bg-muted/30 border-border";
  };
  const ssc=(v:number)=>v>=70?"text-primary bg-primary/10 border-primary/30":v<=30?"text-foreground/50 bg-muted/50 border-border":"text-foreground/70 bg-muted/30 border-border";
  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      <header className="h-14 bg-white border-b border-border/60 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">8</div>
            <span className="font-bold text-sm tracking-tight text-foreground uppercase">{isId?"Unit 8: Industri Kerajinan Rotan":"Unit 8: Rattan Craft Industry"}</span>
          </div>
          <div className="h-6 w-px bg-border/60"/>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(s=>(
                <div key={s} className="flex flex-col items-center gap-0.5">
                  <div className={`w-7 h-1.5 rounded-full transition-all ${currentStep>=s?"bg-primary":"bg-border"}`}/>
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${currentStep>=s?"text-primary":"text-muted-foreground/40"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={()=>setCurrentStep(p=>Math.max(0,p-1))} disabled={currentStep===0} className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button onClick={()=>setCurrentStep(p=>Math.min(5,p+1))} disabled={currentStep===5 || !isStepValid()} className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
          <div className="w-px h-6 bg-border/60 mx-2"/>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/60 px-2 py-1 rounded">{stepLabels[currentStep]}</span>
          <div className="w-px h-6 bg-border/60 mx-2"/>
          <button onClick={handleExit} className="px-3 py-1.5 bg-background text-foreground text-[10px] font-bold rounded border border-border hover:bg-muted transition-colors uppercase tracking-wider">{isId?"Kembali":"Back"}</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT: Questions */}
        <div className="w-[45%] bg-emerald-50/60 border-r border-emerald-200 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-4 exam-scrollbar">

            {currentStep===0&&(
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-[10px]">{isId?"Pendahuluan":"Introduction"}</h2>
                  <h1 className="text-xl font-bold text-foreground leading-tight">{isId?"INDUSTRI KERAJINAN ROTAN (ROTAN PLERED)":"RATTAN CRAFT INDUSTRY (ROTAN PLERED)"}</h1>
                </div>
                <div className="text-[13px] leading-[1.8] text-foreground/80 space-y-3">
                  <p>{isId?"Di Cirebon, rotan digunakan untuk membuat furnitur dan kerajinan tangan. Rotan merupakan hasil hutan bukan kayu, yang berarti diambil dari ekosistem hutan tanpa menebang pohon.":"In Cirebon, rattan is used to make furniture and handicrafts. Rattan is a non-timber forest product, which means it is taken from forest ecosystems without cutting down trees."}</p>
                  <p>{isId?"Para peneliti tertarik pada bagaimana rotan dapat dipanen dan digunakan secara berkelanjutan. Pemanenan rotan secara berkelanjutan dapat mendukung mata pencaharian lokal sekaligus membantu menjaga keanekaragaman hayati hutan dan keseimbangan ekologi.":"Researchers are interested in how rattan can be harvested and used in a sustainable way. Sustainable rattan harvesting can support local livelihoods while helping to maintain forest biodiversity and ecological balance."}</p>
                  <p>{isId?"Dalam penyelidikan ini, siswa memeriksa tiga faktor penting: tingkat panen, upaya penanaman kembali, dan pemanfaatan limbah.":"In this investigation, students examine three important factors: harvest rate, replanting effort, and waste utilization."}</p>
                  <div className="rounded-xl overflow-hidden border border-border/40 bg-black/5">
                    <video
                      src="/videos/unit8-rattan.mp4"
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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

            {currentStep===1&&(
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div>
                  <h2 className="text-base font-bold text-foreground">{isId?"Soal 1 / 5":"Question 1 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId?"Pengumpulan Data":"Data Collection"}</p>
                  <p>{isId?"Siswa menggunakan tiga indikator untuk mempelajari keberlanjutan di hutan dan industri. Mereka mengumpulkan data dari area hutan dan area produksi kerajinan.":"Students use three indicators to study sustainability in the forest and the industry. They collect data from both the forest area and the craft-production area."}</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>{isId?"Pemantau panen: mencatat berapa banyak rotan yang dipanen dari hutan dalam satu periode":"Harvest monitor: records how much rattan is harvested from the forest in one period"}</li>
                    <li>{isId?"Pemantau penanaman kembali: mencatat berapa banyak tanaman rotan baru yang ditanam setelah panen":"Replanting monitor: records how many new rattan plants are added after harvesting"}</li>
                    <li>{isId?"Pemantau penggunaan limbah: mencatat berapa banyak limbah rotan yang digunakan kembali dibandingkan dibuang":"Waste-use monitor: records how much rattan waste is reused instead of being discarded"}</li>
                  </ul>
                  <p className="mt-1">{isId?"Siswa mengumpulkan dua pengukuran untuk setiap kondisi dan kemudian membandingkan polanya.":"Students collect two measurements for each condition and then compare the pattern."}</p>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId?"Dalam menyelidiki produksi rotan yang berkelanjutan, mengapa siswa mengukur dua kali untuk setiap indikator dibandingkan hanya menggunakan satu pengukuran untuk setiap indikator?":"In investigating sustainable rattan production, why do students measure two of each indicator instead of using only one measurement for each indicator?"}</p>
                <textarea value={q1Answer} onChange={e=>setQ1Answer(e.target.value)} className="w-full h-32 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder={isId?"Ketik jawabanmu di sini...":"Type your answer here..."}/>
                <p className={`text-[10px] font-bold text-right ${getWordCount(q1Answer) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q1Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
              </div>
            )}

            {currentStep===2&&(
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
                  <h2 className="text-base font-bold text-foreground">{isId?"Soal 2 / 5":"Question 2 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId?"Analisis Data":"Data Analysis"}</p>
                  <p>{isId?"Siswa membandingkan hasil rata-rata dari beberapa percobaan simulasi:":"The students compare the average results from different simulation runs:"}</p>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-[11px] border-collapse">
                      <thead><tr className="bg-muted/50">
                        <th className="border border-border/40 px-2 py-1 text-left">{isId?"Kondisi":"Condition"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Tingkat Panen":"Harvest Rate"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Penggunaan Limbah":"Waste Use"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Rata-rata Keanekaragaman Hayati":"Avg Biodiversity"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Rata-rata Pendapatan Lokal":"Avg Local Income"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Dampak Lingkungan":"Env Impact"}</th>
                      </tr></thead>
                      <tbody>
                        <tr><td className="border border-border/40 px-2 py-1">A</td><td className="border border-border/40 px-2 py-1 text-center">80</td><td className="border border-border/40 px-2 py-1 text-center">70</td><td className="border border-border/40 px-2 py-1 text-center">32 ± 5</td><td className="border border-border/40 px-2 py-1 text-center">78 ± 6</td><td className="border border-border/40 px-2 py-1 text-center">{isId?"Sedang":"Medium"}</td></tr>
                        <tr><td className="border border-border/40 px-2 py-1">B</td><td className="border border-border/40 px-2 py-1 text-center">40</td><td className="border border-border/40 px-2 py-1 text-center">20</td><td className="border border-border/40 px-2 py-1 text-center">68 ± 6</td><td className="border border-border/40 px-2 py-1 text-center">45 ± 5</td><td className="border border-border/40 px-2 py-1 text-center">{isId?"Tinggi":"High"}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId?"Dua siswa memiliki pendapat yang berbeda tentang faktor yang paling bertanggung jawab terhadap penurunan keanekaragaman hayati hutan.\n\nSiswa 1 berpendapat bahwa penurunan keanekaragaman hayati terutama disebabkan oleh tingkat panen yang tinggi.\nSiswa 2 berpendapat bahwa penurunan keanekaragaman hayati terutama disebabkan oleh rendahnya pemanfaatan limbah di workshop.\n\nBerdasarkan data, siswa manakah yang lebih didukung?":"Two students disagree about which factor is most responsible for a decline in forest biodiversity.\n\nStudent 1 thinks biodiversity decline is mainly caused by a high harvest rate.\nStudent 2 thinks biodiversity decline is mainly caused by low waste utilization in the workshop.\n\nAccording to the data, which student is more strongly supported?"}</p>
                <div className="space-y-2">
                  {[{val:"student1",en:"Student 1",id:"Siswa 1"},{val:"student2",en:"Student 2",id:"Siswa 2"}].map(opt=>(
                    <label key={opt.val} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q2choice" className="w-4 h-4 accent-primary" checked={q2Choice===opt.val} onChange={()=>setQ2Choice(opt.val)}/>
                      <span className="text-[13px] text-foreground/80">{isId?opt.id:opt.en}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{isId?"Jelaskan jawabanmu":"Explain your answer"}</p>
                <textarea value={q2Explain} onChange={e=>setQ2Explain(e.target.value)} className="w-full h-28 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder={isId?"Ketik penjelasanmu di sini...":"Type your explanation here..."}/>
                <p className={`text-[10px] font-bold text-right ${getWordCount(q2Explain) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q2Explain)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
              </div>
            )}

            {currentStep===3&&(
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</div>
                  <h2 className="text-base font-bold text-foreground">{isId?"Soal 3 / 5":"Question 3 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId?"Ringkasan Simulasi":"Simulation Summary"}</p>
                  <p>{isId?"Dalam model ini, keberlanjutan paling tinggi ketika regenerasi hutan seimbang dengan kegiatan panen dan ketika limbah dimanfaatkan kembali menjadi produk baru.":"In this model, sustainability is highest when forest regeneration keeps pace with harvesting and when waste materials are reused in new products."}</p>
                  <table className="w-full text-[11px] border-collapse mt-2">
                    <thead><tr className="bg-muted/50"><th className="border border-border/40 px-2 py-1 text-left">{isId?"Indikator":"Indicator"}</th><th className="border border-border/40 px-2 py-1">{isId?"Keberlanjutan Rendah":"Low Sustainability"}</th><th className="border border-border/40 px-2 py-1">{isId?"Keberlanjutan Tinggi":"High Sustainability"}</th></tr></thead>
                    <tbody>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Tingkat panen":"Harvest rate"}</td><td className="border border-border/40 px-2 py-1 text-center">{isId?"Sangat tinggi":"Very high"}</td><td className="border border-border/40 px-2 py-1 text-center">{isId?"Seimbang":"Balanced"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Penanaman kembali":"Replanting"}</td><td className="border border-border/40 px-2 py-1 text-center">{isId?"Rendah":"Low"}</td><td className="border border-border/40 px-2 py-1 text-center">{isId?"Tinggi":"High"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Pemanfaatan limbah":"Waste utilization"}</td><td className="border border-border/40 px-2 py-1 text-center">{isId?"Rendah":"Low"}</td><td className="border border-border/40 px-2 py-1 text-center">{isId?"Tinggi":"High"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId?"Prosedur manakah yang akan membuat industri kerajinan rotan menjadi lebih berkelanjutan?":"Which procedure would make the rattan craft industry more sustainable?"}</p>
                <div className="space-y-2.5">
                  {[
                    {val:"A",en:"Increasing the harvest rate without increasing replanting.",id:"Meningkatkan tingkat panen tanpa meningkatkan penanaman kembali."},
                    {val:"B",en:"Increasing replanting and reusing more production waste.",id:"Meningkatkan penanaman kembali dan menggunakan kembali lebih banyak limbah produksi."},
                    {val:"C",en:"Discarding more waste so the workshop stays clean.",id:"Membuang lebih banyak limbah agar workshop tetap bersih."},
                    {val:"D",en:"Focusing only on short-term income from harvesting.",id:"Hanya berfokus pada pendapatan jangka pendek dari hasil panen."},
                  ].map(opt=>(
                    <label key={opt.val} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q3" className="w-4 h-4 accent-primary" checked={q3Choice===opt.val} onChange={()=>setQ3Choice(opt.val)}/>
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.val}</span>
                      <span className="text-[13px] text-foreground/70">{isId?opt.id:opt.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep===4&&(
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">4</div>
                  <h2 className="text-base font-bold text-foreground">{isId?"Soal 4 / 5":"Question 4 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId?"Hasil Simulasi Saat Ini":"Current Simulation Results"}</p>
                  <p>{isId?"Jalankan simulasi pada Soal 1 dan gunakan hasil saat ini sebagai bukti.":"Run the simulation on Question 1 and use the current outputs as evidence."}</p>
                  <table className="w-full text-[11px] border-collapse mt-2">
                    <thead><tr className="bg-muted/50">
                      <th className="border border-border/40 px-2 py-1">{isId?"Panen":"Harvest"}</th>
                      <th className="border border-border/40 px-2 py-1">{isId?"Penanaman Kembali":"Replanting"}</th>
                      <th className="border border-border/40 px-2 py-1">{isId?"Penggunaan Limbah":"Waste Use"}</th>
                      <th className="border border-border/40 px-2 py-1">{isId?"Keanekaragaman Hayati":"Biodiversity"}</th>
                      <th className="border border-border/40 px-2 py-1">{isId?"Pendapatan Lokal":"Local Income"}</th>
                      <th className="border border-border/40 px-2 py-1">{isId?"Dampak Lingkungan":"Env Impact"}</th>
                    </tr></thead>
                    <tbody>
                      <tr>
                        <td className="border border-border/40 px-2 py-1 text-center">{harvestRate}</td>
                        <td className="border border-border/40 px-2 py-1 text-center">{replanting}</td>
                        <td className="border border-border/40 px-2 py-1 text-center">{wasteUse}</td>
                        <td className="border border-border/40 px-2 py-1 text-center">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[outputs.biodiversity]:outputs.biodiversity}</td>
                        <td className="border border-border/40 px-2 py-1 text-center">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[outputs.localIncome]:outputs.localIncome}</td>
                        <td className="border border-border/40 px-2 py-1 text-center">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[outputs.envImpact]:outputs.envImpact}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Hint: what "balanced" looks like */}
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg px-4 py-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div className="text-[11px] text-blue-800 leading-relaxed">
                    <p className="font-bold mb-1">{isId ? "Apa itu Kombinasi Seimbang?" : "What is a Balanced Combination?"}</p>
                    <p className="mb-2">{isId ? "Kombinasi seimbang berarti variabel tidak semuanya di level yang sama. Tujuannya adalah menemukan titik tengah yang menguntungkan semua aspek." : "A balanced combination means variables are not all at the same level. The goal is to find a middle ground that benefits all aspects."}</p>
                    <div className="bg-blue-100 rounded px-2 py-1.5">
                      <p className="font-semibold text-[10px] mb-0.5">{isId ? "Contoh Kombinasi Baik:" : "Example of Good Balance:"}</p>
                      <p className="text-[10px]">{isId ? "• Panen: Sedang (40-60)" : "• Harvest: Medium (40-60)"}</p>
                      <p className="text-[10px]">{isId ? "• Penanaman kembali: Tinggi (70-100)" : "• Replanting: High (70-100)"}</p>
                      <p className="text-[10px]">{isId ? "• Penggunaan limbah: Tinggi (70-100)" : "• Waste Use: High (70-100)"}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId?"Sebuah workshop di Cirebon ingin meningkatkan pendapatan dengan cepat dengan memanen lebih banyak rotan, tetapi tidak ingin keanekaragaman hayati menurun terlalu banyak.\n\nGunakan simulasi dan tentukan satu kombinasi variabel yang memberikan keseimbangan yang wajar antara pendapatan lokal dan keanekaragaman hayati.":"A workshop in Cirebon wants to increase income quickly by harvesting more rattan, but it does not want biodiversity to decline too much.\n\nUse the simulation and identify one combination of variables that gives a reasonable balance between local income and biodiversity."}</p>
                <button onClick={()=>setShowWritingGuide(!showWritingGuide)} className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors text-[11px] font-bold text-foreground/70">
                  {isId?"Tampilkan Panduan Menulis":"Show Writing Guide"}
                  <svg className={`w-3 h-3 ml-auto transition-transform ${showWritingGuide?"rotate-180":""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {showWritingGuide&&(
                  <div className="bg-muted/40 border border-border p-4 rounded-lg">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId?"Panduan Menulis":"Writing Guide"}</p>
                    <p className="text-[12px] text-foreground/70 leading-relaxed italic">{isId?"Jawaban yang baik mengusulkan tingkat panen yang moderat disertai dengan penanaman kembali yang lebih tinggi dan pemanfaatan limbah yang lebih tinggi, serta menjelaskan mengapa hal tersebut menyeimbangkan pendapatan dan perlindungan lingkungan.":"A strong answer proposes a moderate harvest rate together with higher replanting and higher waste utilization, and explains why this balances income and environmental protection."}</p>
                  </div>
                )}
                <textarea value={q4Answer} onChange={e=>setQ4Answer(e.target.value)} className="w-full h-32 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder={isId?"Ketik jawabanmu di sini...":"Type your answer here..."}/>
                <p className={`text-[10px] font-bold text-right ${getWordCount(q4Answer) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q4Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
              </div>
            )}

            {currentStep===5&&(
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">5</div>
                  <h2 className="text-base font-bold text-foreground">{isId?"Soal 5 / 5":"Question 5 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId?"Pengambilan Keputusan":"Decision Making"}</p>
                  <p>{isId?"Pengelolaan berkelanjutan hasil hutan non-kayu bergantung pada keseimbangan antara kesehatan ekologi dan kebutuhan ekonomi.":"Sustainable management of non-timber forest products depends on balancing ecological health with economic needs."}</p>
                  <table className="w-full text-[11px] border-collapse mt-2">
                    <thead><tr className="bg-muted/50"><th className="border border-border/40 px-2 py-1 text-left">{isId?"Fokus kebijakan":"Policy focus"}</th><th className="border border-border/40 px-2 py-1 text-left">{isId?"Dampak yang mungkin terjadi":"Possible effect"}</th></tr></thead>
                    <tbody>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Pengendalian panen":"Controlled harvesting"}</td><td className="border border-border/40 px-2 py-1">{isId?"Mencegah penurunan cepat sumber daya hutan":"Prevents rapid decline of forest resources"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Program penanaman kembali":"Replanting programs"}</td><td className="border border-border/40 px-2 py-1">{isId?"Mendukung pasokan rotan di masa depan":"Supports future rattan supply"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Inovasi penggunaan ulang limbah":"Waste reuse innovation"}</td><td className="border border-border/40 px-2 py-1">{isId?"Mengurangi polusi dan menciptakan produk baru":"Reduces pollution and creates new products"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Dukungan bagi pengrajin lokal":"Support for local craftspeople"}</td><td className="border border-border/40 px-2 py-1">{isId?"Menjaga mata pencaharian di Cirebon":"Maintains livelihoods in Cirebon"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId?"Jika kamu menjadi penasihat pemerintah daerah di Cirebon, kebijakan apa yang akan kamu rekomendasikan untuk mendukung industri kerajinan rotan yang berkelanjutan?\n\nJawabanmu harus menyebutkan hutan, mata pencaharian, dan limbah produksi.":"If you were advising the local government in Cirebon, what policy would you recommend to support a sustainable rattan craft industry?\n\nYour answer should mention forests, livelihoods, and production waste."}</p>
                <button onClick={()=>setShowWritingGuide(!showWritingGuide)} className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors text-[11px] font-bold text-foreground/70">
                  {isId?"Tampilkan Panduan Menulis":"Show Writing Guide"}
                  <svg className={`w-3 h-3 ml-auto transition-transform ${showWritingGuide?"rotate-180":""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {showWritingGuide&&(
                  <div className="bg-muted/40 border border-border p-4 rounded-lg">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId?"Panduan Menulis":"Writing Guide"}</p>
                    <p className="text-[12px] text-foreground/70 leading-relaxed italic">{isId?"Jawaban yang baik merekomendasikan pengaturan tingkat panen, peningkatan penanaman kembali, dan pemanfaatan limbah rotan secara berkelanjutan agar pendapatan industri tetap berjalan tanpa merusak keanekaragaman hayati hutan.":"A strong response recommends regulating harvest levels, increasing replanting, and promoting circular use of rattan waste so that industry income can continue without harming forest biodiversity."}</p>
                  </div>
                )}
                <textarea value={q5Answer} onChange={e=>setQ5Answer(e.target.value)} className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder={isId?"Ketik rekomendasi kebijakanmu di sini...":"Type your policy recommendation here..."}/>
                <p className={`text-[10px] font-bold text-right ${getWordCount(q5Answer) >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q5Answer)} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </p>
              </div>
            )}

          </div>
          {/* ── BOTTOM NAVIGATION ── */}
          <div className="px-6 py-4 border-t-2 border-primary/20 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)] shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={()=>setCurrentStep(p=>Math.max(0,p-1))} disabled={currentStep===0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border font-bold text-[13px] text-foreground bg-white hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
                {isId?"Kembali":"Back"}
              </button>
              <div className="flex-1 text-center text-[11px] font-bold text-muted-foreground">{stepLabels[currentStep]} · {currentStep}/5</div>
              {currentStep < 5 ? (
                <button onClick={()=>setCurrentStep(p=>Math.min(5,p+1))} disabled={!isStepValid()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
                  {isId?"Soal Berikutnya":"Next Question"}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </button>
              ) : (
                <button onClick={handleExit} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] transition-all shadow-md">
                  {isId?"Kirim & Selesai":"Submit & Finish"}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Simulation */}
        <div className="flex-1 bg-lime-50/50 flex flex-col overflow-hidden">
          <div className="p-6 h-full flex flex-col gap-5 overflow-y-auto exam-scrollbar">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40"/>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{isId?"Simulasi Industri Kerajinan Rotan":"Rattan Craft Industry Simulation"}</h3>
              </div>
            </div>

            {/* ── DRAG-DROP PREVIEW: Rattan Production Chain ── */}
            <div className="bg-white rounded-2xl border-2 border-primary/20 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {isId ? "RANTAI PRODUKSI ROTAN" : "RATTAN PRODUCTION CHAIN"}
              </p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {([
                  {type:"leaf" as const, label: isId?"Hutan":"Forest", color:"bg-emerald-100 border-emerald-400 text-emerald-800"},
                  {type:"arrow" as const, label:"", color:""},
                  {type:"saw" as const, label: isId?"Panen":"Harvest", color:"bg-amber-100 border-amber-400 text-amber-800"},
                  {type:"arrow" as const, label:"", color:""},
                  {type:"factory" as const, label: isId?"Workshop":"Workshop", color:"bg-blue-100 border-blue-400 text-blue-800"},
                  {type:"arrow" as const, label:"", color:""},
                  {type:"sofa" as const, label: isId?"Produk":"Product", color:"bg-purple-100 border-purple-400 text-purple-800"},
                  {type:"arrow" as const, label:"", color:""},
                  {type:"recycle" as const, label: isId?"Limbah":"Waste", color:"bg-rose-100 border-rose-400 text-rose-800"},
                ] as const).map((item, i) => item.type === "arrow"
                  ? <span key={i} className="text-muted-foreground font-bold text-xl shrink-0">→</span>
                  : <div key={i} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 shrink-0 ${item.color}`}>
                      {item.type === "leaf" && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>}
                      {item.type === "saw" && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M6.34 6.34L3 3M12 2v3M2 12h3M6.34 17.66L3 21M21 3l-3.34 3.34M17.66 17.66L21 21M12 22v-3"/></svg>}
                      {item.type === "factory" && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>}
                      {item.type === "sofa" && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"/><path d="M4 18v2M20 18v2"/></svg>}
                      {item.type === "recycle" && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/></svg>}
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">{isId ? "Atur slider di bawah untuk melihat dampak pada setiap tahap rantai produksi." : "Adjust sliders below to see the impact on each stage of the production chain."}</p>
            </div>

            {/* ── HIGH-FIDELITY SVG FOREST SIMULATION ── */}
            <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isId ? "EKOSISTEM HUTAN ROTAN" : "RATTAN FOREST ECOSYSTEM"}
              </p>
              <svg viewBox="0 0 340 160" className="w-full drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f0f9ff" />
                    <stop offset="100%" stopColor="#e0f2fe" />
                  </linearGradient>
                  <linearGradient id="forestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#065f46" />
                    <stop offset="100%" stopColor="#064e3b" />
                  </linearGradient>
                  <linearGradient id="treeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <radialGradient id="sunEffect" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
                  </radialGradient>
                  <filter id="premium-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="1.5" />
                    <feComponentTransfer><feFuncA type="linear" slope="0.15"/></feComponentTransfer>
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <path d="M0,0 L6,2 L0,4 Z" fill="#94a3b8"/>
                  </marker>
                </defs>

                {/* Background Ecospace */}
                <rect width="160" height="130" rx="16" fill="url(#skyGrad)" />
                <circle cx="120" cy="30" r="40" fill="url(#sunEffect)" />
                <path d="M0,130 Q40,110 80,125 T160,115 L160,130 L0,130 Z" fill="#064e3b" opacity="0.3" />

                {/* Forest Trees (Density based on harvest) - organic shapes */}
                {Array.from({ length: Math.round(Math.max(2, 8 - (harvestRate / 15))) }).map((_, i) => (
                  <g key={i} transform={`translate(${15 + i * 18}, 110)`} filter="url(#premium-shadow)">
                    <path d="M-1.5,0 Q-2,-7.5 0,-15 Q2,-7.5 1.5,0 Z" fill="#451a03" />
                    <ellipse cx="0" cy="-22" rx="10" ry="12" fill="url(#treeGrad)" />
                    <ellipse cx="-3" cy="-28" rx="6" ry="7" fill="#34d399" opacity="0.9" />
                    <ellipse cx="3" cy="-26" rx="5" ry="6" fill="#22c55e" opacity="0.8" />
                  </g>
                ))}

                {/* Rattan Vines */}
                {Array.from({ length: Math.round(Math.max(1, 6 - (harvestRate / 18))) }).map((_, i) => (
                  <path key={i} d={`M${25 + i * 22},115 Q${35 + i * 22},70 ${20 + i * 22},40`} 
                    stroke="#a3e635" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="80" strokeDashoffset="0" className="opacity-80" />
                ))}

                {/* Replanting Shoots - organic ground */}
                <g transform="translate(0, 130)">
                  <path d="M0,0 Q40,-2 80,0 Q120,-2 160,0 L160,30 Q120,32 80,30 Q40,32 0,30 Z" fill="#14532d" />
                  {Array.from({ length: Math.floor(replanting / 12) }).map((_, i) => (
                    <g key={i} transform={`translate(${10 + i * 14}, 18)`}>
                      <path d="M0,0 Q-3,-6 0,-10 Q3,-6 0,0" fill="#bef264" />
                      <path d="M0,0 Q-2,-5 0,-8 Q2,-5 0,0" fill="#a3e635" opacity="0.6"/>
                      <line y2="-6" stroke="#4ade80" strokeWidth="1" />
                    </g>
                  ))}
                  <text x="80" y="10" textAnchor="middle" fontSize="6" fill="#ecfccb" fontWeight="black" style={{letterSpacing: '1px'}}>{isId ? "ZONA REHABILITASI" : "REHABILITATION ZONE"}</text>
                </g>

                {/* Workshop Connector */}
                <path d="M165,80 L185,80" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arrowhead)" />

                {/* Workshop Building - organic shape */}
                <g transform="translate(195, 20)" filter="url(#premium-shadow)">
                  <path d="M0,16 Q0,0 16,0 L119,0 Q135,0 135,16 L135,94 Q135,110 119,110 L16,110 Q0,110 0,94 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <path d="M16,30 Q67.5,28 119,30" stroke="#f1f5f9" strokeWidth="1" fill="none"/>
                  <text x="67.5" y="20" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b" style={{letterSpacing: '0.5px'}}>{isId ? "BALAI PRODUKSI" : "PRODUCTION SITE"}</text>
                  
                  {/* Rattan Inventory - organic bundles */}
                  <g transform="translate(25, 45)">
                     <ellipse cx="25" cy="2.5" rx="25" ry="2.5" fill="#d97706" />
                     <ellipse cx="22.5" cy="12.5" rx="22.5" ry="2.5" fill="#b45309" opacity="0.8" />
                     <ellipse cx="27.5" cy="22.5" rx="27.5" ry="2.5" fill="#92400e" opacity="0.7" />
                     <text x="25" y="38" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#94a3b8">{isId ? "Stok Rotan" : "Rattan Stock"}</text>
                  </g>
                  
                  {/* Waste Circularity Icon */}
                  <g transform="translate(95, 60)">
                    <circle r="18" fill={wasteUse > 70 ? "#ecfdf5" : wasteUse > 40 ? "#fffbeb" : "#fef2f2"} />
                    <circle r="18" fill="none" stroke={wasteUse > 70 ? "#10b981" : wasteUse > 40 ? "#f59e0b" : "#ef4444"} strokeWidth="1.5" strokeDasharray={113} strokeDashoffset={113 - (wasteUse * 1.13)} />
                    <text textAnchor="middle" dy=".3em" fontSize="9" fontWeight="black" fill={wasteUse > 70 ? "#065f46" : wasteUse > 40 ? "#92400e" : "#991b1b"}>{wasteUse}%</text>
                    <text y="28" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#64748b">{isId ? "Limbah" : "Waste"}</text>
                  </g>
                </g>
              </svg>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm space-y-6">
              {[
                { label: isId?"Tingkat Panen":"Harvest Rate", value: harvestRate, set: setHarvestRate, color: "bg-orange-500" },
                { label: isId?"Upaya Penanaman Kembali":"Replanting Effort", value: replanting, set: setReplanting, color: "bg-green-600" },
                { label: isId?"Pemanfaatan Limbah":"Waste Utilization", value: wasteUse, set: setWasteUse, color: "bg-blue-500" },
              ].map(({ label, value, set, color }) => (
                <div key={label} className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[13px] font-bold text-foreground/80">{label}</span>
                    <span className="text-[14px] font-black text-foreground tabular-nums bg-muted px-2 py-0.5 rounded-md border border-border/50">{value}%</span>
                  </div>
                  <div className="relative h-6 flex items-center group">
                    <div className="absolute inset-0 h-2 my-auto bg-muted rounded-full overflow-hidden border border-border/20">
                      <div className={`h-full ${color} transition-all duration-300 opacity-60`} style={{ width: `${value}%` }} />
                    </div>
                    <input type="range" min={0} max={100} step={1} value={value}
                      onChange={e => set(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                        [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-foreground 
                        [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:active:scale-110 
                        [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white 
                        [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-foreground 
                        [&::-moz-range-thumb]:shadow-lg"
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={runSimulation} className="flex-1 py-3.5 bg-foreground text-background text-[13px] font-black rounded-xl hover:opacity-90 transition-all shadow-md active:scale-[0.98] uppercase tracking-wider">{isId?"Jalankan Simulasi":"Run Simulation"}</button>
                <button onClick={handleRecord} className="px-6 py-3.5 bg-white text-foreground text-[13px] font-bold rounded-xl border-2 border-border/60 hover:bg-muted transition-all active:scale-[0.98]">{isId?"Catat":"Record"}</button>
              </div>
            </div>

            {/* Outputs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: isId?"Keanekaragaman Hayati":"Biodiversity", val: outputs.biodiversity, iconType: "leaf" as const },
                { label: isId?"Pendapatan Lokal":"Local Income", val: outputs.localIncome, iconType: "money" as const },
                { label: isId?"Dampak Lingkungan":"Env Impact", val: outputs.envImpact, iconType: "globe" as const },
                { label: isId?"Skor Keberlanjutan":"Sustain. Score", val: outputs.sustainability, iconType: "chart" as const },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl border border-border/50 p-4 text-center shadow-sm hover:shadow-md transition-all border-b-4 border-b-border">
                  <div className="text-[9px] text-muted-foreground mb-2 font-black tracking-widest uppercase flex items-center justify-center gap-1.5">
                    {item.iconType === "leaf" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>}
                    {item.iconType === "money" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                    {item.iconType === "globe" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                    {item.iconType === "chart" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                    {item.label}
                  </div>
                  <div className="text-[1.5rem] font-black text-foreground leading-none mb-2">
                    {typeof item.val === 'number' ? item.val : (isId ? {Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[item.val] : item.val)}
                  </div>
                  <div className={`h-1.5 w-full rounded-full bg-muted overflow-hidden`}>
                    <div className={`h-full transition-all duration-1000 ${
                      item.val === "High" || (typeof item.val === 'number' && item.val >= 70) ? "bg-green-500" : 
                      item.val === "Medium" || (typeof item.val === 'number' && item.val >= 40) ? "bg-amber-500" : "bg-red-500"
                    }`} style={{ width: typeof item.val === 'number' ? `${item.val}%` : item.val === "High" ? "100%" : item.val === "Medium" ? "50%" : "20%" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* History Table */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">{isId?"Riwayat Data":"Data History"}</span>
                  <button onClick={() => setHistory([])} className="text-[11px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-wider">{isId?"Hapus":"Clear"}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["#", isId?"Panen":"Harvest", isId?"Tanam":"Replant", isId?"Limbah":"Waste", isId?"Keanekaragaman":"Biodiversity", isId?"Pendapatan":"Income", isId?"Dampak":"Impact"].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((row, i) => (
                        <tr key={row.id} className={i % 2 === 1 ? "bg-gray-50/60" : ""}>
                          <td className="px-3 py-2.5 text-gray-400 font-medium">{row.id}</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900">{row.harvest}%</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.replanting}%</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.wasteUse}%</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.biodiversity as string]:row.biodiversity}</td>
                          <td className="px-3 py-2.5 text-gray-700">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.income as string]:row.income}</td>
                          <td className="px-3 py-2.5 text-gray-700">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.env as string]:row.env}</td>
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

export default Unit8Pisa;
