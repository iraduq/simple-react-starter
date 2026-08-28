import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          className="rounded-lg p-1.5 text-black/60 transition-colors hover:bg-black/5 hover:text-black"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="text-[13px] font-semibold text-black">
          {MONTHS[month]} {year}
          <span className="ml-2 text-[11px] font-normal text-black/40">
            {busyDays} zile ocupate
          </span>
        </p>
        <button
          type="button"
          onClick={next}
          className="rounded-lg p-1.5 text-black/60 transition-colors hover:bg-black/5 hover:text-black"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {DAYS_SHORT.map((d) => (
          <span
            key={d}
            className="py-1 text-center text-[9.5px] font-bold tracking-wide text-black/40"
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
                    ? "bg-black/10 font-semibold text-black/70"
                    : "bg-black font-semibold text-white"
                  : out
                    ? "bg-black/5 font-semibold text-black/60 ring-1 ring-black/15"
                    : iso === todayIso
                      ? "font-bold text-black ring-1 ring-black/40"
                      : "text-black/60"
              }`}
            >
              {d}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-black/50">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-black" /> Ocupată (noapte)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-black/10" /> În așteptare
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-black/5 ring-1 ring-black/15" />{" "}
          Plecare / eliberare
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded ring-1 ring-black/40" /> Azi
        </span>
      </div>
    </div>
  );
}

function EditUnitModal({
  unit,
  index,
  onClose,
  onSave,
}: {
  unit: RoomUnit;
  index: number;
  onClose: () => void;
  onSave: (payload: { unitNumber: string; status: string }) => Promise<void>;
}) {
  const [unitNumber, setUnitNumber] = useState(unitLabel(unit, index));
  const [status, setStatus] = useState(unit.status || "active");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!unitNumber.trim()) return;
    setSaving(true);
    try {
      await onSave({ unitNumber: unitNumber.trim(), status });
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
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <p
            className="text-[16px] font-semibold text-black"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Editează unitatea
          </p>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-black/40 transition-colors hover:bg-black/5 hover:text-black"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">
              Număr unitate
            </label>
            <input
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[14px] text-black outline-none focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[14px] text-black outline-none focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
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
            className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition-all hover:bg-black/5 disabled:opacity-50"
          >
            Anulează
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving || !unitNumber.trim()}
            className="rounded-xl bg-black px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Se salvează…" : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-black/40 transition-all hover:bg-black/5 hover:text-black"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 w-56 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg">
          <div className="border-b border-black/5 p-2">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută unitate…"
                className="w-full rounded-lg border border-black/10 bg-white py-1.5 pl-7 pr-2 text-[12px] text-black outline-none focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {ranked.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-black/40">
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
                  className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px] font-medium text-black hover:bg-black/5"
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

          <div className="border-t border-black/5 p-1">
            {booking.status === "completed" ||
            booking.status === "cancelled" ? (
              <p className="px-2 py-1.5 text-[11px] text-black/40">
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
                className="w-full rounded-lg px-2 py-1.5 text-left text-[12px] font-medium text-[#b91c1c] hover:bg-red-50"
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

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [bookingMenuOpenId, setBookingMenuOpenId] = useState<string | null>(
    null,
  );

  const [editingUnit, setEditingUnit] = useState<{
    unit: RoomUnit;
    index: number;
  } | null>(null);

  const loadRoomsAndUsers = useCallback(async () => {
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
  }, [selectedId, toast]);

  const loadUnits = useCallback(
    async (roomId: string | number) => {
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
    },
    [toast],
  );

  const loadBookings = useCallback(async (roomId: string | number) => {
    setBookingsLoading(true);
    try {
      const data = await get<unknown>(`/rooms/${roomId}/bookings`);
      setBookings(list<RoomBooking>(data));
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoomsAndUsers();
  }, [loadRoomsAndUsers]);

  useEffect(() => {
    if (selectedId !== null) {
      setOpenUnit(null);
      void loadUnits(selectedId);
      void loadBookings(selectedId);
    }
  }, [selectedId, loadUnits, loadBookings]);

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
    payload: { unitNumber: string; status: string },
  ) => {
    if (!selectedId) return;
    try {
      const body: Record<string, unknown> = {};
      if (payload.unitNumber && payload.unitNumber !== u.unit_number) {
        body.unit_number = payload.unitNumber;
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

  const assignUnitToBooking = async (
    bookingId: string,
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Ești sigur că vrei să anulezi această rezervare?"))
      return;
    try {
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

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast(`${label} copiat în clipboard!`, "success");
  };

  const activeCount = units.filter(
    (u) => !u.status || u.status === "active" || u.status === "cleaning",
  ).length;

  return (
    <div className="w-full min-h-screen bg-white text-black p-4 sm:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-10 bg-white">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-black/40">
              <span className="h-px w-8 bg-black/40" /> Inventar
            </span>
            <h2
              className="mt-2 text-[30px] font-semibold text-black"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Unități fizice
            </h2>
            <p className="mt-1 text-[13px] text-black/60">
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
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black transition-all hover:bg-black/5"
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
            <div className="rounded-2xl border border-black/10 bg-white p-3">
              <div className="relative mb-3">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Caută cameră…"
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-[13px] text-black outline-none focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] placeholder:text-black/40"
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
                          ? "bg-black text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
                          : "text-black/70 hover:bg-black/5 hover:text-black"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-white/10 text-white/70"
                            : "bg-black/5 text-black"
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

            <div className="rounded-2xl border border-black/10 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
                <div>
                  <p
                    className="text-[17px] font-semibold text-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {selectedRoom ? roomLabel(selectedRoom) : "—"}
                  </p>
                  <p className="text-[12px] text-black/60">
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
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black outline-none focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] placeholder:text-black/40"
                  />
                  <button
                    disabled={adding || !unitNumber.trim()}
                    onClick={() => void addUnit()}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <Plus size={14} /> Adaugă unitate
                  </button>
                </div>

                {unitsLoading ? (
                  <div className="mt-5">
                    <TableSkeleton />
                  </div>
                ) : units.length === 0 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-black/10 bg-white py-10 text-center">
                    <DoorOpen
                      size={24}
                      className="mx-auto mb-2 text-black/40"
                      strokeWidth={1.5}
                    />
                    <p className="text-[13px] text-black/60">
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
                          className="rounded-xl border border-black/10 bg-white"
                        >
                          <div
                            onClick={() => setOpenUnit(expanded ? null : uid)}
                            className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-black/[0.02]"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-[12px] font-bold text-black">
                                {i + 1}
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[14px] font-semibold text-black">
                                    {unitLabel(u, i)}
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
                                <p className="text-[12px] text-black/60 mt-1 pl-2">
                                  {current
                                    ? `${guestOf(current)} · până ${dateFmt(current.check_out)}`
                                    : next
                                      ? `Următoarea sosire: ${dateFmt(next.check_in)} — ${guestOf(next)}`
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
                                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-black outline-none focus:border-black/30"
                              >
                                {STATUSES.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() =>
                                  setOpenUnit(expanded ? null : uid)
                                }
                                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:bg-black/5"
                              >
                                <CalendarDays size={12} /> Ocupare ({ub.length})
                                <ChevronDown
                                  size={12}
                                  className={expanded ? "rotate-180" : ""}
                                />
                              </button>

                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setMenuOpenId(menuOpen ? null : uid)
                                  }
                                  title="Mai multe acțiuni"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition-all hover:bg-black/5 hover:text-black"
                                >
                                  <MoreVertical size={15} />
                                </button>
                                {menuOpen && (
                                  <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg py-1">
                                    <button
                                      onClick={() => {
                                        setMenuOpenId(null);
                                        setEditingUnit({ unit: u, index: i });
                                      }}
                                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-black transition-colors hover:bg-black/5"
                                    >
                                      <Pencil size={13} /> Editează
                                    </button>
                                    <div className="border-t border-black/5 mt-1 pt-1">
                                      <button
                                        onClick={() => {
                                          setMenuOpenId(null);
                                          void removeUnit(u);
                                        }}
                                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[12.5px] font-medium text-red-600 transition-colors hover:bg-red-50"
                                      >
                                        <Trash2 size={13} /> Șterge unitatea
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {expanded && (
                            <div className="border-t border-black/5 bg-white px-4 py-4">
                              <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_330px]">
                                <div className="grid grid-cols-2 gap-4 rounded-xl border border-black/10 bg-white p-4 sm:grid-cols-3">
                                  {[
                                    { l: "Unitate", v: unitLabel(u, i) },
                                    { l: "ID", v: uid.slice(0, 8) },
                                    { l: "Status", v: statusLabel(u.status) },
                                    {
                                      l: "Rezervări active",
                                      v: String(ub.length),
                                    },
                                    {
                                      l: "Ocupată acum",
                                      v: current
                                        ? `${guestOf(current)} → ${dateFmt(current.check_out)}`
                                        : "Nu",
                                    },
                                    {
                                      l: "Următoarea sosire",
                                      v: next
                                        ? `${dateFmt(next.check_in)} — ${guestOf(next)}`
                                        : "—",
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
                                  ].map((f) => (
                                    <div key={f.l}>
                                      <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-black/40">
                                        {f.l}
                                      </p>
                                      <p className="mt-0.5 text-[13px] font-medium text-black">
                                        {f.v}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                <UnitCalendar bookings={ub} />
                              </div>

                              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">
                                Rezervări pe această unitate
                              </p>
                              {bookingsLoading ? (
                                <TableSkeleton />
                              ) : ub.length === 0 ? (
                                <p className="text-[13px] text-black/60">
                                  Nicio rezervare atribuită acestei unități.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {ub.map((b) => {
                                    const userObj = users.find(
                                      (uObj) =>
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
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-3 py-2.5"
                                      >
                                        <div className="flex items-start gap-2">
                                          <div className="flex flex-col items-start gap-0.5">
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
                                              <span className="text-[9.5px] font-bold uppercase tracking-wider text-black/40">
                                                #{shortBookingId}
                                              </span>
                                              <Copy
                                                size={9}
                                                className="text-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                              />
                                            </button>

                                            <button
                                              onClick={() =>
                                                copyToClipboard(
                                                  String(b.user_id || ""),
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
                                                  className="text-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                                />
                                              )}
                                            </button>

                                            {rawEmail && (
                                              <span className="text-[12px] text-black/40 block leading-tight">
                                                {displayEmail}
                                              </span>
                                            )}

                                            <p className="text-[11px] text-black/60 mt-0.5">
                                              {dateFmt(b.check_in)} →{" "}
                                              {dateFmt(b.check_out)} ·{" "}
                                              {nights(b.check_in, b.check_out)}{" "}
                                              nopți
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[12px] font-semibold text-black mr-1">
                                            {money(b.total_price)}
                                          </span>
                                          <Badge tone={bookingTone(b.status)}>
                                            {bookingStatusLabel(b.status)}
                                          </Badge>
                                          {isOngoing(b) && (
                                            <Badge tone="red">Live</Badge>
                                          )}

                                          <div className="relative ml-1">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setBookingMenuOpenId(
                                                  bMenuOpen
                                                    ? null
                                                    : String(b.id),
                                                );
                                              }}
                                              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-black/40 transition-all hover:bg-black/5 hover:text-black"
                                            >
                                              <MoreVertical size={14} />
                                            </button>

                                            {bMenuOpen && (
                                              <div className="absolute right-0 top-7 z-50 w-44 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg py-1">
                                                <button
                                                  onClick={() => {
                                                    assignUnitToBooking(
                                                      String(b.id),
                                                      null,
                                                    );
                                                    setBookingMenuOpenId(null);
                                                  }}
                                                  className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-black hover:bg-black/5"
                                                >
                                                  Dez-atribuie unitatea
                                                </button>

                                                <div className="border-t border-black/5 mt-1 pt-1">
                                                  {b.status === "completed" ||
                                                  b.status === "cancelled" ? (
                                                    <p className="px-3 py-1.5 text-[11px] text-black/40">
                                                      {b.status === "completed"
                                                        ? "Finalizată — nu mai poate fi anulată."
                                                        : "Deja anulată."}
                                                    </p>
                                                  ) : (
                                                    <button
                                                      onClick={() => {
                                                        handleCancelBooking(
                                                          String(b.id),
                                                        );
                                                        setBookingMenuOpenId(
                                                          null,
                                                        );
                                                      }}
                                                      className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-50"
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
                  <div className="mt-6 rounded-xl border border-black/10 bg-white px-4 py-4">
                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-black/70 mb-3">
                      Rezervări fără unitate atribuită ({unassigned.length})
                    </p>
                    <div className="space-y-2">
                      {unassigned.map((b) => {
                        const userObj = users.find(
                          (uObj) => String(uObj.id) === String(b.user_id),
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
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 border border-black/10"
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex flex-col items-start gap-0.5">
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
                                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-black/40">
                                    #{shortBookingId}
                                  </span>
                                  <Copy
                                    size={9}
                                    className="text-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                  />
                                </button>

                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      String(b.user_id || ""),
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
                                      className="text-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                    />
                                  )}
                                </button>

                                {rawEmail && (
                                  <span className="text-[12px] text-black/40 block leading-tight">
                                    {displayEmail}
                                  </span>
                                )}

                                <p className="text-[11px] text-black/60 mt-0.5">
                                  {dateFmt(b.check_in)} → {dateFmt(b.check_out)}{" "}
                                  · {nights(b.check_in, b.check_out)} nopți
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge tone={bookingTone(b.status)}>
                                {bookingStatusLabel(b.status)}
                              </Badge>

                              <AssignUnitDropdown
                                booking={b}
                                units={units}
                                bookingsByUnit={bookingsByUnit}
                                onAssign={(unitId) =>
                                  assignUnitToBooking(String(b.id), unitId)
                                }
                                onCancelBooking={() =>
                                  handleCancelBooking(String(b.id))
                                }
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
            onClose={() => setEditingUnit(null)}
            onSave={(payload) => saveUnitEdits(editingUnit.unit, payload)}
          />
        )}
      </div>
    </div>
  );
}
