import { useEffect, useMemo, useRef, useState } from "react";
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
  RefreshCw,
  MoreVertical,
  Pencil,
  X,
  Copy,
  Check,
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
  type Nomenclature,
  type AdminUser,
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

function GuestCell({
  b,
  info,
  note,
  onCopy,
}: {
  b: RoomBooking;
  info: { name: string; email: string; userId: string | number | null };
  note?: string;
  onCopy: (v: string | number | null | undefined, label: string) => void;
}) {
  return (
    <span className="block">
      <button
        onClick={() => onCopy(info.userId, "ID Client")}
        title="Click pentru a copia ID-ul clientului"
        className="group inline-flex items-center gap-1.5 text-left hover:opacity-70"
      >
        <span className="text-[13px] font-semibold text-[#111111]">
          {info.name}
        </span>
        {info.userId && (
          <Copy
            size={10}
            className="text-[#8a8a8a] opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
      </button>
      {info.email && (
        <span className="block text-[11px] leading-tight text-[#8a8a8a]">
          {info.email}
        </span>
      )}
      <button
        onClick={() => onCopy(b.id, "ID Rezervare")}
        title="Click pentru a copia ID-ul rezervării"
        className="group inline-flex items-center gap-1 text-left hover:opacity-70"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8a8a]">
          #{String(b.id).slice(0, 8)}
        </span>
        <Copy
          size={9}
          className="text-[#8a8a8a] opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
      {note && (
        <span className="block text-[11px] text-[#6b6b6b]">{note}</span>
      )}
    </span>
  );
}

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

/** Verifică dacă două intervale [check_in, check_out) se suprapun. */
const rangesOverlap = (
  aStart?: string | null,
  aEnd?: string | null,
  bStart?: string | null,
  bEnd?: string | null,
) => {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && bs < ae;
};

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
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      map.set(isoOf(d.getFullYear(), d.getMonth(), d.getDate()), b);
    }
  }
  return map;
};

/** Hartă zi de plecare (check-out) → rezervarea care se încheie în ziua respectivă. */
const departureMap = (bs: RoomBooking[]) => {
  const map = new Map<string, RoomBooking>();
  for (const b of bs) {
    if (!b.check_out) continue;
    map.set(String(b.check_out).slice(0, 10), b);
  }
  return map;
};

