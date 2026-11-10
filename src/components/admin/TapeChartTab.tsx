import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  FileDown,
  KeyRound,
  UserCheck,
  Sparkles,
  BedDouble,
} from "lucide-react";
import {
  get,
  list,
  money,
  dateFmt,
  downloadBookingInvoicePdf,
  type Room,
  type RoomUnit,
  type RoomBooking,
} from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";
import {
  SectionHeader,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Modal,
  Badge,
} from "./ui";

interface EnrichedUnitRow {
  unitId: string;
  unitNumber: string;
  unitStatus: string;
  roomId: string;
  roomTitle: string;
  bookings: RoomBooking[];
}

const MONTHS_RO = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

const DAYS_SHORT_RO = ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"];

function getGuestDisplay(b: RoomBooking): string {
  const full = [b.user?.first_name, b.user?.last_name].filter(Boolean).join(" ");
  return b.guest_name || full || b.user?.email || b.guest_email || "Oaspete Casa Esy";
}

export default function TapeChartTab() {
  const { toast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [loading, setLoading] = useState(true);
  const [unitRows, setUnitRows] = useState<EnrichedUnitRow[]>([]);
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<{
    booking: RoomBooking;
    roomTitle: string;
    unitNumber: string;
  } | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const loadAllTimelineData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const rawRooms = await get<unknown>("/rooms");
        const rooms = list<Room>(rawRooms);

        const detailed = await Promise.all(
          rooms.map(async (r) => {
            try {
              const [roomDetail, roomBks] = await Promise.all([
                get<Room>(`/rooms/${r.id}`),
                get<unknown>(`/rooms/${r.id}/bookings`),
              ]);
              return {
                room: roomDetail || r,
                units: roomDetail?.units || r.units || [],
                bookings: list<RoomBooking>(roomBks).filter((b) => b.status !== "cancelled"),
              };
            } catch {
              return { room: r, units: r.units || [], bookings: [] as RoomBooking[] };
            }
          }),
        );

        const rows: EnrichedUnitRow[] = [];
        for (const item of detailed) {
          const rTitle = item.room.title || item.room.name || `Cameră #${item.room.id}`;
          const rId = String(item.room.id);
          const unitsList: RoomUnit[] = item.units;

          const assignedIds = new Set<string>();
          unitsList.forEach((u, idx) => {
            const uId = String(u.id);
            const uNum = u.unit_number || u.name || u.code || `${idx + 1}`;
            const unitBks = item.bookings.filter((b) => {
              const bUnitId = String(b.unit_id ?? b.room_unit_id ?? b.unit?.id ?? "");
              if (bUnitId === uId) {
                assignedIds.add(String(b.id));
                return true;
              }
              return false;
            });
            rows.push({
              unitId: uId,
              unitNumber: `Camera ${uNum}`,
              unitStatus: u.status || "active",
              roomId: rId,
              roomTitle: rTitle,
              bookings: unitBks,
            });
          });

          // If there are bookings not yet assigned to a specific physical unit or room has 0 units
          const unassigned = item.bookings.filter((b) => !assignedIds.has(String(b.id)));
          if (unassigned.length > 0 || unitsList.length === 0) {
            rows.push({
              unitId: `unassigned-${rId}`,
              unitNumber: unitsList.length === 0 ? `Unitate Principală` : `Alocare Automată`,
              unitStatus: "active",
              roomId: rId,
              roomTitle: rTitle,
              bookings: unassigned,
            });
          }
        }

        setUnitRows(rows);
      } catch (err: any) {
        if (!silent) toast(err?.message || "Eroare la încărcarea diagramei de ocupare.", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadAllTimelineData();
  }, [loadAllTimelineData]);

  useAdminLiveSync({
    topic: "all",
    onSync: () => loadAllTimelineData(true),
  });

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

  const dayColumns = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const d = new Date(year, month, dayNum);
      const dow = d.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      return {
        dayNum,
        dowLabel: DAYS_SHORT_RO[dow],
        isWeekend,
        isToday,
        dateObj: d,
      };
    });
  }, [year, month, daysInMonth]);

  const distinctRooms = useMemo(() => {
    const map = new Map<string, string>();
    unitRows.forEach((r) => map.set(r.roomId, r.roomTitle));
    return Array.from(map.entries());
  }, [unitRows]);

  const filteredRows = useMemo(() => {
    return unitRows.filter((row) => {
      if (roomFilter !== "all" && row.roomId !== roomFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const unitMatch = row.unitNumber.toLowerCase().includes(q) || row.roomTitle.toLowerCase().includes(q);
        const bkMatch = row.bookings.some(
          (b) =>
            getGuestDisplay(b).toLowerCase().includes(q) ||
            String(b.booking_code || "").toLowerCase().includes(q),
        );
        return unitMatch || bkMatch;
      }
      return true;
    });
  }, [unitRows, roomFilter, search]);

  const monthStartMs = useMemo(() => new Date(year, month, 1, 0, 0, 0).getTime(), [year, month]);
  const monthEndMs = useMemo(
    () => new Date(year, month, daysInMonth, 23, 59, 59).getTime(),
    [year, month, daysInMonth],
  );

  // Compute daily occupancy counts for footer & KPI summary
  const stats = useMemo(() => {
    const dailyBooked = new Array(daysInMonth).fill(0);
    let activeBookingsCount = 0;
    let monthRevenue = 0;
    const seenBk = new Set<string>();

    filteredRows.forEach((row) => {
      row.bookings.forEach((b) => {
        if (!b.check_in || !b.check_out) return;
        const ci = new Date(b.check_in).getTime();
        const co = new Date(b.check_out).getTime();
        if (co < monthStartMs || ci > monthEndMs) return;

        if (!seenBk.has(String(b.id))) {
          seenBk.add(String(b.id));
          activeBookingsCount++;
          monthRevenue += Number(b.total_price || 0);
        }

        for (let d = 1; d <= daysInMonth; d++) {
          const dayTime = new Date(year, month, d, 14, 0, 0).getTime();
          if (dayTime >= ci && dayTime < co) {
            dailyBooked[d - 1] += 1;
          }
        }
      });
    });

    const totalUnitDays = Math.max(1, filteredRows.length * daysInMonth);
    const totalOccupiedUnitDays = dailyBooked.reduce((a, b) => a + b, 0);
    const avgOccupancy = Math.min(100, Math.round((totalOccupiedUnitDays / totalUnitDays) * 100));

    return {
      dailyBooked,
      activeBookingsCount,
      monthRevenue,
      avgOccupancy,
    };
  }, [filteredRows, daysInMonth, monthStartMs, monthEndMs, year, month]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Hotel Property Management System (PMS)"
        title="Diagramă Orizontală de Ocupare (Tape Chart)"
        description="Vizualizare completă pe unități fizice (Camera 101, 102...) și zilele lunii. Apasă pe orice bară de rezervare pentru detalii, PIN Smart Lock sau descărcarea facturii PDF."
        actions={
          <div className="flex items-center gap-2">
            <GhostButton onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </GhostButton>
            <div className="px-4 py-2 rounded-xl bg-white border border-[color:var(--color-border)] font-serif font-bold text-sm min-w-[160px] text-center shadow-xs">
              {MONTHS_RO[month]} {year}
            </div>
            <GhostButton onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </GhostButton>
            <PrimaryButton onClick={goToday}>Astăzi</PrimaryButton>
          </div>
        }
      />

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="p-4 rounded-2xl bg-white/85 border border-[color:var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--color-muted-foreground)]">Unități Afișate</div>
            <div className="font-serif font-bold text-2xl text-[color:var(--color-primary)]">
              {filteredRows.length} camere
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] flex items-center justify-center">
            <DoorOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[color:var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--color-muted-foreground)]">
              Sejururi în {MONTHS_RO[month]}
            </div>
            <div className="font-serif font-bold text-2xl text-[color:var(--color-primary)]">
              {stats.activeBookingsCount} rezervări
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
            <CalendarRange className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[color:var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--color-muted-foreground)]">Grad Mediu Ocupare</div>
            <div className="font-serif font-bold text-2xl text-[color:var(--color-primary)]">
              {stats.avgOccupancy}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[color:var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-xs text-[color:var(--color-muted-foreground)]">Valoare Sejururi Lună</div>
            <div className="font-serif font-bold text-2xl text-[color:var(--color-primary)]">
              {money(stats.monthRevenue)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-700 flex items-center justify-center">
            <BedDouble className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRoomFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              roomFilter === "all"
                ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]"
                : "bg-white text-slate-700 border-[color:var(--color-border)] hover:bg-slate-50"
            }`}
          >
            Toate Tipurile de Camere
          </button>
          {distinctRooms.map(([rId, rTitle]) => (
            <button
              key={rId}
              onClick={() => setRoomFilter(rId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                roomFilter === rId
                  ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)]"
                  : "bg-white text-slate-700 border-[color:var(--color-border)] hover:bg-slate-50"
              }`}
            >
              {rTitle}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#0f2942]" /> Confirmată
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500" /> În așteptare
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-600" /> Check-in Efectuat
            </span>
          </div>
          <div className="w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Caută oaspete, #BK sau cameră..."
            />
          </div>
        </div>
      </div>

      {/* Horizontal Tape Chart Table */}
      <div className="rounded-2xl bg-white border border-[color:var(--color-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1150px]">
            {/* Header Row: Days of the Month */}
            <div
              className="grid border-b border-[color:var(--color-border)] bg-slate-50/90"
              style={{
                gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(34px, 1fr))`,
              }}
            >
              <div className="p-3 font-bold text-xs uppercase tracking-wider text-slate-600 border-r border-[color:var(--color-border)] sticky left-0 bg-slate-50 z-20 flex items-center justify-between">
                <span>Unitate Fizică</span>
                <span className="text-[10px] font-normal text-slate-400">{MONTHS_RO[month].slice(0, 3)}</span>
              </div>
              {dayColumns.map((col) => (
                <div
                  key={col.dayNum}
                  className={`py-2 text-center border-r border-[color:var(--color-border)]/60 flex flex-col items-center justify-center ${
                    col.isToday
                      ? "bg-amber-500/20 text-amber-950 font-bold"
                      : col.isWeekend
                        ? "bg-slate-100/90 text-slate-700"
                        : "text-slate-600"
                  }`}
                >
                  <span className="text-[10px] uppercase opacity-75">{col.dowLabel}</span>
                  <span className="text-xs font-bold">{col.dayNum}</span>
                </div>
              ))}
            </div>

            {/* Body Rows: Physical Units */}
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Se încarcă diagrama orizontală de ocupare...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Nicio unitate fizică nu corespunde filtrului selectat.
              </div>
            ) : (
              filteredRows.map((row) => {
                // Filter bookings that overlap the current month
                const monthBookings = row.bookings
                  .map((b) => {
                    if (!b.check_in || !b.check_out) return null;
                    const ci = new Date(b.check_in);
                    const co = new Date(b.check_out);
                    if (co.getTime() < monthStartMs || ci.getTime() > monthEndMs) return null;

                    const startDay =
                      ci.getFullYear() < year || (ci.getFullYear() === year && ci.getMonth() < month)
                        ? 1
                        : ci.getDate();
                    const endDay =
                      co.getFullYear() > year || (co.getFullYear() === year && co.getMonth() > month)
                        ? daysInMonth + 1
                        : Math.max(startDay + 1, co.getDate());

                    const clampedStart = Math.max(1, Math.min(daysInMonth, startDay));
                    const clampedEnd = Math.max(clampedStart + 1, Math.min(daysInMonth + 1, endDay));

                    return {
                      booking: b,
                      startCol: clampedStart,
                      spanCols: clampedEnd - clampedStart,
                    };
                  })
                  .filter((x): x is NonNullable<typeof x> => x !== null);

                return (
                  <div
                    key={row.unitId}
                    className="relative grid border-b border-[color:var(--color-border)]/70 hover:bg-amber-50/20 transition-colors"
                    style={{
                      gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(34px, 1fr))`,
                      minHeight: "54px",
                    }}
                  >
                    {/* Sticky Left Unit Cell */}
                    <div className="p-2.5 border-r border-[color:var(--color-border)] sticky left-0 bg-white z-10 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-[color:var(--color-primary)] truncate">
                          {row.unitNumber}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            row.unitStatus === "cleaning"
                              ? "bg-amber-100 text-amber-800"
                              : row.unitStatus === "maintenance"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {row.unitStatus === "cleaning"
                            ? "Curățenie"
                            : row.unitStatus === "maintenance"
                              ? "Mentenanță"
                              : "Activă"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 truncate">{row.roomTitle}</span>
                    </div>

                    {/* Background Day Cells */}
                    {dayColumns.map((col) => (
                      <div
                        key={col.dayNum}
                        className={`border-r border-[color:var(--color-border)]/40 ${
                          col.isToday
                            ? "bg-amber-500/10"
                            : col.isWeekend
                              ? "bg-slate-50/70"
                              : ""
                        }`}
                      />
                    ))}

                    {/* Overlay Booking Bars */}
                    {monthBookings.map(({ booking, startCol, spanCols }) => {
                      const guest = getGuestDisplay(booking);
                      const isPending = booking.status === "pending";
                      const isCheckedIn = Boolean(booking.self_checkin_completed_at);
                      const barStyle = isCheckedIn
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                        : isPending
                          ? "bg-amber-500 hover:bg-amber-600 text-[#0c192c] border-amber-600"
                          : "bg-[#0f2942] hover:bg-[#163a5c] text-white border-[#0c192c]";

                      const leftPercent = `calc(220px + ((100% - 220px) * ${(startCol - 1) / daysInMonth}))`;
                      const widthPercent = `calc(((100% - 220px) * ${spanCols / daysInMonth}) - 4px)`;

                      return (
                        <button
                          key={String(booking.id)}
                          onClick={() =>
                            setSelectedBooking({
                              booking,
                              roomTitle: row.roomTitle,
                              unitNumber: row.unitNumber,
                            })
                          }
                          style={{
                            position: "absolute",
                            left: leftPercent,
                            width: widthPercent,
                            top: "8px",
                            bottom: "8px",
                          }}
                          title={`${guest} (${booking.booking_code || `#${booking.id}`}) • ${dateFmt(booking.check_in)} → ${dateFmt(booking.check_out)}`}
                          className={`z-10 rounded-lg border px-2 flex items-center justify-between gap-1.5 text-[11px] font-semibold shadow-xs transition cursor-pointer overflow-hidden ${barStyle}`}
                        >
                          <span className="truncate flex items-center gap-1.5">
                            {(booking as any).channel === "booking.com" && (
                              <span className="px-1 py-0.2 rounded bg-[#003580] text-white text-[9px] font-bold shrink-0">
                                B.
                              </span>
                            )}
                            {(booking as any).channel === "airbnb" && (
                              <span className="px-1 py-0.2 rounded bg-[#FF385C] text-white text-[9px] font-bold shrink-0">
                                A.
                              </span>
                            )}
                            {(booking as any).channel === "expedia" && (
                              <span className="px-1 py-0.2 rounded bg-[#ffc600] text-[#002244] text-[9px] font-bold shrink-0">
                                E.
                              </span>
                            )}
                            <span className="truncate">{guest}</span>
                          </span>
                          {booking.booking_code && spanCols >= 2 && (
                            <span className="text-[10px] font-mono opacity-85 shrink-0 bg-black/15 px-1 rounded">
                              {booking.booking_code}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}

            {/* Footer Row: Daily Occupancy Count */}
            <div
              className="grid bg-slate-50 border-t border-[color:var(--color-border)]"
              style={{
                gridTemplateColumns: `220px repeat(${daysInMonth}, minmax(34px, 1fr))`,
              }}
            >
              <div className="p-2.5 text-[11px] font-bold text-slate-600 border-r border-[color:var(--color-border)] sticky left-0 bg-slate-50 z-10">
                Camere Ocupate / Zi
              </div>
              {stats.dailyBooked.map((count, idx) => {
                const ratio = filteredRows.length > 0 ? count / filteredRows.length : 0;
                const cellColor =
                  ratio >= 0.8
                    ? "bg-emerald-500/20 text-emerald-900 font-bold"
                    : ratio > 0
                      ? "bg-amber-500/15 text-amber-900 font-semibold"
                      : "text-slate-400";
                return (
                  <div
                    key={idx}
                    className={`py-2 text-center text-[11px] border-r border-[color:var(--color-border)]/50 ${cellColor}`}
                  >
                    {count}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detalii Rezervare din Tape Chart */}
      <Modal
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title={
          selectedBooking
            ? `Rezervare ${selectedBooking.booking.booking_code || `#${selectedBooking.booking.id}`}`
            : "Detalii Rezervare"
        }
        subtitle={
          selectedBooking ? `${selectedBooking.unitNumber} • ${selectedBooking.roomTitle}` : ""
        }
        footer={
          selectedBooking ? (
            <>
              <GhostButton onClick={() => setSelectedBooking(null)}>Închide</GhostButton>
              <PrimaryButton
                disabled={downloadingPdf}
                onClick={async () => {
                  const ref = String(
                    selectedBooking.booking.booking_code || selectedBooking.booking.id,
                  );
                  setDownloadingPdf(true);
                  try {
                    await downloadBookingInvoicePdf(ref, selectedBooking.booking.booking_code || undefined);
                    toast(`Factura PDF pentru ${ref} a fost descărcată!`, "success");
                  } catch (e: any) {
                    toast(e?.message || "Eroare la descărcarea facturii PDF.", "error");
                  } finally {
                    setDownloadingPdf(false);
                  }
                }}
              >
                <FileDown className="w-4 h-4" />
                {downloadingPdf ? "Se generează PDF..." : "Descarcă Factură PDF"}
              </PrimaryButton>
            </>
          ) : null
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-[color:var(--color-border)]">
              <div>
                <div className="text-xs text-slate-500">Oaspete Titular</div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <UserCheck className="w-4 h-4 text-[color:var(--color-primary)]" />
                  {getGuestDisplay(selectedBooking.booking)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Status Sejur</div>
                <div className="mt-0.5">
                  <Badge
                    tone={
                      selectedBooking.booking.status === "confirmed"
                        ? "green"
                        : selectedBooking.booking.status === "pending"
                          ? "gold"
                          : "muted"
                    }
                  >
                    {selectedBooking.booking.status === "confirmed"
                      ? "Confirmată"
                      : selectedBooking.booking.status === "pending"
                        ? "În așteptare"
                        : selectedBooking.booking.status || "Activă"}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Check-in</div>
                <div className="font-semibold text-sm text-slate-800">
                  {dateFmt(selectedBooking.booking.check_in)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Check-out</div>
                <div className="font-semibold text-sm text-slate-800">
                  {dateFmt(selectedBooking.booking.check_out)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total Sejur</div>
                <div className="font-bold text-base text-[color:var(--color-primary)]">
                  {money(selectedBooking.booking.total_price)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">PIN Acces Smart Lock</div>
                <div className="font-mono font-bold text-sm text-amber-800 flex items-center gap-1 mt-0.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  {selectedBooking.booking.access_pin || "Se generează la Self Check-In"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Canal Distribuție</div>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  {(selectedBooking.booking as any).channel === "booking.com" ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#003580] text-white text-[11px] font-bold">
                      Booking.com {(selectedBooking.booking as any).external_reference ? `(${(selectedBooking.booking as any).external_reference})` : ""}
                    </span>
                  ) : (selectedBooking.booking as any).channel === "airbnb" ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF385C] text-white text-[11px] font-bold">
                      Airbnb {(selectedBooking.booking as any).external_reference ? `(${(selectedBooking.booking as any).external_reference})` : ""}
                    </span>
                  ) : (selectedBooking.booking as any).channel === "expedia" ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffc600] text-[#002244] text-[11px] font-bold">
                      Expedia {(selectedBooking.booking as any).external_reference ? `(${(selectedBooking.booking as any).external_reference})` : ""}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                      Rezervare Directă Casa Esy
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
