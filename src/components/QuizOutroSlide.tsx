import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SPRITES = Array.from({ length: 12 }, (_, i) => `/karakter/sprite_${i + 1}.png`);

const DIALOGUE_EN = [
  "Woohoo! You made it to the end! ",
  "You've explored 10 amazing topics from Cirebon!",
  "From nasi jamblang to tahu gejrot... science is everywhere!",
  "You're now a Cirebon Ethnoscience Explorer! ",
  "Keep curious, keep learning. See you next time! ",
];

const DIALOGUE_ID = [
  "Hore! Kamu berhasil sampai akhir! ",
  "Kamu sudah menjelajahi 10 topik keren dari Cirebon!",
  "Dari nasi jamblang sampai tahu gejrot... sains ada di mana-mana!",
  "Kamu sekarang adalah Penjelajah Etnosains Cirebon! ",
  "Tetap penasaran, terus belajar. Sampai jumpa! ",
];

const CONFETTI_COLORS = ["#4ade80", "#60a5fa", "#f59e0b", "#f472b6", "#a78bfa", "#34d399"];

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

interface Props {
  onFinish: () => void;
}

export default function QuizOutroSlide({ onFinish }: Props) {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const dialogue = isId ? DIALOGUE_ID : DIALOGUE_EN;

  const [spriteIdx, setSpriteIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const [showBtn, setShowBtn] = useState(false);
  const [confetti] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      size: 6 + Math.random() * 8,
    }))
  );
  const charRef = useRef(0);

  // Animate sprite
  useEffect(() => {
    const t = setInterval(() => setSpriteIdx((i) => (i + 1) % SPRITES.length), 120);
    return () => clearInterval(t);
  }, []);

  // Typewriter effect
  useEffect(() => {
    charRef.current = 0;
    setDisplayed("");
    setTyping(true);

    const line = dialogue[lineIdx];
    const t = setInterval(() => {
      charRef.current += 1;
      setDisplayed(line.slice(0, charRef.current));
      if (charRef.current >= line.length) {
        clearInterval(t);
        setTyping(false);
        if (lineIdx === dialogue.length - 1) setTimeout(() => setShowBtn(true), 400);
      }
    }, 35);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx]);

  const handleNext = () => {
    if (typing) {
      setDisplayed(dialogue[lineIdx]);
      setTyping(false);
      if (lineIdx === dialogue.length - 1) setShowBtn(true);
    } else if (lineIdx < dialogue.length - 1) {
      setLineIdx((i) => i + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Cirebon background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/cirebon.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute top-0 rounded-sm pointer-events-none"
          style={{
            left: `${c.x}%`,
            width: c.size,
            height: c.size * 0.6,
            backgroundColor: c.color,
            animation: `confetti-fall ${c.duration}s ease-in ${c.delay}s infinite`,
            opacity: 0.85,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 pt-8 pb-4">
        {/* Trophy + badge */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-primary animate-bounce" style={{ animationDuration: "1.5s" }}>
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
              <path d="M7 6H4v2a3 3 0 0 0 3 3" />
              <path d="M17 6h3v2a3 3 0 0 1-3 3" />
              <path d="M12 13v4" />
              <path d="M8 21h8" />
              <path d="M9 17h6" />
            </svg>
          </div>
          <div className="bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
            {isId ? "Kuis Selesai!" : "Quiz Complete!"}
          </div>
        </div>

        {/* Speech bubble */}
        <div
          className="relative bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/60 max-w-md w-full cursor-pointer select-none"
          onClick={handleNext}
          style={{ minHeight: 80 }}
        >
          <div className="flex gap-1.5 mb-3">
            {dialogue.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === lineIdx ? "bg-primary w-5" : i < lineIdx ? "bg-primary/40 w-3" : "bg-muted w-3"}`}
              />
            ))}
          </div>

          <p className="text-[15px] text-foreground font-medium leading-snug min-h-[2.5rem]">
            {displayed}
            {typing && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />}
          </p>

          {!typing && lineIdx < dialogue.length - 1 && (
            <p className="text-[11px] text-muted-foreground mt-2 text-right animate-pulse">
              {isId ? "Ketuk untuk lanjut →" : "Tap to continue →"}
            </p>
          )}

          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-r border-b border-border/40 rotate-45" />
        </div>

        {/* Bottom: character + text + button */}
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Character standing on ground */}
          <div className="relative flex flex-col items-center">
            <img
              src={SPRITES[spriteIdx]}
              alt="character"
              className="relative z-10 w-32 h-40 object-contain object-bottom drop-shadow-[0_8px_14px_rgba(0,0,0,0.5)]"
              draggable={false}
            />
            <div className="absolute bottom-0 w-20 h-3 rounded-[100%] bg-black/50 blur-[4px] z-0" />
          </div>

          <div className="text-center mt-2">
            <h1 className="font-display text-lg text-white font-bold mb-1 drop-shadow-md">
              {isId ? "Terima Kasih Sudah Menjelajahi Cirebon dan Sains!" : "Thank You for Exploring Cirebon and Science!"}
            </h1>
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              {isId
                ? "Semoga aktivitas ini membantumu menikmati belajar, berpikir kritis, dan menghargai kearifan lokal dalam kehidupan sehari-hari."
                : "We hope this activity helps you enjoy learning, think critically, and appreciate local wisdom in everyday life."}
            </p>
          </div>

          <button
            onClick={onFinish}
            className={`mt-3 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full btn-3d transition-all duration-300 text-sm active:scale-95 hover:bg-primary/90 ${showBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          >
            {isId ? "Selesai" : "Finish"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
