import React from "react";
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

// Map English hotel revenue acronyms to intuitive Romanian definitions
const ACRONYMS_MAP: Record<string, string> = {
  RevPAR: "Venit mediu per cameră disponibilă (RevPAR)",
  ADR: "Tarif mediu zilnic realizat (ADR)",
  DOS: "Durată medie a sejurului (zile)",
  MLOS: "Ședere minimă obligatorie (MLOS)",
  "F&B": "Restaurant & Bar (F&B)",
};

function enrichAndFormatInlineText(raw: string): React.ReactNode[] {
  // First, replace known acronyms if not already formatted
  let formatted = raw;
  Object.entries(ACRONYMS_MAP).forEach(([acronym, fullMeaning]) => {
    // Only replace standalone acronym if not already followed by full text
    const regex = new RegExp(`\\b${acronym}\\b(?!\\s*[-–:]?\\s*${fullMeaning.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'g');
    formatted = formatted.replace(regex, fullMeaning);
  });

  // Split by bold pattern **text**
  const parts = formatted.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2).trim();
      return (
        <strong key={idx} className="font-bold text-[#0d2c5c]">
          {inner}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function AiText({ text }: { text?: string }) {
  if (!text) {
    return <p className="text-sm text-[#6b7c99]">Nu există analiză disponibilă pentru perioada selectată.</p>;
  }

  // Split lines and parse markdown cleanly
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="space-y-3 text-[13.5px] leading-relaxed text-[#2a3b52]">
      {lines.map((line, idx) => {
        // Heading detection (e.g. **1. Evaluare Financiară** or **Briefing Strategic**)
        const isHeader =
          (line.startsWith("**") && line.endsWith("**") && !line.includes("* **")) ||
          line.startsWith("#") ||
          /^\*\*\d+\./.test(line);

        if (isHeader) {
          const cleanHeader = line.replace(/^#+\s*/, "").replace(/^\*\*/, "").replace(/\*\*$/, "").trim();
          return (
            <div key={idx} className="pt-2 first:pt-0">
              <h4 className="text-[14.5px] font-bold text-[#0d2c5c] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c69a3f] shrink-0" />
                <span>{cleanHeader}</span>
              </h4>
            </div>
          );
        }

        // Bullet point detection (e.g. * **Implementare...** or - ...)
        const isBullet = line.startsWith("*") || line.startsWith("-");
        if (isBullet) {
          const cleanBullet = line.replace(/^[*\-]\s*/, "").trim();
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c69a3f]/70 shrink-0 mt-2" />
              <div className="leading-relaxed flex-1">
                {enrichAndFormatInlineText(cleanBullet)}
              </div>
            </div>
          );
        }

        // Regular paragraph with inline formatting
        return (
          <p key={idx} className="leading-relaxed">
            {enrichAndFormatInlineText(line)}
          </p>
        );
      })}
    </div>
  );
}
