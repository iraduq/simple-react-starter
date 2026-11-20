import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { get, post, errMsg, money } from "../../lib/admin";
import { useToast } from "../Toast";
import { Badge, Button, Card } from "./ui";

interface DemandDay {
  date: string;
  day: number;
  weekday: number;
  is_weekend: boolean;
  holiday_name?: string | null;
  is_holiday: boolean;
  is_bridge_day: boolean;
  demand_tier: "low" | "normal" | "high" | "peak" | string;
  rooms_booked: number;
  rooms_available: number;
  occupancy_pct: number;
  base_price: number;
  final_price: number;
  has_override: boolean;
  breakdown: {
    base_price: number;
    season_multiplier: number;
    weekend_multiplier: number;
    holiday_multiplier: number;
    holiday_name?: string | null;
    occupancy_multiplier: number;
    lead_time_multiplier: number;
    los_multiplier: number;
    override_applied?: number;
  };
}

interface HolidayItem {
  date: string;
  name: string;
  multiplier: number;
  demand_tier: string;
  is_holiday: boolean;
  is_bridge_day: boolean;
  source?: string;
}

interface DemandCalendarResponse {
  room_id: string;
  room_title: string;
  base_price: number;
  year: number;
  month: number;
  snapshots_present: number;
  days: DemandDay[];
  year_holidays: HolidayItem[];
}

const WEEKDAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

