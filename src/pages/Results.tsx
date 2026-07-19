import { useLocation, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllLocalSessions } from "@/hooks/useExamSession";
import { getQuestionsForUnit } from "@/data/examQuestions";

interface ResultsState {
  score: number;
  total: number;
  answers: Record<number, string | string[]>;
  unit?: number;
}

const unitNames: Record<number, string> = {
  1: "Unit 1 — Nasi Jamblang",
  2: "Unit 2 — Terasi Cirebon",
  3: "Unit 3 — Empal Gentong",
  4: "Unit 4 — Kerupuk Melarat",
  5: "Unit 5 — Tape Ketan Bakung",
  6: "Unit 6 — Mangrove Ecosystem",
  7: "Unit 7 — Nadran",
  8: "Unit 8 — Rattan Craft",
  9: "Unit 9 — Batik Trusmi",
  10: "Unit 10 — Tahu Gejrot",
};

const Results = () => {
  const { t, lang } = useLanguage();
  const isId = lang === "id";
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | null;

  if (!state) {
    return (
      <div className="h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-4">{t("No results found.", "Hasil tidak ditemukan.")}</p>
          <Link to="/quiz" className="text-sm font-medium text-primary hover:opacity-80">{t("Take the assessment", "Ikuti penilaian")}</Link>
        </div>
      </div>
    );
  }

  const percentage = Math.round((state.score / state.total) * 100);

  const getFeedback = () => {
    if (percentage >= 80) return t("Excellent. You demonstrate strong comprehension.", "Sangat baik. Anda menunjukkan pemahaman yang kuat.");
    if (percentage >= 60) return t("Good. You show adequate understanding.", "Baik. Anda menunjukkan pemahaman yang memadai.");
    return t("Review recommended. Please revisit the material.", "Perlu ditinjau. Silakan baca ulang materi.");
  };

  const getLatestSession = () => {
    const sessions = getAllLocalSessions();
    return sessions.find(s => s.completed && s.score === state.score) ?? null;
  };

  const session = getLatestSession();
  const unitNum = state.unit ?? session?.unit ?? 1;
  const questions = getQuestionsForUnit(unitNum);

  // Build answer key rows — MCQ and checkbox only
  const answerKeyRows = questions
    .filter(q => q.type === "mcq" || q.type === "checkbox")
    .map(q => {
      const studentAnswer = state.answers[q.id];
      let isCorrect = false;
      if (q.type === "mcq") {
        // match against EN correct; if lang=id, match optionsIdn index
        const correctEn = q.correct as string;
        const correctIdx = q.options?.indexOf(correctEn) ?? -1;
        const correctDisplay = isId && q.optionsIdn && correctIdx >= 0
          ? q.optionsIdn[correctIdx]
          : correctEn;
        const studentIdx = isId && q.optionsIdn
          ? q.optionsIdn.indexOf(studentAnswer as string)
          : q.options?.indexOf(studentAnswer as string) ?? -1;
        isCorrect = studentIdx >= 0 && studentIdx === correctIdx;
        return { id: q.id, type: q.type, correct: correctDisplay, student: studentAnswer as string || "—", isCorrect };
      } else {
        // checkbox
        const correctArr = q.correct as string[];
        const studentArr = (studentAnswer as string[]) || [];
        isCorrect = studentArr.length === correctArr.length && correctArr.every(c => {
          const idx = q.options?.indexOf(c) ?? -1;
          const display = isId && q.optionsIdn && idx >= 0 ? q.optionsIdn[idx] : c;
          return studentArr.includes(display) || studentArr.includes(c);
        });
        const correctDisplay = correctArr.map(c => {
          const idx = q.options?.indexOf(c) ?? -1;
          return isId && q.optionsIdn && idx >= 0 ? q.optionsIdn[idx] : c;
        }).join(", ");
        return { id: q.id, type: q.type, correct: correctDisplay, student: studentArr.join(", ") || "—", isCorrect };
      }
    });

  const downloadCSV = () => {
    const sessions = getAllLocalSessions().filter(s => s.completed);
    if (sessions.length === 0) return;

    const headers = ["No", "Nama", "Kelas", "Sekolah", "Kontak", "Instagram", "Unit", "Skor", "Total", "%", "Waktu Mulai", "Waktu Selesai"];
    const rows = sessions.map((s, i) => [
      i + 1,
      s.student_name ?? "",
      s.student_class ?? "",
      s.student_school ?? "",
      s.student_contact ?? "",
      s.student_instagram ? `@${s.student_instagram}` : "",
      unitNames[s.unit] ?? `Unit ${s.unit}`,
      s.score ?? 0,
      s.total ?? 0,
      s.total ? Math.round(((s.score ?? 0) / s.total) * 100) + "%" : "0%",
      new Date(s.started_at).toLocaleString("id-ID"),
      new Date(s.updated_at).toLocaleString("id-ID"),
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil-ujian-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const sessions = getAllLocalSessions().filter(s => s.completed);
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hasil-ujian-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = percentage >= 80 ? "text-emerald-600" : percentage >= 60 ? "text-amber-600" : "text-rose-600";
  const barColor = percentage >= 80 ? "bg-emerald-500" : percentage >= 60 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pt-16">
      <div className="max-w-2xl mx-auto px-6 py-10 fade-in-up">

        {/* Header */}
        <p className="text-[10px] font-semibold tracking-widest uppercase text-black mb-4">
          {t("Assessment Complete", "Penilaian Selesai")}
        </p>

        {/* Student info */}
        {session?.student_name && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
            <p className="text-[14px] font-semibold text-black">{session.student_name}</p>
            <p className="text-[12px] text-black">{session.student_class} · {session.student_school}</p>
            <p className="text-[11px] text-black mt-1">{unitNames[session.unit] ?? `Unit ${session.unit}`}</p>
          </div>
        )}

        {/* Score card */}
        <div className="mb-6 p-6 bg-white rounded-2xl border border-border/40 shadow-sm">
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`font-display text-6xl font-bold ${scoreColor}`}>{state.score}</span>
            <span className="text-2xl text-black font-light">/ {state.total}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full mb-3">
            <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-sm text-black">{percentage}% {t("correct", "benar")}</p>
          <p className="text-[13px] text-black mt-2 leading-relaxed">{getFeedback()}</p>
        </div>

        {/* Answer Key Sheet — MCQ/Checkbox only */}
        {answerKeyRows.length > 0 && (
          <div className="mb-6 bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-black">
                {isId ? "Kunci Jawaban (Pilihan Ganda)" : "Answer Key (Multiple Choice)"}
              </p>
            </div>
            <div className="divide-y divide-border/30">
              {answerKeyRows.map(row => (
                <div key={row.id} className="px-5 py-3 flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${row.isCorrect ? "bg-emerald-500" : "bg-rose-500"}`}>
                    {row.isCorrect ? "✓" : "✗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-black mb-1">
                      {isId ? `Soal ${row.id}` : `Question ${row.id}`}
                      <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${row.isCorrect ? "bg-emerald-100 text-black" : "bg-rose-100 text-black"}`}>
                        {row.isCorrect ? (isId ? "Benar" : "Correct") : (isId ? "Salah" : "Incorrect")}
                      </span>
                    </p>
                    <p className="text-[11px] text-black">
                      <span className="font-medium text-black">{isId ? "Jawaban kamu: " : "Your answer: "}</span>
                      {row.student}
                    </p>
                    {!row.isCorrect && (
                      <p className="text-[11px] text-black mt-0.5">
                        <span className="font-medium text-black">{isId ? "Kunci: " : "Key: "}</span>
                        <span className="text-black">{row.correct}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download buttons */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-border/40 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black mb-3">
            {isId ? "Unduh Semua Data Sesi" : "Download All Session Data"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[12px] font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              CSV
            </button>
            <button
              onClick={downloadJSON}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border/60 text-black text-[12px] font-semibold rounded-lg hover:bg-muted/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              JSON
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate("/quiz")} className="px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            {t("Retake", "Ulangi")}
          </button>
          <Link to="/dashboard" className="px-5 py-2.5 bg-white border border-border/60 text-black text-[13px] font-medium rounded-lg hover:bg-muted/30 transition-colors">
            {t("View History", "Lihat Riwayat")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
