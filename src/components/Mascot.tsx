import React, { useState, useEffect, useRef } from 'react';
import { EquippedMascot } from '../types/xstk';
import { getMascotById, MASCOT_20_CHEER_QUOTES } from '../data/mascotCatalog';
import confetti from 'canvas-confetti';

interface MascotProps {
  equipped?: EquippedMascot;
  speechText?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onDoubleClick?: () => void;
  showConfettiOnClick?: boolean;
  interactive?: boolean;
  showDanceBadge?: boolean;
}

const DANCE_ANIMATIONS = [
  'anim-mascot-jump',
  'anim-mascot-disco',
  'anim-mascot-pom-pom',
  'anim-mascot-wave',
  'anim-mascot-roll',
  'anim-mascot-moonwalk',
  'anim-mascot-clap',
];

const DANCE_CHEER_LINES = [
  'Yeahhh! Quẩy lên nào, xác suất ăn điểm 10 hôm nay là 100%! 💃🕺',
  'Nhảy một điệu xả stress rồi cùng mình bấm máy Casio tiếp nhé! 🎶✨',
  'Đại Học Ngân Hàng TP.HCM đỉnh nóc kịch trần bay phấp phới! 🏛️🔥',
  'Bé đang nhảy điệu Disco XSTK cổ vũ bạn đây! Cố lên bạn ơi! 🎉',
  'Bơm 100% năng lượng! Đề thi khó mấy cũng bị sinh viên HUB giải gọn! ⚡',
  'Vũ điệu may mắn P = 1! Chúc bạn thi thử đạt điểm tuyệt đối! 🍀',
  'Học tập chăm chỉ rồi quẩy hết mình, sinh viên HUB 1976 vô địch! 🏆',
];

/**
 * Play a cute retro 8-bit synthesizer chime on dance/click using Web Audio API
 */
function playMascotChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major arpeggio)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + idx * 0.07 + 0.22);
    });
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
}

