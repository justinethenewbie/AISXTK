import React, { useMemo } from 'react';

/**
 * Subtle Animated Pixel Ambient Background
 * Renders floating, drifting retro pixel particles, math cubes, and twinkles in the background
 * without interfering with readability or interactions.
 */
export const PixelAmbientBackground: React.FC = () => {
  // Generate a fixed set of deterministic particles to prevent re-render shifts
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      size: (i % 3 === 0 ? 8 : (i % 2 === 0 ? 6 : 4)), // pixel square sizes: 4px, 6px, 8px
      left: `${(i * 19 + 7) % 96}%`,
      top: `${(i * 23 + 11) % 92}%`,
      duration: 12 + (i % 8) * 3, // 12s - 33s smooth drift
      delay: -(i * 2.3),
      color: i % 4 === 0 ? '#00f0ff' : i % 4 === 1 ? '#10b981' : i % 4 === 2 ? '#f59e0b' : '#a855f7',
      opacity: 0.15 + (i % 3) * 0.08,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Subtle Retro Cyber Pixel Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating Pixel Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-none animate-pulse"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            top: p.top,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
