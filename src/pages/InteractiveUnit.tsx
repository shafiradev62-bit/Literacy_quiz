import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const introTextEn = `PISA-STYLE INTERACTIVE UNIT
READING LITERACY: UNDERSTANDING INFORMATIONAL TEXTS

Reading literacy is the ability to understand, use, evaluate, and reflect on written texts. In this unit, you will analyze an informational text about traditional food packaging and answer questions that test your comprehension skills.`;

const introTextId = `UNIT INTERAKTIF GAYA PISA
LITERASI MEMBACA: MEMAHAMI TEKS INFORMATIF

Literasi membaca adalah kemampuan untuk memahami, menggunakan, mengevaluasi, dan merefleksikan teks tertulis. Dalam unit ini, Anda akan menganalisis teks informatif tentang kemasan makanan tradisional dan menjawab pertanyaan yang menguji keterampilan pemahaman Anda.`;

const questionsEn = [
  { id: 1, title: "Question 1 / 5", prompt: "Based on the text, why were teak leaves chosen as packaging for Nasi Jamblang during the colonial period?", type: "single", options: ["They were the cheapest option available", "They are strong, tear-resistant, and allow air circulation", "They were easier to produce than plastic", "They had no environmental impact"], correct: 1 },
  { id: 2, title: "Question 2 / 5", prompt: "According to the comparison table, which packaging type has the lowest environmental impact?", type: "single", options: ["Plastic", "Paper", "Teak leaf", "All are equal"], correct: 2 },
  { id: 3, title: "Question 3 / 5", prompt: "Explain why teak leaf packaging is considered more sustainable than plastic packaging. Use evidence from the text.", type: "text" },
  { id: 4, title: "Question 4 / 5", prompt: "A vendor wants to switch from teak leaves to plastic for cost reasons. What environmental trade-offs should they consider? Use the table data in your answer.", type: "text" },
  { id: 5, title: "Question 5 / 5", prompt: "If you were advising a Nasi Jamblang vendor on packaging choices, what would you recommend and why? Consider both economic and environmental factors.", type: "text" },
];

const questionsId = [
  { id: 1, title: "Pertanyaan 1 / 5", prompt: "Berdasarkan teks, mengapa daun jati dipilih sebagai kemasan Nasi Jamblang pada masa kolonial?", type: "single", options: ["Karena paling murah", "Karena kuat, tidak mudah robek, dan memungkinkan sirkulasi udara", "Karena lebih mudah diproduksi dari plastik", "Karena tidak berdampak lingkungan"], correct: 1 },
  { id: 2, title: "Pertanyaan 2 / 5", prompt: "Berdasarkan tabel perbandingan, jenis kemasan mana yang memiliki dampak lingkungan paling rendah?", type: "single", options: ["Plastik", "Kertas", "Daun jati", "Semua sama"], correct: 2 },
  { id: 3, title: "Pertanyaan 3 / 5", prompt: "Jelaskan mengapa kemasan daun jati dianggap lebih berkelanjutan dibandingkan plastik. Gunakan bukti dari teks.", type: "text" },
  { id: 4, title: "Pertanyaan 4 / 5", prompt: "Seorang pedagang ingin beralih dari daun jati ke plastik karena alasan biaya. Pertimbangan lingkungan apa yang harus mereka pikirkan? Gunakan data tabel dalam jawaban Anda.", type: "text" },
  { id: 5, title: "Pertanyaan 5 / 5", prompt: "Jika Anda memberi saran kepada pedagang Nasi Jamblang tentang pilihan kemasan, apa yang akan Anda rekomendasikan dan mengapa? Pertimbangkan faktor ekonomi dan lingkungan.", type: "text" },
];