export default function PricingDemandCalendar({ roomId }: { roomId: string }) {
  const { toast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<DemandCalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshingSnap, setRefreshingSnap] = useState(false);
  const [selected, setSelected] = useState<DemandDay | null>(null);

  const loadDemand = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const res = await get<DemandCalendarResponse>(
        `/api/pricing/demand-calendar?room_id=${encodeURIComponent(roomId)}&year=${year}&month=${month}`,
      );
      setData(res);
      setSelected((prev) => {
        if (!res.days?.length) return null;
        if (prev) {
          const same = res.days.find((d) => d.date === prev.date);
          if (same) return same;
        }
        return res.days.find((d) => d.is_holiday || d.demand_tier === "peak") || res.days[0];
      });
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  }, [roomId, year, month, toast]);

  useEffect(() => {
    void loadDemand();
  }, [loadDemand]);

  const handleRefreshSnapshots = async () => {
    setRefreshingSnap(true);
    try {
      await post("/api/pricing/refresh-snapshots", {});
      toast("Snapshot-urile de ocupare au fost recalculate pentru următoarele 90 de zile!", "success");
      await loadDemand();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setRefreshingSnap(false);
    }
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const jumpToDate = (iso: string) => {
    const [y, m] = iso.split("-").map(Number);
    if (y && m) {
      setYear(y);
      setMonth(m);
    }
  };

  if (!roomId) return null;

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });

  const firstWeekday = data?.days?.[0]?.weekday ?? 0;
  const peakShortcuts = (data?.year_holidays || []).filter(
    (h) =>
      h.demand_tier === "peak" &&
      (h.name.includes("Paștele") ||
        h.name.includes("1 Mai ·") ||
        h.name === "Rusalii" ||
        h.name.includes("15") ||
        h.name.includes("Ziua Marinei (Vârf") ||
        h.name.includes("1 Decembrie") ||
        h.name === "Revelion"),
  );

  return (
    <div className="space-y-4">
      {/* Explicație simplă Occupancy Snapshot + Buton Refresh */}
      <div className="rounded-2xl border border-[#e5dcc3] bg-gradient-to-r from-[#fffdf7] via-white to-[#f6f9ff] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#f5d588] shadow-xs">
            <Info size={17} />
          </span>
          <div className="space-y-1">
            <div className="text-[13px] font-bold text-[#0d2c5c]">
              Ce este „Occupancy Snapshot” în baza de date?
            </div>
            <p className="text-[12.5px] text-[#4f6280] leading-relaxed max-w-3xl">
              Este o <b>fotografie zilnică</b> salvată în DB cu câte camere sunt deja rezervate din totalul disponibil pentru fiecare zi (următoarele 90 de zile). Motorul de prețuri o citește instant — fără să recalculeze toate rezervările la fiecare click — și ajustează automat tariful:{" "}
              <b className="text-[#0d2c5c]">&lt;30% ocupare → -10%</b>,{" "}
              <b className="text-[#0d2c5c]">60–79% → +10%</b>,{" "}
              <b className="text-[#9a7222]">≥80% → +25%</b>, la care adaugă{" "}
              <b className="text-[#9a7222]">Sărbătorile legale (API Nager.Date RO) &amp; Punțile de minivacanță</b>.
            </p>
          </div>
        </div>
        <Button
          variant="gold"
          onClick={() => void handleRefreshSnapshots()}
          disabled={refreshingSnap}
          className="shrink-0"
        >
          <RefreshCw size={13} className={refreshingSnap ? "animate-spin" : ""} />
          {refreshingSnap ? "Recalculez..." : "Actualizează Snapshot Ocupare"}
        </Button>
      </div>

      {/* Calendar Dinamic Cerere & Sărbători */}
      <Card className="p-5 sm:p-6 space-y-5 border-[#e5dcc3]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#e8eef6]">
          <div>
            <h3 className="text-[18px] font-bold text-[#0d2c5c] flex items-center gap-2 font-['Outfit',sans-serif]">
              <Flame size={18} className="text-[#c69a3f]" />
              Calendar Cerere, Sărbători &amp; Formula Dinamică ({data?.room_title || "Cameră"})
            </h3>
            <p className="text-[12px] text-[#5e718f] mt-0.5">
              Click pe orice zi pentru a vedea exact multiplicatorii (Sărbători RO din API public, Punți, Weekend, Ocupare Snapshot).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f] cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[140px] text-center text-[13px] font-bold capitalize text-[#0d2c5c]">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f] cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Scurtături cele mai dorite zile din an */}
        {peakShortcuts.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8a6420] mr-1 flex items-center gap-1">
              <CalendarDays size={12} /> Vârfuri {year}:
            </span>
            {peakShortcuts.slice(0, 7).map((h) => (
              <button
                key={h.date}
                type="button"
                onClick={() => jumpToDate(h.date)}
                className="rounded-full border border-[#e5dcc3] bg-[#fdf6e2] px-2.5 py-1 text-[11px] font-semibold text-[#8a6420] hover:border-[#c69a3f] hover:bg-[#faecc3] transition cursor-pointer"
              >
                {h.date.slice(5)} · {h.name.split("·")[0].trim()} (+{Math.round((h.multiplier - 1) * 100)}%)
              </button>
            ))}
          </div>
        )}

        {/* Grilă lunară */}
        <div>
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="text-center text-[10.5px] font-bold uppercase tracking-wider text-[#6b7c99] py-1"
              >
                {wd}
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-7 gap-1.5 ${loading ? "opacity-50" : ""}`}>
            {Array.from({ length: firstWeekday }).map((_, idx) => (
              <div key={`pad-${idx}`} className="h-[86px] rounded-xl bg-[#f8fafd]/40" />
            ))}
            {(data?.days || []).map((d) => {
              const isSelected = selected?.date === d.date;
              const tierCls =
                d.demand_tier === "peak"
                  ? "border-[#c69a3f] bg-gradient-to-b from-[#fffaf0] to-[#fdf3d7]"
                  : d.demand_tier === "high"
                    ? "border-[#cbd9ef] bg-[#f6f9ff]"
                    : "border-[#e6ecf5] bg-white";

              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelected(d)}
                  className={`h-[86px] rounded-xl border p-2 text-left flex flex-col justify-between transition cursor-pointer ${tierCls} ${
                    isSelected
                      ? "ring-2 ring-[#0d2c5c] shadow-sm"
                      : "hover:border-[#0d2c5c]/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[12px] font-bold text-[#0d2c5c]">{d.day}</span>
                    {d.is_holiday ? (
                      <span className="rounded-md bg-[#c69a3f] px-1 py-0.5 text-[8.5px] font-bold text-white leading-none">
                        LIBER
                      </span>
                    ) : d.is_bridge_day ? (
                      <span className="rounded-md bg-[#0d2c5c] px-1 py-0.5 text-[8.5px] font-bold text-[#f5d588] leading-none">
                        PUNTE
                      </span>
                    ) : d.is_weekend ? (
                      <span className="text-[9px] font-bold text-[#8a6420]">WKND</span>
                    ) : null}
                  </div>

                  {d.holiday_name && (
                    <div
                      className="truncate text-[9.5px] font-semibold text-[#8a6420]"
                      title={d.holiday_name}
                    >
                      {d.holiday_name}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-[12px] font-extrabold text-[#0d2c5c] leading-none">
                      {money(d.final_price)}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1 flex-1 rounded-full bg-[#e2e8f0] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.occupancy_pct >= 80
                              ? "bg-rose-500"
                              : d.occupancy_pct >= 60
                                ? "bg-[#c69a3f]"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(4, d.occupancy_pct))}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-semibold text-[#6b7c99] tabular-nums">
                        {Math.round(d.occupancy_pct)}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panou Descompunere Preț pentru ziua selectată */}
        {selected && (
          <div className="rounded-2xl border border-[#e5dcc3] bg-[#faf7f0] p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles size={15} className="text-[#c69a3f]" />
                <span className="text-[13px] font-bold text-[#0d2c5c]">
                  Descompunere tarif pentru {selected.date}
                </span>
                {selected.holiday_name && <Badge tone="gold">{selected.holiday_name}</Badge>}
                {selected.has_override && <Badge tone="navy">Override Admin Activ</Badge>}
              </div>
              <span className="text-[16px] font-extrabold text-[#0d2c5c]">
                {money(selected.final_price)} / noapte
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-[11.5px]">
              <span className="rounded-lg bg-white border border-[#e1e8f0] px-2.5 py-1 text-[#0d2c5c]">
                Bază: <b>{money(selected.breakdown.base_price)}</b>
              </span>
              <span className="rounded-lg bg-white border border-[#e1e8f0] px-2.5 py-1 text-[#0d2c5c]">
                Sezon: <b>×{selected.breakdown.season_multiplier.toFixed(2)}</b>
              </span>
              <span className="rounded-lg bg-white border border-[#e1e8f0] px-2.5 py-1 text-[#0d2c5c]">
                Weekend: <b>×{selected.breakdown.weekend_multiplier.toFixed(2)}</b>
              </span>
              <span className="rounded-lg bg-white border border-[#e5dcc3] px-2.5 py-1 text-[#8a6420]">
                Sărbătoare / Punte: <b>×{selected.breakdown.holiday_multiplier.toFixed(2)}</b>
              </span>
              <span className="rounded-lg bg-white border border-[#e1e8f0] px-2.5 py-1 text-[#0d2c5c]">
                Ocupare Snapshot ({selected.rooms_booked}/{selected.rooms_available || "—"}):{" "}
                <b>×{selected.breakdown.occupancy_multiplier.toFixed(2)}</b>
              </span>
              <span className="rounded-lg bg-white border border-[#e1e8f0] px-2.5 py-1 text-[#0d2c5c]">
                Lead-time: <b>×{selected.breakdown.lead_time_multiplier.toFixed(2)}</b>
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
