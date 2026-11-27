import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { EASE } from "../types";

export default function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  delay = 0,
  tone = "navy",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  delay?: number;
  tone?: "navy" | "gold" | "green" | "red";
}) {
  const accentBorder =
    tone === "gold"
      ? "border-[#c69a3f]/45"
      : tone === "red"
        ? "border-[#8c2f39]/35"
        : tone === "green"
          ? "border-emerald-500/35"
          : "border-[#e1e8f0]";

  const iconBox =
    tone === "gold"
      ? "border-[#c69a3f]/35 bg-[#fdf8ec] text-[#8a6420]"
      : tone === "red"
        ? "border-[#8c2f39]/25 bg-[#8c2f39]/10 text-[#8c2f39]"
        : tone === "green"
          ? "border-emerald-500/30 bg-emerald-50 text-emerald-700"
          : "border-[#e1e8f0] bg-[#f4f6f9] text-[#0d2c5c]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={`rounded-2xl border bg-white p-5 shadow-[0_2px_16px_rgba(13,44,92,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(13,44,92,0.08)] ${accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
            {label}
          </span>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[#0d2c5c]">
            {value}
          </p>
          {hint && (
            <span className="mt-2 block text-[11.5px] font-medium text-[#6b7c99]">
              {hint}
            </span>
          )}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBox}`}>
          <Icon size={19} strokeWidth={1.6} />
        </span>
      </div>
    </motion.div>
  );
}