export const Mascot: React.FC<MascotProps> = ({
  equipped,
  speechText,
  size = 'md',
  onClick,
  onDoubleClick,
  showConfettiOnClick = true,
  interactive = true,
  showDanceBadge = true,
}) => {
  const mascotInfo = getMascotById(equipped?.species);
  const [isDancing, setIsDancing] = useState(false);
  const [danceAnimation, setDanceAnimation] = useState('anim-mascot-jump');
  const [currentCheer, setCurrentCheer] = useState<string | null>(null);
  const [floatingNotes, setFloatingNotes] = useState<number[]>([]);
  const danceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerDance = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // 1. Audio chime
    playMascotChime();

    // 2. Pick next dance style
    const nextDance = DANCE_ANIMATIONS[Math.floor(Math.random() * DANCE_ANIMATIONS.length)];
    setDanceAnimation(nextDance);
    setIsDancing(true);

    // 3. Pick random funny dance cheer
    const nextQuote = DANCE_CHEER_LINES[Math.floor(Math.random() * DANCE_CHEER_LINES.length)];
    setCurrentCheer(nextQuote);

    // 4. Floating musical notes & sparkles
    setFloatingNotes((prev) => [...prev.slice(-3), Date.now()]);

    // 5. Confetti burst
    if (showConfettiOnClick) {
      confetti({
        particleCount: 42,
        spread: 65,
        origin: { y: 0.65 },
        colors: [mascotInfo.accentHex, '#00f0ff', '#10b981', '#f59e0b', '#ec4899'],
      });
    }

    if (onClick) onClick();

    // Auto-end high-energy dance after 3.2s and return to gentle idle breathing
    if (danceTimeoutRef.current) clearTimeout(danceTimeoutRef.current);
    danceTimeoutRef.current = setTimeout(() => {
      setIsDancing(false);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (danceTimeoutRef.current) clearTimeout(danceTimeoutRef.current);
    };
  }, []);

  const sizeClasses = {
    sm: 'w-24 h-24 text-4xl',
    md: 'w-32 h-32 text-5xl',
    lg: 'w-48 h-48 text-7xl',
  }[size];

  const activeSpeech = currentCheer || speechText;

  return (
    <div className="relative inline-flex flex-col items-center group select-none">
      {/* Floating Musical Notes when dancing */}
      {floatingNotes.map((id) => (
        <span
          key={id}
          className="absolute -top-8 text-amber-300 font-bold text-lg animate-ping pointer-events-none z-30"
          style={{ left: `${25 + (id % 50)}%` }}
        >
          {id % 2 === 0 ? '🎶' : '✨'}
        </span>
      ))}

      {/* Speech Bubble */}
      {activeSpeech && (
        <div className={`mb-3 max-w-xs bg-slate-900/95 border-2 ${isDancing ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'border-cyan-500/40 shadow-lg'} rounded-2xl p-3 text-xs md:text-sm text-slate-100 relative animate-fade-in transition-all backdrop-blur-md`}>
          <div className="font-bold text-cyan-300 mb-0.5 flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5">
              <span>{mascotInfo.emoji}</span>
              <span>{mascotInfo.name}</span>
            </span>
            {isDancing && (
              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded animate-pulse">
                ĐANG NHẢY 💃
              </span>
            )}
          </div>
          <p className="leading-snug font-medium italic text-slate-200">"{activeSpeech}"</p>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-cyan-500/60" />
        </div>
      )}

      {/* Mascot Avatar Box with Live Pixel Dance Animation */}
      <div
        onClick={interactive ? triggerDance : onClick}
        onDoubleClick={onDoubleClick}
        title="Bấm vào để bé nhảy nhót, phát nhạc và cổ vũ bạn học tập!"
        className={`${sizeClasses} relative rounded-3xl ${
          mascotInfo.imageUrl
            ? 'bg-slate-950 border-3 ' + (isDancing ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.6)]' : mascotInfo.borderColor + ' shadow-[0_0_25px_rgba(6,182,212,0.4)]')
            : 'bg-gradient-to-br ' + mascotInfo.gradient + ' border-4 ' + mascotInfo.borderColor
        } p-1.5 shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 ${
          isDancing ? `${danceAnimation} scale-105 ring-4 ring-amber-400/40` : 'anim-mascot-wiggle hover:scale-110 active:scale-95'
        }`}
      >
        {/* Hat Overlay */}
        {equipped?.hat && (
          <div className="absolute -top-5 text-2xl md:text-4xl filter drop-shadow-md z-20 animate-pulse">
            🎓
          </div>
        )}

        {/* Mascot Face / Authentic HUB Pixel Image */}
        <div className="relative z-0 w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-900/60">
          {mascotInfo.imageUrl ? (
            <img
              src={mascotInfo.imageUrl}
              alt={mascotInfo.name}
              className="w-full h-full object-cover rounded-2xl select-none transition-transform duration-200 group-hover:scale-105"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <span className="transform transition-transform group-hover:scale-110">{mascotInfo.emoji}</span>
          )}

          {/* Dancing Sparkle Accent */}
          {isDancing && (
            <span className="absolute top-1 right-1 text-sm animate-spin z-10">
              ✨
            </span>
          )}
        </div>

        {/* Glasses Accessory */}
        {equipped?.accessory && (
          <div className="absolute top-2/5 text-xl md:text-3xl z-20 pointer-events-none">
            👓
          </div>
        )}

        {/* Outfit Badge */}
        {equipped?.outfit && (
          <div className="absolute -bottom-2 right-0 text-xl md:text-2xl bg-slate-900 rounded-full p-1 border border-cyan-400 shadow z-20">
            🥼
          </div>
        )}
      </div>

      {/* Mascot Name Pill & Dance Indicator */}
      {showDanceBadge && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            onClick={triggerDance}
            className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isDancing
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 hover:text-white border-cyan-500/40'
            }`}
          >
            <span>{isDancing ? '💃' : mascotInfo.emoji}</span>
            <span>{isDancing ? 'Đang nhảy nhót!' : mascotInfo.name}</span>
            <span className="text-[10px] font-mono opacity-80">🎵</span>
          </button>
        </div>
      )}
    </div>
  );
};
