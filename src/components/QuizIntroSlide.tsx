import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SPRITES = Array.from({ length: 12 }, (_, i) => `/karakter/sprite_${i + 1}.png`);

// Dialogue lines the character says one by one
const DIALOGUE_EN = [
  "Hey there, explorer! 👋",
  "Welcome to the Cirebon Ethnoscience Quiz!",
  "Did you know... science is hiding in food, crafts, and traditions?",
  "We're going to discover it together through the culture of Cirebon!",
  "Ready to think like a scientist? Let's go! 🚀",
];

const DIALOGUE_ID = [
  "Hei, penjelajah! 👋",
  "Selamat datang di Kuis Etnosains Cirebon!",
  "Tahukah kamu... sains tersembunyi di makanan, kerajinan, dan tradisi?",
  "Kita akan menemukannya bersama lewat budaya Cirebon!",
  "Siap berpikir seperti ilmuwan? Ayo mulai! 🚀",
];

// Floating emoji decorations
const FLOATERS = ["🍚", "🌿", "🔬", "🎨", "🐟", "🌊", "🏺", "✨"];

interface Props {
  onStart: () => void;
}

export default function QuizIntroSlide({ onStart }: Props) {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const dialogue = isId ? DIALOGUE_ID : DIALOGUE_EN;

  const [spriteIdx, setSpriteIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const [showBtn, setShowBtn] = useState(false);
  const [bounce, setBounce] = useState(false);
  const charRef = useRef(0);
  const lineRef = useRef(0);

  // Animate sprite
  useEffect(() => {
    const t = setInterval(() => setSpriteIdx((i) => (i + 1) % SPRITES.length), 120);
    return () => clearInterval(t);
  }, []);

  // Typewriter effect per line
  useEffect(() => {
    charRef.current = 0;
    setDisplayed("");
    setTyping(true);
    lineRef.current = lineIdx;

    const line = dialogue[lineIdx];
    const t = setInterval(() => {
      charRef.current += 1;
      setDisplayed(line.slice(0, charRef.current));
      if (charRef.current >= line.length) {
        clearInterval(t);
        setTyping(false);
        if (lineIdx === dialogue.length - 1) {
          setTimeout(() => setShowBtn(true), 400);
        }
      }
    }, 35);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx]);

  // Bounce character when new line starts
  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 400);
    return () => clearTimeout(t);
  }, [lineIdx]);

  const handleNext = () => {
    if (typing) {
      // Skip typing — show full line immediately
      setDisplayed(dialogue[lineIdx]);
      setTyping(false);
      if (lineIdx === dialogue.length - 1) setShowBtn(true);
    } else if (lineIdx < dialogue.length - 1) {
      setLineIdx((i) => i + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #fef9ee 0%, #e8f5e9 50%, #e3f2fd 100%)" }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary/10 animate-pulse" style={{ animationDuration: "3s" }} />
        <div className="absolute bottom-20 right-10 w-56 h-56 rounded-full bg-blue-200/30 animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-yellow-200/40 animate-pulse" style={{ animationDuration: "2.5s" }} />
      </div>

      {/* Floating emoji decorations */}
      {FLOATERS.map((emoji, i) => (
        <span
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{
            top: `${10 + (i * 11) % 80}%`,
            left: `${5 + (i * 13) % 90}%`,
            animation: `float-${(i % 3) + 1} ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            opacity: 0.5,
          }}
        >
          {emoji}
        </span>
      ))}

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-md w-full">
        {/* Title badge */}
        <div className="bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
          {isId ? "Kuis Etnosains Cirebon" : "Cirebon Ethnoscience Quiz"}
        </div>

        {/* Speech bubble */}
        <div
          className="relative bg-white rounded-2xl px-6 py-4 shadow-lg border border-border/40 w-full cursor-pointer select-none"
          onClick={handleNext}
          style={{ minHeight: 80 }}
        >
          {/* Progress dots */}
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

          {/* Bubble tail */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-r border-b border-border/40 rotate-45" />
        </div>

        {/* Character sprite */}
        <img
          src={SPRITES[spriteIdx]}
          alt="character"
          className={`w-32 h-32 object-contain drop-shadow-lg transition-transform duration-200 ${bounce ? "scale-110" : "scale-100"}`}
          draggable={false}
        />

        {/* Subtitle */}
        <div className="text-center">
          <h1 className="font-display text-xl text-foreground font-bold mb-1">
            {isId ? "Jelajahi Sains Lewat Budaya Cirebon!" : "Explore Science Through Cirebon Culture!"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {isId
              ? "Dalam aktivitas ini, kamu akan belajar sains dari budaya unik Cirebon — makanan, tradisi, kerajinan, dan alam."
              : "In this activity, you'll learn science from the unique culture of Cirebon — food, traditions, crafts, and nature."}
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className={`px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 text-sm active:scale-95 hover:bg-primary/90 ${showBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        >
          {isId ? "Mulai Kuis 🚀" : "Start Quiz 🚀"}
        </button>
      </div>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes float-1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float-2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float-3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}
