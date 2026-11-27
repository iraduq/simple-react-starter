import { Sparkles, BrushCleaning, SearchCode, Wrench, PackagePlus } from "lucide-react";
import type { HousekeepingUnit } from "../../../services/housekeepingService";
import type { CleanState } from "../types";

interface HousekeepingCardActionsProps {
  unit: HousekeepingUnit;
  cleanState: CleanState;
  updating: boolean;
  onStatusChange: (
    unit: HousekeepingUnit,
    payload: {
      status: "active" | "cleaning" | "maintenance";
      clean_status?: "clean" | "dirty" | "inspecting";
    },
    successText: string,
  ) => void;
  onReportMaintenance: () => void;
  onReportLostFound: () => void;
}

export default function HousekeepingCardActions({
  unit,
  cleanState,
  updating,
  onStatusChange,
  onReportMaintenance,
  onReportLostFound,
}: HousekeepingCardActionsProps) {
  return (
    <>
      <div className="rounded-2xl bg-[#f2f5fa] p-1 border border-[#e5ecf5] grid grid-cols-4 gap-1">
        <button
          type="button"
          disabled={updating}
          onClick={() =>
            onStatusChange(
              unit,
              { status: "active", clean_status: "clean" },
              "marcată Curată & Pregătită",
            )
          }
          className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10.5px] font-semibold transition-all cursor-pointer disabled:opacity-50 ${
            cleanState === "clean"
              ? "bg-white text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.16)] ring-1 ring-emerald-200"
              : "text-[#5c6f8c] hover:text-emerald-700 hover:bg-white/60"
          }`}
        >
          <Sparkles size={13} />
          <span>Curată</span>
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() =>
            onStatusChange(
              unit,
              { status: "cleaning", clean_status: "dirty" },
              "marcată Necesită Curățenie",
            )
          }
          className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10.5px] font-semibold transition-all cursor-pointer disabled:opacity-50 ${
            cleanState === "dirty"
              ? "bg-white text-[#9a7222] shadow-[0_2px_8px_rgba(198,154,63,0.22)] ring-1 ring-[#e5cfa0]"
              : "text-[#5c6f8c] hover:text-[#9a7222] hover:bg-white/60"
          }`}
        >
          <BrushCleaning size={13} />
          <span>Curățat</span>
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() =>
            onStatusChange(
              unit,
              { status: "cleaning", clean_status: "inspecting" },
              "pusă În Inspecție",
            )
          }
          className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10.5px] font-semibold transition-all cursor-pointer disabled:opacity-50 ${
            cleanState === "inspecting"
              ? "bg-white text-[#0d2c5c] shadow-[0_2px_8px_rgba(13,44,92,0.14)] ring-1 ring-[#cbd8ec]"
              : "text-[#5c6f8c] hover:text-[#0d2c5c] hover:bg-white/60"
          }`}
        >
          <SearchCode size={13} />
          <span>Inspecție</span>
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() =>
            onStatusChange(unit, { status: "maintenance" }, "trecută În Mentenanță")
          }
          className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[10.5px] font-semibold transition-all cursor-pointer disabled:opacity-50 ${
            cleanState === "maintenance"
              ? "bg-white text-[#8c2f39] shadow-[0_2px_8px_rgba(140,47,57,0.16)] ring-1 ring-[#ebc4c8]"
              : "text-[#5c6f8c] hover:text-[#8c2f39] hover:bg-white/60"
          }`}
        >
          <Wrench size={13} />
          <span>Tehnic</span>
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#efe9dc] pt-3 text-[11.5px]">
        <button
          type="button"
          onClick={onReportMaintenance}
          className="inline-flex items-center gap-1.5 font-semibold text-[#5c6f8c] transition-colors hover:text-[#8c2f39] cursor-pointer"
        >
          <Wrench size={12.5} /> Raportează defecțiune
        </button>
        <span className="h-3.5 w-[1px] bg-[#e5dcc3]" aria-hidden="true" />
        <button
          type="button"
          onClick={onReportLostFound}
          className="inline-flex items-center gap-1.5 font-semibold text-[#5c6f8c] transition-colors hover:text-[#9a7222] cursor-pointer"
        >
          <PackagePlus size={12.5} /> Obiect găsit
        </button>
      </div>
    </>
  );
}
