import { motion } from "framer-motion";
import { float } from "../types";

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
      <path d="M40 92 h20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function FloatingDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
      <div className="absolute top-[20%] -left-32 h-[500px] w-[500px] rounded-full bg-[#0d2c5c]/[0.02] blur-[140px]" />
      <div className="absolute top-[50%] -right-40 h-[600px] w-[600px] rounded-full bg-[#1e4d8c]/[0.03] blur-[150px]" />
      <div className="absolute top-[80%] -left-40 h-[500px] w-[500px] rounded-full bg-[#0d2c5c]/[0.02] blur-[140px]" />

      <motion.div {...float(12, 18, 5)} className="absolute top-[15%] right-[8%] opacity-15 hidden md:block">
        <SunRing className="h-32 w-32 text-[#0d2c5c]" />
      </motion.div>

      <motion.div {...float(15, 14, -4, 1)} className="absolute top-[35%] left-[3%] opacity-10 hidden lg:block">
        <Shell className="h-24 w-24 text-[#0d2c5c]" />
      </motion.div>

      <motion.div {...float(13, 16, 8, 2)} className="absolute top-[65%] right-[5%] opacity-12 hidden lg:block">
        <Shell className="h-28 w-28 text-[#0d2c5c]" />
      </motion.div>

      <motion.div {...float(14, 20, -5, 1.5)} className="absolute top-[85%] left-[6%] opacity-15 hidden md:block">
        <SunRing className="h-28 w-28 text-[#0d2c5c]" />
      </motion.div>
    </div>
  );
}
