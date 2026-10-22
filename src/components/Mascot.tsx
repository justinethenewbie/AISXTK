import React from 'react';
import { EquippedMascot } from '../types/xstk';
import confetti from 'canvas-confetti';

interface MascotProps {
  equipped?: EquippedMascot;
  speechText?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onDoubleClick?: () => void;
  showConfettiOnClick?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({
  equipped,
  speechText,
  size = 'md',
  onClick,
  onDoubleClick,
  showConfettiOnClick = false,
}) => {
  const triggerConfetti = (e: React.MouseEvent) => {
    if (showConfettiOnClick) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    if (onClick) onClick();
  };

  const sizeClasses = {
    sm: 'w-20 h-20 text-3xl',
    md: 'w-32 h-32 text-5xl',
    lg: 'w-48 h-48 text-7xl',
  }[size];

  return (
    <div className="relative inline-flex flex-col items-center group cursor-pointer select-none">
      {/* Speech Bubble */}
      {speechText && (
        <div className="mb-3 max-w-xs bg-amber-50 dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-500/40 rounded-2xl p-3 shadow-lg text-xs md:text-sm text-slate-800 dark:text-amber-100 relative animate-bounce-subtle">
          <div className="font-semibold text-amber-700 dark:text-amber-400 mb-0.5 flex items-center gap-1">
            <span>🦉 Cú Thông Thái XSTK</span>
          </div>
          <p className="leading-snug">{speechText}</p>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-amber-300 dark:border-t-slate-800" />
        </div>
      )}

      {/* Mascot Avatar Box */}
      <div
        onClick={triggerConfetti}
        onDoubleClick={onDoubleClick}
        className={`${sizeClasses} relative rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-800 p-2 shadow-xl flex items-center justify-center border-4 border-amber-200 dark:border-amber-400 hover:scale-105 transition-transform duration-200`}
      >
        {/* Hat Overlay */}
        {equipped?.hat && (
          <div className="absolute -top-5 text-2xl md:text-4xl filter drop-shadow-md z-10 animate-pulse">
            🎓
          </div>
        )}

        {/* Mascot Face */}
        <div className="relative z-0 flex flex-col items-center justify-center">
          <span>🦉</span>
        </div>

        {/* Glasses Accessory */}
        {equipped?.accessory && (
          <div className="absolute top-2/5 text-xl md:text-3xl z-10 pointer-events-none">
            👓
          </div>
        )}

        {/* Outfit Badge */}
        {equipped?.outfit && (
          <div className="absolute -bottom-2 right-0 text-xl md:text-2xl bg-amber-100 rounded-full p-1 border border-amber-400 shadow z-10">
            🥼
          </div>
        )}
      </div>

      <div className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700">
        Linh Vật Cú Thông Thái
      </div>
    </div>
  );
};
