import { X } from "lucide-react";
import { dayLabel } from "../../../lib/format";

interface RoomsFilterTabsProps {
  searched: { in: string; out: string; guests: number } | null;
  nights: number;
  clearSearch: () => void;
  categories: string[];
  activeTab: string;
  setActiveTab: (t: string) => void;
  loading: boolean;
  error: string | null;
}

export default function RoomsFilterTabs({
  searched,
  nights,
  clearSearch,
  categories,
  activeTab,
  setActiveTab,
  loading,
  error,
}: RoomsFilterTabsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
      <div>
        <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-[#c69a3f]/60" />
          {searched ? "Rezultatele căutării" : "Alege-ți spațiul"}
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,4vw,3.2rem)] font-normal leading-[1.1] text-[#0d2c5c]">
          {searched ? (
            <>Libere pentru <em className="italic text-[#c69a3f]">datele tale</em></>
          ) : (
            <>Toate <em className="italic text-[#c69a3f]">camerele</em></>
          )}
        </h2>
        {searched && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur border border-[#e2e8f0] px-4 py-2 text-[12.5px] font-semibold text-[#0d2c5c] shadow-sm">
              {dayLabel(searched.in)} — {dayLabel(searched.out)} · {nights} {nights === 1 ? "noapte" : "nopți"} · {searched.guests} oaspeți
            </span>
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] px-3.5 py-2 text-[12px] font-semibold text-[#64748b] bg-white hover:border-[#0d2c5c] hover:text-[#0d2c5c] cursor-pointer"
            >
              <X size={13} /> Arată toate camerele
            </button>
          </div>
        )}
      </div>

      {!loading && !error && categories.length > 2 && (
        <div className="flex gap-2.5 flex-wrap">
          {categories.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full border text-[12px] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                activeTab === tab
                  ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                  : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