function UnitCalendar({ bookings }: { bookings: RoomBooking[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const occ = useMemo(() => occupancyMap(bookings), [bookings]);
  const dep = useMemo(() => departureMap(bookings), [bookings]);

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
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          className="rounded-lg p-1.5 text-[#525252] transition-colors hover:bg-[#f5f5f5] hover:text-[#111111]"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="text-[13px] font-semibold text-[#111111]">
          {MONTHS[month]} {year}
          <span className="ml-2 text-[11px] font-normal text-[#8a8a8a]">
            {busyDays} zile ocupate
          </span>
        </p>
        <button
          type="button"
          onClick={next}
          className="rounded-lg p-1.5 text-[#525252] transition-colors hover:bg-[#f5f5f5] hover:text-[#111111]"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {DAYS_SHORT.map((d) => (
          <span
            key={d}
            className="py-1 text-center text-[9.5px] font-bold tracking-wide text-[#8a8a8a]"
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
          const out = !b ? dep.get(iso) : undefined;
          return (
            <span
              key={d}
              title={
                b
                  ? `${guestOf(b)} · ${dateFmt(b.check_in)} → ${dateFmt(b.check_out)}${
                      b.booking_code ? ` · ${b.booking_code}` : ""
                    }`
                  : out
                    ? `Plecare (check-out) · ${guestOf(out)} · camera se eliberează în această zi${
                        out.booking_code ? ` · ${out.booking_code}` : ""
                      }`
                    : "Liberă"
              }
              className={`flex h-8 items-center justify-center rounded-lg text-[12px] ${
                b
                  ? b.status === "pending"
                    ? "bg-[#ededed] font-semibold text-[#404040]"
                    : "bg-[#262626] font-semibold text-[#ffffff]"
                  : out
                    ? "bg-[#f5f5f5] font-semibold text-[#525252] ring-1 ring-[#d4d4d4]"
                    : iso === todayIso
                      ? "font-bold text-[#111111] ring-1 ring-[#737373]"
                      : "text-[#525252]"
              }`}
            >
              {d}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#6b6b6b]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#262626]" /> Ocupată (noapte)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#ededed]" /> În așteptare
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-[#f5f5f5] ring-1 ring-[#d4d4d4]" />{" "}
          Plecare / eliberare
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-1 ring-[#737373]" /> Azi
        </span>
      </div>
    </div>
  );
}

/** Modal de editare pentru o unitate (număr, tip pat, status). */
function EditUnitModal({
  unit,
  index,
  bedTypes,
  onClose,
  onSave,
}: {
  unit: RoomUnit;
  index: number;
  bedTypes: Nomenclature[];
  onClose: () => void;
  onSave: (payload: {
    unitNumber: string;
    bedTypeId: string;
    status: string;
  }) => Promise<void>;
}) {
  const [unitNumber, setUnitNumber] = useState(unitLabel(unit, index));
  const [bedTypeId, setBedTypeId] = useState(
    unit.bed_type?.id ? String(unit.bed_type.id) : "",
  );
  const [status, setStatus] = useState(unit.status || "active");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!unitNumber.trim()) return;
    setSaving(true);
    try {
      await onSave({ unitNumber: unitNumber.trim(), bedTypeId, status });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <p
            className="text-[16px] font-semibold text-[#111111]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Editează unitatea
          </p>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#8a8a8a] transition-colors hover:bg-[#f5f5f5] hover:text-[#111111]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">
              Număr unitate
            </label>
            <input
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-2.5 text-[14px] text-[#111111] outline-none focus:border-[#737373] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">
              Tip pat
            </label>
            <select
              value={bedTypeId}
              onChange={(e) => setBedTypeId(e.target.value)}
              className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-2.5 text-[14px] text-[#111111] outline-none focus:border-[#737373] focus:bg-white"
            >
              <option value="">Fără tip specificat</option>
              {bedTypes.map((bt) => (
                <option key={bt.id} value={String(bt.id)}>
                  {bt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-2.5 text-[14px] text-[#111111] outline-none focus:border-[#737373] focus:bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#111111] transition-all hover:bg-[#f5f5f5] disabled:opacity-50"
          >
            Anulează
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving || !unitNumber.trim()}
            className="rounded-xl bg-[#111111] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-[#262626] disabled:opacity-50"
          >
            {saving ? "Se salvează…" : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Dropdown cu search pentru atribuirea unei rezervări la o unitate.
 * Arată întâi unitățile libere pentru perioada rezervării, apoi pe cele ocupate
 * (marcate vizual, dar tot selectabile — pentru cazuri de suprascriere manuală).
 */
function AssignUnitDropdown({
  booking,
  units,
  bookingsByUnit,
  onAssign,
  onCancelBooking,
}: {
  booking: RoomBooking;
  units: RoomUnit[];
  bookingsByUnit: Map<string, RoomBooking[]>;
  onAssign: (unitId: string) => void;
  onCancelBooking: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withAvailability = units.map((u, idx) => {
      const uBookings = bookingsByUnit.get(String(u.id)) || [];
      const conflict = uBookings.some(
        (b) =>
          String(b.id) !== String(booking.id) &&
          b.status !== "cancelled" &&
          b.status !== "completed" &&
          rangesOverlap(
            booking.check_in,
            booking.check_out,
            b.check_in,
            b.check_out,
          ),
      );
      return {
        unit: u,
        label: unitLabel(u, idx),
        available: !conflict && (!u.status || u.status === "active"),
      };
    });
    const filtered = q
      ? withAvailability.filter((x) => x.label.toLowerCase().includes(q))
      : withAvailability;
    return filtered.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
  }, [units, bookingsByUnit, booking, query]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[#8a8a8a] transition-all hover:bg-[#e5e5e5] hover:text-[#111111]"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 w-56 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg">
          <div className="border-b border-[#ededed] p-2">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a]"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută unitate…"
                className="w-full rounded-lg border border-[#e5e5e5] bg-[#fafafa] py-1.5 pl-7 pr-2 text-[12px] text-[#111111] outline-none focus:border-[#737373] focus:bg-white"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {ranked.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-[#8a8a8a]">
                Nicio unitate găsită.
              </p>
            ) : (
              ranked.map(({ unit, label, available }) => (
                <button
                  key={unit.id}
                  onClick={() => {
                    onAssign(String(unit.id));
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px] font-medium text-[#111111] hover:bg-[#f5f5f5]"
                >
                  <span className="truncate">{label}</span>
                  {available ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#16a34a]">
                      <Check size={11} /> liberă
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#b91c1c]">
                      ocupată
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-[#ededed] p-1">
            {booking.status === "completed" ||
            booking.status === "cancelled" ? (
              <p className="px-2 py-1.5 text-[11px] text-[#8a8a8a]">
                {booking.status === "completed"
                  ? "Rezervare finalizată — nu mai poate fi anulată."
                  : "Rezervare deja anulată."}
              </p>
            ) : (
              <button
                onClick={() => {
                  onCancelBooking();
                  setOpen(false);
                }}
                className="w-full rounded-lg px-2 py-1.5 text-left text-[12px] font-medium text-[#b91c1c] hover:bg-[#fef2f2]"
              >
                Anulează rezervarea
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnitsTab() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
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
  const [bedTypes, setBedTypes] = useState<Nomenclature[]>([]);
  const [bedTypeId, setBedTypeId] = useState<string>("");

  // State-uri pentru meniuri Dropdown
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null); // Meniul unității
  const [bookingMenuOpenId, setBookingMenuOpenId] = useState<string | null>(
    null,
  ); // Meniul din rezervări (atribuite)

  const [editingUnit, setEditingUnit] = useState<{
    unit: RoomUnit;
    index: number;
  } | null>(null);

  const loadBedTypes = async () => {
    try {
      const data = await get<unknown>("/rooms/bed-types");
      const bts = list<Nomenclature>(data);
      setBedTypes(bts);
      if (bts.length) setBedTypeId((v) => v || String(bts[0].id));
    } catch {
      setBedTypes([]);
    }
  };

  const loadRoomsAndUsers = async () => {
    setLoading(true);
    try {
      const [r, u] = await Promise.all([
        get<unknown>("/rooms"),
        get<unknown>("/users/admin/all"),
      ]);
      const rs = list<Room>(r);
      setRooms(rs);
      setUsers(list<AdminUser>(u));
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
    void loadRoomsAndUsers();
    void loadBedTypes();
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

  // Închide meniurile de 3 puncte la click în exterior
  useEffect(() => {
    if (!menuOpenId && !bookingMenuOpenId) return;
    const close = () => {
      setMenuOpenId(null);
      setBookingMenuOpenId(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpenId, bookingMenuOpenId]);

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
    setAdding(true);
    try {
      await post(`/rooms/${selectedId}/units`, {
        unit_number: unitNumber.trim(),
        bed_type_id: bedTypeId ? Number(bedTypeId) : 1,
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

  const saveUnitEdits = async (
    u: RoomUnit,
    payload: { unitNumber: string; bedTypeId: string; status: string },
  ) => {
    if (!selectedId) return;
    try {
      const body: Record<string, unknown> = {};
      if (payload.unitNumber && payload.unitNumber !== u.unit_number) {
        body.unit_number = payload.unitNumber;
      }
      if (
        payload.bedTypeId &&
        payload.bedTypeId !== String(u.bed_type?.id ?? "")
      ) {
        body.bed_type_id = Number(payload.bedTypeId);
      }
      if (payload.status && payload.status !== (u.status || "active")) {
        body.status = payload.status;
      }
      if (Object.keys(body).length > 0) {
        await patch(`/rooms/${selectedId}/units/${u.id}`, body);
        toast("Unitate actualizată.", "success");
        await loadUnits(selectedId);
      }
      setEditingUnit(null);
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  // FUNCȚII PENTRU REZERVĂRI (Atribuire și Anulare via Dropdown)
  const assignUnitToBooking = async (
    bookingId: string | number,
    unitId: string | null,
  ) => {
    try {
      await patch(`/bookings/${bookingId}`, { room_unit_id: unitId });
      toast(
        unitId
          ? "Unitate atribuită cu succes."
          : "Rezervare scoasă de pe unitate.",
        "success",
      );
      if (selectedId) {
        await loadUnits(selectedId);
        await loadBookings(selectedId);
      }
    } catch (err) {
      toast(errMsg(err), "error");
    }
  };

  const handleCancelBooking = async (bookingId: string | number) => {
    if (!window.confirm("Ești sigur că vrei să anulezi această rezervare?"))
      return;
    try {
      // Endpoint-ul POST /bookings/:id/cancel verifică ownership-ul
      // (guest-ul propriu) și respinge cu 403 apelurile de admin.
      // PATCH /bookings/:id merge deja cu drepturi de admin (folosit și
      // pentru room_unit_id), deci trecem și anularea prin el.
      await patch(`/bookings/${bookingId}`, { status: "cancelled" });
      toast("Rezervare anulată.", "success");
      if (selectedId) {
        await loadUnits(selectedId);
        await loadBookings(selectedId);
      }
    } catch (err) {
      toast(errMsg(err), "error");
    }
  };

  const copyToClipboard = (text: string | number | null | undefined, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    toast(`${label} copiat în clipboard!`, "success");
  };

  const guestInfo = (b: RoomBooking) => {
    const userObj = users.find(
      (u: any) => String(u.id) === String((b as any).user_id),
    ) as any;
    const email =
      b.user_email || b.guest_email || b.user?.email || userObj?.email || "";
    let name =
      b.guest_name ||
      b.user_name ||
      [b.user?.first_name, b.user?.last_name].filter(Boolean).join(" ").trim() ||
      [userObj?.first_name, userObj?.last_name].filter(Boolean).join(" ").trim();
    if (!name && email) {
      const local = email.split("@")[0];
      name = local.charAt(0).toUpperCase() + local.slice(1);
    }
    return {
      name: name || "Oaspete necunoscut",
      email: email || "",
      userId: (b as any).user_id ?? userObj?.id ?? null,
    };
  };

  const activeCount = units.filter(
    (u) => !u.status || u.status === "active" || u.status === "cleaning",
  ).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a8a8a]">
            <span className="h-px w-8 bg-[#737373]" /> Inventar
          </span>
          <h2
            className="mt-2 text-[30px] font-semibold text-[#111111]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Unități fizice
          </h2>
          <p className="mt-1 text-[13px] text-[#6b6b6b]">
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
            className="inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#111111] transition-all hover:bg-[#f5f5f5]"
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
          <div className="rounded-2xl border border-[#e5e5e5] bg-white p-3">
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută cameră…"
                className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] py-2.5 pl-9 pr-3 text-[13px] text-[#111111] outline-none focus:border-[#737373] focus:bg-white"
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
                        ? "bg-[#111111] text-white shadow-[0_4px_14px_rgba(13,44,92,0.18)]"
                        : "text-[#525252] hover:bg-[#f5f5f5] hover:text-[#111111]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-white/10 text-[#737373]"
                          : "bg-[#f5f5f5] text-[#111111]"
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
          <div className="rounded-2xl border border-[#e5e5e5] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ededed] px-5 py-4">
              <div>
                <p
                  className="text-[17px] font-semibold text-[#111111]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {selectedRoom ? roomLabel(selectedRoom) : "—"}
                </p>
                <p className="text-[12px] text-[#6b6b6b]">
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
                  className="w-full rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-[14px] text-[#111111] outline-none focus:border-[#737373] focus:bg-white"
                />
                <select
                  value={bedTypeId}
                  onChange={(e) => setBedTypeId(e.target.value)}
                  className="shrink-0 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 text-[14px] text-[#111111] outline-none focus:border-[#737373] focus:bg-white sm:w-[190px]"
                >
                  <option value="">Tip pat (opțional)</option>
                  {bedTypes.map((bt) => (
                    <option key={bt.id} value={String(bt.id)}>
                      {bt.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={adding || !unitNumber.trim()}
                  onClick={() => void addUnit()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-[#262626] disabled:opacity-50"
                >
                  <Plus size={14} /> Adaugă unitate
                </button>
              </div>

              {unitsLoading ? (
                <div className="mt-5">
                  <TableSkeleton />
                </div>
              ) : units.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-[#e5e5e5] bg-[#fafafa] py-10 text-center">
                  <DoorOpen
                    size={24}
                    className="mx-auto mb-2 text-[#8a8a8a]"
                    strokeWidth={1.5}
                  />
                  <p className="text-[13px] text-[#6b6b6b]">
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
                    const menuOpen = menuOpenId === uid;

                    return (
                      <div
                        key={u.id}
                        className="rounded-xl border border-[#e5e5e5] bg-white"
                      >
                        <div
                          onClick={() => setOpenUnit(expanded ? null : uid)}
                          className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#fafafa]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[12px] font-bold text-[#111111]">
                              {i + 1}
                            </span>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[14px] font-semibold text-[#111111]">
                                  {unitLabel(u, i)}
                                </span>
                                <span className="text-[13px] font-medium text-[#525252]">
                                  {u.bed_type?.name || "Fără pat specificat"}
                                </span>

                                <Badge tone={statusTone(u.status)}>
                                  {statusLabel(u.status)}
                                </Badge>
                                {current ? (
                                  <Badge tone="red">Ocupată acum</Badge>
                                ) : (
                                  <Badge tone="green">Liberă acum</Badge>
                                )}
                              </div>
                              <p className="text-[12px] text-[#6b6b6b] mt-1 pl-2">
                                {current
                                  ? `${guestInfo(current).name} · până ${dateFmt(current.check_out)}`
                                  : next
                                    ? `Următoarea sosire: ${dateFmt(next.check_in)} — ${guestInfo(next).name}`
                                    : "Fără rezervări viitoare"}
                              </p>
                            </div>
                          </div>
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={u.status || "active"}
                              onChange={(e) =>
                                void changeStatus(u, e.target.value)
                              }
                              className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#111111] outline-none"
                            >
                              {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setOpenUnit(expanded ? null : uid)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#111111] transition-all hover:bg-[#f5f5f5]"
                            >
                              <CalendarDays size={12} /> Ocupare ({ub.length})
                              <ChevronDown
                                size={12}
                                className={expanded ? "rotate-180" : ""}
                              />
                            </button>

                            {/* Meniu cu 3 puncte: Editează / Șterge UNITATE */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setMenuOpenId(menuOpen ? null : uid)
                                }
                                title="Mai multe acțiuni"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] text-[#525252] transition-all hover:bg-[#f5f5f5] hover:text-[#111111]"
                              >
                                <MoreVertical size={15} />
                              </button>
                              {menuOpen && (
                                <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg py-1">
                                  <button
                                    onClick={() => {
                                      setMenuOpenId(null);
                                      setEditingUnit({ unit: u, index: i });
                                    }}
                                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-[#111111] transition-colors hover:bg-[#f5f5f5]"
                                  >
                                    <Pencil size={13} /> Editează
                                  </button>
                                  <div className="border-t border-[#ededed] mt-1 pt-1">
                                    <button
                                      onClick={() => {
                                        setMenuOpenId(null);
                                        void removeUnit(u);
                                      }}
                                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-[#b91c1c] transition-colors hover:bg-[#fef2f2]"
                                    >
                                      <Trash2 size={13} /> Șterge unitatea
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* DETALII REZERVĂRI ATRIBUITE UNITĂȚII */}
                        {expanded && (
                          <div className="border-t border-[#ededed] bg-[#fafafa] px-4 py-4">
                            <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_330px]">
                              <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#e5e5e5] bg-white p-4 sm:grid-cols-3">
                                {[
                                  { l: "Unitate", v: unitLabel(u, i) },
                                  { l: "ID", v: uid.slice(0, 8) },
                                  {
                                    l: "Tip pat",
                                    v: u.bed_type?.name || "—",
                                  },
                                  {
                                    l: "Capacitate",
                                    v: u.bed_type?.capacity
                                      ? `${u.bed_type.capacity} pers.`
                                      : "—",
                                  },
                                  { l: "Status", v: statusLabel(u.status) },
                                  {
                                    l: "Rezervări active",
                                    v: String(ub.length),
                                  },
                                  {
                                    l: "Ocupată acum",
                                    v: current ? (
                                      <GuestCell
                                        b={current}
                                        info={guestInfo(current)}
                                        note={`până ${dateFmt(current.check_out)}`}
                                        onCopy={copyToClipboard}
                                      />
                                    ) : (
                                      "Nu"
                                    ),
                                  },
                                  {
                                    l: "Următoarea sosire",
                                    v: next ? (
                                      <GuestCell
                                        b={next}
                                        info={guestInfo(next)}
                                        note={`sosire ${dateFmt(next.check_in)}`}
                                        onCopy={copyToClipboard}
                                      />
                                    ) : (
                                      "—"
                                    ),
                                  },
                                  {
                                    l: "Nopți rezervate",
                                    v: String(
                                      ub.reduce(
                                        (s, b) =>
                                          s + nights(b.check_in, b.check_out),
                                        0,
                                      ),
                                    ),
                                  },
                                ].map((f: { l: string; v: any }) => (
                                  <div key={f.l}>
                                    <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">
                                      {f.l}
                                    </p>
                                    <p className="mt-0.5 text-[13px] font-medium text-[#111111]">
                                      {f.v}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <UnitCalendar bookings={ub} />
                            </div>

                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a8a8a]">
                              Rezervări pe această unitate
                            </p>
                            {bookingsLoading ? (
                              <TableSkeleton />
                            ) : ub.length === 0 ? (
                              <p className="text-[13px] text-[#6b6b6b]">
                                Nicio rezervare atribuită acestei unități.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {ub.map((b) => {
                                  const userObj = users.find(
                                    (uObj: any) =>
                                      String(uObj.id) === String(b.user_id),
                                  );
                                  const shortBookingId =
                                    String(b.id).length > 8
                                      ? String(b.id).substring(0, 8) + "..."
                                      : String(b.id);
                                  const rawEmail =
                                    b.user_email ||
                                    b.guest_email ||
                                    userObj?.email ||
                                    "";
                                  const displayEmail = rawEmail || "—";
                                  let displayName =
                                    b.guest_name || b.user_name || "";

                                  if (!displayName && userObj) {
                                    displayName =
                                      `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim();
                                  }
                                  if (!displayName && rawEmail) {
                                    displayName = rawEmail.split("@")[0];
                                    displayName =
                                      displayName.charAt(0).toUpperCase() +
                                      displayName.slice(1);
                                  } else if (!displayName) {
                                    displayName = "Client Necunoscut";
                                  }

                                  const bMenuOpen =
                                    bookingMenuOpenId === String(b.id);

                                  return (
                                    <div
                                      key={b.id}
                                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2.5"
                                    >
                                      <div className="flex items-start gap-2">
                                        <div className="flex flex-col items-start gap-0.5">
                                          {/* ID REZERVARE */}
                                          <button
                                            onClick={() =>
                                              copyToClipboard(
                                                String(b.id),
                                                "ID Rezervare",
                                              )
                                            }
                                            className="group flex items-center gap-1.5 text-left transition-all hover:opacity-70"
                                            title="Click pentru a copia ID-ul rezervării"
                                          >
                                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8a8a8a]">
                                              #{shortBookingId}
                                            </span>
                                            <Copy
                                              size={9}
                                              className="text-[#8a8a8a] opacity-0 transition-opacity group-hover:opacity-100"
                                            />
                                          </button>

                                          {/* NUME */}
                                          <button
                                            onClick={() =>
                                              copyToClipboard(
                                                b.user_id,
                                                "ID Client",
                                              )
                                            }
                                            className="group flex items-center gap-1.5 text-left transition-all hover:opacity-70"
                                            title="Click pentru a copia ID-ul clientului"
                                          >
                                            <span className="block text-[13px] font-semibold text-black">
                                              {displayName}
                                            </span>
                                            {b.user_id && (
                                              <Copy
                                                size={10}
                                                className="text-[#8a8a8a] opacity-0 transition-opacity group-hover:opacity-100"
                                              />
                                            )}
                                          </button>

                                          {/* EMAIL */}
                                          {rawEmail && (
                                            <span className="text-[12px] text-[#8a8a8a] block leading-tight">
                                              {displayEmail}
                                            </span>
                                          )}

                                          {/* PERIOADA */}
                                          <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                                            {dateFmt(b.check_in)} →{" "}
                                            {dateFmt(b.check_out)} ·{" "}
                                            {nights(b.check_in, b.check_out)}{" "}
                                            nopți
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-semibold text-[#111111] mr-1">
                                          {money(b.total_price)}
                                        </span>
                                        <Badge tone={bookingTone(b.status)}>
                                          {bookingStatusLabel(b.status)}
                                        </Badge>
                                        {isOngoing(b) && (
                                          <Badge tone="red">Live</Badge>
                                        )}

                                        {/* DROPDOWN REZERVARE ATRIBUITA */}
                                        <div className="relative ml-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setBookingMenuOpenId(
                                                bMenuOpen ? null : String(b.id),
                                              );
                                            }}
                                            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[#8a8a8a] transition-all hover:bg-[#f5f5f5] hover:text-[#111111]"
                                          >
                                            <MoreVertical size={14} />
                                          </button>

                                          {bMenuOpen && (
                                            <div className="absolute right-0 top-7 z-50 w-44 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-lg py-1">
                                              <button
                                                onClick={() => {
                                                  assignUnitToBooking(
                                                    b.id,
                                                    null,
                                                  );
                                                  setBookingMenuOpenId(null);
                                                }}
                                                className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-[#111111] hover:bg-[#f5f5f5]"
                                              >
                                                Dez-atribuie unitatea
                                              </button>

                                              <div className="border-t border-[#ededed] mt-1 pt-1">
                                                {b.status === "completed" ||
                                                b.status === "cancelled" ? (
                                                  <p className="px-3 py-1.5 text-[11px] text-[#8a8a8a]">
                                                    {b.status === "completed"
                                                      ? "Finalizată — nu mai poate fi anulată."
                                                      : "Deja anulată."}
                                                  </p>
                                                ) : (
                                                  <button
                                                    onClick={() => {
                                                      handleCancelBooking(b.id);
                                                      setBookingMenuOpenId(
                                                        null,
                                                      );
                                                    }}
                                                    className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-[#b91c1c] hover:bg-[#fef2f2]"
                                                  >
                                                    Anulează rezervarea
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
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
                <div className="mt-6 rounded-xl border border-[#e5e5e5] bg-[#fafafa] px-4 py-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#404040] mb-3">
                    Rezervări fără unitate atribuită ({unassigned.length})
                  </p>
                  <div className="space-y-2">
                    {unassigned.map((b) => {
                      const userObj = users.find(
                        (uObj: any) => String(uObj.id) === String(b.user_id),
                      );
                      const shortBookingId =
                        String(b.id).length > 8
                          ? String(b.id).substring(0, 8) + "..."
                          : String(b.id);
                      const rawEmail =
                        b.user_email || b.guest_email || userObj?.email || "";
                      const displayEmail = rawEmail || "—";
                      let displayName = b.guest_name || b.user_name || "";

                      if (!displayName && userObj) {
                        displayName =
                          `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim();
                      }
                      if (!displayName && rawEmail) {
                        displayName = rawEmail.split("@")[0];
                        displayName =
                          displayName.charAt(0).toUpperCase() +
                          displayName.slice(1);
                      } else if (!displayName) {
                        displayName = "Client Necunoscut";
                      }

                      return (
                        <div
                          key={b.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 border border-[#e5e5e5]"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex flex-col items-start gap-0.5">
                              {/* ID REZERVARE */}
                              <button
                                onClick={() =>
                                  copyToClipboard(String(b.id), "ID Rezervare")
                                }
                                className="group flex items-center gap-1.5 text-left transition-all hover:opacity-70"
                                title="Click pentru a copia ID-ul rezervării"
                              >
                                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8a8a8a]">
                                  #{shortBookingId}
                                </span>
                                <Copy
                                  size={9}
                                  className="text-[#8a8a8a] opacity-0 transition-opacity group-hover:opacity-100"
                                />
                              </button>

                              {/* NUME */}
                              <button
                                onClick={() =>
                                  copyToClipboard(b.user_id, "ID Client")
                                }
                                className="group flex items-center gap-1.5 text-left transition-all hover:opacity-70"
                                title="Click pentru a copia ID-ul clientului"
                              >
                                <span className="block text-[13px] font-semibold text-black">
                                  {displayName}
                                </span>
                                {b.user_id && (
                                  <Copy
                                    size={10}
                                    className="text-[#8a8a8a] opacity-0 transition-opacity group-hover:opacity-100"
                                  />
                                )}
                              </button>

                              {/* EMAIL */}
                              {rawEmail && (
                                <span className="text-[12px] text-[#8a8a8a] block leading-tight">
                                  {displayEmail}
                                </span>
                              )}

                              {/* PERIOADA & NOPTI */}
                              <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                                {dateFmt(b.check_in)} → {dateFmt(b.check_out)} ·{" "}
                                {nights(b.check_in, b.check_out)} nopți
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge tone={bookingTone(b.status)}>
                              {bookingStatusLabel(b.status)}
                            </Badge>

                            {/* DROPDOWN CU SEARCH: ATRIBUIE LA UNITATE */}
                            <AssignUnitDropdown
                              booking={b}
                              units={units}
                              bookingsByUnit={bookingsByUnit}
                              onAssign={(unitId) =>
                                assignUnitToBooking(b.id, unitId)
                              }
                              onCancelBooking={() => handleCancelBooking(b.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingUnit && (
        <EditUnitModal
          unit={editingUnit.unit}
          index={editingUnit.index}
          bedTypes={bedTypes}
          onClose={() => setEditingUnit(null)}
          onSave={(payload) => saveUnitEdits(editingUnit.unit, payload)}
        />
      )}
    </div>
  );
}
