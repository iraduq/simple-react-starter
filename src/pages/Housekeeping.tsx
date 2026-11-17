import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Wrench,
  BrushCleaning,
  LayoutGrid,
  RefreshCw,
  SearchCode,
  CalendarClock,
  LogOut,
  PackagePlus,
  AlertTriangle,
  Coffee,
  PackageSearch,
  UserCheck,
  ShieldCheck,
  Building2,
} from "lucide-react";
import {
  getHousekeepingUnits,
  updateUnitHousekeeping,
  type HousekeepingUnit,
} from "../services/housekeepingService";
import { clearSession, fetchSession, type SessionUser } from "../lib/auth";
import { apiFetch } from "../lib/api";
import { useToast } from "../components/Toast";
import {
  LiveSyncBadge,
  useAdminLiveSync,
} from "../context/AdminLiveSyncContext";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Modal,
  Pagination,
  SearchBox,
  SectionHeader,
  Select,
  Skeleton,
  TextInput,
  Textarea,
  usePaged,
} from "../components/admin/ui";
import MaintenanceTab from "../components/admin/MaintenanceTab";
import LostFoundTab from "../components/admin/LostFoundTab";
import BreakfastTab from "../components/admin/BreakfastTab";

const STAFF_ROLES_ALLOWED = new Set([
  "admin",
  "menajera",
  "manajera",
  "intretinere",
  "receptionist",
]);

const isHousekeepingStaff = (u: NonNullable<SessionUser>) =>
  STAFF_ROLES_ALLOWED.has((u.role || "").toLowerCase().trim());

const unitId = (u: HousekeepingUnit) => u.id || u.unit_id || "";
const roomTitle = (u: HousekeepingUnit) => u.room_title || u.title || "Cameră";
const unitNumber = (u: HousekeepingUnit) =>
  u.unit_number || u.number || u.code || "—";

const extractFloor = (u: HousekeepingUnit) => {
  if (typeof u.floor === "number" && u.floor > 0) return u.floor;
  const digits = unitNumber(u).replace(/\D/g, "");
  if (digits.length >= 3) return Number(digits[0]) || 1;
  return 1;
};

const normalizedCleanState = (u: HousekeepingUnit) => {
  if (u.status === "maintenance") return "maintenance";
  if (u.clean_status === "inspecting") return "inspecting";
  if (u.status === "cleaning" || u.clean_status === "dirty") return "dirty";
  return "clean";
};

const stateMeta = (
  state: ReturnType<typeof normalizedCleanState>,
): { label: string; tone: "green" | "gold" | "red" | "navy" | "muted" } => {
  switch (state) {
    case "clean":
      return { label: "Curată & Pregătită", tone: "green" };
    case "inspecting":
      return { label: "În Inspecție", tone: "navy" };
    case "maintenance":
      return { label: "În Mentenanță", tone: "red" };
    default:
      return { label: "Necesită Curățenie", tone: "gold" };
  }
};

const formatShortDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
};

const ROLE_TITLES: Record<string, { eyebrow: string; heading: string; badge: string }> = {
  admin: {
    eyebrow: "Operare & Supervizare Generală",
    heading: "Panou Housekeeping & Camere",
    badge: "Administrator",
  },
  menajera: {
    eyebrow: "Operațiuni Housekeeping · Vila Casa Esy",
    heading: "Portal Cameriste & Igienizare",
    badge: "Echipa Housekeeping",
  },
  manajera: {
    eyebrow: "Operațiuni Housekeeping · Vila Casa Esy",
    heading: "Portal Cameriste & Igienizare",
    badge: "Echipa Housekeeping",
  },
  intretinere: {
    eyebrow: "Intervenții & Pregătire Unități",
    heading: "Status Camere & Tehnic",
    badge: "Echipa Întreținere",
  },
  receptionist: {
    eyebrow: "Front Desk & Coordonare Sosiri",
    heading: "Situație Camere & Curățenie",
    badge: "Recepție",
  },
};

