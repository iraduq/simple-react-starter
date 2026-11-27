export function SunRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="34" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 5" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 16;
        const x1 = 60 + Math.cos(a) * 44;
        const y1 = 60 + Math.sin(a) * 44;
        const x2 = 60 + Math.cos(a) * (i % 2 ? 52 : 58);
        const y2 = 60 + Math.sin(a) * (i % 2 ? 52 : 58);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" fill="none" className={className}>
      {[0, 14, 28].map((o) => (
        <path
          key={o}
          d={`M0 ${16 + o} Q25 ${4 + o} 50 ${16 + o} T100 ${16 + o} T150 ${16 + o} T200 ${16 + o}`}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export function Shell({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 92 L8 44 Q50 -8 92 44 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      {[-30, -15, 0, 15, 30].map((o) => (
        <path
          key={o}
          d={`M50 92 Q${50 + o * 0.4} 50 ${50 + o * 0.7} 22`}
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
