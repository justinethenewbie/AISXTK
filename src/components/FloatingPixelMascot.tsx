import React, { useState, useEffect } from 'react';
import { ActiveToolType, EquippedMascot } from '../types/xstk';
import { getMascotById } from '../data/mascotCatalog';
import { MASCOT_22_ACTIONS, MascotAction } from '../data/mascotActions';
import confetti from 'canvas-confetti';
import { Sparkles, X, ChevronUp, ChevronDown, Heart, Play, RefreshCw, Volume2, Smile } from 'lucide-react';

interface FloatingPixelMascotProps {
  activeTool: ActiveToolType;
  equippedMascot?: EquippedMascot;
  onNavigateToProfile?: () => void;
}

/**
 * List of core study tools where the user needs 100% focused concentration.
 */
const STUDY_TOOLS: ActiveToolType[] = [
  'image_grading',
  'essay_generator',
  'mcq_generator',
  'learning',
  'casio_calc',
  'charts',
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
  const [actionIndex, setActionIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [heartsCount, setHeartsCount] = useState<number[]>([]);
  const [customActionTriggered, setCustomActionTriggered] = useState(false);

  const mascot = getMascotById(equippedMascot?.species);
  const currentAction: MascotAction = MASCOT_22_ACTIONS[actionIndex] || MASCOT_22_ACTIONS[0];

  // Auto-switch to next comical action every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActionIndex((prev) => (prev + 1) % MASCOT_22_ACTIONS.length);
      setCustomActionTriggered(false);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Click on mascot: trigger confetti/hearts & switch to next hilarious action
  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (actionIndex + 1) % MASCOT_22_ACTIONS.length;
    setActionIndex(nextIdx);
    setCustomActionTriggered(true);

    // Floating heart effect
    setHeartsCount((prev) => [...prev.slice(-4), Date.now()]);

    // Confetti effect on click
    confetti({
      particleCount: 28,
      spread: 60,
      origin: { x: 0.9, y: 0.8 },
      colors: [mascot.accentHex, '#00f0ff', '#10b981', '#f59e0b', '#ec4899'],
    });
  };

  // Select a specific action from the 22-action menu
  const handleSelectAction = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionIndex(idx);
    setCustomActionTriggered(true);
    setIsActionMenuOpen(false);

    if (MASCOT_22_ACTIONS[idx].id === 'celebrate_confetti' || MASCOT_22_ACTIONS[idx].id === 'jump_high') {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { x: 0.9, y: 0.8 },
        colors: [mascot.accentHex, '#00f0ff', '#f59e0b'],
      });
    }
  };

  // Rule: Hide mascot during core study tools
  const isStudyMode = STUDY_TOOLS.includes(activeTool);
  if (isStudyMode) {
    return null;
  }

  return (
    <aside
      aria-label="Linh vật pixel hoạt náo cổ vũ học tập"
      className="fixed bottom-20 right-4 sm:right-6 z-30 select-none transition-all duration-300 pointer-events-auto"
    >
      <div className="relative flex flex-col items-end">
        {/* Floating Heart Burst Animations */}
        {heartsCount.map((id) => (
          <span
            key={id}
            className="absolute -top-12 right-8 text-rose-400 animate-ping pointer-events-none text-lg z-40"
          >
            💖
          </span>
        ))}

        {/* 1. Comical Action Speech Bubble (If not minimized) */}
        {!isMinimized && (
          <div className={`mb-3 max-w-[280px] sm:max-w-[320px] bg-slate-900/95 backdrop-blur-md border-2 ${currentAction.bubbleColor || 'border-cyan-500/50'} rounded-2xl p-3.5 shadow-[0_0_25px_rgba(6,182,212,0.35)] text-slate-100 relative animate-fade-in`}>
            {/* Header: Mascot Badge, Current Action Status, Minimize Button */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 font-black text-cyan-300">
                <span className="text-base">{mascot.emoji}</span>
                <span className="truncate">{mascot.name}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                  className="px-2 py-0.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] flex items-center gap-1 transition-all"
                  title="Chọn 1 trong 22 động tác hài hước"
                >
                  <Smile className="w-3 h-3 text-amber-300" />
                  <span>22 Động tác</span>
                </button>

                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                  title="Thu nhỏ linh vật"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Current Action Tag */}
            <div className="flex items-center justify-between mt-2 text-[11px] font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="text-sm">{currentAction.icon}</span>
                <span>{currentAction.actionStatus}</span>
              </span>
              {currentAction.propEmoji && (
                <span className="text-xs bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 animate-pulse font-mono">
                  {currentAction.propEmoji}
                </span>
              )}
            </div>

            {/* Quote Body */}
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed mt-1.5 italic">
              "{currentAction.quote}"
            </p>

            {/* Footer with hint */}
            <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-cyan-400/90 font-mono">Bấm vào bé để đổi động tác tiếp theo!</span>
              <span className="font-mono text-cyan-300 font-bold">
                {actionIndex + 1}/{MASCOT_22_ACTIONS.length}
              </span>
            </div>

            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-cyan-500/80" />
          </div>
        )}

        {/* 2. Interactive Action Menu Drawer (Select from all 22 comical actions) */}
        {isActionMenuOpen && !isMinimized && (
          <div className="mb-3 max-w-[310px] sm:max-w-[340px] bg-slate-950/95 backdrop-blur-md border-2 border-amber-400/60 rounded-2xl p-3 shadow-[0_0_30px_rgba(245,158,11,0.3)] space-y-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
              <span className="font-black text-amber-300 flex items-center gap-1.5">
                <span>🎭</span>
                <span>Chọn 1 Trong 22 Động Tác Hài Hước:</span>
              </span>
              <button
                onClick={() => setIsActionMenuOpen(false)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto grid grid-cols-2 gap-1.5 pr-1 text-xs">
              {MASCOT_22_ACTIONS.map((act, idx) => (
                <button
                  key={act.id}
                  onClick={(e) => handleSelectAction(idx, e)}
                  className={`p-2 rounded-xl text-left font-bold transition-all flex items-center gap-1.5 border ${
                    actionIndex === idx
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="text-base shrink-0">{act.icon}</span>
                  <span className="truncate text-[11px]">{act.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Interactive Pixel Character Avatar with 22 Comic Animations */}
        <div
          onClick={handleMascotClick}
          className="relative group cursor-pointer flex items-center gap-2"
          title={`Bấm vào ${mascot.name} để bé nhảy nhót & đổi động tác ngớ ngẩn!`}
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

          {/* Animated Mascot Container */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${mascot.gradient} p-1 border-3 ${mascot.borderColor} shadow-[0_0_25px_rgba(6,182,212,0.45)] flex items-center justify-center transition-transform duration-200 group-hover:scale-110 active:scale-95 relative ${currentAction.animationClass}`}
          >
            {/* 8-bit Pixel Texture Overlay */}
            <div className="w-full h-full rounded-2xl bg-slate-950/35 backdrop-blur-xs flex items-center justify-center relative overflow-hidden">
              {/* Scanline grid texture */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none z-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 4px)',
                }}
              />

              {/* Action Floating Prop Accessory (e.g. Popcorn, Book, Casio, Boba, Jetpack, Glasses) */}
              {currentAction.propEmoji && (
                <div className="absolute -top-1 -left-1 text-sm sm:text-base filter drop-shadow z-20 animate-bounce">
                  {currentAction.propEmoji}
                </div>
              )}

              {/* Main Mascot Pixel Character Artwork */}
              {mascot.imageUrl ? (
                <img
                  src={mascot.imageUrl}
                  alt={mascot.name}
                  className="w-full h-full object-cover rounded-2xl filter drop-shadow-md select-none transform transition-transform group-hover:scale-105"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none transform transition-transform group-hover:rotate-6">
                  {mascot.emoji}
                </span>
              )}

              {/* Corner Twinkle Sparkle */}
              <span className="absolute -top-1 -right-1 text-xs animate-spin z-20">
                ✨
              </span>
            </div>

            {/* Action Mood Badge Pill at bottom */}
            <div className="absolute -bottom-2 bg-slate-950 px-2 py-0.5 rounded-full border border-cyan-400 text-[10px] font-mono font-bold text-cyan-300 shadow-sm flex items-center gap-1 whitespace-nowrap z-20">
              <span>{currentAction.icon}</span>
              <span className="max-w-[70px] truncate">{currentAction.name}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
