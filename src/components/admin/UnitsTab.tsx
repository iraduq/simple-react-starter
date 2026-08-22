import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  DoorOpen,
  Search,
  BedDouble,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  User,
  RefreshCw,
} from "lucide-react";
import { Badge, TableSkeleton, EmptyState } from "./ui";
import {
  get,
  post,
  patch,
  del,
  list,
  errMsg,
  dateFmt,
  money,
  nights,
  type Room,
  type RoomUnit,
  type RoomBooking,
} from "../../lib/admin";

import { useToast } from "../Toast";

const roomLabel = (r: Room) =>
  (r.name as string) || (r as any).title || `Cameră #${r.id}`;

const unitLabel = (u: RoomUnit, i: number) =>
  u.unit_number || u.name || u.code || `Unitate ${i + 1}`;

const STATUSES: { value: string; label: string }[] = [
  { value: "active", label: "Activă" },
  { value: "cleaning", label: "Curățenie" },
  { value: "maintenance", label: "Mentenanță" },
];

const statusLabel = (s?: string | null) =>
  STATUSES.find((x) => x.value === s)?.label ||
  (s === undefined || s === null ? "Activă" : s);

const statusTone = (s?: string | null): "green" | "gold" | "red" =>
  !s || s === "active" ? "green" : s === "cleaning" ? "gold" : "red";

const bookingTone = (s?: string | null): "green" | "gold" | "red" | "muted" =>
  s === "confirmed"
    ? "green"
    : s === "pending"
      ? "gold"
      : s === "cancelled"
        ? "red"
        : "muted";

const bookingStatusLabel = (s?: string | null) =>
  s === "confirmed"
    ? "Confirmată"
    : s === "pending"
      ? "În așteptare"
      : s === "cancelled"
        ? "Anulată"
        : s === "completed"
          ? "Finalizată"
          : s || "—";

const guestOf = (b: RoomBooking) => {
  const full = [b.user?.first_name, b.user?.last_name]
    .filter(Boolean)
    .join(" ");
  return (
    b.guest_name ||
    full ||
    null ||
    b.user?.email ||
    b.guest_email ||
    "Oaspete necunoscut"
  );
};

const unitIdOf = (b: RoomBooking) =>
  String(b.unit_id ?? b.room_unit_id ?? b.unit?.id ?? "");

const isOngoing = (b: RoomBooking) => {
  if (!b.check_in || !b.check_out) return false;
  const now = Date.now();
  return (
    new Date(b.check_in).getTime() <= now &&
    new Date(b.check_out).getTime() > now
  );
};

const isUpcoming = (b: RoomBooking) =>
  !!b.check_in && new Date(b.check_in).getTime() > Date.now();

