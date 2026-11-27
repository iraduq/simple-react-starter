import { Layers, Gauge, Palette } from "lucide-react";
import { type CategoryFilter, type StageBg, CATEGORY_TABS } from "../types";

interface LottieFilterBarProps {
  category: CategoryFilter;
  setCategory: (c: CategoryFilter) => void;
  speed: number;
  setSpeed: (s: number) => void;
  stageBg: StageBg;
  setStageBg: (bg: StageBg) => void;
}

export default function LottieFilterBar({
  category,
  setCategory,
  speed,
  setSpeed,
  stageBg,
  setStageBg,
}: LottieFilterBarProps) {
  return (
    <div className="mt-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#e1e8f0]">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_TABS.map((tab) => {
          const active = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                active
                  ? "bg-[#0d2c5c] text-white shadow-xs"
                  : "bg-white border border-[#e1e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
              }`}
            >
              <Layers size={13} className={active ? "text-[#c69a3f]" : "text-[#94a3b8]"} />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] ${
                  active ? "bg-white/15 text-[#e6b85c]" : "bg-[#f8fafc] text-[#64748b]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-white p-1">
          <span className="inline-flex items-center gap-1 pl-2.5 pr-1 text-[11px] font-bold text-[#64748b]">
            <Gauge size={13} className="text-[#c69a3f]" />
            Viteză:
          </span>
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                speed === s ? "bg-[#0d2c5c] text-white" : "text-[#475569] hover:bg-[#f8fafc]"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] bg-white p-1">
          <span className="inline-flex items-center gap-1 pl-2.5 pr-1 text-[11px] font-bold text-[#64748b]">
            <Palette size={13} className="text-[#c69a3f]" />
            Scenă:
          </span>
          {(
            [
              { id: "white", label: "Alb" },
              { id: "slate", label: "Soft" },
              { id: "navy", label: "Navy" },
            ] as const
          ).map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => setStageBg(bg.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                stageBg === bg.id ? "bg-[#0d2c5c] text-white" : "text-[#475569] hover:bg-[#f8fafc]"
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
