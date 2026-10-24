import React from 'react';

interface HubEdtLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const HubEdtLogo: React.FC<HubEdtLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const dimensions = {
    sm: { icon: 38, textEdt: 'text-base', textSub: 'text-[9px]', gap: 'gap-2' },
    md: { icon: 48, textEdt: 'text-xl', textSub: 'text-[10px]', gap: 'gap-2.5' },
    lg: { icon: 68, textEdt: 'text-3xl', textSub: 'text-xs', gap: 'gap-3.5' },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${dimensions.gap} select-none group cursor-pointer ${className}`}
      title="Đại học Ngân hàng TP.HCM (HUB) • AI Classroom Tutor"
    >
      {/* Official HUB Emblem Container with Neon Glow */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Neon Ambient Pulse Halo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/30 via-red-600/20 to-cyan-500/30 blur-md group-hover:blur-lg group-hover:scale-110 transition-all duration-300 pointer-events-none" />

        {/* Official High-Resolution HUB Crest Image */}
        <img
          src="/assets/hub-logo.png"
          alt="Trường Đại học Ngân hàng TP.HCM (HUB)"
          style={{ width: `${dimensions.icon}px`, height: `${dimensions.icon}px` }}
          className="relative z-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.65)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Typography: HUB Logo Brand on Top & AI Classroom Directly Underneath */}
      <div className="flex flex-col justify-center">
        {/* Top: University Name Header with Gold/Cyan Glow */}
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-[11px] sm:text-xs font-black tracking-wide text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] uppercase">
            ĐẠI HỌC NGÂN HÀNG TP.HCM
          </span>
          <span className="px-1.5 py-0.2 rounded-md bg-red-950/80 border border-red-500/60 text-red-300 text-[9px] font-mono font-bold tracking-tighter">
            HUB
          </span>
        </div>

        {/* Bottom: AI Classroom in High-Tech Neon Cyber Typography */}
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`${dimensions.textEdt} font-black tracking-wider bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.85)]`}
          >
            AI Classroom
          </span>
          <span className="h-3.5 w-0.5 bg-cyan-500/50 rounded-full hidden sm:block" />
          <span className="text-[11px] sm:text-xs font-extrabold text-cyan-200 tracking-tight drop-shadow-[0_0_6px_rgba(6,182,212,0.5)] hidden sm:inline">
            AI TUTOR XSTK
          </span>
        </div>

        {/* Optional Subtitle: Only on 2xl ultra widescreen to save space on laptops */}
        {showSubtitle && (
          <div className={`${dimensions.textSub} font-semibold text-slate-400 tracking-wide mt-0.5 hidden 2xl:flex items-center gap-1.5`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span>Khoa Khoa Học Dữ Liệu & Trí Tuệ Nhân Tạo</span>
          </div>
        )}
      </div>
    </div>
  );
};