const MONTHS = [
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
const DAYS_SHORT = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"];

const isoOf = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Hartă zi (YYYY-MM-DD) → rezervarea care ocupă noaptea respectivă. */
const occupancyMap = (bs: RoomBooking[]) => {
  const map = new Map<string, RoomBooking>();
  for (const b of bs) {
    if (!b.check_in || !b.check_out) continue;
    const start = new Date(String(b.check_in).slice(0, 10) + "T00:00:00");
    const end = new Date(String(b.check_out).slice(0, 10) + "T00:00:00");
    for (
      let d = new Date(start);
      d < end;
      d.setDate(d.getDate() + 1)
    ) {
      map.set(isoOf(d.getFullYear(), d.getMonth(), d.getDate()), b);
    }
  }
  return map;
};

function UnitCalendar({ bookings }: { bookings: RoomBooking[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const occ = useMemo(() => occupancyMap(bookings), [bookings]);

  const firstDow = new Date(year, month, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const todayIso = isoOf(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const prev = () =>
    month === 0 ? (setMonth(11), setYear(year - 1)) : setMonth(month - 1);
  const next = () =>
    month === 11 ? (setMonth(0), setYear(year + 1)) : setMonth(month + 1);

  const busyDays = cells.filter(
    (d) => d !== null && occ.has(isoOf(year, month, d as number)),
  ).length;

  return (
    <div className="rounded-xl border border-[#e1e8f0] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          className="rounded-lg p-1.5 text-[#4f6280] transition-colors hover:bg-[#f4f7fb] hover:text-[#0d2c5c]"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="text-[13px] font-semibold text-[#0d2c5c]">
          {MONTHS[month]} {year}
          <span className="ml-2 text-[11px] font-normal text-[#8595aa]">
            {busyDays} zile ocupate
          </span>
        </p>
        <button
          type="button"
          onClick={next}
          className="rounded-lg p-1.5 text-[#4f6280] transition-colors hover:bg-[#f4f7fb] hover:text-[#0d2c5c]"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {DAYS_SHORT.map((d) => (
          <span
            key={d}
            className="py-1 text-center text-[9.5px] font-bold tracking-wide text-[#8595aa]"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e-${i}`} />;
          const iso = isoOf(year, month, d);
          const b = occ.get(iso);
          return (
            <span
              key={d}
              title={
                b
                  ? `${guestOf(b)} · ${dateFmt(b.check_in)} → ${dateFmt(b.check_out)}${
                      b.booking_code ? ` · ${b.booking_code}` : ""
                    }`
                  : "Liberă"
              }
              className={`flex h-8 items-center justify-center rounded-lg text-[12px] ${
                b
                  ? b.status === "pending"
                    ? "bg-[#fdf3dc] font-semibold text-[#8a6d2f]"
                    : "bg-[#fde8e8] font-semibold text-[#b42318]"
                  : iso === todayIso
                    ? "font-bold text-[#0d2c5c] ring-1 ring-[#c69a3f]"
                    : "text-[#4f6280]"
              }`}
            >
              {d}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#6b7c99]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#fde8e8]" /> Ocupată
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#fdf3dc]" /> În așteptare
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-1 ring-[#c69a3f]" /> Azi
        </span>
      </div>
    </div>
  );
}

export default function UnitsTab() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [units, setUnits] = useState<RoomUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [unitNumber, setUnitNumber] = useState("");
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [openUnit, setOpenUnit] = useState<string | null>(null);


  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>("/rooms");
      const rs = list<Room>(data);
      setRooms(rs);
      if (rs.length && selectedId === null) setSelectedId(rs[0].id);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };




  const loadUnits = async (roomId: string | number) => {
    setUnitsLoading(true);
    try {
      const room = await get<Room>(`/rooms/${roomId}`);
      setUnits(room?.units || []);
    } catch (e) {
      toast(errMsg(e), "error");
      setUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  };

  const loadBookings = async (roomId: string | number) => {
    setBookingsLoading(true);
    try {
      const data = await get<unknown>(`/rooms/${roomId}/bookings`);
      setBookings(list<RoomBooking>(data));
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId !== null) {
      setOpenUnit(null);
      void loadUnits(selectedId);
      void loadBookings(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => String(r.id) === String(selectedId)) || null,
    [rooms, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => roomLabel(r).toLowerCase().includes(q));
  }, [rooms, query]);

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled"),
    [bookings],
  );

  const bookingsByUnit = useMemo(() => {
    const map = new Map<string, RoomBooking[]>();
    for (const b of activeBookings) {
      const key = unitIdOf(b) || "__unassigned__";
      const arr = map.get(key) || [];
      arr.push(b);
      map.set(key, arr);
    }
    for (const arr of map.values()) {
      arr.sort(
        (a, b) =>
          new Date(a.check_in || 0).getTime() -
          new Date(b.check_in || 0).getTime(),
      );
    }
    return map;
  }, [activeBookings]);

  const unassigned = bookingsByUnit.get("__unassigned__") || [];

  const addUnit = async () => {
    if (!selectedId || !unitNumber.trim()) return;
    if (!bedTypeId) {
      toast("Alege tipul de pat pentru unitate.", "error");
      return;
    }
    setAdding(true);
    try {
      await post(`/rooms/${selectedId}/units`, {
        unit_number: unitNumber.trim(),
        bed_type_id: Number(bedTypeId),
      });
      toast("Unitate adăugată.", "success");
      setUnitNumber("");
      await loadUnits(selectedId);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setAdding(false);
    }
  };

  const changeStatus = async (u: RoomUnit, status: string) => {
    if (!selectedId) return;
    try {
      await patch(`/rooms/${selectedId}/units/${u.id}`, { status });
      toast(`Status actualizat: ${statusLabel(status)}.`, "success");
      await loadUnits(selectedId);
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const removeUnit = async (u: RoomUnit) => {
    if (!selectedId) return;
    try {
      await del(`/rooms/${selectedId}/units/${u.id}`);
      toast("Unitate ștearsă.", "success");
      await loadUnits(selectedId);
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const activeCount = units.filter(
    (u) => !u.status || u.status === "active",
  ).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8595aa]">
            <span className="h-px w-8 bg-[#c69a3f]" /> Inventar
          </span>
          <h2
            className="mt-2 text-[30px] font-semibold text-[#0d2c5c]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Unități fizice
          </h2>
          <p className="mt-1 text-[13px] text-[#6b7c99]">
            Alege o cameră, vezi statusul fiecărei unități și zilele în care e
            ocupată — cu oaspetele aferent.
          </p>
        </div>
        {selectedId !== null && (
          <button
            onClick={() => {
              void loadUnits(selectedId);
              void loadBookings(selectedId);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e1e8f0] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c] transition-all hover:bg-[#f4f7fb]"
          >
            <RefreshCw size={13} /> Reîncarcă
          </button>
        )}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : rooms.length === 0 ? (
        <EmptyState
          title="Nicio cameră"
          hint="Adaugă mai întâi camere din tabul „Camere & foto”."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          {/* Room selector */}
          <div className="rounded-2xl border border-[#e1e8f0] bg-white p-3">
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8595aa]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută cameră…"
                className="w-full rounded-xl border border-[#e1e8f0] bg-[#f7f9fc] py-2.5 pl-9 pr-3 text-[13px] text-[#0d2c5c] outline-none focus:border-[#c69a3f] focus:bg-white"
              />
            </div>
            <div className="max-h-[520px] space-y-1 overflow-y-auto">
              {filtered.map((r) => {
                const active = String(r.id) === String(selectedId);
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition-all ${
                      active
                        ? "bg-[#0d2c5c] text-white shadow-[0_4px_14px_rgba(13,44,92,0.18)]"
                        : "text-[#4f6280] hover:bg-[#f4f7fb] hover:text-[#0d2c5c]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-white/10 text-[#c69a3f]"
                          : "bg-[#f4f7fb] text-[#0d2c5c]"
                      }`}
                    >
                      <BedDouble size={14} strokeWidth={1.75} />
                    </span>
                    <span className="truncate">{roomLabel(r)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Units panel */}
          <div className="rounded-2xl border border-[#e1e8f0] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] px-5 py-4">
              <div>
                <p
                  className="text-[17px] font-semibold text-[#0d2c5c]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {selectedRoom ? roomLabel(selectedRoom) : "—"}
                </p>
                <p className="text-[12px] text-[#6b7c99]">
                  {units.length} unități · {activeCount} active ·{" "}
                  {activeBookings.length} rezervări active
                </p>
              </div>
              <Badge tone={activeCount > 0 ? "green" : "red"}>
                {activeCount > 0 ? "Disponibilă" : "Fără unități active"}
              </Badge>
            </div>

            <div className="px-5 py-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void addUnit();
                  }}
                  placeholder="Număr unitate — ex: 101"
                  className="w-full rounded-xl border border-[#e1e8f0] bg-[#f7f9fc] px-4 py-3 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f] focus:bg-white"
                />
                <button
                  disabled={adding || !unitNumber.trim()}
                  onClick={() => void addUnit()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-[#123a76] disabled:opacity-50"
                >
                  <Plus size={14} /> Adaugă unitate
                </button>
              </div>

              {unitsLoading ? (
                <div className="mt-5">
                  <TableSkeleton />
                </div>
              ) : units.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-[#e1e8f0] bg-[#f9fbfe] py-10 text-center">
                  <DoorOpen
                    size={24}
                    className="mx-auto mb-2 text-[#8595aa]"
                    strokeWidth={1.5}
                  />
                  <p className="text-[13px] text-[#6b7c99]">
                    Nicio unitate pentru această cameră.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-2">
                  {units.map((u, i) => {
                    const uid = String(u.id);
                    const ub = bookingsByUnit.get(uid) || [];
                    const current = ub.find(isOngoing);
                    const next = ub.find(isUpcoming);
                    const expanded = openUnit === uid;
                    return (
                      <div
                        key={u.id}
                        className="rounded-xl border border-[#e1e8f0] bg-white"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f7fb] text-[12px] font-bold text-[#0d2c5c]">
                              {i + 1}
                            </span>
                            <div>
                              <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-[#0d2c5c]">
                                {unitLabel(u, i)}
                                <Badge tone={statusTone(u.status)}>
                                  {statusLabel(u.status)}
                                </Badge>
                                {current ? (
                                  <Badge tone="red">Ocupată acum</Badge>
                                ) : (
                                  <Badge tone="green">Liberă acum</Badge>
                                )}
                              </p>
                              <p className="text-[12px] text-[#6b7c99]">
                                {u.bed_type?.name
                                  ? `${u.bed_type.name} · `
                                  : ""}
                                {current
                                  ? `${guestOf(current)} · până ${dateFmt(current.check_out)}`
                                  : next
                                    ? `Următoarea sosire: ${dateFmt(next.check_in)} — ${guestOf(next)}`
                                    : "Fără rezervări viitoare"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={u.status || "active"}
                              onChange={(e) =>
                                void changeStatus(u, e.target.value)
                              }
                              className="rounded-full border border-[#e1e8f0] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0d2c5c] outline-none"
                            >
                              {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setOpenUnit(expanded ? null : uid)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] transition-all hover:bg-[#f4f7fb]"
                            >
                              <CalendarDays size={12} /> Ocupare ({ub.length})
                              <ChevronDown
                                size={12}
                                className={expanded ? "rotate-180" : ""}
                              />
                            </button>
                            <button
                              onClick={() => void removeUnit(u)}
                              title="Șterge unitatea"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 transition-all hover:bg-red-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {expanded && (
                          <div className="border-t border-[#eef2f7] bg-[#f9fbfe] px-4 py-4">
                            {bookingsLoading ? (
                              <TableSkeleton />
                            ) : ub.length === 0 ? (
                              <p className="text-[13px] text-[#6b7c99]">
                                Nicio rezervare atribuită acestei unități.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {ub.map((b) => (
                                  <div
                                    key={b.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e1e8f0] bg-white px-4 py-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4f7fb] text-[#0d2c5c]">
                                        <User size={13} />
                                      </span>
                                      <div>
                                        <p className="text-[13px] font-semibold text-[#0d2c5c]">
                                          {guestOf(b)}
                                        </p>
                                        <p className="text-[12px] text-[#6b7c99]">
                                          {dateFmt(b.check_in)} →{" "}
                                          {dateFmt(b.check_out)} ·{" "}
                                          {nights(b.check_in, b.check_out)}{" "}
                                          nopți
                                          {b.booking_code
                                            ? ` · ${b.booking_code}`
                                            : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[13px] font-semibold text-[#0d2c5c]">
                                        {money(b.total_price)}
                                      </span>
                                      <Badge tone={bookingTone(b.status)}>
                                        {bookingStatusLabel(b.status)}
                                      </Badge>
                                      {isOngoing(b) && (
                                        <Badge tone="red">În desfășurare</Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {unassigned.length > 0 && (
                <div className="mt-6 rounded-xl border border-[#f2e3c2] bg-[#fffaf0] px-4 py-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a6d2f] mb-3">
                    Rezervări fără unitate atribuită ({unassigned.length})
                  </p>
                  <div className="space-y-2">
                    {unassigned.map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 border border-[#f2e3c2]"
                      >
                        <div>
                          <span className="text-[13px] font-semibold text-[#0d2c5c] block">
                            {guestOf(b)}
                          </span>
                          <span className="text-[12px] text-[#6b7c99]">
                            {dateFmt(b.check_in)} → {dateFmt(b.check_out)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            onChange={async (e) => {
                              const targetUnitId = e.target.value;
                              if (!targetUnitId) return;
                              try {
                                await patch(`/bookings/${b.id}`, {
                                  room_unit_id: targetUnitId,
                                });
                                toast(
                                  "Unitate atribuită cu succes.",
                                  "success",
                                );
                                if (selectedId) {
                                  await loadUnits(selectedId);
                                  await loadBookings(selectedId);
                                }
                              } catch (err) {
                                toast(errMsg(err), "error");
                              }
                            }}
                            defaultValue=""
                            className="rounded-lg border border-[#e1e8f0] bg-[#f7f9fc] px-3 py-1.5 text-[11px] font-bold text-[#0d2c5c] outline-none"
                          >
                            <option value="" disabled>
                              Atribuie unitate...
                            </option>
                            {units.map((u, idx) => (
                              <option key={u.id} value={u.id}>
                                {unitLabel(u, idx)}
                              </option>
                            ))}
                          </select>
                          <Badge tone={bookingTone(b.status)}>
                            {bookingStatusLabel(b.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
