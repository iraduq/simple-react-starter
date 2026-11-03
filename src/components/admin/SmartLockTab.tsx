import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  KeyRound,
  Radio,
  RefreshCw,
  DoorOpen,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Wifi,
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";
import { Card, SectionHeader, Button, Badge } from "./ui";
import SmartLockKeypad from "../SmartLockKeypad";
import { useToast } from "../Toast";
import { WS_URL } from "../../lib/config";
import {
  get,
  list,
  type RoomUnit,
  type RoomBooking,
  type Room,
} from "../../lib/admin";

interface LiveEvent {
  id: string;
  type:
    | "door_unlocked"
    | "guest_checked_in"
    | "room_held"
    | "room_released"
    | "payment_confirmed"
    | "new_booking"
    | "room_booked"
    | "info";
  message: string;
  timestamp: string;
  unit?: string;
}

const DOOR_PAGE_SIZE = 8;
const TABLE_PAGE_SIZE = 8;
const EVENTS_PAGE_SIZE = 2;

export default function SmartLockTab() {
  const { toast } = useToast();

  const [units, setUnits] = useState<RoomUnit[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string>("101");

  // Search & Pagination — Left Side (Keypad Selector)
  const [doorSearch, setDoorSearch] = useState("");
  const [doorPage, setDoorPage] = useState(1);

  // Search, Filter & Pagination — Right Side (Table)
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "occupied" | "arriving_today" | "vacant">("all");
  const [tablePage, setTablePage] = useState(1);

  // WebSocket Live Feed State
  const [wsConnected, setWsConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [eventsPage, setEventsPage] = useState(1);
  const wsRef = useRef<WebSocket | null>(null);

  // Copied PIN indicator
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedRooms, fetchedBookings] = await Promise.all([
        get<Room[]>("/rooms"),
        list<RoomBooking>("/bookings"),
      ]);

      const rList = Array.isArray(fetchedRooms) ? fetchedRooms : [];
      setRooms(rList);

      const allUnits: RoomUnit[] = [];
      rList.forEach((r) => {
        if (Array.isArray(r.units)) {
          r.units.forEach((u) => {
            allUnits.push({ ...u, room_id: r.id });
          });
        }
      });
      setUnits(allUnits);

      if (allUnits.length > 0 && !allUnits.some((u) => u.unit_number === selectedUnit)) {
        const first = allUnits[0]?.unit_number;
        if (first) setSelectedUnit(first);
      }

      setBookings(Array.isArray(fetchedBookings) ? fetchedBookings : []);
    } catch {
      toast("Nu am putut încărca datele camerelor și rezervărilor.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedUnit, toast]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        await fetchData();
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // Connect to live WebSocket
  useEffect(() => {
    const rawWsUrl = WS_URL.replace(/\/$/, "");
    const endpoint = `${rawWsUrl}/ws/live`;
    let ws: WebSocket;
    let pingInterval: ReturnType<typeof setInterval>;

    try {
      ws = new WebSocket(endpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const payload = JSON.parse(event.data);
          let newEv: LiveEvent | null = null;
          const time = new Date().toLocaleTimeString("ro-RO");

          if (payload.event === "payment_confirmed") {
            newEv = {
              id: Math.random().toString(36).substring(7),
              type: "payment_confirmed",
              message: `💳 Plată Stripe: Rezervare #${payload.booking_code} (${payload.total_price} RON) · ${payload.room_title || "Cameră"}${payload.unit_number ? ` (Ușa ${payload.unit_number})` : ""} · ${payload.guest_name || payload.guest_email || ""}`,
              timestamp: time,
              unit: payload.unit_number,
            };
            void fetchData();
          } else if (payload.event === "new_booking_confirmed") {
            newEv = {
              id: Math.random().toString(36).substring(7),
              type: "new_booking",
              message: `✨ Rezervare nouă: #${payload.booking_code} (${payload.total_price} RON) · ${payload.room_title || "Cameră"} · ${payload.guest_name || payload.guest_email || ""}`,
              timestamp: time,
              unit: payload.unit_number,
            };
            void fetchData();
          } else if (payload.event === "room_booked") {
            newEv = {
              id: Math.random().toString(36).substring(7),
              type: "room_booked",
              message: `📅 Cameră ocupată: ${payload.room_title || payload.room_id} rezervată (${payload.check_in ? payload.check_in.slice(0, 10) : ""} - ${payload.check_out ? payload.check_out.slice(0, 10) : ""})`,
              timestamp: time,
            };
            void fetchData();
          } else if (payload.event === "door_unlocked") {
            newEv = {
              id: Math.random().toString(36).substring(7),
              type: "door_unlocked",
              message: `🚪 Clanța camerei ${payload.unit_number} s-a descuiat autorizat.`,
              timestamp: time,
              unit: payload.unit_number,
            };
          } else if (payload.event === "guest_checked_in") {
            newEv = {
              id: Math.random().toString(36).substring(7),
              type: "guest_checked_in",
              message: `🛎️ Check-in finalizat pentru ${payload.guest_name || "oaspete"} (Cam ${payload.unit_number || "—"}).`,
              timestamp: time,
              unit: payload.unit_number,
            };
            void fetchData();
          } else if (payload.event === "room_held") {
            newEv = {
              id: Math.random().toString(36).substring(7),
              type: "room_held",
              message: `🔒 Sesiune plată în curs: ${payload.room_title || payload.room_id} reținută temporar (anti-coliziune activ).`,
              timestamp: time,
            };
          } else if (payload.event === "room_released") {
            newEv = {
              id: Math.random().toString(36).substring(7),
              type: "room_released",
              message: `🔓 Reținerea temporară a camerei a expirat sau a fost eliberată.`,
              timestamp: time,
            };
          }

          if (newEv) {
            setLiveEvents((prev) => [newEv, ...prev.slice(0, 19)]);
          }
        } catch {
          // ignore non-json
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        clearInterval(pingInterval);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }

    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPin(text);
    toast(`Codul PIN ${text} a fost copiat în clipboard!`, "success");
    setTimeout(() => setCopiedPin(null), 2500);
  };

  // Occupancy calculations for today
  const todayIso = new Date().toISOString().split("T")[0];
  const now = Date.now();

  const unitOccupancy = useMemo(() => {
    const list: {
      id: string;
      unit: RoomUnit;
      roomTitle: string;
      booking?: RoomBooking;
      status: "occupied" | "arriving_today" | "vacant";
    }[] = [];

    units.forEach((u) => {
      const uNum = u.unit_number || String(u.id);
      const room = rooms.find((r) => String(r.id) === String(u.room_id));
      const roomTitle = room?.name || (room as { title?: string })?.title || `Cameră ${u.room_id}`;

      const unitBookings = bookings.filter(
        (b) =>
          String(b.unit_id ?? b.room_unit_id ?? (b.unit as { id?: string | number } | null)?.id ?? "") === String(u.id) ||
          b.unit?.unit_number === uNum
      );

      const activeBooking = unitBookings.find((b) => {
        if (!b.check_in || !b.check_out) return false;
        if (b.status === "cancelled") return false;
        const ci = new Date(b.check_in).getTime();
        const co = new Date(b.check_out).getTime();
        return ci <= now && co > now;
      });

      const todayArrival = unitBookings.find((b) => {
        if (!b.check_in || b.status === "cancelled") return false;
        return b.check_in.startsWith(todayIso) && b.status !== "cancelled";
      });

      const b = activeBooking || todayArrival;

      let status: "occupied" | "arriving_today" | "vacant" = "vacant";
      if (activeBooking && (activeBooking.self_checkin_completed_at || activeBooking.status === "checked_in")) {
        status = "occupied";
      } else if (todayArrival || activeBooking) {
        status = "arriving_today";
      }

      list.push({
        id: String(u.id),
        unit: u,
        roomTitle,
        booking: b,
        status,
      });
    });

    return list;
  }, [units, rooms, bookings, now, todayIso]);

  // Unique Door Numbers list for keypad buttons (deduplicated)
  const uniqueDoorNumbers = useMemo(() => {
    const set = new Set<string>();
    const list: string[] = [];
    units.forEach((u) => {
      const num = (u.unit_number || "").trim();
      if (num && !set.has(num)) {
        set.add(num);
        list.push(num);
      }
    });
    return list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [units]);

  // Filtered & Paginated Doors for Keypad Selector (Left)
  const filteredDoors = useMemo(() => {
    const q = doorSearch.trim().toLowerCase();
    if (!q) return uniqueDoorNumbers;
    return uniqueDoorNumbers.filter((num) => num.toLowerCase().includes(q));
  }, [uniqueDoorNumbers, doorSearch]);

  const totalDoorPages = Math.ceil(filteredDoors.length / DOOR_PAGE_SIZE) || 1;
  const paginatedDoors = useMemo(() => {
    return filteredDoors.slice((doorPage - 1) * DOOR_PAGE_SIZE, doorPage * DOOR_PAGE_SIZE);
  }, [filteredDoors, doorPage]);

  // Reset doorPage when search changes
  useEffect(() => {
    setDoorPage(1);
  }, [doorSearch]);

  // Filtered & Paginated Units for Table (Right)
  const filteredUnits = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return unitOccupancy.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;

      if (!q) return true;
      const uNum = (item.unit.unit_number || "").toLowerCase();
      const rTitle = item.roomTitle.toLowerCase();
      const gName = (item.booking?.guest_name || item.booking?.user?.first_name || "").toLowerCase();
      const pin = (item.booking?.access_pin || "").toLowerCase();
      const bCode = (item.booking?.booking_code || "").toLowerCase();

      return (
        uNum.includes(q) ||
        rTitle.includes(q) ||
        gName.includes(q) ||
        pin.includes(q) ||
        bCode.includes(q)
      );
    });
  }, [unitOccupancy, tableSearch, statusFilter]);

  const totalTablePages = Math.ceil(filteredUnits.length / TABLE_PAGE_SIZE) || 1;
  const paginatedUnits = useMemo(() => {
    return filteredUnits.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);
  }, [filteredUnits, tablePage]);

  // Reset tablePage when search/filter changes
  useEffect(() => {
    setTablePage(1);
  }, [tableSearch, statusFilter]);

  const stats = useMemo(() => {
    let occupied = 0;
    let arriving = 0;
    let vacant = 0;

    unitOccupancy.forEach((item) => {
      if (item.status === "occupied") occupied++;
      else if (item.status === "arriving_today") arriving++;
      else vacant++;
    });

    return { total: units.length, occupied, arriving, vacant };
  }, [unitOccupancy, units.length]);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Hardware IoT & Securitate Acces"
        title="Smart Lock, Clanțe Inteligente & Acces Camere"
        action={
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border ${
                wsConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <Radio
                size={13}
                className={wsConnected ? "animate-pulse text-emerald-600" : "text-amber-600"}
              />
              {wsConnected ? "WebSocket Live Conectat" : "Se reconectează..."}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void fetchData()} disabled={loading}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualizează
            </Button>
          </div>
        }
      />

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 sm:p-5">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
            Total Unități Fizice
          </span>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-sans tracking-tight tabular-nums text-[#0d2c5c]">
            {stats.total}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6b7c99]">
            <DoorOpen size={13} className="text-[#c69a3f]" /> Unități în baza de date
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            Ocupate Acum (Live)
          </span>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-sans tracking-tight tabular-nums text-emerald-700">
            {stats.occupied}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600">
            <CheckCircle2 size={13} /> Check-in finalizat & PIN generat
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-amber-700">
            Sosiri Azi
          </span>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-sans tracking-tight tabular-nums text-amber-700">
            {stats.arriving}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-600">
            <Clock size={13} /> În așteptare self check-in
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#0d2c5c]">
            Camere Libere
          </span>
          <p className="mt-2 text-2xl sm:text-3xl font-bold font-sans tracking-tight tabular-nums text-[#0d2c5c]">
            {stats.vacant}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6b7c99]">
            <Wifi size={13} className="text-[#0d2c5c]" /> Clanțe pregătite pentru oaspeți
          </div>
        </Card>
      </div>

      {/* TWO COLUMN INTERACTIVE SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: SMART LOCK KEYPAD SIMULATOR */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#e1e8f0]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d2c5c]/10 text-[#0d2c5c]">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0d2c5c]">Simulator Clanță Smart Lock</h3>
                  <p className="text-[11.5px] text-[#6b7c99]">
                    Tastatură fizică IoT montată pe ușa camerei
                  </p>
                </div>
              </div>
              <Badge tone="gold">Hardware Keypad</Badge>
            </div>

            {/* DOOR SELECTOR WITH SEARCH & PAGINATION */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#2a3b52]">
                  Selectează Ușa de Testat
                </label>
                <span className="text-[10.5px] font-semibold text-[#6b7c99]">
                  {filteredDoors.length} {filteredDoors.length === 1 ? "ușă" : "uși"}
                </span>
              </div>

              {/* SEARCH BOX FOR DOORS */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                />
                <input
                  type="text"
                  value={doorSearch}
                  onChange={(e) => setDoorSearch(e.target.value)}
                  placeholder="Caută ușă (ex: 101, 201)..."
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white py-1.5 pl-9 pr-8 text-[12px] text-[#0d2c5c] placeholder-[#94a3b8] focus:border-[#0d2c5c] focus:outline-none"
                />
                {doorSearch && (
                  <button
                    onClick={() => setDoorSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0d2c5c]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* DOOR BUTTONS GRID */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {paginatedDoors.length > 0 ? (
                  paginatedDoors.map((uNum) => {
                    const isSelected = selectedUnit === uNum;
                    const matching = unitOccupancy.filter(
                      (item) => (item.unit.unit_number || "").trim() === uNum
                    );
                    const isOccupied = matching.some((m) => m.status === "occupied");
                    const isArriving = matching.some((m) => m.status === "arriving_today");

                    return (
                      <button
                        key={uNum}
                        onClick={() => setSelectedUnit(uNum)}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-[12px] font-bold transition-all ${
                          isSelected
                            ? "bg-[#0d2c5c] text-white shadow-md ring-2 ring-[#c69a3f]"
                            : "border border-[#e1e8f0] bg-[#f8fafd] text-[#0d2c5c] hover:bg-white"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            isOccupied
                              ? "bg-emerald-400"
                              : isArriving
                              ? "bg-amber-400"
                              : "bg-slate-300"
                          }`}
                        />
                        {uNum}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-4 rounded-xl border border-dashed border-[#e1e8f0] p-4 text-center text-[11.5px] text-[#6b7c99]">
                    Nicio ușă găsită pentru "{doorSearch}".
                  </div>
                )}
              </div>

              {/* PAGINATION CONTROLS FOR DOORS */}
              {totalDoorPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-[#eef2f7] text-[11px]">
                  <span className="text-[#6b7c99]">
                    Pag. <strong>{doorPage}</strong> din <strong>{totalDoorPages}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDoorPage((p) => Math.max(1, p - 1))}
                      disabled={doorPage === 1}
                      className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-[#e1e8f0] text-[#0d2c5c] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setDoorPage((p) => Math.min(totalDoorPages, p + 1))}
                      disabled={doorPage === totalDoorPages}
                      className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-[#e1e8f0] text-[#0d2c5c] hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* EMBEDDED KEYPAD */}
            <div className="mt-6 flex justify-center">
              <SmartLockKeypad
                initialUnitNumber={selectedUnit}
                units={uniqueDoorNumbers}
                onUnlocked={(data) => {
                  setLiveEvents((prev) => [
                    {
                      id: Math.random().toString(36).substring(7),
                      type: "door_unlocked",
                      message: `Descuiere simulată reușită pentru ${(data.guest_name as string) || "oaspete"} la camera ${selectedUnit}.`,
                      timestamp: new Date().toLocaleTimeString("ro-RO"),
                      unit: selectedUnit,
                    },
                    ...prev.slice(0, 19),
                  ]);
                }}
              />
            </div>
          </Card>

          {/* REALTIME WEBSOCKET EVENT FEED */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#c69a3f]" />
                <h4 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#0d2c5c]">
                  Jurnal Evenimente Live (IoT & WebSockets)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-[#6b7c99] uppercase tracking-wider">
                {liveEvents.length} evenimente
              </span>
            </div>

            {(() => {
              const totalEventPages = Math.max(1, Math.ceil(liveEvents.length / EVENTS_PAGE_SIZE));
              const safePage = Math.min(eventsPage, totalEventPages);
              const paginatedEvents = liveEvents.slice((safePage - 1) * EVENTS_PAGE_SIZE, safePage * EVENTS_PAGE_SIZE);

              return (
                <div>
                  <div className="space-y-2 font-mono text-[11px]">
                    {liveEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#e1e8f0] p-6 text-center text-[#6b7c99]">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#0d2c5c]">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>WebSocket Live conectat</span>
                        </div>
                        <span className="text-[11px]">Așteptare evenimente de la plăți Stripe, clanțe sau rezervări în timp real…</span>
                      </div>
                    ) : (
                      paginatedEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-[#eef2f7] bg-[#f8fafd] p-2.5 text-[#2a3b52]"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                ev.type === "payment_confirmed"
                                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                                  : ev.type === "new_booking" || ev.type === "room_booked"
                                  ? "bg-blue-600"
                                  : ev.type === "door_unlocked"
                                  ? "bg-teal-500"
                                  : ev.type === "guest_checked_in"
                                  ? "bg-sky-500"
                                  : ev.type === "room_held"
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-slate-400"
                              }`}
                            />
                            <span className="leading-snug">{ev.message}</span>
                          </div>
                          <span className="shrink-0 text-[10px] text-[#8fa2be]">{ev.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {liveEvents.length > EVENTS_PAGE_SIZE && (
                    <div className="mt-3 flex items-center justify-between border-t border-[#eef2f7] pt-2.5 text-[11px] text-[#6b7c99]">
                      <span>
                        Pagina <strong className="text-[#0d2c5c] font-sans font-semibold">{safePage}</strong> din <strong className="text-[#0d2c5c] font-sans font-semibold">{totalEventPages}</strong> ({liveEvents.length} total)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                          disabled={safePage <= 1}
                          className="rounded-lg border border-[#cbd5e1] px-2.5 py-1 text-[11px] font-semibold text-[#0d2c5c] hover:bg-[#f1f5f9] disabled:opacity-35 transition-colors cursor-pointer"
                        >
                          Anterior
                        </button>
                        <button
                          type="button"
                          onClick={() => setEventsPage((p) => Math.min(totalEventPages, p + 1))}
                          disabled={safePage >= totalEventPages}
                          className="rounded-lg border border-[#cbd5e1] px-2.5 py-1 text-[11px] font-semibold text-[#0d2c5c] hover:bg-[#f1f5f9] disabled:opacity-35 transition-colors cursor-pointer"
                        >
                          Următor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>
        </div>

        {/* RIGHT: LIVE OCCUPANCY TABLE WITH SEARCH, FILTER & PAGINATION */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-[16px] font-bold text-[#0d2c5c]">
                  Stare Camere & Coduri PIN Active Azi
                </h3>
                <p className="text-[12px] text-[#6b7c99]">
                  Monitorizare acces în timp real pentru fiecare unitate fizică
                </p>
              </div>
              <Badge tone="green">{filteredUnits.length} din {stats.total} Unități</Badge>
            </div>

            {/* SEARCH & STATUS FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
              {/* SEARCH INPUT */}
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Caută ușă (101), tip cameră (Deluxe), oaspete..."
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white py-2 pl-9 pr-8 text-[12.5px] text-[#0d2c5c] placeholder-[#94a3b8] focus:border-[#0d2c5c] focus:outline-none"
                />
                {tableSearch && (
                  <button
                    onClick={() => setTableSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0d2c5c]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* STATUS FILTER PILLS */}
              <div className="flex items-center gap-1 p-1 bg-[#f8fafd] border border-[#e1e8f0] rounded-xl text-[11px] font-bold overflow-x-auto shrink-0">
                {[
                  { key: "all" as const, label: "Toate" },
                  { key: "occupied" as const, label: `Ocupate (${stats.occupied})` },
                  { key: "arriving_today" as const, label: `Sosiri (${stats.arriving})` },
                  { key: "vacant" as const, label: `Libere (${stats.vacant})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      statusFilter === tab.key
                        ? "bg-[#0d2c5c] text-white shadow-sm"
                        : "text-[#6b7c99] hover:text-[#0d2c5c]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-[#e1e8f0] text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                    <th className="pb-3">Unitate</th>
                    <th className="pb-3">Tip Cameră</th>
                    <th className="pb-3">Status Ocupare</th>
                    <th className="pb-3">Oaspete Curent</th>
                    <th className="pb-3">Cod PIN Smart Lock</th>
                    <th className="pb-3 text-right">Acțiune</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {paginatedUnits.length > 0 ? (
                    paginatedUnits.map((item) => {
                      const uNum = item.unit.unit_number || "—";
                      const b = item.booking;
                      const hasPin = Boolean(b?.access_pin);

                      return (
                        <tr key={item.id} className="hover:bg-[#f8fafd] transition-colors">
                          <td className="py-3.5 font-bold text-[#0d2c5c]">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d2c5c]/5 px-2.5 py-1 text-[#0d2c5c]">
                              <KeyRound size={12} className="text-[#c69a3f]" />
                              {uNum}
                            </span>
                          </td>
                          <td className="py-3.5 font-medium text-[#2a3b52]">
                            {item.roomTitle}
                          </td>
                          <td className="py-3.5">
                            {item.status === "occupied" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Ocupat (Check-in activ)
                              </span>
                            ) : item.status === "arriving_today" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-amber-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Sosire Azi (Așteaptă)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-600">
                                Liberă
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 text-[#475569]">
                            {b ? (
                              <div>
                                <div className="font-semibold text-[#0d2c5c]">
                                  {b.guest_name || (b.user?.first_name ? `${b.user?.first_name || ""} ${b.user?.last_name || ""}`.trim() : "Oaspete")}
                                </div>
                                {b.booking_code && (
                                  <div className="text-[10.5px] text-[#c69a3f] font-mono">
                                    #{b.booking_code}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#94a3b8] italic">Fără rezervare activă</span>
                            )}
                          </td>
                          <td className="py-3.5">
                            {hasPin ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold tracking-widest text-[#0d2c5c] bg-[#eef2f7] px-2 py-0.5 rounded">
                                  {b?.access_pin}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(b!.access_pin!)}
                                  className="text-[#6b7c99] hover:text-[#0d2c5c] p-1"
                                  title="Copiază PIN"
                                >
                                  {copiedPin === b?.access_pin ? (
                                    <Check size={14} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </div>
                            ) : item.status === "arriving_today" ? (
                              <span className="text-[11px] text-amber-700 italic">
                                Se generează la check-in
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#94a3b8]">—</span>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedUnit(uNum);
                                toast(`Unitatea ${uNum} a fost selectată pe simulatorul Smart Lock.`, "info");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#e1e8f0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0d2c5c] hover:border-[#0d2c5c] transition-colors"
                            >
                              Testează pe Clanță
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#6b7c99]">
                        <DoorOpen size={24} className="mx-auto text-[#94a3b8] mb-2" />
                        <p className="font-semibold text-[#0d2c5c]">Nicio ușă găsită</p>
                        <p className="text-[12px] text-[#94a3b8] mt-1">
                          Nicio cameră nu corespunde căutării sau filtrului selectat.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE PAGINATION BAR */}
            {totalTablePages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#eef2f7]">
                <span className="text-[12px] text-[#6b7c99]">
                  Afișare <strong>{(tablePage - 1) * TABLE_PAGE_SIZE + 1}</strong> - <strong>{Math.min(tablePage * TABLE_PAGE_SIZE, filteredUnits.length)}</strong> din <strong>{filteredUnits.length}</strong> unități
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                    disabled={tablePage === 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] hover:bg-[#f8fafd] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  <span className="text-[12px] font-semibold text-[#0d2c5c] px-2">
                    {tablePage} / {totalTablePages}
                  </span>

                  <button
                    onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                    disabled={tablePage === totalTablePages}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-[#0d2c5c] hover:bg-[#f8fafd] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    Următor <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
