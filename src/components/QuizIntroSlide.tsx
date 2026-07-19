import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SPRITES = Array.from({ length: 12 }, (_, i) => `/karakter/sprite_${i + 1}.png`);

const DIALOGUE_EN = [
  "Hey there, explorer!",
  "Welcome to the Cirebon Ethnoscience Quiz!",
  "Did you know... science is hiding in food, crafts, and traditions?",
  "We're going to discover it together through the culture of Cirebon!",
  "Ready to think like a scientist? Let's go!",
];

const DIALOGUE_ID = [
  "Hei, penjelajah!",
  "Selamat datang di Kuis Etnosains Cirebon!",
  "Tahukah kamu... sains tersembunyi di makanan, kerajinan, dan tradisi?",
  "Kita akan menemukannya bersama lewat budaya Cirebon!",
  "Siap berpikir seperti ilmuwan? Ayo mulai!",
];

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

  useEffect(() => {
    const t = setInterval(() => setSpriteIdx((i) => (i + 1) % SPRITES.length), 120);
    return () => clearInterval(t);
  }, []);

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
        if (lineIdx === dialogue.length - 1) {
          setTimeout(() => setShowBtn(true), 400);
        }
      }
    }, 35);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx]);

  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 400);
    return () => clearTimeout(t);
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full px-6 pt-6 pb-0">
        {/* Top badge */}
        <div className="bg-amber-800/90 text-amber-50 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md border border-amber-600/40">
          {isId ? "Kuis Etnosains Cirebon" : "Cirebon Ethnoscience Quiz"}
        </div>

        {/* Speech bubble in middle */}
        <div className="relative w-full max-w-md -mt-4">
          {/* Cloud bumps on top */}
          <div className="absolute -top-4 left-0 right-0 flex justify-center gap-3 pointer-events-none">
            <div className="w-10 h-8 rounded-full bg-white/95 shadow-sm" />
            <div className="w-14 h-9 rounded-full bg-white/95 shadow-sm" />
            <div className="w-12 h-8 rounded-full bg-white/95 shadow-sm" />
            <div className="w-16 h-10 rounded-full bg-white/95 shadow-sm" />
            <div className="w-11 h-8 rounded-full bg-white/95 shadow-sm" />
            <div className="w-13 h-9 rounded-full bg-white/95 shadow-sm" />
            <div className="w-9 h-7 rounded-full bg-white/95 shadow-sm" />
          </div>
          {/* Cloud bumps on bottom sides */}
          <div className="absolute -bottom-3 left-8 w-8 h-7 rounded-full bg-white/95" />
          <div className="absolute -bottom-5 left-14 w-10 h-8 rounded-full bg-white/95" />
          {/* Main bubble body */}
          <div
            className="relative bg-white/95 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-xl border-2 border-white/60 w-full cursor-pointer select-none mt-4"
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
          </div>
          {/* Tail pointing down toward character */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-7 h-7 bg-white/95 rounded-full" />
            <div className="w-4 h-4 bg-white/95 rounded-full mt-0.5" />
            <div className="w-2 h-2 bg-white/95 rounded-full mt-0.5" />
          </div>
        </div>

        {/* Bottom section: character + text + button, pinned to bottom */}
        <div className="flex flex-col items-center w-full max-w-md pb-4">
          {/* Character standing on ground */}
          <div className="relative flex flex-col items-center">
            <img
              src={SPRITES[spriteIdx]}
              alt="character"
              className={`relative z-10 w-36 h-44 object-contain object-bottom drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-200 ${bounce ? "scale-105 -translate-y-1" : "scale-100"}`}
              draggable={false}
            />
            {/* Contact shadow on ground */}
            <div className="absolute bottom-0 w-24 h-3 rounded-[100%] bg-black/50 blur-[5px] z-0" />
          </div>

          <div className="text-center mt-2">
            <h1 className="font-display text-lg text-white font-bold mb-1 drop-shadow-md">
              {isId ? "Jelajahi Sains Lewat Budaya Cirebon!" : "Explore Science Through Cirebon Culture!"}
            </h1>
            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              {isId
                ? "Dalam aktivitas ini, kamu akan belajar sains dari budaya unik Cirebon — makanan, tradisi, kerajinan, dan alam."
                : "In this activity, you'll learn science from the unique culture of Cirebon — food, traditions, crafts, and nature."}
            </p>
          </div>

          <button
            onClick={onStart}
            className={`mt-3 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full btn-3d transition-all duration-300 text-sm active:scale-95 hover:bg-primary/90 ${showBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          >
            {isId ? "Mulai Kuis" : "Start Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
