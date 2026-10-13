import { RefreshCw } from "lucide-react";
import { MONTHS, YEARS } from "./shared";

const sel =
  "rounded-xl border border-[#e1e8f0] bg-white px-3 py-2 text-[13px] font-semibold text-[#0d2c5c] focus:border-[#0d2c5c] focus:outline-none";

export default function AnalyticsPeriodPicker({
  year, month, loading, onChange, onRefresh,
}: {
  year: number;
  month: number;
  loading: boolean;
  onChange: (y: number, m: number) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Lună" className={sel} value={month} onChange={(e) => onChange(year, Number(e.target.value))}>
        {MONTHS.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
      </select>
      <select aria-label="An" className={sel} value={year} onChange={(e) => onChange(Number(e.target.value), month)}>
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#07203f] disabled:opacity-60"
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        Actualizează Datele
      </button>
    </div>
  );
}
