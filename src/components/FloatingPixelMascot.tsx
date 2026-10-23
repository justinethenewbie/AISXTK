import React, { useState, useEffect } from 'react';
import { ActiveToolType, EquippedMascot } from '../types/xstk';
import { getMascotById, MASCOT_20_CHEER_QUOTES } from '../data/mascotCatalog';
import confetti from 'canvas-confetti';
import { Sparkles, X, ChevronUp, ChevronDown, Heart } from 'lucide-react';

interface FloatingPixelMascotProps {
  activeTool: ActiveToolType;
  equippedMascot?: EquippedMascot;
  onNavigateToProfile?: () => void;
}

/**
 * List of core study tools where the user needs 100% focused concentration and zero screen obstruction.
 * The cheer mascot automatically hides itself when user is in any of these modes.
 */
const STUDY_TOOLS: ActiveToolType[] = [
  'image_grading',
  'essay_generator',
  'mcq_generator',
  'learning',
  'casio_calc',
  'math_processor',
  'viva_exam',
  'voice_chat',
  'wysiwyg_math',
];

export const FloatingPixelMascot: React.FC<FloatingPixelMascotProps> = ({
  activeTool,
  equippedMascot,
  onNavigateToProfile,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [heartsCount, setHeartsCount] = useState<number[]>([]);

  const mascot = getMascotById(equippedMascot?.species);

  // Combine mascot special cheer with the 20 diverse encouragement quotes
  const quotes = [mascot.specialCheer, ...MASCOT_20_CHEER_QUOTES];

  // Auto-cycle cheer quotes every 14 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1500);
    }, 14000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  // Click handler: trigger cheer, heart sparkles, and advance quote
  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1200);

    // Advance to next cheer quote
    setQuoteIndex((prev) => (prev + 1) % quotes.length);

    // Floating heart effect
    setHeartsCount((prev) => [...prev.slice(-4), Date.now()]);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { x: 0.9, y: 0.8 },
      colors: [mascot.accentHex, '#00f0ff', '#10b981', '#f59e0b'],
    });
  };

  // Rule: When user enters any core study feature, automatically hide the mascot completely
  const isStudyMode = STUDY_TOOLS.includes(activeTool);
  if (isStudyMode) {
    return null;
  }

  return (
    <aside
      aria-label="Linh vật pixel cổ vũ học tập"
      className="fixed bottom-20 right-4 sm:right-6 z-30 select-none transition-all duration-300 pointer-events-auto"
    >
      <div className="relative flex flex-col items-end">
        {/* Floating Heart Burst Animations */}
        {heartsCount.map((id) => (
          <span
            key={id}
            className="absolute -top-10 right-8 text-rose-400 animate-ping pointer-events-none text-base"
          >
            💖
          </span>
        ))}

        {/* 1. Cheerful Speech Bubble (If not minimized) */}
        {!isMinimized && (
          <div className="mb-3 max-w-[270px] sm:max-w-[310px] bg-slate-900/95 backdrop-blur-md border-2 border-cyan-500/50 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-slate-100 relative animate-fade-in">
            {/* Header with Mascot Badge & Minimize Button */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 font-black text-cyan-300">
                <span className="text-sm">{mascot.emoji}</span>
                <span className="truncate">{mascot.name} Cổ Vũ</span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                title="Thu nhỏ linh vật"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quote Body */}
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed mt-2 italic">
              "{quotes[quoteIndex]}"
            </p>

            {/* Footer with Hint to Click for Next Quote */}
            <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-cyan-400/80 font-mono">Bấm vào mình để đổi câu cổ vũ!</span>
              <span className="font-mono text-cyan-300 font-bold">
                {quoteIndex + 1}/{quotes.length}
              </span>
            </div>

            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-cyan-500/80" />
          </div>
        )}

        {/* 2. Interactive Pixel Character Avatar */}
        <div
          onClick={handleMascotClick}
          className="relative group cursor-pointer flex items-center gap-2"
          title={`Bấm vào ${mascot.name} để nhận thêm lời cổ vũ!`}
        >
          {/* Minimized Pill Toggle */}
          {isMinimized && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow-md hover:bg-slate-800 transition-all flex items-center gap-1"
            >
              <span>{mascot.emoji}</span>
              <span className="hidden sm:inline">Cổ vũ</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Retro Pixel Mascot Frame */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${mascot.gradient} p-1 border-2 ${mascot.borderColor} shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 active:scale-95 ${
              isWaving ? 'animate-bounce' : 'animate-pulse'
            }`}
          >
            {/* 8-bit Pixel Texture Overlay */}
            <div className="w-full h-full rounded-xl bg-slate-950/40 backdrop-blur-xs flex items-center justify-center relative overflow-hidden">
              {/* Subtle retro scanline grid */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
                }}
              />

              {/* Mascot Animated Emoji Display */}
              <span className="text-2xl sm:text-3xl filter drop-shadow-md transition-transform duration-300 group-hover:rotate-12">
                {mascot.emoji}
              </span>

              {/* Sparkle Badge */}
              <span className="absolute -top-1 -right-1 text-[11px] animate-spin">
                ✨
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
