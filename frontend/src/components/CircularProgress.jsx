import { useEffect, useState } from 'react';

export default function CircularProgress({ solved = 0, total = 0, size = 180, strokeWidth = 12 }) {
  const [animated, setAnimated] = useState(false);
  const gradientId = `ring-${size}`;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [solved, total]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(solved / total, 1) : 0;
  const percent = Math.round(ratio * 100);
  const offset = animated ? circumference * (1 - ratio) : circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-6 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)' }}
      />
      <svg width={size} height={size} className="-rotate-90 relative">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.5))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white/40 text-[10px] uppercase tracking-[0.15em] font-semibold mb-1">
          Solved
        </span>
        <div className="flex items-baseline">
          <span className="text-[34px] font-bold text-white leading-none tabular-nums">{solved}</span>
          <span className="text-[14px] text-white/40 font-medium ml-1">/{total}</span>
        </div>
        <span className="text-[11px] text-violet-400 font-semibold mt-1.5 tracking-wide">
          {percent}%
        </span>
      </div>
    </div>
  );
}