import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SPRITES = Array.from({ length: 12 }, (_, i) => `/karakter/sprite_${i + 1}.png`);

const BUBBLES_EN = [
  "Welcome! Let's explore traditional food science.",
  "Did you know teak leaves are biodegradable?",
  "Terasi fermentation reduces harmful bacteria!",
  "Clay pots retain heat more efficiently than metal.",
  "Sand frying uses no oil — pretty cool, right?",
  "Traditional food practices can be sustainable too.",
  "Get ready to run some simulations!",
  "Read the stimulus carefully before answering.",
  "You can record data and use it to answer questions.",
  "Science and tradition go hand in hand here.",
];

const BUBBLES_ID = [
  "Selamat datang! Yuk eksplorasi sains pangan tradisional.",
  "Tahukah kamu daun jati bersifat biodegradable?",
  "Fermentasi terasi mengurangi bakteri berbahaya!",
  "Kuali tanah liat lebih efisien menahan panas.",
  "Goreng pasir tidak pakai minyak — keren kan?",
  "Praktik pangan tradisional bisa berkelanjutan.",
  "Bersiaplah untuk menjalankan simulasi!",
  "Baca stimulus dengan teliti sebelum menjawab.",
  "Catat data dan gunakan untuk menjawab soal.",
  "Sains dan tradisi berjalan beriringan di sini.",
];

interface LoadingScreenProps {
  onDone: () => void;
  duration?: number;
}

export default function LoadingScreen({ onDone, duration = 30000 }: LoadingScreenProps) {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const bubbles = isId ? BUBBLES_ID : BUBBLES_EN;

  const [spriteIdx, setSpriteIdx] = useState(0);
  const [bubbleIdx, setBubbleIdx] = useState(() => Math.floor(Math.random() * bubbles.length));
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = setInterval(() => setSpriteIdx((i) => (i + 1) % SPRITES.length), 120);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBubbleIdx((i) => (i + 1) % bubbles.length), 700);
    return () => clearInterval(t);
  }, [bubbles.length]);

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg/handcraft-workshop.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-amber-900/20" />
      <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#3d2b1f] via-[#5c4033]/90 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5 select-none pb-10 px-6">
        <div className="relative bg-white/95 backdrop-blur-sm border border-white/50 rounded-2xl px-5 py-3 shadow-lg max-w-xs text-center">
          <p className="text-[14px] text-foreground font-medium leading-snug">{bubbles[bubbleIdx]}</p>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-r border-b border-white/50 rotate-45" />
        </div>

        <div className="relative flex flex-col items-center">
          <img
            src={SPRITES[spriteIdx]}
            alt="character"
            className="relative z-10 w-36 h-44 object-contain object-bottom drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
            draggable={false}
          />
          <div className="absolute bottom-1 w-24 h-3.5 rounded-[100%] bg-black/40 blur-[5px] z-0" />
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-amber-200 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>

        <button
          onClick={onDone}
          className="mt-1 text-[12px] text-amber-50/80 hover:text-white transition-colors underline underline-offset-2 rounded-full"
        >
          {isId ? "Lewati" : "Skip"}
        </button>
      </div>
    </div>
  );
}