export default function InteractiveUnit() {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [page, setPage] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});

  // AUTO-SYNC / AUTO-SAVE
  React.useEffect(() => {
    if (page > 0) {
      localStorage.setItem("interactive_unit_autosave", JSON.stringify({ page, responses }));
    }
  }, [page, responses]);

  // LOAD AUTO-SAVE
  React.useEffect(() => {
    const saved = localStorage.getItem("interactive_unit_autosave");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.page !== undefined) setPage(d.page);
        if (d.responses !== undefined) setResponses(d.responses);
      } catch (e) {
        console.error("Failed to load interactive unit autosave", e);
      }
    }
  }, []);

  const questions = isId ? questionsId : questionsEn;
  const introText = isId ? introTextId : introTextEn;

  const currentQuestion = questions[page - 1];

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const isCurrentValid = () => {
    if (!currentQuestion) return true;
    const resp = responses[currentQuestion.id] || "";
    if (currentQuestion.type === "text") {
      const wc = getWordCount(resp);
      return wc >= 15;
    }
    if (currentQuestion.type === "single") {
      return resp !== "";
    }
    return true;
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (q.type === "single" && responses[q.id] === String(q.correct)) score += 1;
      else if (q.type === "text" && responses[q.id]?.trim().length > 0) score += 1;
    });
    return score;
  };

  const handleFinish = () => {
    const finalScore = calculateScore();
    alert(isId ? `Unit selesai! Skor Anda: ${finalScore}/5` : `Unit completed! Your score: ${finalScore}/5`);
    setPage(0);
    setResponses({});
  };

  if (page === 0) {
    return (
      <div className="h-screen flex flex-col overflow-hidden pt-16">
        <div className="flex-1 overflow-y-auto bg-muted/30 px-6 py-8">
          <div className="mx-auto bg-white rounded-xl border border-border/50 p-8 shadow-sm text-left max-w-3xl">
            <h1 className="font-display text-2xl text-foreground mb-6">{isId ? "Pendahuluan" : "Introduction"}</h1>
            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/80 mb-6">{introText}</div>
            <button onClick={() => setPage(1)} className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg transition-opacity hover:opacity-90">
              {isId ? "Mulai Unit" : "Start Unit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === 6) {
    return (
      <div className="h-screen flex flex-col overflow-hidden pt-16">
        <div className="flex-1 flex items-center justify-center bg-muted/30 px-6">
          <div className="bg-white rounded-xl border border-border/50 p-8 shadow-sm max-w-md">
            <h2 className="font-display text-xl mb-4">{isId ? "Selesai" : "Finish"}</h2>
            <p className="text-sm text-muted-foreground mb-6">{isId ? "Klik selesai untuk melihat skor Anda." : "Click finish to see your score."}</p>
            <div className="flex gap-3">
              <button onClick={() => setPage(5)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50">{isId ? "Kembali" : "Back"}</button>
              <button onClick={handleFinish} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">{isId ? "Selesai" : "Finish"}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden pt-16">
      <div className="bg-white border-b border-border/60 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wide uppercase text-foreground">{isId ? "Unit Interaktif Literasi" : "Literacy Interactive Unit"}</span>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${(page / 5) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto exam-scrollbar p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{currentQuestion.title}</span>
          </div>
          <div className="bg-white rounded-xl border border-border/50 p-5 shadow-sm mb-5">
            {currentQuestion.mediaUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border border-border/30 bg-muted/20 flex justify-center items-center">
                {currentQuestion.mediaType === "video" ? (
                  <video src={currentQuestion.mediaUrl} controls className="max-h-[240px] w-full" />
                ) : (
                  <img src={currentQuestion.mediaUrl} alt="Question stimulus" className="max-h-[240px] w-auto object-contain" />
                )}
              </div>
            )}
            <p className="text-sm leading-relaxed">{currentQuestion.prompt}</p>
          </div>
          
          {currentQuestion.type === "single" && (
            <div className="space-y-2">
              {currentQuestion.options.map((opt, idx) => (
                <button key={idx} onClick={() => setResponses((r) => ({ ...r, [currentQuestion.id]: String(idx) }))} className={`w-full text-left p-3 rounded-lg border transition-all ${responses[currentQuestion.id] === String(idx) ? "border-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/20"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${responses[currentQuestion.id] === String(idx) ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                      {responses[currentQuestion.id] === String(idx) && <span className="w-2 h-2 bg-white rounded-full" />}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "text" && (
            <div className="bg-white rounded-xl border border-border/50 p-1 shadow-sm">
              <textarea
                value={responses[currentQuestion.id] ?? ""}
                onChange={(e) => setResponses((r) => ({ ...r, [currentQuestion.id]: e.target.value }))}
                placeholder={isId ? "Tulis jawaban..." : "Write answer..."}
                className="w-full p-3 text-sm rounded-lg border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none"
              />
              <div className="px-3 pb-2 flex justify-end">
                <span className={`text-[10px] font-bold ${getWordCount(responses[currentQuestion.id] || "") >= 15 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(responses[currentQuestion.id] || "")} {isId ? "kata (Minimal 15)" : "words (Min. 15)"}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg">{isId ? "← Kembali" : "← Back"}</button>
            <button
              onClick={() => setPage((p) => Math.min(6, p + 1))}
              disabled={!isCurrentValid()}
              className="px-4 py-2 text-sm rounded-lg hover:opacity-90 bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isId ? "Berikutnya →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
