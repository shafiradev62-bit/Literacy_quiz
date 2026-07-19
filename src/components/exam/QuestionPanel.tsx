import React, { useState, useMemo } from "react";
import { ExamQuestion } from "@/data/examQuestions";
import { useLanguage } from "@/contexts/LanguageContext";
import { SimulationEngine } from "./SimulationEngine";

interface QuestionPanelProps {
  question: ExamQuestion;
  answer: string | string[] | undefined;
  isFlagged: boolean;
  onAnswer: (questionId: number, answer: string | string[]) => void;
  onFlag: (questionId: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
  questionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedSet: Set<number>;
  onGoTo: (index: number) => void;
  unit?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  allAnswers?: Record<number, string | string[]>;
  questions?: ExamQuestion[];
}

const QuestionPanel = ({
  question,
  answer,
  isFlagged,
  onAnswer,
  onFlag,
  onPrev,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  questionIndex,
  totalQuestions,
  answeredCount,
  flaggedSet,
  onGoTo,
  unit = 2,
  allAnswers = {},
  questions = [],
}: QuestionPanelProps) => {
  const { t, lang } = useLanguage();
  const isId = lang === "id";

  const unitStyles = useMemo(() => {
    const themes: Record<number, { left: string; right: string; border: string; accent: string; options: string[] }> = {
      1: { left: "bg-emerald-50/50", right: "bg-white", border: "border-emerald-100", accent: "text-emerald-700", options: ["bg-emerald-50/40", "bg-teal-50/40", "bg-green-50/40", "bg-slate-50/40"] },
      2: { left: "bg-blue-50/50", right: "bg-white", border: "border-blue-100", accent: "text-blue-700", options: ["bg-blue-50/40", "bg-sky-50/40", "bg-indigo-50/40", "bg-slate-50/40"] },
      3: { left: "bg-amber-50/50", right: "bg-white", border: "border-amber-100", accent: "text-amber-700", options: ["bg-amber-50/40", "bg-yellow-50/40", "bg-orange-50/40", "bg-slate-50/40"] },
      4: { left: "bg-orange-50/50", right: "bg-white", border: "border-orange-100", accent: "text-orange-700", options: ["bg-orange-50/40", "bg-amber-50/40", "bg-red-50/40", "bg-slate-50/40"] },
      5: { left: "bg-lime-50/50", right: "bg-white", border: "border-lime-100", accent: "text-lime-700", options: ["bg-lime-50/40", "bg-emerald-50/40", "bg-green-50/40", "bg-slate-50/40"] },
      6: { left: "bg-teal-50/50", right: "bg-white", border: "border-teal-100", accent: "text-teal-700", options: ["bg-teal-50/40", "bg-cyan-50/40", "bg-sky-50/40", "bg-slate-50/40"] },
      7: { left: "bg-cyan-50/50", right: "bg-white", border: "border-cyan-100", accent: "text-cyan-700", options: ["bg-cyan-50/40", "bg-blue-50/40", "bg-sky-50/40", "bg-slate-50/40"] },
    };
    return themes[unit || 2] || themes[2];
  }, [unit]);

  const [saltVal, setSaltVal] = useState(22);
  const [dryingDays, setDryingDays] = useState(2);
  const [hygieneVal, setHygieneVal] = useState(60);
  const [shrimpVal, setShrimpVal] = useState(70);
  const [simRuns, setSimRuns] = useState<{no: number; salt: number; drying: number; hygiene: number; shrimp: number; quality: number; safetyRisk: number; sustainability: number}[]>([]);

  const simCalc = useMemo(() => {
    const quality = Math.round(Math.min(100, saltVal * 0.4 + hygieneVal * 0.4 + dryingDays * 3 + shrimpVal * 0.1));
    const safetyRisk = Math.round(Math.max(0, 100 - saltVal * 0.5 - hygieneVal * 0.5 + (7 - dryingDays) * 2));
    const sustainability = Math.round(Math.min(100, shrimpVal * 0.6 + hygieneVal * 0.2 + saltVal * 0.1 + dryingDays * 2));
    const qualityLabel = quality >= 67 ? "High" : quality >= 34 ? "Medium" : "Low";
    const riskLabel = safetyRisk >= 67 ? "High" : safetyRisk >= 34 ? "Medium" : "Low";
    const sustLabel = sustainability >= 67 ? "High" : sustainability >= 34 ? "Medium" : "Low";
    return { quality, safetyRisk, sustainability, qualityLabel, riskLabel, sustLabel };
  }, [saltVal, dryingDays, hygieneVal, shrimpVal]);

  const runSim = () => {
    setSimRuns((prev) => [...prev, {
      no: prev.length + 1,
      salt: saltVal, drying: dryingDays, hygiene: hygieneVal, shrimp: shrimpVal,
      quality: simCalc.quality, safetyRisk: simCalc.safetyRisk, sustainability: simCalc.sustainability
    }]);
  };

  const showSim = unit === 2 && question.id === 2;
  const hasSimData = simRuns.length > 0;

  // Enhanced simulation with visual indicators
  const getQualityColor = (value: number) => {
    if (value >= 75) return "text-green-600";
    if (value >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (value: number) => {
    if (value <= 25) return "text-green-600";
    if (value <= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getGaugeWidth = (value: number) => `${Math.min(100, Math.max(0, value))}%`;

  // Unit 3 simulation state
  const [potType, setPotType] = useState<"clay" | "metal">("clay");
  const [wallThickness, setWallThickness] = useState(5);
  const [heatInput, setHeatInput] = useState(80);
  const [waterVolume, setWaterVolume] = useState(4);
  const [u3Runs, setU3Runs] = useState<{no: number; pot: string; wall: number; heat: number; water: number; retention: number; evenHeat: number; energy: number; envImpact: number; cookingTime: number}[]>([]);

  const u3Calc = useMemo(() => {
    const isClay = potType === "clay";
    const retention = Math.round(Math.min(100, (isClay ? 40 : 20) + wallThickness * 4 + heatInput * 0.2 - waterVolume * 2));
    const evenHeat = Math.round(Math.min(100, (isClay ? 30 : 50) + heatInput * 0.3 + wallThickness * 2 - waterVolume));
    const energy = Math.round(Math.min(100, (isClay ? 50 : 70) - wallThickness * 2 + heatInput * 0.3 - waterVolume));
    const envImpact = Math.round(Math.min(100, (isClay ? 20 : 60) + waterVolume * 3 + heatInput * 0.2));
    const cookingTime = Math.round(Math.max(10, (isClay ? 90 : 60) + wallThickness * 3 + waterVolume * 4 - heatInput * 0.5));
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { retention, evenHeat, energy, envImpact, cookingTime, retLabel: label(retention), evenLabel: label(evenHeat), energyLabel: label(energy), envLabel: label(envImpact) };
  }, [potType, wallThickness, heatInput, waterVolume]);

  const recordU3 = () => {
    setU3Runs(prev => [...prev, { no: prev.length + 1, pot: potType === "clay" ? "Clay" : "Metal", wall: wallThickness, heat: heatInput, water: waterVolume, retention: u3Calc.retention, evenHeat: u3Calc.evenHeat, energy: u3Calc.energy, envImpact: u3Calc.envImpact, cookingTime: u3Calc.cookingTime }]);
  };

  // Unit 4 simulation state
  const [fryMedium, setFryMedium] = useState<"oil" | "sand">("sand");
  const [fryTemp, setFryTemp] = useState(160);
  const [fryTime, setFryTime] = useState(3);
  const [isReused, setIsReused] = useState(false);
  const [u4Runs, setU4Runs] = useState<{no: number; medium: string; temp: number; time: number; reused: string; oilAbsorption: number; crispiness: number; energy: number; sustainability: number}[]>([]);

  const u4Calc = useMemo(() => {
    const isSand = fryMedium === "sand";
    const oilAbsorption = Math.round(Math.max(0, Math.min(100, isSand ? 10 + fryTemp * 0.05 + fryTime * 2 : 30 + fryTemp * 0.1 + fryTime * 3 - (isReused ? 5 : 0))));
    const crispiness = Math.round(Math.min(100, (isSand ? 40 : 30) + fryTemp * 0.3 + fryTime * 4 - (isReused ? 5 : 0)));
    const energy = Math.round(Math.min(100, fryTemp * 0.4 + fryTime * 5 - (isSand ? 10 : 0) - (isReused ? 8 : 0)));
    const sustainability = Math.round(Math.min(100, (isSand ? 70 : 30) + (isReused ? 20 : 0) - fryTemp * 0.1));
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { oilAbsorption, crispiness, energy, sustainability, oilLabel: label(oilAbsorption), crispLabel: label(crispiness), energyLabel: label(energy), sustLabel: label(sustainability) };
  }, [fryMedium, fryTemp, fryTime, isReused]);

  const recordU4 = () => {
    setU4Runs(prev => [...prev, {
      no: prev.length + 1,
      medium: fryMedium === "sand" ? "Sand" : "Oil",
      temp: fryTemp, time: fryTime,
      reused: isReused ? "Yes" : "No",
      oilAbsorption: u4Calc.oilAbsorption,
      crispiness: u4Calc.crispiness,
      energy: u4Calc.energy,
      sustainability: u4Calc.sustainability,
    }]);
  };

  const handleNext = () => {
    if (question.type === "open" && currentWordCount < 15) {
      return; // Prevent navigation if validation fails
    }
    onNext();
  };

  const handleSubmit = () => {
    if (question.type === "open" && currentWordCount < 15) {
      return; // Prevent submission if validation fails
    }
    onSubmit();
  };

  const selectedMCQ = answer as string | undefined;
  const selectedCheckbox = (answer as string[]) || [];

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const currentWordCount = question.type === "open" ? getWordCount(answer as string || "") : 0;
  const isAnswerValid = useMemo(() => {
    if (question.type === "open") {
      return currentWordCount >= 15;
    }
    if (question.type === "mcq") {
      return !!answer;
    }
    if (question.type === "checkbox") {
      return (answer as string[] || []).length > 0;
    }
    return true;
  }, [question, answer, currentWordCount]);

  const getOptions = () => {
    if (lang === "id" && question.optionsIdn) {
      return question.optionsIdn;
    }
    return question.options || [];
  };

  const options = getOptions();
  const checkboxShouldBeSingle =
    question.type === "checkbox" &&
    (typeof question.correct === "string" ||
      (Array.isArray(question.correct) && question.correct.length <= 1));

  const handleMCQ = (option: string) => {
    onAnswer(question.id, option);
  };

  const handleCheckbox = (option: string) => {
    if (checkboxShouldBeSingle) {
      onAnswer(question.id, [option]);
      return;
    }
    // Enforce max selection = 2 for Unit 4 Question 4
    const isUnit4Q4 = question.id === 4 && question.questionIdn?.includes("PILIH 2");
    if (isUnit4Q4 && !selectedCheckbox.includes(option) && selectedCheckbox.length >= 2) {
      return; // Prevent selecting more than 2
    }
    const updated = selectedCheckbox.includes(option)
      ? selectedCheckbox.filter((o) => o !== option)
      : [...selectedCheckbox, option];
    onAnswer(question.id, updated);
  };

  const getQuestionText = () => {
    if (lang === "id" && question.questionIdn) {
      return question.questionIdn;
    }
    return question.question;
  };

  const getPlaceholder = () => {
    if (lang === "id") {
      return "Tulis jawaban Anda di sini.";
    }
    return "Write your response here.";
  };

  return (
    <div className={`h-full flex flex-col ${unitStyles.right} transition-colors duration-500`}>
      {/* Question Navigator */}
      <div className="px-5 pt-4 pb-3 border-b border-exam-divider bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-1 mb-2.5">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const qId = i + 1;
            const isAnswered = answeredCount > 0;
            const isCurrent = i === questionIndex;
            const isFuture = i > questionIndex;
            const canNavigate = !isFuture || isAnswerValid;
            const isItemFlagged = flaggedSet.has(qId);

            return (
              <button
                key={i}
                onClick={() => canNavigate && onGoTo(i)}
                disabled={!canNavigate}
                className={`relative w-8 h-8 text-xs font-semibold rounded-md transition-all duration-200 shadow-sm ${
                  isCurrent
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
                    : isItemFlagged
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : !canNavigate
                    ? "bg-muted/30 text-muted-foreground/30 border border-border/30 cursor-not-allowed"
                    : "bg-white text-muted-foreground hover:bg-secondary border border-border/50"
                }`}
              >
                {i + 1}
                {isItemFlagged && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {answeredCount} of {totalQuestions} {t("answered", "dijawab")}
          </p>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary/80"></span>
              <span className="text-[10px] text-muted-foreground">{t("Current", "Aktif")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="text-[10px] text-muted-foreground">{t("Flagged", "Ditandai")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto exam-scrollbar px-5 py-5">
        <div className="fade-in" key={question.id}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                {questionIndex + 1}
              </div>
              <h2 className="text-base font-bold text-foreground">
                {isId ? `Soal ${questionIndex + 1} / ${totalQuestions}` : `Question ${questionIndex + 1} / ${totalQuestions}`}
              </h2>
            </div>
            <button
              onClick={() => onFlag(question.id)}
              className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-md transition-all duration-150 ${
                isFlagged
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {isFlagged ? t("Flagged", "Ditandai") : t("Flag", "Tandai")}
            </button>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm mb-5">
            <h2 className="text-[14px] font-medium text-foreground leading-relaxed whitespace-pre-line">
              {getQuestionText()}
            </h2>
            
            {/* Question Media (Image/Video) */}
            {question.mediaUrl && (
              <div className="mt-4 mb-3">
                {question.mediaType === "video" ? (
                  <div className="rounded-lg overflow-hidden border border-border/40 bg-muted/10">
                    <video 
                      src={question.mediaUrl} 
                      controls 
                      className="w-full aspect-video object-cover"
                      preload="metadata"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border border-border/40 bg-muted/10 group relative">
                    <img 
                      src={question.mediaUrl} 
                      alt="Question media" 
                      className="w-full h-auto object-cover max-h-[400px] cursor-zoom-in"
                      onClick={() => window.open(question.mediaUrl, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>
                )}
              </div>
            )}
            
            {question.id === 3 && unit === 2 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground">{isId ? "Gunakan data simulasi Anda untuk menjawab." : "Use your simulation data to answer."}</p>
                <details className="mt-2">
                  <summary className="text-[11px] font-medium text-primary cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{isId ? "Jawaban yang kuat menjelaskan bahwa waktu pengeringan yang lebih singkat mengurangi penguapan air, sehingga kadar air tetap tinggi dan memungkinkan lebih banyak pertumbuhan mikroba, yang meningkatkan risiko keamanan." : "A strong answer explains that shorter drying time reduces water evaporation, so moisture remains high and allows more microbial growth, which increases safety risk."}</p>
                </details>
              </div>
            )}
            {question.id === 4 && unit === 2 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground">{isId ? "Petunjuk: Lihat kombinasi mana yang menghasilkan risiko TINGGI dalam data Anda." : "Hint: Look at which combination produces HIGH risk in your data."}</p>
                <details className="mt-2">
                  <summary className="text-[11px] font-medium text-primary cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{isId ? "Jawaban yang kuat menyebutkan tingkat kebersihan tertinggi yang masih menghasilkan risiko tinggi saat garam sangat rendah, lalu mengutip baris data dari tabel sebagai bukti." : "A strong answer states the highest hygiene level that still produces high risk when salt is very low, then cites a data row from the table as evidence."}</p>
                </details>
              </div>
            )}
            {question.id === 5 && unit === 2 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground mr-auto">{isId ? "Gunakan data simulasi Anda untuk menjawab." : "Use your simulation data to answer."}</p>
                <div className="flex items-center gap-2">
                   <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentWordCount >= 15 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {currentWordCount} {isId ? "kata" : "words"} (Min. 15)
                   </div>
                   <details>
                      <summary className="text-[11px] font-medium text-primary cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{isId ? "Jawaban yang kuat merekomendasikan kombinasi garam tinggi, kebersihan tinggi, dan pengeringan cukup, lalu menjelaskan alasan ilmiahnya dan dampak terhadap keberlanjutan udang." : "A strong answer recommends a combination of high salt, high hygiene, and adequate drying, then explains the scientific reason and the impact on shrimp sustainability."}</p>
                   </details>
                </div>
              </div>
            )}
          </div>

            {/* UNIT 2 SIMULATION */}
            {unit === 2 && (
              <SimulationEngine unit={unit as 2} />
            )}

          {/* Dynamic Warning for Question 2 - removed */}

          {/* Unit 3 writing guides for open questions */}
          {unit === 3 && question.type === "open" && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <details>
                <summary className="text-[11px] font-medium text-blue-700 cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                <p className="text-[11px] text-blue-600 mt-1 leading-relaxed">
                  {question.id === 3 && (isId
                    ? "Jawaban yang kuat membandingkan efisiensi energi wadah tanah liat vs logam menggunakan data dari tabel, dan menjelaskan mengapa tanah liat lebih hemat energi karena kemampuannya menahan panas lebih lama."
                    : "A strong answer compares energy efficiency of clay vs metal pot using data from the table, and explains why clay is more efficient due to its heat retention properties.")}
                  {question.id === 4 && (isId
                    ? "Jawaban yang kuat merekomendasikan kombinasi spesifik (jenis wadah + ketebalan), lalu mengutip dua baris data dari tabel sebagai bukti yang mendukung rekomendasi tersebut."
                    : "A strong answer recommends a specific combination (pot type + thickness), then cites two rows of data from the table as evidence supporting that recommendation.")}
                  {question.id === 5 && (isId
                    ? "Jawaban yang kuat membandingkan wadah tanah liat dan logam dari sisi efisiensi energi, dampak lingkungan, dan keberlanjutan, lalu memberikan rekomendasi yang jelas dengan alasan ilmiah."
                    : "A strong answer compares clay and metal pots in terms of energy efficiency, environmental impact, and sustainability, then makes a clear recommendation with scientific reasoning.")}
                </p>
              </details>
            </div>
          )}

            {/* UNIT 3 SIMULATION */}
            {unit === 3 && (
              <SimulationEngine unit={unit as 3} />
            )}

          {/* Unit 4 writing guides for open questions */}
          {unit === 4 && question.type === "open" && (
            <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <details>
                <summary className="text-[11px] font-medium text-amber-700 cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  {question.id === 3 && (isId
                    ? "Jawaban yang kuat menjelaskan bahwa pasir tidak mengandung minyak sehingga tidak ada minyak yang diserap oleh kerupuk, berbeda dengan penggorengan minyak di mana minyak meresap ke dalam makanan."
                    : "A strong answer explains that sand contains no oil so there is no oil to be absorbed by the cracker, unlike oil frying where oil penetrates into the food.")}
                  {question.id === 4 && (isId
                    ? "Jawaban yang kuat menyebutkan kombinasi terbaik (media + suhu + waktu), lalu mengutip dua baris data dari tabel yang menunjukkan kerenyahan tinggi dengan penggunaan energi rendah atau sedang."
                    : "A strong answer states the best combination (medium + temp + time), then cites two rows from the table showing high crispiness with low or medium energy use.")}
                  {question.id === 5 && (isId
                    ? "Jawaban yang kuat membandingkan penggorengan pasir dan minyak dari sisi kesehatan, penggunaan energi, dan keberlanjutan, lalu memberikan rekomendasi yang jelas."
                    : "A strong answer compares sand and oil frying in terms of health, energy use, and sustainability, then makes a clear recommendation.")}
                </p>
              </details>
            </div>
          )}

            {/* UNIT 4 SIMULATION */}
            {unit === 4 && (
              <SimulationEngine unit={unit as 4} />
            )}

          {/* Unit 5 writing guides for open questions */}
          {unit === 5 && question.type === "open" && (
            <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <details>
                <summary className="text-[11px] font-medium text-green-700 cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                <p className="text-[11px] text-green-700 mt-1 leading-relaxed">
                  {question.id === 3 && (isId
                    ? "Jawaban yang kuat menjelaskan bahwa semakin lama fermentasi, mikroorganisme mengubah lebih banyak gula menjadi asam, sehingga rasa manis menurun dan keasaman meningkat."
                    : "A strong answer explains that as fermentation time increases, microorganisms convert more sugar into acid, so sweetness decreases and acidity increases.")}
                  {question.id === 4 && (isId
                    ? "Jawaban yang kuat menyebutkan satu kombinasi terbaik, lalu mengutip dua baris dari tabel sebagai bukti untuk rasa, keasaman, dan daya simpan."
                    : "A strong answer states one best combination, then cites two rows from the table as evidence for taste, acidity, and shelf life.")}
                  {question.id === 5 && (isId
                    ? "Jawaban yang kuat membandingkan daun pisang dan plastik dari sisi biodegradabilitas, kualitas pangan, dan pengurangan limbah, lalu memberikan rekomendasi yang jelas."
                    : "A strong answer compares banana leaf and plastic in terms of biodegradability, food quality, and waste reduction, then makes a clear recommendation.")}
                </p>
              </details>
            </div>
          )}

            {/* UNIT 5 SIMULATION */}
            {unit === 5 && (
              <SimulationEngine unit={unit as 5} />
            )}

          {/* Unit 6 writing guides for open questions */}
          {unit === 6 && question.type === "open" && (
            <div className="mb-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <details>
                <summary className="text-[11px] font-medium text-teal-700 cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                <p className="text-[11px] text-teal-700 mt-1 leading-relaxed">
                  {question.id === 3 && (isId
                    ? "Jawaban yang kuat menjelaskan bahwa mangrove menyediakan habitat, sumber makanan, dan area pembesaran bagi ikan. Ketika tutupan mangrove berkurang, lebih sedikit ikan muda yang bertahan hidup sehingga produksi ikan menurun."
                    : "A strong answer explains that mangroves provide habitat, food, and nursery areas for fish. When mangrove cover decreases, fewer young fish survive so fish production declines.")}
                  {question.id === 4 && (isId
                    ? "Jawaban yang kuat membandingkan hasil simulasi pada tutupan mangrove tinggi vs rendah, menyebutkan dampak jangka pendek dan panjang, serta menggunakan minimal dua bukti dari data simulasi."
                    : "A strong answer compares simulation results at high vs low mangrove cover, mentions short-term and long-term effects, and uses at least two pieces of evidence from simulation data.")}
                  {question.id === 5 && (isId
                    ? "Jawaban yang kuat merekomendasikan satu strategi utama (misalnya restorasi mangrove), memberikan alasan ilmiah, dan menjelaskan dampak jangka panjang terhadap ekosistem pesisir."
                    : "A strong answer recommends one main strategy (e.g. mangrove restoration), provides a scientific reason, and explains the long-term effect on the coastal ecosystem.")}
                </p>
              </details>
            </div>
          )}

            {/* UNIT 6 SIMULATION */}
            {unit === 6 && (
              <SimulationEngine unit={unit as 6} />
            )}

            {/* UNIT 7 SIMULATION */}
            {unit === 7 && (
              <SimulationEngine unit={unit as 7} />
            )}

          {/* Options Container */}
          <div className="space-y-2.5">
             {/* MCQ Options with distinct colors */}
            {question.type === "mcq" && options && (
              <div className="grid gap-3">
                {options.map((option, idx) => {
                  const isSelected = selectedMCQ === option;
                  const optionBg = unitStyles.options[idx % unitStyles.options.length];
                  return (
                    <button
                      key={option}
                      onClick={() => handleMCQ(option)}
                      className={`group w-full text-left px-5 py-4 text-[14px] rounded-2xl transition-all duration-300 border flex items-center gap-4 ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-lg scale-[1.02] z-10"
                          : `${optionBg} border-slate-200/60 text-foreground/80 hover:border-primary/40 hover:shadow-md hover:scale-[1.01]`
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? "bg-white border-white scale-110"
                            : "bg-white/50 border-slate-300 group-hover:border-primary/50"
                        }`}
                      >
                        {isSelected ? (
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        )}
                      </span>
                      <span className={`flex-1 leading-relaxed font-medium ${isSelected ? "text-white" : "text-slate-700"}`}>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

             {/* Checkbox Options with distinct colors */}
            {question.type === "checkbox" && options && (
              <div className="grid gap-3">
                {options.map((option, idx) => {
                  const isSelected = selectedCheckbox.includes(option);
                  const optionBg = unitStyles.options[idx % unitStyles.options.length];
                  return (
                    <button
                      key={option}
                      onClick={() => handleCheckbox(option)}
                      className={`group w-full text-left px-5 py-4 text-[14px] rounded-2xl transition-all duration-300 border flex items-center gap-4 ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-lg scale-[1.02] z-10"
                          : `${optionBg} border-slate-200/60 text-foreground/80 hover:border-primary/40 hover:shadow-md hover:scale-[1.01]`
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-7 h-7 ${checkboxShouldBeSingle ? "rounded-full" : "rounded-xl"} border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? "bg-white border-white rotate-[360deg] scale-110"
                            : "bg-white/50 border-slate-300 group-hover:border-primary/50"
                        }`}
                      >
                        {isSelected ? (
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        )}
                      </span>
                      <span className={`flex-1 leading-relaxed font-medium ${isSelected ? "text-white" : "text-slate-700"}`}>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Open-ended */}
            {question.type === "open" && (() => {
              const text = (answer as string) || "";
              const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
              // Skip 15-word requirement for Unit 7 Question 1 (pairing/matching question)
              const isPairingQuestion = question.id === 1 && question.questionIdn?.includes("Pasangkan");
              const tooShort = !isPairingQuestion && wordCount > 0 && wordCount < 15;
              const tooLong = false; // No upper limit
              const wordColor = tooLong ? "text-rose-500" : tooShort ? "text-red-600" : wordCount >= 15 || isPairingQuestion ? "text-emerald-600" : "text-muted-foreground";
              return (
                <div className={`bg-white rounded-xl border shadow-sm p-1 ${tooLong ? "border-rose-300" : tooShort ? "border-red-300" : "border-border/50"}`}>
                  <textarea
                    value={text}
                    onChange={(e) => onAnswer(question.id, e.target.value)}
                    placeholder={getPlaceholder()}
                    rows={10}
                    className="w-full px-4 py-4 text-[14px] rounded-lg border-0 bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-150 resize-none leading-relaxed"
                  />
                  <div className="px-4 pb-3 flex items-center justify-between border-t border-border/30">
                    <span className={`text-[10px] font-medium ${wordColor}`}>
                      {wordCount} {t("words", "kata")}
                      {tooShort && <span className="ml-1">({t("min. 15", "min. 15")})</span>}
                      {tooLong && <span className="ml-1">({t("max. 50", "maks. 50")})</span>}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {t("min. 15 words", "minimal 15 kata")}
                    </span>
                  </div>
                  {tooShort && (
                    <div className="mx-4 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-[11px] text-red-700 font-medium">
                        {isId
                          ? `Jawaban harus minimal 15 kata. Saat ini: ${wordCount} kata.`
                          : `Answer must be at least 15 words. Current: ${wordCount} words.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Navigation Footer — super clear Next / Back */}
      <div className="px-5 py-4 border-t-2 border-primary/20 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          {/* BACK */}
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border font-bold text-[13px] text-foreground bg-white hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            {isId ? "Kembali" : "Back"}
          </button>

          {/* word count for open */}
          {question.type === "open" && (
            <span className={`text-[11px] font-bold flex-1 text-center ${currentWordCount >= 15 ? "text-emerald-600" : "text-red-500"}`}>
              {isId ? `${currentWordCount} kata (Min. 15)` : `${currentWordCount} words (Min. 15)`}
            </span>
          )}
          {question.type !== "open" && <div className="flex-1" />}

          {/* NEXT or SUBMIT */}
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!isAnswerValid}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {isId ? "Kirim Penilaian" : "Submit Assessment"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswerValid}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {isId ? "Soal Berikutnya" : "Next Question"}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPanel;

function Unit5Simulation({ isId }: { isId: boolean }) {
  const [fermTime, setFermTime] = React.useState(48);
  const [fermTemp, setFermTemp] = React.useState(28);
  const [packaging, setPackaging] = React.useState<"banana" | "plastic">("banana");
  const [starterQuality, setStarterQuality] = React.useState<"good" | "poor">("good");
  const [u5Runs, setU5Runs] = React.useState<{no: number; time: number; temp: number; pkg: string; starter: string; sweetness: number; acidity: number; shelfLife: number; sustainability: number}[]>([]);

  const u5Calc = React.useMemo(() => {
    const isGoodStarter = starterQuality === "good";
    const isBanana = packaging === "banana";
    const optimalTemp = fermTemp >= 25 && fermTemp <= 30;
    const sweetness = Math.round(Math.min(100, Math.max(0,
      (isGoodStarter ? 60 : 30) + (optimalTemp ? 15 : -10) - (fermTime > 48 ? (fermTime - 48) * 0.8 : 0)
    )));
    const acidity = Math.round(Math.min(100, Math.max(0,
      (isGoodStarter ? 20 : 40) + fermTime * 0.5 + (fermTemp > 30 ? (fermTemp - 30) * 2 : 0)
    )));
    const shelfLife = Math.round(Math.min(100, Math.max(0,
      (isGoodStarter ? 50 : 25) + (isBanana ? 10 : 5) + (fermTime >= 24 && fermTime <= 48 ? 20 : 0)
    )));
    const sustainability = Math.round(Math.min(100, (isBanana ? 80 : 30) + (isGoodStarter ? 10 : 0)));
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { sweetness, acidity, shelfLife, sustainability, sLabel: label(sweetness), aLabel: label(acidity), slLabel: label(shelfLife), susLabel: label(sustainability) };
  }, [fermTime, fermTemp, packaging, starterQuality]);

  const runU5 = () => {
    setU5Runs(prev => [...prev, {
      no: prev.length + 1,
      time: fermTime, temp: fermTemp,
      pkg: packaging === "banana" ? "Banana leaf" : "Plastic",
      starter: starterQuality === "good" ? "Good" : "Poor",
      sweetness: u5Calc.sweetness, acidity: u5Calc.acidity,
      shelfLife: u5Calc.shelfLife, sustainability: u5Calc.sustainability,
    }]);
  };

  return (
    <div className="mb-5 space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: isId ? "Rasa Manis" : "Sweetness", value: u5Calc.sweetness, sub: u5Calc.sLabel },
          { label: isId ? "Keasaman" : "Acidity", value: u5Calc.acidity, sub: u5Calc.aLabel },
          { label: isId ? "Daya Simpan" : "Shelf Life", value: u5Calc.shelfLife, sub: u5Calc.slLabel },
          { label: isId ? "Keberlanjutan" : "Sustainability", value: u5Calc.sustainability, sub: u5Calc.susLabel },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
            <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
            <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
            <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Controls + Diagram */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-xl border border-border/50 p-5 shadow-sm space-y-4">
          <div className="text-[13px] font-semibold text-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</div>
        {/* Fermentation Time */}
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Waktu Fermentasi (jam)" : "Fermentation Time (hours)"}: <span className="font-semibold">{fermTime}</span></div>
          <input type="range" min={12} max={96} step={12} value={fermTime}
            onChange={(e) => setFermTime(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${((fermTime - 12) / 84) * 100}%, #e5e7eb ${((fermTime - 12) / 84) * 100}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>12h</span><span>48h</span><span>96h</span></div>
        </div>

        {/* Temperature */}
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Suhu Fermentasi (Â°C)" : "Fermentation Temperature (Â°C)"}: <span className="font-semibold">{fermTemp}</span></div>
          <input type="range" min={15} max={40} step={1} value={fermTemp}
            onChange={(e) => setFermTemp(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${((fermTemp - 15) / 25) * 100}%, #e5e7eb ${((fermTemp - 15) / 25) * 100}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>15Â°C</span><span>28Â°C</span><span>40Â°C</span></div>
        </div>

        {/* Packaging */}
        <div>
          <div className="text-[13px] font-medium text-foreground mb-2">{isId ? "Jenis Kemasan" : "Packaging Type"}</div>
          <div className="flex gap-4">
            {(["banana", "plastic"] as const).map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="u5pkg" value={p} checked={packaging === p} onChange={() => setPackaging(p)} className="accent-primary w-4 h-4" />
                <span className="text-[13px]">{p === "banana" ? (isId ? "Daun pisang" : "Banana leaf") : (isId ? "Plastik" : "Plastic")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Starter Quality */}
        <div>
          <div className="text-[13px] font-medium text-foreground mb-2">{isId ? "Kualitas Starter (Ragi)" : "Starter Quality (Ragi)"}</div>
          <div className="flex gap-4">
            {(["good", "poor"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="u5starter" value={s} checked={starterQuality === s} onChange={() => setStarterQuality(s)} className="accent-primary w-4 h-4" />
                <span className="text-[13px]">{s === "good" ? (isId ? "Baik" : "Good") : (isId ? "Buruk" : "Poor")}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={runU5} className="px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:opacity-90">
          {isId ? "Jalankan" : "Run"}
        </button>
        </div>

        {/* Tape Ketan Diagram */}
        <div className="flex flex-col gap-3 w-44">
          <div className="bg-white rounded-xl border border-border/50 p-2 shadow-sm flex items-center justify-center">
            <svg viewBox="0 0 160 220" width="140" height="196" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="riceGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#fef9c3" />
                  <stop offset="100%" stopColor="#fde68a" />
                </radialGradient>
                <radialGradient id="tapeGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor={u5Calc.sweetness > 60 ? "#bbf7d0" : "#fef08a"} />
                  <stop offset="100%" stopColor={u5Calc.sweetness > 60 ? "#4ade80" : "#facc15"} />
                </radialGradient>
              </defs>
              {/* Thermometer */}
              <rect x="140" y="20" width="10" height="80" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
              <rect x="142" y={100 - Math.round(((fermTemp - 15) / 25) * 70)} width="6" height={Math.round(((fermTemp - 15) / 25) * 70)} rx="3" fill={fermTemp > 32 ? "#ef4444" : fermTemp > 25 ? "#f97316" : "#3b82f6"} />
              <circle cx="145" cy="105" r="7" fill={fermTemp > 32 ? "#ef4444" : fermTemp > 25 ? "#f97316" : "#3b82f6"} />
              <text x="145" y="120" fontSize="7" fill="#374151" textAnchor="middle" fontFamily="sans-serif">{fermTemp}Â°C</text>

              {/* Leaf wrapper */}
              <ellipse cx="80" cy="60" rx="45" ry="20" fill={packaging === "banana" ? "#86efac" : "#93c5fd"} opacity="0.7" />
              <ellipse cx="80" cy="60" rx="38" ry="15" fill={packaging === "banana" ? "#4ade80" : "#60a5fa"} opacity="0.5" />
              <text x="80" y="64" fontSize="7" fill="#166534" textAnchor="middle" fontFamily="sans-serif">{packaging === "banana" ? (isId ? "Daun Pisang" : "Banana Leaf") : "Plastic"}</text>

              {/* Rice/tape container */}
              <rect x="45" y="80" width="70" height="80" rx="8" fill="url(#riceGrad)" stroke="#d97706" strokeWidth="1.5" />
              {/* Fermentation bubbles */}
              {starterQuality === "good" && [55,70,85,100].map((x, i) => (
                <circle key={i} cx={x} cy={90 + i * 12} r={2 + i} fill="white" opacity={0.4 + i * 0.1} />
              ))}
              {/* Tape color overlay based on sweetness */}
              <rect x="47" y={160 - Math.round(u5Calc.sweetness * 0.6)} width="66" height={Math.round(u5Calc.sweetness * 0.6)} rx="6" fill="url(#tapeGrad)" opacity="0.7" />
              <text x="80" y="130" fontSize="8" fill="#92400e" textAnchor="middle" fontFamily="sans-serif">{isId ? "Tape Ketan" : "Tape Ketan"}</text>

              {/* Time indicator */}
              <rect x="10" y="80" width="28" height="14" rx="3" fill="#ddd6fe" />
              <text x="24" y="91" fontSize="7" fill="#5b21b6" textAnchor="middle" fontFamily="sans-serif">{fermTime}h</text>

              {/* Starter indicator */}
              <circle cx="24" cy="120" r="12" fill={starterQuality === "good" ? "#bbf7d0" : "#fecaca"} stroke={starterQuality === "good" ? "#16a34a" : "#dc2626"} strokeWidth="1.5" />
              <text x="24" y="124" fontSize="6" fill={starterQuality === "good" ? "#166534" : "#991b1b"} textAnchor="middle" fontFamily="sans-serif">{starterQuality === "good" ? "Good" : "Poor"}</text>
              <text x="24" y="140" fontSize="6" fill="#374151" textAnchor="middle" fontFamily="sans-serif">{isId ? "Ragi" : "Starter"}</text>

              {/* Labels */}
              <text x="80" y="175" fontSize="7" fill="#374151" textAnchor="middle" fontFamily="sans-serif">{isId ? "Fermentasi" : "Fermentation"}</text>
            </svg>
          </div>
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-border/50 p-3 shadow-sm flex flex-col justify-between flex-1">
            <div className="text-[9px] text-muted-foreground text-right mb-1">100</div>
            <div className="flex items-end gap-1 h-24">
              {[
                { v: u5Calc.sweetness, label: "Sw" },
                { v: u5Calc.acidity, label: "Ac" },
                { v: u5Calc.shelfLife, label: "SL" },
                { v: u5Calc.sustainability, label: "Su" },
              ].map(({ v, label }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full bg-gray-900 rounded-sm transition-all duration-300" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
            <div className="text-[9px] text-muted-foreground mb-1">0</div>
            <div className="flex gap-0.5 mt-1">
              {[{label:"Sweet"},{label:"Acid"},{label:"Shelf"},{label:"Sust."}].map(({ label }) => (
                <div key={label} className="flex-1 text-center text-[7px] text-muted-foreground leading-tight">{label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div>
        <div className="text-[13px] font-semibold text-foreground mb-3">{isId ? "Tabel Hasil Simulasi" : "Simulation Results Table"}</div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                {["No", isId ? "Waktu (jam)" : "Time (h)", isId ? "Suhu Â°C" : "Temp Â°C", isId ? "Kemasan" : "Packaging", isId ? "Starter" : "Starter", isId ? "Manis" : "Sweetness", isId ? "Asam" : "Acidity", isId ? "Daya Simpan" : "Shelf Life", isId ? "Keberlanjutan" : "Sustainability"].map(h => (
                  <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {u5Runs.length === 0 ? (
                <tr><td colSpan={9} className="p-3 text-center text-muted-foreground text-[11px]">{isId ? "Belum ada data" : "No data yet"}</td></tr>
              ) : u5Runs.map((r) => (
                <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                  <td className="p-2">{r.no}</td>
                  <td className="p-2">{r.time}</td>
                  <td className="p-2">{r.temp}</td>
                  <td className="p-2">{r.pkg}</td>
                  <td className="p-2">{r.starter}</td>
                  <td className="p-2">{r.sweetness}</td>
                  <td className="p-2">{r.acidity}</td>
                  <td className="p-2">{r.shelfLife}</td>
                  <td className="p-2">{r.sustainability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Unit6Simulation({ isId }: { isId: boolean }) {
  const [mangrove, setMangrove] = React.useState(60);
  const [waveStrength, setWaveStrength] = React.useState(50);
  const [pollution, setPollution] = React.useState(30);
  const [u6Runs, setU6Runs] = React.useState<{no: number; mangrove: number; wave: number; pollution: number; erosion: number; floodRisk: number; fishProd: number; carbon: number; biodiversity: number}[]>([]);

  const u6Calc = React.useMemo(() => {
    const erosion = Math.round(Math.max(0, Math.min(100, 80 - mangrove * 0.7 + waveStrength * 0.4 + pollution * 0.2)));
    const floodRisk = Math.round(Math.max(0, Math.min(100, 70 - mangrove * 0.6 + waveStrength * 0.3 + pollution * 0.1)));
    const fishProd = Math.round(Math.max(0, Math.min(100, mangrove * 0.7 - pollution * 0.4 + 20)));
    const carbon = Math.round(Math.max(0, Math.min(100, mangrove * 0.8 - pollution * 0.2)));
    const biodiversity = Math.round(Math.max(0, Math.min(100, mangrove * 0.75 - pollution * 0.3 - waveStrength * 0.1 + 10)));
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { erosion, floodRisk, fishProd, carbon, biodiversity, eLabel: label(erosion), fLabel: label(floodRisk), fpLabel: label(fishProd), cLabel: label(carbon), bLabel: label(biodiversity) };
  }, [mangrove, waveStrength, pollution]);

  const runU6 = () => {
    setU6Runs(prev => [...prev, {
      no: prev.length + 1,
      mangrove, wave: waveStrength, pollution,
      erosion: u6Calc.erosion, floodRisk: u6Calc.floodRisk,
      fishProd: u6Calc.fishProd, carbon: u6Calc.carbon, biodiversity: u6Calc.biodiversity,
    }]);
  };

  return (
    <div className="mb-5 space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: isId ? "Abrasi" : "Erosion", value: u6Calc.erosion, sub: u6Calc.eLabel },
          { label: isId ? "Risiko Banjir" : "Flood Risk", value: u6Calc.floodRisk, sub: u6Calc.fLabel },
          { label: isId ? "Prod. Ikan" : "Fish Prod.", value: u6Calc.fishProd, sub: u6Calc.fpLabel },
          { label: isId ? "Karbon" : "Carbon", value: u6Calc.carbon, sub: u6Calc.cLabel },
          { label: isId ? "Biodiversitas" : "Biodiversity", value: u6Calc.biodiversity, sub: u6Calc.bLabel },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
            <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
            <div className="text-xl font-bold text-foreground leading-none">{value}</div>
            <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Controls + Diagram */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-xl border border-border/50 p-5 shadow-sm space-y-4">
          <div className="text-[13px] font-semibold text-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Tutupan Mangrove (%)" : "Mangrove Cover (%)"}: <span className="font-semibold">{mangrove}</span></div>
          <input type="range" min={0} max={100} step={5} value={mangrove}
            onChange={(e) => setMangrove(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${mangrove}%, #e5e7eb ${mangrove}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Kekuatan Gelombang (%)" : "Wave Strength (%)"}: <span className="font-semibold">{waveStrength}</span></div>
          <input type="range" min={0} max={100} step={5} value={waveStrength}
            onChange={(e) => setWaveStrength(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${waveStrength}%, #e5e7eb ${waveStrength}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Tingkat Polusi (%)" : "Pollution Level (%)"}: <span className="font-semibold">{pollution}</span></div>
          <input type="range" min={0} max={100} step={5} value={pollution}
            onChange={(e) => setPollution(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${pollution}%, #e5e7eb ${pollution}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <button onClick={runU6} className="px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:opacity-90">
          {isId ? "Jalankan" : "Run"}
        </button>
        </div>

        {/* Mangrove Coastal Diagram */}
        <div className="flex flex-col gap-3 w-44">
          <div className="bg-white rounded-xl border border-border/50 p-2 shadow-sm flex items-center justify-center">
            <svg viewBox="0 0 160 220" width="140" height="196" xmlns="http://www.w3.org/2000/svg">
              {/* Sky */}
              <rect x="0" y="0" width="160" height="100" fill="#e0f2fe" />
              {/* Sea */}
              <rect x="0" y="100" width="160" height="120" fill={`rgba(14,165,233,${0.4 + pollution * 0.004})`} />
              {/* Wave lines */}
              {[110, 125, 140].map((y, i) => (
                <path key={i} d={`M0,${y} Q20,${y - 5 + waveStrength * 0.05} 40,${y} Q60,${y + 5 - waveStrength * 0.05} 80,${y} Q100,${y - 5 + waveStrength * 0.05} 120,${y} Q140,${y + 5 - waveStrength * 0.05} 160,${y}`}
                  fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
              ))}
              {/* Shore */}
              <rect x="0" y="95" width="160" height="12" fill="#fde68a" />
              {/* Mangrove trees based on coverage */}
              {Array.from({ length: Math.round(mangrove / 14) }, (_, i) => {
                const x = 10 + i * 22;
                const h = 30 + (i % 3) * 8;
                return (
                  <g key={i}>
                    <line x1={x} y1={95} x2={x} y2={95 - h} stroke="#92400e" strokeWidth="3" />
                    <circle cx={x} cy={95 - h} r={10 + (i % 2) * 3} fill="#16a34a" opacity="0.85" />
                    {/* Roots */}
                    <line x1={x - 6} y1={95} x2={x} y2={85} stroke="#92400e" strokeWidth="1.5" />
                    <line x1={x + 6} y1={95} x2={x} y2={85} stroke="#92400e" strokeWidth="1.5" />
                  </g>
                );
              })}
              {/* Pollution indicator */}
              {pollution > 40 && (
                <g>
                  <circle cx="130" cy="130" r="8" fill="#ef4444" opacity="0.6" />
                  <circle cx="115" cy="145" r="5" fill="#f97316" opacity="0.5" />
                </g>
              )}
              {/* Fish indicator */}
              {u6Calc.fishProd > 40 && (
                <g>
                  <ellipse cx="50" cy="150" rx="8" ry="4" fill="#fbbf24" opacity="0.7" />
                  <ellipse cx="70" cy="160" rx="6" ry="3" fill="#fbbf24" opacity="0.6" />
                </g>
              )}
              {/* Labels */}
              <text x="80" y="12" fontSize="7" fill="#0369a1" textAnchor="middle" fontFamily="sans-serif">{isId ? "Pesisir" : "Coastline"}</text>
              <text x="80" y="210" fontSize="7" fill="#0369a1" textAnchor="middle" fontFamily="sans-serif">{isId ? "Laut" : "Sea"}</text>
              <text x="80" y="92" fontSize="6" fill="#92400e" textAnchor="middle" fontFamily="sans-serif">{mangrove}% {isId ? "mangrove" : "mangrove"}</text>
            </svg>
          </div>
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-border/50 p-3 shadow-sm flex flex-col justify-between flex-1">
            <div className="text-[9px] text-muted-foreground text-right mb-1">100</div>
            <div className="flex items-end gap-0.5 h-24">
              {[
                { v: u6Calc.erosion, label: "Er" },
                { v: u6Calc.floodRisk, label: "Fl" },
                { v: u6Calc.fishProd, label: "Fi" },
                { v: u6Calc.carbon, label: "C" },
                { v: u6Calc.biodiversity, label: "Bd" },
              ].map(({ v, label }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full bg-gray-900 rounded-sm transition-all duration-300" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
            <div className="text-[9px] text-muted-foreground mb-1">0</div>
            <div className="flex gap-0.5 mt-1">
              {[{label:"Eros"},{label:"Flood"},{label:"Fish"},{label:"C"},{label:"Bio"}].map(({ label }) => (
                <div key={label} className="flex-1 text-center text-[7px] text-muted-foreground leading-tight">{label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div>
        <div className="text-[13px] font-semibold text-foreground mb-3">{isId ? "Tabel Hasil Simulasi" : "Simulation Results Table"}</div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                {["No", isId ? "Mangrove %" : "Mangrove %", isId ? "Gelombang %" : "Wave %", isId ? "Polusi %" : "Pollution %", isId ? "Abrasi" : "Erosion", isId ? "Banjir" : "Flood", isId ? "Ikan" : "Fish", isId ? "Karbon" : "Carbon", isId ? "Biodiv." : "Biodiv."].map(h => (
                  <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {u6Runs.length === 0 ? (
                <tr><td colSpan={9} className="p-3 text-center text-muted-foreground text-[11px]">{isId ? "Belum ada data" : "No data yet"}</td></tr>
              ) : u6Runs.map((r) => (
                <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                  <td className="p-2">{r.no}</td>
                  <td className="p-2">{r.mangrove}</td>
                  <td className="p-2">{r.wave}</td>
                  <td className="p-2">{r.pollution}</td>
                  <td className="p-2">{r.erosion}</td>
                  <td className="p-2">{r.floodRisk}</td>
                  <td className="p-2">{r.fishProd}</td>
                  <td className="p-2">{r.carbon}</td>
                  <td className="p-2">{r.biodiversity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Unit7Simulation({ isId }: { isId: boolean }) {
  const [fishingIntensity, setFishingIntensity] = React.useState(70);
  const [awareness, setAwareness] = React.useState(30);
  const [wasteMgmt, setWasteMgmt] = React.useState<"good" | "poor">("poor");
  const [conservation, setConservation] = React.useState(20);
  const [u7Runs, setU7Runs] = React.useState<{no: number; fishing: number; awareness: number; waste: string; conservation: number; fishPop: number; waterQuality: number; biodiversity: number; sustainability: number}[]>([]);

  const u7Calc = React.useMemo(() => {
    const isWasteGood = wasteMgmt === "good";
    const fishPop = Math.round(Math.max(0, Math.min(100, 80 - fishingIntensity * 0.6 + awareness * 0.15 + conservation * 0.25 - (isWasteGood ? 0 : 15))));
    const waterQuality = Math.round(Math.max(0, Math.min(100, (isWasteGood ? 85 : 35) + awareness * 0.1 + conservation * 0.05)));
    const biodiversity = Math.round(Math.max(0, Math.min(100, conservation * 0.7 + awareness * 0.1 + (isWasteGood ? 10 : 0) + 10)));
    const sustainability = Math.round((fishPop + waterQuality + biodiversity) / 3);
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { fishPop, waterQuality, biodiversity, sustainability, fLabel: label(fishPop), wLabel: label(waterQuality), bLabel: label(biodiversity), sLabel: label(sustainability) };
  }, [fishingIntensity, awareness, wasteMgmt, conservation]);

  const runU7 = () => {
    setU7Runs(prev => [...prev, {
      no: prev.length + 1,
      fishing: fishingIntensity, awareness,
      waste: wasteMgmt === "good" ? "Good" : "Poor",
      conservation,
      fishPop: u7Calc.fishPop, waterQuality: u7Calc.waterQuality,
      biodiversity: u7Calc.biodiversity, sustainability: u7Calc.sustainability,
    }]);
  };

  return (
    <div className="mb-5 space-y-4">
      {/* Metric Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: isId ? "Populasi Ikan" : "Fish Pop.", value: u7Calc.fishPop, sub: u7Calc.fLabel },
          { label: isId ? "Kualitas Air" : "Water Quality", value: u7Calc.waterQuality, sub: u7Calc.wLabel },
          { label: isId ? "Biodiversitas" : "Biodiversity", value: u7Calc.biodiversity, sub: u7Calc.bLabel },
          { label: isId ? "Keberlanjutan" : "Sustainability", value: u7Calc.sustainability, sub: u7Calc.sLabel },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
            <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
            <div className="text-xl font-bold text-foreground leading-none">{value}</div>
            <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-border/50 p-5 shadow-sm space-y-4">
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Intensitas Penangkapan Ikan (%)" : "Fishing Intensity (%)"}: <span className="font-semibold">{fishingIntensity}</span></div>
          <input type="range" min={0} max={100} step={5} value={fishingIntensity}
            onChange={(e) => setFishingIntensity(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${fishingIntensity}%, #e5e7eb ${fishingIntensity}%)` }}
          />
        </div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Kesadaran Masyarakat (%)" : "Community Awareness (%)"}: <span className="font-semibold">{awareness}</span></div>
          <input type="range" min={0} max={100} step={5} value={awareness}
            onChange={(e) => setAwareness(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${awareness}%, #e5e7eb ${awareness}%)` }}
          />
        </div>
        <div>
          <div className="text-[13px] font-medium text-foreground mb-2">{isId ? "Pengelolaan Limbah" : "Waste Management"}</div>
          <div className="flex gap-4">
            {(["good", "poor"] as const).map((w) => (
              <label key={w} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="u7waste" value={w} checked={wasteMgmt === w} onChange={() => setWasteMgmt(w)} className="accent-primary w-4 h-4" />
                <span className="text-[13px]">{w === "good" ? (isId ? "Baik" : "Good") : (isId ? "Buruk" : "Poor")}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Upaya Konservasi (%)" : "Conservation Efforts (%)"}: <span className="font-semibold">{conservation}</span></div>
          <input type="range" min={0} max={100} step={5} value={conservation}
            onChange={(e) => setConservation(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${conservation}%, #e5e7eb ${conservation}%)` }}
          />
        </div>
        <button onClick={runU7} className="px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:opacity-90">
          {isId ? "Jalankan" : "Run"}
        </button>
      </div>

      {/* Results Table */}
      <div>
        <div className="text-[13px] font-semibold text-foreground mb-3">{isId ? "Tabel Hasil Simulasi" : "Simulation Results Table"}</div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                {["No", isId ? "Tangkapan" : "Fishing", isId ? "Sadar" : "Aware", isId ? "Limbah" : "Waste", isId ? "Konservasi" : "Cons.", isId ? "Pop. Ikan" : "Fish Pop.", isId ? "Kual. Air" : "Water Q.", isId ? "Biodiv." : "Biodiv.", isId ? "Keberlanjutan" : "Sustain."].map(h => (
                  <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {u7Runs.length === 0 ? (
                <tr><td colSpan={9} className="p-3 text-center text-muted-foreground text-[11px]">{isId ? "Belum ada data" : "No data yet"}</td></tr>
              ) : u7Runs.map((r) => (
                <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                  <td className="p-2">{r.no}</td>
                  <td className="p-2">{r.fishing}</td>
                  <td className="p-2">{r.awareness}</td>
                  <td className="p-2">{r.waste}</td>
                  <td className="p-2">{r.conservation}</td>
                  <td className="p-2">{r.fishPop}</td>
                  <td className="p-2">{r.waterQuality}</td>
                  <td className="p-2">{r.biodiversity}</td>
                  <td className="p-2">{r.sustainability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
