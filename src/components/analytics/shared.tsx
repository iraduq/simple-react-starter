import { TrendingDown, TrendingUp } from "lucide-react";

export const MONTHS = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];
export const YEARS = [2024, 2025, 2026, 2027];

export const formatRon = (v?: number | null) =>
  `${new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v ?? 0))} RON`;

export const formatNum = (v?: number | null) =>
  new Intl.NumberFormat("ro-RO").format(Number(v ?? 0));

export const periodLabel = (p?: string) => {
  if (!p) return "—";
  const m = p.match(/^(\d{4})-(\d{1,2})/);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : p;
};

export function GrowthBadge({ pct }: { pct?: number | null }) {
  const v = Number(pct ?? 0);
  const up = v >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      <Icon size={12} />
      {up ? "+" : ""}
      {v.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}% față de luna precedentă
    </span>
  );
}

export function AiText({ text }: { text?: string }) {
  if (!text) return <p className="text-sm text-[#6b7c99]">Nu există analiză disponibilă.</p>;
  return (
    <div className="space-y-2 text-[14px] leading-relaxed text-[#2a3b52] whitespace-pre-line">
      {text}
    </div>
  );
}
