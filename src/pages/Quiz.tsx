import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExamSession } from "@/hooks/useExamSession";
import { useExamLock } from "@/hooks/useExamLock";
import { getQuestionsForUnit } from "@/data/examQuestions";
import { getUnitMeta, getUnitImages } from "@/data/appContent";
import { getAllLocalSessions } from "@/hooks/useExamSession";
import ExamToolbar from "@/components/exam/ExamToolbar";
import StimulusPanel from "@/components/exam/StimulusPanel";
import QuestionPanel from "@/components/exam/QuestionPanel";
import Unit8Pisa from "@/components/exam/Unit8Pisa";
import Unit9Pisa from "@/components/exam/Unit9Pisa";
import Unit10Pisa from "@/components/exam/Unit10Pisa";
import LoadingScreen from "@/components/LoadingScreen";
import StudentIdentityForm from "@/components/StudentIdentityForm";
import QuizIntroSlide from "@/components/QuizIntroSlide";
import QuizOutroSlide from "@/components/QuizOutroSlide";



const Quiz = () => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const navigate = useNavigate();

  // "welcome" = intro slide, "identity" = student form, "loading" = initial 30s loading, "select" = unit selection screen, "intro" = per-unit intro, "exam" = questions, "outro" = closing slide
  const [screen, setScreen] = useState<"welcome" | "identity" | "loading" | "select" | "intro" | "exam" | "outro">("welcome");
  const [loading, setLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState<{ id: string; name: string } | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(1);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const questions = getQuestionsForUnit(selectedUnit) || [];
  const meta = getUnitMeta(selectedUnit) || { title: `Unit ${selectedUnit}`, subtitle: "" };


  const { completeSession, trackQuestionAttempt } = useExamSession({
    unit: selectedUnit,
    answers,
    enabled: screen === "exam",
    studentId: studentProfile?.id,
  });

  // Lock user in exam — blocks back button and tab close
  useExamLock(screen === "exam");

  // Set localStorage flag so navbar knows exam is active
  useEffect(() => {
    if (screen === "exam") {
      localStorage.setItem("exam_active", "1");
    } else {
      localStorage.removeItem("exam_active");
    }
  }, [screen]);

  const handleAnswer = (questionId: number, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    if (questionId) trackQuestionAttempt(questionId.toString());
  };

  const handleFlag = (questionId: number) =>
    setFlagged((prev) => { const next = new Set(prev); next.has(questionId) ? next.delete(questionId) : next.add(questionId); return next; });

  const calculateScore = () => {
    let s = 0;
    questions.forEach((q) => {
      if (q.type === "mcq" && answers[q.id] === q.correct) s += 1;
      else if (q.type === "checkbox") {
        const ans = (answers[q.id] as string[]) || [];
        const correct = q.correct as string[];
        if (ans.length === correct.length && ans.every((a) => correct.includes(a))) s += 1;
      } else if (q.type === "open" && answers[q.id]) {
        const text = (answers[q.id] as string).trim();
        const wordCount = text === "" ? 0 : text.split(/\s+/).length;
        if (wordCount >= 15) s += 1;
      }
    });
    return s;
  };

  function advanceAfterUnit(justCompleted: number) {
    localStorage.removeItem("exam_active");
    const allSessions = getAllLocalSessions();
    const completedUnits = new Set(allSessions.filter(s => s.completed).map(s => s.unit));
    completedUnits.add(justCompleted);
    const allDone = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every(u => completedUnits.has(u));
    if (allDone) {
      setScreen("outro");
      return;
    }
    // Continue to next unfinished unit instead of dumping back to unit select
    const next = ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).find(u => !completedUnits.has(u));
    if (next) {
      setSelectedUnit(next);
      setCurrent(0);
      setAnswers({});
      setFlagged(new Set());
      setScreen("intro");
    } else {
      setScreen("select");
    }
  }

  function handleSubmit() {
    const finalScore = calculateScore();
    completeSession(finalScore, questions.length);
    advanceAfterUnit(selectedUnit);
  }

  const answeredCount = Object.keys(answers).filter((k) => {
    const val = answers[Number(k)];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string") return val.trim().length > 0;
    return false;
  }).length;

  // ── WELCOME INTRO SLIDE ──
  if (screen === "welcome") {
    return <QuizIntroSlide onStart={() => setScreen("identity")} />;
  }

  // ── STUDENT IDENTITY FORM ──
  if (screen === "identity") {
    return (
      <StudentIdentityForm
        onDone={(profile) => {
          setStudentProfile(profile);
          setScreen("loading");
        }}
      />
    );
  }

  // ── INITIAL LOADING SCREEN ──
  if (screen === "loading") {
    return <LoadingScreen onDone={() => setScreen("select")} duration={30000} />;
  }

  // ── OUTRO SLIDE ──
  if (screen === "outro") {
    return (
      <QuizOutroSlide
        onFinish={() => navigate("/results", { state: { score: 0, total: 0, answers: {}, unit: selectedUnit } })}
      />
    );
  }

  // ── UNIT SELECTION SCREEN ──
  if (screen === "select") {
    // Get latest session per unit for progress display, filtered by current student
    const allSessions = getAllLocalSessions().filter(s => 
      !studentProfile?.id || s.student_id === studentProfile.id
    );
    const getUnitProgress = (u: number) => {
      // Find the most recent session for this unit
      const unitSessions = allSessions.filter(s => s.unit === u);
      if (unitSessions.length === 0) return null;
      // Prefer completed, else latest
      const completed = unitSessions.find(s => s.completed);
      const session = completed ?? unitSessions[unitSessions.length - 1];
      const totalQ = getQuestionsForUnit(u).length || 5;
      const answeredQ = Object.keys(session.answers || {}).filter(k => {
        const v = (session.answers as Record<string, unknown>)[k];
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "string") return v.trim().length > 0;
        return false;
      }).length;
      const pct = session.completed
        ? 100
        : Math.min(99, Math.round((answeredQ / totalQ) * 100));
      return { pct, completed: session.completed, score: session.score, total: session.total };
    };

    return (
      <div
        className="h-screen flex flex-col overflow-hidden pt-16 relative"
        style={{ backgroundImage: "url('/cirebon 1.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        {loading && <LoadingScreen onDone={() => { setLoading(false); setScreen("intro"); }} duration={1500} />}

        <div className="relative z-10 flex-1 flex flex-col px-6 py-8 overflow-hidden">
          <h1 className="font-display text-2xl text-white mb-2 text-center drop-shadow">
            {isId ? "Pilih Unit" : "Select Unit"}
          </h1>
          <p className="text-sm text-white/80 text-center mb-6 drop-shadow">
            {isId ? "Pilih unit yang ingin kamu kerjakan." : "Choose the unit you want to work on."}
          </p>

          {/* Horizontal Scrollable Unit List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3 max-w-2xl mx-auto">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((u) => {
                const meta = getUnitMeta(u);
                const progress = getUnitProgress(u);
                const isCompleted = progress?.completed === true;
                return (
                  <button
                    key={u}
                    onClick={() => {
                      if (isCompleted) return;
                      setSelectedUnit(u); setCurrent(0); setAnswers({}); setFlagged(new Set()); setLoading(true);
                    }}
                    disabled={isCompleted}
                    className={`w-full bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 p-4 shadow-sm transition-all text-left group flex items-start gap-4 ${isCompleted ? "opacity-60 cursor-not-allowed" : "hover:shadow-md hover:border-white/40"}`}
                  >
                    <div className={`w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center shrink-0 transition-all btn-3d ${progress?.completed ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"}`}>
                      {progress?.completed ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : u}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-white mb-0.5">{meta.title}</div>
                      <div className="text-sm font-semibold text-white leading-tight mb-1">{meta.subtitle}</div>
                      <div className="text-[11px] text-white/80 line-clamp-2 mb-2">
                        {isId ? meta.themeId : meta.themeEn}
                      </div>
                      {/* Progress bar */}
                      {progress !== null ? (
                        <div className="mt-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-white/70">
                              {progress.completed
                                ? (isId ? `Selesai · ${progress.score ?? 0}/${progress.total ?? 0}` : `Done · ${progress.score ?? 0}/${progress.total ?? 0}`)
                                : (isId ? `${progress.pct}% dikerjakan` : `${progress.pct}% answered`)}
                            </span>
                            <span className="text-[10px] font-semibold text-white">
                              {progress.pct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${progress.completed ? "bg-primary" : "bg-primary/50"}`}
                              style={{ width: `${progress.pct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-primary/30 rounded-full" />
                          </div>
                          <span className="text-[10px] text-white/60">{isId ? "Belum dimulai" : "Not started"}</span>
                        </div>
                      )}
                    </div>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold text-white bg-white/20 border border-white/30 px-2 py-1 rounded-full shrink-0 mt-2">{isId ? "Selesai" : "Done"}</span>
                    ) : (
                      <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors shrink-0 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PER-UNIT INTRO SCREEN ──
  if (screen === "intro") {
    return (
      <div className="h-screen flex flex-col overflow-hidden pt-16 relative" style={{ backgroundImage: "url('/doodle.png')", backgroundRepeat: "repeat" }}>
        <div className="bg-white/70 backdrop-blur-sm border-b border-border/60 px-6 py-3 shrink-0 flex items-center justify-between">
          <button onClick={() => { setScreen("select"); setLoading(false); }} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            {isId ? "Kembali" : "Back"}
          </button>
          <span className="text-xs font-bold uppercase tracking-wide text-foreground">{meta.title} — {meta.subtitle}</span>
          <div />
        </div>

        <div className="flex-1 flex overflow-hidden justify-center bg-white/60">
          <div className="flex w-full max-w-5xl bg-white/85 shadow-sm overflow-hidden border-x border-border/30">
            {/* Left: Theme + Stimulus preview */}
            <div className="flex-1 overflow-y-auto exam-scrollbar px-10 py-10 border-r border-border/30">
              <div className="max-w-2xl">
                <div className="mb-8 p-5 bg-gradient-to-r from-primary/5 to-accent/30 rounded-2xl border border-primary/10">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">{isId ? "Tema" : "Theme"}</p>
                  <p className="text-[14px] leading-relaxed text-foreground/85 italic">
                    {isId ? meta.themeId : meta.themeEn}
                  </p>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{isId ? "Stimulus" : "Stimulus"}</p>
                {selectedUnit <= 7 && (
                  <StimulusPanel
                    unit={selectedUnit as 1 | 2 | 3 | 4 | 5 | 6 | 7}
                    videoUrl={meta.videoUrl}
                  />
                )}
                {selectedUnit > 7 && meta.videoUrl && (
                  <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/10">
                    <video
                      src={meta.videoUrl}
                      controls
                      preload="metadata"
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Unit info + start */}
            <div className="w-80 shrink-0 flex flex-col justify-between px-8 py-10 bg-white/70">
              <div>
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground font-bold text-2xl flex items-center justify-center mb-5 mx-auto btn-3d">
                  {selectedUnit}
                </div>
                <h2 className="font-display text-xl text-foreground mb-2 text-center">{meta.title}</h2>
                <p className="text-[13px] text-muted-foreground mb-8 text-center leading-tight">{meta.subtitle}</p>
                <div className="space-y-4 text-sm text-foreground/70 bg-white/70 p-4 rounded-xl border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    </div>
                    <span className="font-medium">{selectedUnit >= 8 ? 5 : questions.length} {isId ? "soal" : "questions"}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setScreen("exam")}
                className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/95 transition-all flex items-center justify-center gap-2 btn-3d active:scale-[0.98]"
              >
                {isId ? "Mulai Soal" : "Start Questions"}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── EXAM SCREEN ──
  if (selectedUnit === 8) {
    return (
      <div className="h-screen overflow-hidden">
        <Unit8Pisa onExit={() => advanceAfterUnit(8)} studentId={studentProfile?.id} />
      </div>
    );
  }

  if (selectedUnit === 9) {
    return (
      <div className="h-screen overflow-hidden">
        <Unit9Pisa onExit={() => advanceAfterUnit(9)} studentId={studentProfile?.id} />
      </div>
    );
  }

  if (selectedUnit === 10) {
    return (
      <div className="h-screen overflow-hidden">
        <Unit10Pisa onExit={() => advanceAfterUnit(10)} studentId={studentProfile?.id} />
      </div>
    );
  }

  // Per-unit color themes: [leftBg, rightBg, accent]
  const unitColors: Record<number, { left: string; right: string; border: string }> = {
    1:  { left: "bg-white/85",   right: "bg-white/85",   border: "border-amber-200" },
    2:  { left: "bg-white/85",   right: "bg-white/85",   border: "border-orange-200" },
    3:  { left: "bg-white/85",   right: "bg-white/85",   border: "border-stone-200" },
    4:  { left: "bg-white/85",   right: "bg-white/85",   border: "border-yellow-200" },
    5:  { left: "bg-white/85",   right: "bg-white/85",   border: "border-green-200" },
    6:  { left: "bg-white/85",   right: "bg-white/85",   border: "border-teal-200" },
    7:  { left: "bg-white/85",   right: "bg-white/85",   border: "border-blue-200" },
  };
  const colors = unitColors[selectedUnit] ?? { left: "bg-white/85", right: "bg-white/85", border: "border-border" };

  return (
    <div className="h-screen flex flex-col overflow-hidden pt-16 relative" style={{ backgroundImage: "url('/doodle.png')", backgroundRepeat: "repeat" }}>
      <div className="bg-white/70 backdrop-blur-sm border-b border-border/60 px-4 py-2 shrink-0 flex items-center gap-3">
        <button onClick={() => setScreen("intro")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          {meta?.title}
        </button>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">{meta?.subtitle}</span>
      </div>

      <ExamToolbar
        currentQuestion={current}
        totalQuestions={questions.length}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Soal kiri */}
        <div className={`flex-1 overflow-hidden ${colors.right} order-2 md:order-1`}>
          {questions[current] ? (
            <QuestionPanel
              question={questions[current]}
              answer={answers[questions[current].id]}
              isFlagged={flagged.has(questions[current].id)}
              onAnswer={handleAnswer}
              onFlag={handleFlag}
              onPrev={() => setCurrent((c) => Math.max(0, c - 1))}
              onNext={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              onSubmit={handleSubmit}
              isFirst={current === 0}
              isLast={current === questions.length - 1}
              questionIndex={current}
              totalQuestions={questions.length}
              answeredCount={answeredCount}
              flaggedSet={flagged}
              onGoTo={setCurrent}
              unit={selectedUnit as 1 | 2 | 3 | 4 | 5 | 6 | 7}
              allAnswers={answers}
              questions={questions}
            />
          ) : (
            <div className="p-10 text-center">Loading questions...</div>
          )}
        </div>
        {/* Redaksi + gambar kanan */}
        <div className={`w-full md:w-1/2 border-t md:border-t-0 md:border-l ${colors.border} overflow-y-auto md:overflow-hidden ${colors.left} max-h-[40vh] md:max-h-none order-1 md:order-2`}>
          <StimulusPanel 
            unit={selectedUnit as 1 | 2 | 3 | 4 | 5 | 6 | 7} 
            videoUrl={meta?.videoUrl}
            images={getUnitImages(selectedUnit)}
          />
        </div>
      </div>
    </div>
  );
};

export default Quiz;
