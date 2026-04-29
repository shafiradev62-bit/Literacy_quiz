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
  duration?: number; // ms
}

export default function LoadingScreen({ onDone, duration = 30000 }: LoadingScreenProps) {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const bubbles = isId ? BUBBLES_ID : BUBBLES_EN;

  const [spriteIdx, setSpriteIdx] = useState(0);
  const [bubbleIdx, setBubbleIdx] = useState(() => Math.floor(Math.random() * bubbles.length));
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Cycle sprites every 120ms
  useEffect(() => {
    const t = setInterval(() => {
      setSpriteIdx((i) => (i + 1) % SPRITES.length);
    }, 120);
    return () => clearInterval(t);
  }, []);

  // Cycle bubble text every 700ms
  useEffect(() => {
    const t = setInterval(() => {
      setBubbleIdx((i) => (i + 1) % bubbles.length);
    }, 700);
    return () => clearInterval(t);
  }, [bubbles.length]);

  // Auto-dismiss after duration
  useEffect(() => {
    const t = setTimeout(() => {
      onDoneRef.current();
    }, duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Green accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

      <div className="flex flex-col items-center gap-6 select-none">
        {/* Speech bubble */}
        <div className="relative bg-white border border-border/60 rounded-2xl px-5 py-3 shadow-sm max-w-xs text-center">
          <p className="text-[14px] text-foreground font-medium leading-snug">
            {bubbles[bubbleIdx]}
          </p>
          {/* Bubble tail */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-border/60 rotate-45" />
        </div>

        {/* Sprite */}
        <img
          src={SPRITES[spriteIdx]}
          alt="character"
          className="w-28 h-28 object-contain"
          draggable={false}
        />

        {/* Dots loader */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={onDone}
          className="mt-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          {isId ? "Lewati" : "Skip"}
        </button>
      </div>

      {/* Bottom green strip */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary" />
    </div>
  );
}
