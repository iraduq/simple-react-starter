import { Search, X } from "lucide-react";
import { CATEGORIES } from "../types";

interface PlacesFilterBarProps {
  category: string;
  setCategory: (c: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function PlacesFilterBar({
  category,
  setCategory,
  searchQuery,
  setSearchQuery,
}: PlacesFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
      <div>
        <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-[#c69a3f] to-transparent" />
          Experiențe & Meniu Digital
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,4.5vw,3.6rem)] font-normal leading-[1.08] text-[#0d2c5c]">
          Arome & <em className="italic text-[#c69a3f]">Destinații</em>
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {CATEGORIES.map((c) => {
          const isActive = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-5 py-2.5 rounded-full border text-[11.5px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
                  : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
              }`}
            >
              {c.label}
            </button>
          );
        })}

        <div className="relative min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută o locație…"
            className="w-full rounded-full border border-[#e2e8f0] bg-white py-2.5 pl-9 pr-8 text-[12.5px] text-[#0d2c5c] placeholder:text-[#94a3b8] focus:border-[#c69a3f] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0d2c5c]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
