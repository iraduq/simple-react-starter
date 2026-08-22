import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  BedDouble,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { Badge, statusTone, TableSkeleton, EmptyState, Skeleton } from "./ui";
import {
  get,
  post,
  list,
  money,
  dateFmt,
  errMsg,
  type Booking,
  type Room,
  type AdminUser,
} from "../../lib/admin";
import { useToast } from "../Toast";

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  loading,
  delay = 0,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
  loading: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-black/[0.06] bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-shadow duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a8a8a]">
            {label}
          </span>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-24 rounded-lg bg-black/5" />
          ) : (
            <p className="mt-2 font-sans text-[28px] font-bold tracking-tight text-black leading-none">
              {value}
            </p>
          )}
          {hint && (
            <span className="mt-2 block text-[12px] text-[#8a8a8a]">
              {hint}
            </span>
          )}
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black/[0.03] text-black border border-black/[0.05] transition-transform duration-500 hover:scale-110">
          <Icon size={20} strokeWidth={1.5} />
        </span>
      </div>
    </motion.div>
  );
}

const WEEK_DAYS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];
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

type ViewMode = "week" | "month";

const toISO = (d: Date) => d.toISOString().split("T")[0];

const startOfWeek = (d: Date) => {
  const dow = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

export default function OverviewTab() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState<Date>(() => new Date());

  const load = async () => {
    setLoading(true);
    const [b, r, u] = await Promise.allSettled([
      get<unknown>("/bookings"),
      get<unknown>("/rooms"),
      get<unknown>("/users/admin/all"),
    ]);
    if (b.status === "fulfilled") setBookings(list<Booking>(b.value));
    if (r.status === "fulfilled") setRooms(list<Room>(r.value));
    if (u.status === "fulfilled") setUsers(list<AdminUser>(u.value));
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const active = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending",
    );
    const revenue = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + Number(b.total_price || 0), 0);
    const today = toISO(new Date());
    const occupiedRoomIds = new Set(
      bookings
        .filter(
          (b) =>
            b.status === "confirmed" &&
            (b.check_in || "") <= today &&
            (b.check_out || "") > today,
        )
        .map((b) => String(b.room_id)),
    );
    const occupancy = rooms.length
      ? Math.round((occupiedRoomIds.size / rooms.length) * 100)
      : 0;
    return {
      active: active.length,
      revenue,
      occupancy,
      occupied: occupiedRoomIds.size,
    };
  }, [bookings, rooms]);

  const pending = bookings.filter((b) => b.status === "pending").slice(0, 5);

  const act = async (id: Booking["id"], kind: "confirm" | "cancel") => {
    setBusy(`${id}-${kind}`);
    try {
      await post(
        `/bookings/${id}/${kind}`,
        kind === "cancel" ? { reason: null } : undefined,
      );
      toast(
        kind === "confirm" ? "Rezervare confirmată." : "Rezervare anulată.",
        "success",
      );
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(null);
    }
  };

  // ── Perioada afișată în calendarul de disponibilitate ──
  const rangeDays = useMemo(() => {
    if (viewMode === "week") {
      const monday = startOfWeek(anchor);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
      });
    }
    const first = startOfMonth(anchor);
    const last = endOfMonth(anchor);
    const days: Date[] = [];
    for (let i = 1; i <= last.getDate(); i++) {
      days.push(new Date(first.getFullYear(), first.getMonth(), i));
    }
    return days;
  }, [anchor, viewMode]);

  const rangeLabel = useMemo(() => {
    if (viewMode === "week") {
      const first = rangeDays[0];
      const last = rangeDays[rangeDays.length - 1];
      if (!first || !last) return "";
      const sameMonth = first.getMonth() === last.getMonth();
      const firstStr = `${first.getDate()}${
        sameMonth ? "" : ` ${MONTHS_RO[first.getMonth()].slice(0, 3)}`
      }`;
      const lastStr = `${last.getDate()} ${
        MONTHS_RO[last.getMonth()]
      } ${last.getFullYear()}`;
      return `${firstStr} – ${lastStr}`;
    }
    return `${MONTHS_RO[anchor.getMonth()]} ${anchor.getFullYear()}`;
  }, [rangeDays, viewMode, anchor]);

  const shiftRange = (dir: -1 | 1) => {
    const d = new Date(anchor);
    if (viewMode === "week") {
      d.setDate(d.getDate() + dir * 7);
    } else {
      d.setMonth(d.getMonth() + dir);
    }
    setAnchor(d);
  };

  const goToday = () => setAnchor(new Date());

  const isBooked = (roomId: Room["id"], day: string) =>
    bookings.some(
      (b) =>
        String(b.room_id) === String(roomId) &&
        (b.status === "confirmed" || b.status === "pending") &&
        (b.check_in || "") <= day &&
        (b.check_out || "") > day,
    );

  const dayOccupancy = (day: string) => {
    if (!rooms.length) return 0;
    const occupied = rooms.filter((r) => isBooked(r.id, day)).length;
    return Math.round((occupied / rooms.length) * 100);
  };

  const todayISO = toISO(new Date());

  return (
    <div className="space-y-12 pb-10 max-w-7xl mx-auto">
      {/* ── KPI GRID ── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={CalendarDays}
          label="Rezervări active"
          value={String(stats.active)}
          hint={`${bookings.length} în total`}
          loading={loading}
          delay={0}
        />
        <Kpi
          icon={TrendingUp}
          label="Venituri generate"
          value={money(stats.revenue)}
          hint="Exclus anulările"
          loading={loading}
          delay={0.1}
        />
        <Kpi
          icon={BedDouble}
          label="Grad de ocupare"
          value={`${stats.occupancy}%`}
          hint={`${stats.occupied}/${rooms.length} camere ocupate azi`}
          loading={loading}
          delay={0.2}
        />
        <Kpi
          icon={Users}
          label="Utilizatori"
          value={String(users.length)}
          hint="Conturi înregistrate"
          loading={loading}
          delay={0.3}
        />
      </div>

      {/* ── REZERVĂRI RECENTE ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 px-1">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-px bg-black/40" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8a8a8a]">
                În așteptare
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond',serif] text-[32px] md:text-[36px] text-black leading-none">
              Rezervări recente
            </h2>
          </div>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:bg-black/5"
          >
            <RefreshCw size={12} /> Reîmprospătează
          </button>
        </div>

        <div className="rounded-[24px] border border-black/5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : pending.length === 0 ? (
            <div className="p-10 text-center">
              <EmptyState
                title="Nicio rezervare în așteptare"
                hint="Toate rezervările au fost procesate. Totul este la zi."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02] text-[10px] uppercase tracking-[0.18em] text-[#8a8a8a]">
                    <th className="px-6 py-4 font-bold">Client</th>
                    <th className="px-6 py-4 font-bold">Cameră</th>
                    <th className="px-6 py-4 font-bold">Perioadă</th>
                    <th className="px-6 py-4 font-bold">Total</th>
                    <th className="px-6 py-4 font-bold text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-black/5 last:border-0 transition-colors hover:bg-black/[0.01]"
                    >
                      <td className="px-6 py-4">
                        <span className="block font-semibold text-black">
                          {b.guest_name || "—"}
                        </span>
                        <span className="text-[12px] text-[#8a8a8a] mt-0.5 block">
                          {b.guest_email || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-black">
                        {b.room_name || `#${b.room_id ?? "—"}`}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#666]">
                        <span className="font-semibold text-black">
                          {dateFmt(b.check_in)}
                        </span>
                        <span className="mx-2 text-[#ccc]">→</span>
                        <span className="font-semibold text-black">
                          {dateFmt(b.check_out)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-black/5 font-semibold text-black text-[13px]">
                          {money(b.total_price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={busy === `${b.id}-confirm`}
                            onClick={() => void act(b.id, "confirm")}
                            className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-neutral-800 disabled:opacity-60"
                          >
                            <Check size={12} strokeWidth={2.5} /> Confirmă
                          </button>
                          <button
                            disabled={busy === `${b.id}-cancel`}
                            onClick={() => void act(b.id, "cancel")}
                            className="inline-flex items-center gap-1.5 rounded-full border border-black/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:bg-black/5 disabled:opacity-60"
                          >
                            <X size={12} strokeWidth={2.5} /> Anulează
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── DISPONIBILITATE CAMERE ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 px-1">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-px bg-black/40" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8a8a8a]">
                Calendar
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond',serif] text-[32px] md:text-[36px] text-black leading-none">
              Disponibilitate camere
            </h2>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white p-1 shadow-sm">
            {(["week", "month"] as ViewMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                className={`rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-200 ${
                  viewMode === m
                    ? "bg-black text-white"
                    : "text-[#8a8a8a] hover:text-black"
                }`}
              >
                {m === "week" ? "Săptămână" : "Lună"}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-black/5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Header de navigare perioadă */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-black/[0.02] px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => shiftRange(-1)}
                aria-label="Perioada anterioară"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black hover:bg-black/5"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="min-w-[190px] text-center text-[15px] font-bold uppercase tracking-wider text-black">
                {rangeLabel}
              </p>
              <button
                type="button"
                onClick={() => shiftRange(1)}
                aria-label="Perioada următoare"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black hover:bg-black/5"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={goToday}
              className="rounded-full border border-black/20 bg-white px-5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-black/5"
            >
              Astăzi
            </button>
          </div>

          <div className="overflow-x-auto p-6">
            {loading ? (
              <TableSkeleton rows={4} />
            ) : rooms.length === 0 ? (
              <div className="py-8">
                <EmptyState
                  title="Nicio cameră definită"
                  hint="Adaugă camere pentru a le vedea disponibilitatea."
                />
              </div>
            ) : (
              <table className="w-full border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-white py-2 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a8a8a]">
                      Cameră
                    </th>
                    {rangeDays.map((d) => {
                      const iso = toISO(d);
                      const isToday = iso === todayISO;
                      return (
                        <th key={iso} className="px-1 py-2 text-center">
                          <div
                            className={`mx-auto flex flex-col items-center rounded-lg px-2 py-1.5 transition-colors ${
                              isToday
                                ? "bg-black text-white shadow-sm"
                                : "text-[#8a8a8a]"
                            }`}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-[0.1em]">
                              {WEEK_DAYS[(d.getDay() + 6) % 7]}
                            </span>
                            <span
                              className={`text-[14px] font-semibold mt-0.5 ${
                                isToday ? "text-white" : "text-black"
                              }`}
                            >
                              {d.getDate()}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.id}>
                      <td className="sticky left-0 bg-white py-1 pr-4 text-[13px] font-semibold text-black">
                        {r.name}
                      </td>
                      {rangeDays.map((d) => {
                        const iso = toISO(d);
                        const booked = isBooked(r.id, iso);
                        const isToday = iso === todayISO;
                        return (
                          <td key={iso} className="px-1 py-1">
                            <span
                              className={`group relative mx-auto block h-8 w-full max-w-[48px] rounded-lg transition-all duration-300 ${
                                booked
                                  ? "bg-neutral-800 hover:bg-black shadow-sm scale-[1.02]"
                                  : "bg-black/[0.03] hover:bg-black/[0.08]"
                              } ${isToday && !booked ? "ring-1 ring-black/20" : ""}`}
                              title={`${r.name} · ${dateFmt(iso)} · ${
                                booked ? "Rezervat" : "Liber"
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Rând de rezumat: grad de ocupare pe zi */}
                  <tr>
                    <td className="sticky left-0 bg-white pt-4 pr-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8a8a] border-t border-black/5">
                      Ocupare %
                    </td>
                    {rangeDays.map((d) => {
                      const iso = toISO(d);
                      const pct = dayOccupancy(iso);
                      return (
                        <td
                          key={iso}
                          className="px-1 pt-4 text-center border-t border-black/5"
                        >
                          <span
                            className={`text-[11px] font-bold ${
                              pct >= 75
                                ? "text-black"
                                : pct > 0
                                  ? "text-[#666]"
                                  : "text-[#ccc]"
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            )}

            {/* Legendă elegantă, B&W */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a8a8a] pt-4 border-t border-black/5">
              <span className="flex items-center gap-2.5">
                <span className="h-3.5 w-6 rounded-md bg-black/[0.03] border border-black/5" />
                Liber
              </span>
              <span className="flex items-center gap-2.5">
                <span className="h-3.5 w-6 rounded-md bg-neutral-800 shadow-sm" />
                Rezervat
              </span>
              <span className="flex items-center gap-2.5">
                <span className="h-3.5 w-6 rounded-md bg-black/[0.03] ring-1 ring-black/20" />
                Astăzi
              </span>
              <div className="ml-auto">
                <Badge tone={statusTone("confirmed")}>Live status</Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
