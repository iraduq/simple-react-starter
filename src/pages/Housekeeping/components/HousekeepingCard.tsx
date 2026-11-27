import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Wrench,
  BrushCleaning,
  SearchCode,
  CalendarClock,
  PackagePlus,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import type { HousekeepingUnit } from "../../../services/housekeepingService";
import {
  extractFloor,
  formatShortDate,
  normalizedCleanState,
  roomTitle,
  stateMeta,
  unitNumber,
  EASE,
} from "../types";

export default function HousekeepingCard({
  unit,
  updating,
  onStatusChange,
  onReportMaintenance,
  onReportLostFound,
  index,
}: {
  unit: HousekeepingUnit;
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
  index: number;
}) {
  const cleanState = normalizedCleanState(unit);
  const meta = stateMeta(cleanState);
  const floor = extractFloor(unit);
  const occupancy = unit.occupancy_state || "vacant";
  const ticketsCount = unit.open_tickets_count || 0;

  const statusDotClass =
    cleanState === "dirty"
      ? "bg-[#c69a3f]"
      : cleanState === "inspecting"
        ? "bg-[#1d4ed8]"
        : cleanState === "maintenance"
          ? "bg-[#9f2c38]"
          : "bg-emerald-500";

  const statusPillClass =
    cleanState === "dirty"
      ? "bg-[#fdf6e2] text-[#8a6420] border-[#ead7a7]"
      : cleanState === "inspecting"
        ? "bg-[#eff4ff] text-[#0d2c5c] border-[#d3e1fa]"
        : cleanState === "maintenance"
          ? "bg-[#fdf2f3] text-[#8c2f39] border-[#f2cfd3]"
          : "bg-emerald-50/80 text-emerald-800 border-emerald-200/80";

  const cardBorderClass =
    cleanState === "dirty"
      ? "border-[#e0c483]"
      : cleanState === "maintenance"
        ? "border-[#e5b8be]"
        : "border-[#e5dcc3]/75";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.03, 0.22),
        ease: EASE,
      }}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-[22px] border bg-gradient-to-b from-white via-white to-[#fdfbf6] p-5 shadow-[0_6px_24px_rgba(13,44,92,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c69a3f]/70 hover:shadow-[0_16px_38px_rgba(13,44,92,0.09)] ${cardBorderClass}`}
    >
      {/* Header Cameră */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-13 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d2c5c] to-[#173d78] text-white shadow-[0_6px_16px_rgba(13,44,92,0.18)] ring-1 ring-[#c69a3f]/35">
            <span className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-[#e8c67a]/85">
              Et. {floor}
            </span>
            <span
              className="text-[20px] font-bold leading-tight text-[#f6d98e]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {unitNumber(unit)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="truncate text-[17px] font-semibold leading-snug text-[#0d2c5c]"
              style={{ fontFamily: "var(--font-display)" }}
              title={roomTitle(unit)}
            >
              {roomTitle(unit)}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold ${statusPillClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
                {meta.label}
              </span>
              {ticketsCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#8c2f39]/10 px-2 py-0.5 text-[10px] font-bold text-[#8c2f39]">
                  <AlertTriangle size={10} /> {ticketsCount} tichet{ticketsCount > 1 ? "e" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Context Ocupare Live */}
      <div className="min-h-[54px] flex flex-col justify-center rounded-2xl border border-[#ece4d3] bg-[#faf7f0]/80 px-3.5 py-2.5 text-[12px]">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#0d2c5c]">
            {occupancy === "checkout_today" ? (
              <>
                <CalendarClock size={13} className="text-[#c69a3f]" />
                <span className="text-[#8a6420]">Check-out azi · Prioritate</span>
              </>
            ) : occupancy === "checkin_today" ? (
              <>
                <UserCheck size={13} className="text-[#0d2c5c]" />
                <span>Sosire oaspete azi</span>
              </>
            ) : occupancy === "occupied" ? (
              <>
                <UserCheck size={13} className="text-emerald-700" />
                <span>Oaspete cazat acum</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} className="text-[#7c8da8]" />
                <span className="text-[#5c6f8c] font-medium">Cameră liberă</span>
              </>
            )}
          </span>
          {(unit.check_in || unit.check_out) && (
            <span className="text-[11px] font-medium text-[#6b7c99] tabular-nums">
              {formatShortDate(unit.check_in)} – {formatShortDate(unit.check_out)}
            </span>
          )}
        </div>
        {unit.guest_name ? (
          <p className="mt-0.5 truncate text-[11.5px] text-[#4f6280]">
            Oaspete: <span className="font-semibold text-[#0d2c5c]">{unit.guest_name}</span>
          </p>
        ) : (
          <p className="mt-0.5 text-[11px] text-[#8b9bb4]">
            Disponibilă pentru cazare sau pregătire
          </p>
        )}
      </div>

      {unit.notes && (
        <p className="rounded-xl border border-[#e6ecf4] bg-white px-3 py-2 text-[11.5px] text-[#4f6280]">
          {unit.notes}
        </p>
      )}

      {/* Segmented Control Status Igienizare */}
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
            onStatusChange(
              unit,
              { status: "maintenance" },
              "trecută În Mentenanță",
            )
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

      {/* Footer Acțiuni Secundare */}
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
    </motion.div>
  );
}
