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
      {/* HUB Emblem Container with Neon Glow */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Neon Ambient Pulse Halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 via-amber-500/30 to-emerald-500/30 blur-md group-hover:blur-lg group-hover:scale-110 transition-all duration-300 pointer-events-none" />

        {/* High-Resolution HUB Crest SVG */}
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 120 120"
          className="relative z-10 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Outer Cyber Neon Ring Gradient */}
            <linearGradient id="hubNeonRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Traditional HUB Deep Ruby Red Background Gradient */}
            <radialGradient id="hubRubyRed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="70%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>

            {/* Imperial Gold Coin & Lettering Gradient */}
            <linearGradient id="hubGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Outer Cyber Ring with Neon ticks */}
          <circle cx="60" cy="60" r="57" fill="none" stroke="url(#hubNeonRing)" strokeWidth="2.5" opacity="0.9" />
          <circle cx="60" cy="60" r="53" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

          {/* HUB Ruby Shield Base */}
          <circle cx="60" cy="60" r="50" fill="url(#hubRubyRed)" stroke="#f59e0b" strokeWidth="2" />

          {/* Golden Circular Seal Arc Text Guides (Representation of HUB) */}
          <path id="hubTextArcTop" d="M 22 60 A 38 38 0 0 1 98 60" fill="none" />
          <path id="hubTextArcBottom" d="M 98 60 A 38 38 0 0 1 22 60" fill="none" />

          {/* HUB Ribbon / Banking Coin Motifs */}
          <g filter="drop-shadow(0 0 3px rgba(245,158,11,0.5))">
            {/* Ancient Coin Symbol in center with rounded square */}
            <circle cx="60" cy="55" r="23" fill="none" stroke="url(#hubGoldGrad)" strokeWidth="2.5" />
            <rect x="53" y="48" width="14" height="14" rx="2" fill="none" stroke="url(#hubGoldGrad)" strokeWidth="2" />

            {/* Stylized Torch of Knowledge Rising from Coin */}
            <path
              d="M 60 22 C 57 28, 56 32, 60 36 C 64 32, 63 28, 60 22 Z"
              fill="url(#hubGoldGrad)"
            />
            <circle cx="60" cy="27" r="2.5" fill="#fef08a" />

            {/* Laurel Wreath of Academic Excellence */}
            <path
              d="M 33 62 C 34 76, 46 86, 60 86 C 74 86, 86 76, 87 62"
              fill="none"
              stroke="url(#hubGoldGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Laurel Leaves */}
            <circle cx="36" cy="68" r="2" fill="#f59e0b" />
            <circle cx="43" cy="76" r="2.2" fill="#f59e0b" />
            <circle cx="51" cy="82" r="2.2" fill="#f59e0b" />
            <circle cx="69" cy="82" r="2.2" fill="#f59e0b" />
            <circle cx="77" cy="76" r="2.2" fill="#f59e0b" />
            <circle cx="84" cy="68" r="2" fill="#f59e0b" />

            {/* HUB Distinctive Lettering */}
            <text
              x="60"
              y="74"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="sans-serif"
              fontWeight="900"
              fontSize="12"
              letterSpacing="2"
            >
              HUB
            </text>
          </g>

          {/* University Motto Star */}
          <polygon points="60,11 61.5,14 65,14 62,16.5 63,20 60,17.5 57,20 58,16.5 55,14 58.5,14" fill="#00f0ff" />
        </svg>
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
          <span className="h-3.5 w-0.5 bg-cyan-500/50 rounded-full" />
          <span className="text-[11px] sm:text-xs font-extrabold text-cyan-200 tracking-tight drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]">
            AI TUTOR XSTK
          </span>
        </div>

        {/* Optional Subtitle */}
        {showSubtitle && (
          <div className={`${dimensions.textSub} font-semibold text-slate-400 tracking-wide mt-0.5 hidden sm:flex items-center gap-1.5`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span>Khoa Khoa Học Dữ Liệu & Trí Tuệ Nhân Tạo</span>
          </div>
        )}
      </div>
    </div>
  );
};
