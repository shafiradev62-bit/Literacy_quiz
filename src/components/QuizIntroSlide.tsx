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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-hidden">
      {/* Handcraft workshop background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg/handcraft-workshop.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/45 to-amber-900/25" />

      {/* Ground plane so character stands on floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-gradient-to-t from-[#3d2b1f] via-[#5c4033]/95 to-transparent pointer-events-none" />
      <div className="absolute bottom-[12%] left-0 right-0 h-8 bg-black/25 blur-md pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4 px-6 max-w-md w-full pb-8 md:pb-10">
        <div className="bg-amber-800/90 text-amber-50 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md border border-amber-600/40">
          {isId ? "Kuis Etnosains Cirebon" : "Cirebon Ethnoscience Quiz"}
        </div>

        <div
          className="relative bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-white/40 w-full cursor-pointer select-none"
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
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white/95 border-r border-b border-white/40 rotate-45" />
        </div>

        {/* Male character standing on ground */}
        <div className="relative flex flex-col items-center mt-2">
          <img
            src={SPRITES[spriteIdx]}
            alt="character"
            className={`relative z-10 w-40 h-48 object-contain object-bottom drop-shadow-[0_12px_18px_rgba(0,0,0,0.45)] transition-transform duration-200 ${bounce ? "scale-105 -translate-y-1" : "scale-100"}`}
            draggable={false}
          />
          {/* Contact shadow on ground */}
          <div className="absolute bottom-1 w-28 h-4 rounded-[100%] bg-black/40 blur-[6px] z-0" />
        </div>

        <div className="text-center">
          <h1 className="font-display text-xl text-white font-bold mb-1 drop-shadow-md">
            {isId ? "Jelajahi Sains Lewat Budaya Cirebon!" : "Explore Science Through Cirebon Culture!"}
          </h1>
          <p className="text-sm text-amber-50/90 leading-relaxed max-w-sm">
            {isId
              ? "Dalam aktivitas ini, kamu akan belajar sains dari budaya unik Cirebon — makanan, tradisi, kerajinan, dan alam."
              : "In this activity, you'll learn science from the unique culture of Cirebon — food, traditions, crafts, and nature."}
          </p>
        </div>

        <button
          onClick={onStart}
          className={`px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-black/30 transition-all duration-300 text-sm active:scale-95 hover:bg-primary/90 ${showBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        >
          {isId ? "Mulai Kuis" : "Start Quiz"}
        </button>
      </div>
    </div>
  );
}