const EASE = [0.22, 1, 0.36, 1] as const;

type PortalSection = "rooms" | "maintenance" | "lost_found" | "breakfast";

function SunRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="34" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 5" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 16;
        const x1 = 60 + Math.cos(a) * 44;
        const y1 = 60 + Math.sin(a) * 44;
        const x2 = 60 + Math.cos(a) * (i % 2 ? 52 : 58);
        const y2 = 60 + Math.sin(a) * (i % 2 ? 52 : 58);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" fill="none" className={className}>
      {[0, 14, 28].map((o) => (
        <path
          key={o}
          d={`M0 ${16 + o} Q25 ${4 + o} 50 ${16 + o} T100 ${16 + o} T150 ${16 + o} T200 ${16 + o}`}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function Shell({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path d="M50 92 L8 44 Q50 -8 92 44 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      {[-30, -15, 0, 15, 30].map((o) => (
        <path
          key={o}
          d={`M50 92 Q${50 + o * 0.4} 50 ${50 + o * 0.7} 22`}
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  delay = 0,
  tone = "navy",
}: {
  icon: typeof LayoutGrid;
  label: string;
  value: string;
  hint?: string;
  delay?: number;
  tone?: "navy" | "gold" | "green" | "red";
}) {
  const accentBorder =
    tone === "gold"
      ? "border-[#c69a3f]/45"
      : tone === "red"
        ? "border-[#8c2f39]/35"
        : tone === "green"
          ? "border-emerald-500/35"
          : "border-[#e1e8f0]";

  const iconBox =
    tone === "gold"
      ? "border-[#c69a3f]/35 bg-[#fdf8ec] text-[#8a6420]"
      : tone === "red"
        ? "border-[#8c2f39]/25 bg-[#8c2f39]/10 text-[#8c2f39]"
        : tone === "green"
          ? "border-emerald-500/30 bg-emerald-50 text-emerald-700"
          : "border-[#e1e8f0] bg-[#f4f6f9] text-[#0d2c5c]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={`rounded-2xl border bg-white p-5 shadow-[0_2px_16px_rgba(13,44,92,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(13,44,92,0.08)] ${accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
            {label}
          </span>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[#0d2c5c]">
            {value}
          </p>
          {hint && (
            <span className="mt-2 block text-[11.5px] font-medium text-[#6b7c99]">
              {hint}
            </span>
          )}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBox}`}>
          <Icon size={19} strokeWidth={1.6} />
        </span>
      </div>
    </motion.div>
  );
}

export default function Housekeeping({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sessionUser, setSessionUser] = useState<SessionUser>(null);
  const [section, setSection] = useState<PortalSection>("rooms");
  const [units, setUnits] = useState<HousekeepingUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<number | "all">("all");

  // Modal Raportează Defecțiune (Mentenanță)
  const [ticketUnit, setTicketUnit] = useState<HousekeepingUnit | null>(null);
  const [ticketForm, setTicketForm] = useState({
    category: "instalatii",
    priority: "normal",
    title: "",
    description: "",
    setMaintenanceStatus: true,
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Modal Obiect Pierdut & Găsit
  const [lostUnit, setLostUnit] = useState<HousekeepingUnit | null>(null);
  const [lostForm, setLostForm] = useState({
    item_name: "",
    category: "altele",
    storage_location: "Seif Recepție",
    description: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    booking_id: "",
  });
  const [submittingLost, setSubmittingLost] = useState(false);

  const loadUnits = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const data = await getHousekeepingUnits();
      setUnits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (!silent) {
        toast(err?.message || "Nu am putut încărca lista camerelor.", "error");
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [toast]);

  const { isSyncing, connectionStatus } = useAdminLiveSync({
    topic: "units",
    onSync: () => {
      void loadUnits(true);
    },
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const s = await fetchSession(true);
      if (!active) return;
      if (!s || !isHousekeepingStaff(s)) {
        navigate(s ? "/" : "/login", { replace: true });
        return;
      }
      setSessionUser(s);
      await loadUnits(true);
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [navigate, loadUnits]);

  const handleStatusChange = async (
    u: HousekeepingUnit,
    payload: {
      status: "active" | "cleaning" | "maintenance";
      clean_status?: "clean" | "dirty" | "inspecting";
    },
    successText: string,
  ) => {
    const id = unitId(u);
    if (!id) return;
    setUpdatingId(id);
    try {
      await updateUnitHousekeeping(id, payload);
      toast(`Camera ${unitNumber(u)} (${roomTitle(u)}): ${successText}`, "success");
      await loadUnits(true);
    } catch (err: any) {
      toast(err?.message || "Nu am putut actualiza statusul camerei.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const openMaintenanceModal = (u: HousekeepingUnit) => {
    setTicketUnit(u);
    setTicketForm({
      category: "instalatii",
      priority: "normal",
      title: "",
      description: "",
      setMaintenanceStatus: true,
    });
  };

  const submitMaintenanceTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketUnit || !ticketForm.title.trim() || !ticketForm.description.trim()) {
      toast("Completează titlul și descrierea defecțiunii.", "warning");
      return;
    }
    setSubmittingTicket(true);
    try {
      const staffName =
        [sessionUser?.first_name, sessionUser?.last_name].filter(Boolean).join(" ") ||
        sessionUser?.email ||
        "Personal Housekeeping";

      await apiFetch("/admin/maintenance/tickets", {
        method: "POST",
        body: JSON.stringify({
          unit_number: unitNumber(ticketUnit),
          guest_name: staffName,
          category: ticketForm.category,
          priority: ticketForm.priority,
          title: ticketForm.title.trim(),
          description: ticketForm.description.trim(),
        }),
      });

      const id = unitId(ticketUnit);
      if (ticketForm.setMaintenanceStatus && id) {
        await updateUnitHousekeeping(id, { status: "maintenance" });
      }

      toast(
        `Tichet tehnic înregistrat pentru camera ${unitNumber(ticketUnit)}!`,
        "success",
      );
      setTicketUnit(null);
      await loadUnits(true);
    } catch (err: any) {
      toast(err?.message || "Nu am putut înregistra tichetul.", "error");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const openLostFoundModal = async (u: HousekeepingUnit) => {
    setLostUnit(u);
    setLostForm({
      item_name: "",
      category: "altele",
      storage_location: "Seif Recepție",
      description: "",
      guest_name: u.guest_name || "",
      guest_email: "",
      guest_phone: "",
      booking_id: "",
    });
    try {
      const suggestion = await apiFetch<{
        found?: boolean;
        guest_name?: string;
        guest_email?: string;
        guest_phone?: string;
        booking_id?: string;
      }>(`/lost-found/suggest-guest?unit_number=${encodeURIComponent(unitNumber(u))}`);
      if (suggestion?.found) {
        setLostForm((prev) => ({
          ...prev,
          guest_name: suggestion.guest_name || prev.guest_name,
          guest_email: suggestion.guest_email || "",
          guest_phone: suggestion.guest_phone || "",
          booking_id: suggestion.booking_id || "",
        }));
      }
    } catch {
      // sugestia automata este optionala
    }
  };

  const submitLostFound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostUnit || !lostForm.item_name.trim()) {
      toast("Introdu denumirea obiectului găsit.", "warning");
      return;
    }
    setSubmittingLost(true);
    try {
      const staffName =
        [sessionUser?.first_name, sessionUser?.last_name].filter(Boolean).join(" ") ||
        sessionUser?.email ||
        "Personal Housekeeping";

      await apiFetch("/lost-found", {
        method: "POST",
        body: JSON.stringify({
          item_name: lostForm.item_name.trim(),
          category: lostForm.category,
          room_unit_number: unitNumber(lostUnit),
          storage_location: lostForm.storage_location.trim() || "Seif Recepție",
          description: lostForm.description.trim() || null,
          found_by_name: staffName,
          guest_name: lostForm.guest_name.trim() || null,
          guest_email: lostForm.guest_email.trim() || null,
          guest_phone: lostForm.guest_phone.trim() || null,
          booking_id: lostForm.booking_id || null,
        }),
      });
      toast(
        `Obiectul "${lostForm.item_name}" din camera ${unitNumber(lostUnit)} a fost înregistrat în Lost & Found.`,
        "success",
      );
      setLostUnit(null);
    } catch (err: any) {
      toast(err?.message || "Nu am putut înregistra obiectul găsit.", "error");
    } finally {
      setSubmittingLost(false);
    }
  };

  const floors = useMemo(() => {
    const set = new Set<number>();
    units.forEach((u) => set.add(extractFloor(u)));
    return Array.from(set).sort((a, b) => a - b);
  }, [units]);

  const counts = useMemo(() => {
    let clean = 0;
    let dirty = 0;
    let inspecting = 0;
    let maintenance = 0;
    let checkoutToday = 0;
    let openTickets = 0;

    units.forEach((u) => {
      const st = normalizedCleanState(u);
      if (st === "clean") clean++;
      else if (st === "inspecting") inspecting++;
      else if (st === "maintenance") maintenance++;
      else dirty++;
      if (u.occupancy_state === "checkout_today") checkoutToday++;
      openTickets += u.open_tickets_count || 0;
    });

    return {
      all: units.length,
      clean,
      dirty,
      inspecting,
      maintenance,
      checkoutToday,
      openTickets,
    };
  }, [units]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return units.filter((u) => {
      const floor = extractFloor(u);
      if (floorFilter !== "all" && floor !== floorFilter) return false;

      const state = normalizedCleanState(u);
      if (filter === "checkout_today" && u.occupancy_state !== "checkout_today") {
        return false;
      }
      if (
        filter !== "all" &&
        filter !== "checkout_today" &&
        state !== filter
      ) {
        return false;
      }

      if (!q) return true;
      return (
        roomTitle(u).toLowerCase().includes(q) ||
        unitNumber(u).toLowerCase().includes(q) ||
        (u.guest_name || "").toLowerCase().includes(q) ||
        (u.notes || "").toLowerCase().includes(q)
      );
    });
  }, [units, search, filter, floorFilter]);

  const paged = usePaged(filtered, 12);

  const roleKey = (sessionUser?.role || "menajera").toLowerCase().trim();
  const roleCopy = ROLE_TITLES[roleKey] || ROLE_TITLES.menajera;

  const handleLogout = async () => {
    await clearSession();
    toast("Te-ai delogheat cu succes.", "success");
    navigate("/");
  };

  const roomsContent = (
    <>
      <SectionHeader
        eyebrow={roleCopy.eyebrow}
        title={roleCopy.heading}
        description="Monitorizează starea igienizării, prioritățile de check-out de azi, inspecția camerelor și raportează instant orice defecțiune către mentenanță."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <LiveSyncBadge isSyncing={isSyncing} status={connectionStatus} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void loadUnits(false)}
              disabled={refreshing || loading}
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Reîmprospătează
            </Button>
          </div>
        }
      />

      {/* 5 Carduri KPI Executive */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[118px] rounded-2xl" />
          ))
        ) : (
          <>
            <Kpi
              icon={LayoutGrid}
              label="Total Camere"
              value={String(counts.all)}
              hint={`${floors.length} etaje monitorizate`}
              tone="navy"
            />
            <Kpi
              icon={CheckCircle2}
              label="Curate & Pregătite"
              value={String(counts.clean)}
              hint="Disponibile pentru check-in"
              delay={0.05}
              tone="green"
            />
            <Kpi
              icon={BrushCleaning}
              label="Necesită Curățenie"
              value={String(counts.dirty)}
              hint={
                counts.checkoutToday > 0
                  ? `${counts.checkoutToday} check-out azi · prioritate`
                  : "În așteptare cameristă"
              }
              delay={0.1}
              tone="gold"
            />
            <Kpi
              icon={SearchCode}
              label="În Inspecție"
              value={String(counts.inspecting)}
              hint="Verificare finală calitate"
              delay={0.15}
              tone="navy"
            />
            <Kpi
              icon={Wrench}
              label="În Mentenanță"
              value={String(counts.maintenance)}
              hint={
                counts.openTickets > 0
                  ? `${counts.openTickets} tichete tehnice active`
                  : "Fără defecțiuni deschise"
              }
              delay={0.2}
              tone="red"
            />
          </>
        )}
      </div>

      {/* Bară Filtre Status + Etaje + Căutare */}
      <div className="mt-6 rounded-2xl border border-[#e1e8f0] bg-white p-4 shadow-[0_2px_12px_rgba(13,44,92,0.03)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label={`Toate · ${counts.all}`}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterChip
              label={`Check-out azi · ${counts.checkoutToday}`}
              active={filter === "checkout_today"}
              onClick={() => setFilter("checkout_today")}
              emphasis
            />
            <FilterChip
              label={`De curățat · ${counts.dirty}`}
              active={filter === "dirty"}
              onClick={() => setFilter("dirty")}
              emphasis
            />
            <FilterChip
              label={`Inspecție · ${counts.inspecting}`}
              active={filter === "inspecting"}
              onClick={() => setFilter("inspecting")}
            />
            <FilterChip
              label={`Curate · ${counts.clean}`}
              active={filter === "clean"}
              onClick={() => setFilter("clean")}
            />
            <FilterChip
              label={`Mentenanță · ${counts.maintenance}`}
              active={filter === "maintenance"}
              onClick={() => setFilter("maintenance")}
            />
          </div>

          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Caută cameră (ex: 301), tip sau oaspete…"
            className="w-full lg:w-72"
          />
        </div>

        {floors.length > 1 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#eef2f7] pt-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7c99] mr-1">
              <Building2 size={12} /> Etaje:
            </span>
            <button
              type="button"
              onClick={() => setFloorFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                floorFilter === "all"
                  ? "bg-[#0d2c5c] text-white"
                  : "bg-[#f4f6f9] text-[#4f6280] hover:bg-[#eef2f7] hover:text-[#0d2c5c]"
              }`}
            >
              Toate etajele
            </button>
            {floors.map((fl) => (
              <button
                key={fl}
                type="button"
                onClick={() => setFloorFilter(fl)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  floorFilter === fl
                    ? "bg-[#c69a3f] text-white shadow-sm"
                    : "bg-[#f4f6f9] text-[#4f6280] hover:bg-[#fdf8ec] hover:text-[#8a6420]"
                }`}
              >
                Etajul {fl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Camere */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[290px] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#e1e8f0] bg-white p-8">
            <EmptyState
              title="Nicio cameră găsită"
              hint="Modifică filtrul de etaj, status sau căutarea pentru a vedea unitățile."
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paged.slice.map((u, i) => (
                <HousekeepingCard
                  key={unitId(u) || `${roomTitle(u)}-${unitNumber(u)}`}
                  unit={u}
                  index={i}
                  updating={updatingId === unitId(u)}
                  onStatusChange={handleStatusChange}
                  onReportMaintenance={() => openMaintenanceModal(u)}
                  onReportLostFound={() => void openLostFoundModal(u)}
                />
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white">
              <Pagination
                page={paged.page}
                pages={paged.pages}
                total={paged.total}
                perPage={paged.perPage}
                onPage={paged.setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal Raportează Defecțiune */}
      <Modal
        open={Boolean(ticketUnit)}
        title={`Raportează defecțiune · Camera ${ticketUnit ? unitNumber(ticketUnit) : ""}`}
        subtitle={ticketUnit ? `${roomTitle(ticketUnit)} · Etajul ${extractFloor(ticketUnit)}` : undefined}
        onClose={() => setTicketUnit(null)}
        width="max-w-lg"
      >
        <form onSubmit={(e) => void submitMaintenanceTicket(e)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Categorie problemă">
              <Select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              >
                <option value="instalatii">Instalații sanitare / Apă</option>
                <option value="ac">Aer condiționat / Încălzire</option>
                <option value="electric">Instalație electrică / Lumini</option>
                <option value="tv">Televizor / Smart Lock / Wi-Fi</option>
                <option value="mobilier">Mobilier / Uși / Ferestre</option>
                <option value="curatenie">Igienizare specială</option>
                <option value="altele">Altă problemă tehnică</option>
              </Select>
            </Field>
            <Field label="Prioritate">
              <Select
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
              >
                <option value="normal">Normală (SLA standard)</option>
                <option value="urgent">Urgentă (intervenție imediată)</option>
              </Select>
            </Field>
          </div>

          <Field label="Titlu scurt defecțiune">
            <TextInput
              required
              value={ticketForm.title}
              onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
              placeholder="Ex: Baterie lavoar slăbită / AC nu răcește"
            />
          </Field>

          <Field label="Detalii pentru echipa de întreținere">
            <Textarea
              required
              rows={3}
              value={ticketForm.description}
              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              placeholder="Descrie exact ce ai observat în cameră…"
            />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-[#e1e8f0] bg-[#f9f7f2] px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ticketForm.setMaintenanceStatus}
              onChange={(e) =>
                setTicketForm({ ...ticketForm, setMaintenanceStatus: e.target.checked })
              }
              className="h-4 w-4 accent-[#8c2f39]"
            />
            <span className="text-[12.5px] font-medium text-[#0d2c5c]">
              Trece automat camera în status <strong>„În Mentenanță”</strong> până la remediere
            </span>
          </label>

          <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
            <Button variant="ghost" onClick={() => setTicketUnit(null)}>
              Renunță
            </Button>
            <Button type="submit" disabled={submittingTicket}>
              {submittingTicket ? "Se trimite…" : "Trimite la Întreținere"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Obiect Pierdut / Găsit */}
      <Modal
        open={Boolean(lostUnit)}
        title={`Obiect găsit · Camera ${lostUnit ? unitNumber(lostUnit) : ""}`}
        subtitle={lostUnit ? `${roomTitle(lostUnit)} · Se salvează direct în registrul recepției` : undefined}
        onClose={() => setLostUnit(null)}
        width="max-w-lg"
      >
        <form onSubmit={(e) => void submitLostFound(e)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Ce obiect a fost găsit?">
              <TextInput
                required
                value={lostForm.item_name}
                onChange={(e) => setLostForm({ ...lostForm, item_name: e.target.value })}
                placeholder="Ex: Încărcător Apple / Ochelari"
              />
            </Field>
            <Field label="Categorie">
              <Select
                value={lostForm.category}
                onChange={(e) => setLostForm({ ...lostForm, category: e.target.value })}
              >
                <option value="electronice">Electronice & Gadgeturi</option>
                <option value="bijuterii">Bijuterii & Valori</option>
                <option value="haine">Îmbrăcăminte & Accesorii</option>
                <option value="acte_bani">Documente & Portofele</option>
                <option value="altele">Alte Obiecte</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Unde a fost depozitat?">
              <TextInput
                value={lostForm.storage_location}
                onChange={(e) => setLostForm({ ...lostForm, storage_location: e.target.value })}
                placeholder="Seif Recepție / Depozit Etaj"
              />
            </Field>
            <Field label="Oaspete asociat (auto-sugerat)">
              <TextInput
                value={lostForm.guest_name}
                onChange={(e) => setLostForm({ ...lostForm, guest_name: e.target.value })}
                placeholder="Nume oaspete (opțional)"
              />
            </Field>
          </div>

          <Field label="Detalii / locul din cameră">
            <Textarea
              rows={2}
              value={lostForm.description}
              onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })}
              placeholder="Ex: Găsit sub noptiera din dreapta la curățenia de check-out."
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
            <Button variant="ghost" onClick={() => setLostUnit(null)}>
              Renunță
            </Button>
            <Button type="submit" variant="gold" disabled={submittingLost}>
              {submittingLost ? "Se înregistrează…" : "Înregistrează în Lost & Found"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );

  if (embedded) {
    return roomsContent;
  }

  const portalNav: { id: PortalSection; label: string; icon: typeof Sparkles }[] = [
    { id: "rooms", label: "Camere & Igienizare", icon: Sparkles },
    { id: "maintenance", label: "Tichete Întreținere", icon: Wrench },
    { id: "lost_found", label: "Obiecte Găsite", icon: PackageSearch },
    { id: "breakfast", label: "Mic Dejun", icon: Coffee },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9f7f2] pt-[68px] sm:pt-20">
      {/* Motive marine Vila Casa Esy */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[16%] left-[5%] opacity-[0.04] hidden xl:block">
          <SunRing className="h-56 w-56 text-[#0d2c5c]" />
        </div>
        <div className="absolute top-[52%] right-[3%] opacity-[0.045] hidden lg:block">
          <Shell className="h-44 w-44 text-[#c69a3f]" />
        </div>
        <div className="absolute bottom-[10%] left-[22%] opacity-[0.045] hidden md:block">
          <Wave className="h-14 w-56 text-[#0d2c5c]" />
        </div>
      </div>

      {/* Bandă de navigație Staff Vila Casa Esy */}
      <div className="relative z-10 border-b border-[#c69a3f]/25 bg-gradient-to-r from-[#0d2c5c] via-[#123a72] to-[#07203f] text-white shadow-[0_8px_28px_rgba(13,44,92,0.16)]">
        <div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e6b85c]/40 bg-white/10 text-[#e6b85c]">
              <ShieldCheck size={19} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e6b85c]">
                Vila Casa Esy · Portal Operațional
              </p>
              <p className="text-sm font-semibold text-white">
                {sessionUser?.first_name
                  ? `${sessionUser.first_name} ${sessionUser.last_name || ""}`.trim()
                  : sessionUser?.email || "Staff"}{" "}
                <span className="ml-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#e6b85c]">
                  {roleCopy.badge}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {portalNav.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-all cursor-pointer ${
                    active
                      ? "bg-[#c69a3f] text-[#07203f] shadow-[0_6px_18px_rgba(198,154,63,0.45)]"
                      : "border border-white/15 bg-white/10 text-white/90 hover:bg-white/20"
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e6b85c]/40 bg-[#07203f]/60 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#e6b85c] transition-colors hover:bg-[#e6b85c] hover:text-[#07203f] cursor-pointer"
            >
              Panou Complet
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
            >
              <LogOut size={13} /> Ieșire
            </button>
          </div>
        </div>
      </div>

      {/* Conținut activ */}
      <div className="relative z-10 mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {section === "rooms" && roomsContent}
        {section === "maintenance" && <MaintenanceTab />}
        {section === "lost_found" && <LostFoundTab />}
        {section === "breakfast" && <BreakfastTab />}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  emphasis,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer ${
        active
          ? emphasis
            ? "border-[#c69a3f] bg-[#c69a3f] text-white shadow-[0_6px_16px_-6px_rgba(198,154,63,0.6)]"
            : "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-sm"
          : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f] hover:text-[#8a6420]"
      }`}
    >
      {label}
    </button>
  );
}

function HousekeepingCard({
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

  const topBarClass =
    cleanState === "dirty"
      ? "bg-gradient-to-r from-[#c69a3f] to-[#e6b85c]"
      : cleanState === "inspecting"
        ? "bg-gradient-to-r from-[#0d2c5c] to-[#1e4d8c]"
        : cleanState === "maintenance"
          ? "bg-[#8c2f39]"
          : "bg-emerald-600";

  const borderClass =
    cleanState === "dirty"
      ? "border-[#c69a3f]/55"
      : cleanState === "maintenance"
        ? "border-[#8c2f39]/40"
        : "border-[#e1e8f0]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.035, 0.25),
        ease: EASE,
      }}
      className={`group relative flex flex-col gap-3.5 overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_2px_16px_rgba(13,44,92,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(13,44,92,0.09)] ${borderClass}`}
    >
      <span className={`absolute inset-x-0 top-0 h-[3.5px] ${topBarClass}`} />

      {/* Header Cameră */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[#e1e8f0] bg-[#f9f7f2] text-[#0d2c5c]">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8a6420]">
              Et. {floor}
            </span>
            <span
              className="text-[20px] font-bold leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {unitNumber(unit)}
            </span>
          </div>

          <div className="min-w-0">
            <h3
              className="truncate text-[18px] font-semibold leading-tight text-[#0d2c5c]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {roomTitle(unit)}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge tone={meta.tone}>{meta.label}</Badge>
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
      <div className="rounded-xl border border-[#e1e8f0]/80 bg-[#f9f7f2] px-3.5 py-2.5 text-[12px]">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-[#0d2c5c]">
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
                <CheckCircle2 size={13} className="text-[#6b7c99]" />
                <span className="text-[#4f6280]">Cameră liberă</span>
              </>
            )}
          </span>
          {(unit.check_in || unit.check_out) && (
            <span className="text-[11px] font-medium text-[#6b7c99]">
              {formatShortDate(unit.check_in)} → {formatShortDate(unit.check_out)}
            </span>
          )}
        </div>
        {unit.guest_name && (
          <p className="mt-1 truncate text-[11.5px] font-medium text-[#2a3b52]">
            Oaspete: <span className="font-semibold text-[#0d2c5c]">{unit.guest_name}</span>
          </p>
        )}
      </div>

      {unit.notes && (
        <p className="rounded-xl border border-[#e1e8f0] bg-white px-3 py-2 text-[11.5px] text-[#4f6280]">
          {unit.notes}
        </p>
      )}

      {/* 4 Acțiuni rapide de status */}
      <div className="grid grid-cols-2 gap-2">
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
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
            cleanState === "clean"
              ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
              : "border-[#e1e8f0] bg-white text-[#1f6b45] hover:border-emerald-500 hover:bg-emerald-50"
          }`}
        >
          <Sparkles size={13} />
          Curată
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
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
            cleanState === "dirty"
              ? "border-[#c69a3f] bg-[#c69a3f] text-white shadow-sm"
              : "border-[#e1e8f0] bg-white text-[#8a6420] hover:border-[#c69a3f] hover:bg-[#fdf8ec]"
          }`}
        >
          <BrushCleaning size={13} />
          De curățat
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
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
            cleanState === "inspecting"
              ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-sm"
              : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#0d2c5c] hover:bg-[#f4f6f9]"
          }`}
        >
          <SearchCode size={13} />
          Inspecție
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
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 ${
            cleanState === "maintenance"
              ? "border-[#8c2f39] bg-[#8c2f39] text-white shadow-sm"
              : "border-[#e1e8f0] bg-white text-[#8c2f39] hover:border-[#8c2f39] hover:bg-[#8c2f39]/5"
          }`}
        >
          <Wrench size={13} />
          Mentenanță
        </button>
      </div>

      {/* Footer Raportare Rapidă */}
      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[#eef2f7] pt-3">
        <button
          type="button"
          onClick={onReportMaintenance}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-2 text-[11px] font-semibold text-[#0d2c5c] transition-colors hover:border-[#8c2f39]/50 hover:bg-[#8c2f39]/5 hover:text-[#8c2f39] cursor-pointer"
        >
          <Wrench size={12} /> Defecțiune
        </button>
        <button
          type="button"
          onClick={onReportLostFound}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-2 text-[11px] font-semibold text-[#0d2c5c] transition-colors hover:border-[#c69a3f] hover:bg-[#fdf8ec] hover:text-[#8a6420] cursor-pointer"
        >
          <PackagePlus size={12} /> Obiect găsit
        </button>
      </div>
    </motion.div>
  );
}
