import { Building2 } from "lucide-react";
import { SearchBox } from "../admin/ui";

export function FilterChip({
  label,
  active,
  onClick,
  emphasis,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer ${
        active
          ? emphasis
            ? "border-[#c69a3f] bg-[#c69a3f] text-white shadow-[0_6px_16px_-6px_rgba(198,154,63,0.6)]"
            : "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-sm"
          : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f] hover:text-[#8a6420]"
      }`}
    >
      {label}
    </button>
  );
}

interface HousekeepingFiltersProps {
  counts: {
    all: number;
    clean: number;
    dirty: number;
    inspecting: number;
    maintenance: number;
    checkoutToday: number;
  };
  filter: string;
  setFilter: (f: string) => void;
  search: string;
  setSearch: (s: string) => void;
  floors: number[];
  floorFilter: number | "all";
  setFloorFilter: (fl: number | "all") => void;
}

export default function HousekeepingFilters({
  counts,
  filter,
  setFilter,
  search,
  setSearch,
  floors,
  floorFilter,
  setFloorFilter,
}: HousekeepingFiltersProps) {
  return (
    <div className="mt-6 rounded-2xl border border-[#e1e8f0] bg-white p-4 shadow-[0_2px_12px_rgba(13,44,92,0.03)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label={`Toate · ${counts.all}`}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterChip
            label={`Check-out azi · ${counts.checkoutToday}`}
            active={filter === "checkout_today"}
            onClick={() => setFilter("checkout_today")}
            emphasis
          />
          <FilterChip
            label={`De curățat · ${counts.dirty}`}
            active={filter === "dirty"}
            onClick={() => setFilter("dirty")}
            emphasis
          />
          <FilterChip
            label={`Inspecție · ${counts.inspecting}`}
            active={filter === "inspecting"}
            onClick={() => setFilter("inspecting")}
          />
          <FilterChip
            label={`Curate · ${counts.clean}`}
            active={filter === "clean"}
            onClick={() => setFilter("clean")}
          />
          <FilterChip
            label={`Mentenanță · ${counts.maintenance}`}
            active={filter === "maintenance"}
            onClick={() => setFilter("maintenance")}
          />
        </div>

        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Caută cameră (ex: 301), tip sau oaspete…"
          className="w-full lg:w-72"
        />
      </div>

      {floors.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#eef2f7] pt-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7c99] mr-1">
            <Building2 size={12} /> Etaje:
          </span>
          <button
            type="button"
            onClick={() => setFloorFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
              floorFilter === "all"
                ? "bg-[#0d2c5c] text-white"
                : "bg-[#f4f6f9] text-[#4f6280] hover:bg-[#eef2f7] hover:text-[#0d2c5c]"
            }`}
          >
            Toate etajele
          </button>
          {floors.map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => setFloorFilter(fl)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                floorFilter === fl
                  ? "bg-[#c69a3f] text-white shadow-sm"
                  : "bg-[#f4f6f9] text-[#4f6280] hover:bg-[#fdf8ec] hover:text-[#8a6420]"
              }`}
            >
              Etajul {fl}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
