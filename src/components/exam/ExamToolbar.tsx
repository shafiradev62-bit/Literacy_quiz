import { useLanguage } from "@/contexts/LanguageContext";

interface ExamToolbarProps {
  currentQuestion: number;
  totalQuestions: number;
}

const ExamToolbar = ({ currentQuestion, totalQuestions }: ExamToolbarProps) => {
  const { lang, toggle, t } = useLanguage();

  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 border-b border-indigo-800 select-none shadow-sm">
      <div className="flex items-center justify-between px-5 h-14">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold tracking-wide uppercase text-white">
            {t("Assessment", "Penilaian")}
          </span>
          <div className="hidden sm:block w-px h-5 bg-white/30"></div>
          <span className="hidden sm:block text-xs text-indigo-200 max-w-[150px] truncate">
            Quiz
          </span>
        </div>

        {/* Center: Progress */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-indigo-200">
              {t("Question", "Pertanyaan")} {currentQuestion + 1}/{totalQuestions}
            </span>
          </div>
          <div className="w-40 h-2 bg-indigo-800/50 rounded-full overflow-hidden border border-indigo-500/30">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-white">{Math.round(progress)}%</span>
        </div>

        {/* Right: Lang */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 border border-white/30 rounded-lg transition-all duration-150 hover:bg-white/10 text-white"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {lang === "en" ? "ID" : "EN"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamToolbar;
