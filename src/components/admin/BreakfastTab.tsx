import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChefHat,
  Clock,
  Crown,
  Download,
  FileText,
  Printer,
  RefreshCw,
  Sparkles,
  Users,
  Utensils,
  BedDouble,
  AlertCircle,
  MessageSquarePlus,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";
import { useAdminLiveSync, LiveSyncBadge } from "../../context/AdminLiveSyncContext";
import {
  Badge,
  Card,
  EmptyState,
  Field,
  GhostButton,
  Modal,
  Pagination,
  PrimaryButton,
  SearchInput,
  SectionHeader,
  TableSkeleton,
  Textarea,
  usePaged,
} from "./ui";

export interface BreakfastItem {
  item_key: string;
  service_date: string;
  source: "rate_plan" | "upsell_addon" | "loyalty_vip" | "room_service" | string;
  source_label: string;
  booking_id?: string | null;
  booking_code?: string | null;
  booking_status?: string | null;
  is_paid: boolean;
  room_title: string;
  unit_number?: string | null;
  room_label: string;
  guest_name: string;
  guest_email?: string | null;
  guest_phone?: string | null;
  vip_tier?: string | null;
  package_title: string;
  service_mode: "buffet" | "in_room" | string;
  service_mode_label: string;
  adults: number;
  children: number;
  portions: number;
  notes?: string | null;
  kitchen_notes?: string | null;
  status: "pending" | "preparing" | "served";
  updated_by?: string | null;
  served_at?: string | null;
  check_in: string;
  check_out: string;
}

interface PackageBreakdown {
  title: string;
  service_mode: "buffet" | "in_room" | string;
  service_mode_label: string;
  portions: number;
  tasks_count: number;
}

interface ForecastDay {
  date: string;
  label: string;
  tasks_count: number;
  total_portions: number;
  served_count: number;
}

interface BreakfastSummary {
  total_tasks: number;
  total_portions: number;
  total_adults: number;
  total_children: number;
  buffet_portions: number;
  in_room_portions: number;
  pending_count: number;
  preparing_count: number;
  served_count: number;
  special_notes_count: number;
  arriving_today_count: number;
  arriving_today_portions: number;
}

interface DailyBreakfastResponse {
  service_date: string;
  today: string;
  summary: BreakfastSummary;
  package_breakdown: PackageBreakdown[];
  forecast: ForecastDay[];
  items: BreakfastItem[];
}

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatReadableDate(iso: string): string {
  if (!iso) return "";
  const dt = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortTime(iso?: string | null): string {
  if (!iso) return "";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

export default function BreakfastTab() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso);
  const [data, setData] = useState<DailyBreakfastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "preparing" | "served">("all");
  const [modeFilter, setModeFilter] = useState<"all" | "buffet" | "in_room">("all");
  const [search, setSearch] = useState("");

  const [notesModalItem, setNotesModalItem] = useState<BreakfastItem | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const loadSchedule = useCallback(
    async (opts?: { silent?: boolean; dateOverride?: string }) => {
      const target = opts?.dateOverride || selectedDate;
      if (!opts?.silent) setLoading(true);
      try {
        const res = await apiFetch<DailyBreakfastResponse>(
          `/admin/breakfast/daily?date=${encodeURIComponent(target)}`
        );
        setData(res);
      } catch (err: any) {
        if (!opts?.silent) {
          toast(err?.message || "Eroare la încărcarea planului de mic dejun.", "error");
        }
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [selectedDate, toast]
  );

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const { isSyncing, connectionStatus } = useAdminLiveSync({
    topic: "all",
    onSync: () => loadSchedule({ silent: true }),
  });

  const handleStatusUpdate = async (
    item: BreakfastItem,
    nextStatus: "pending" | "preparing" | "served"
  ) => {
    setBusyKey(item.item_key);
    try {
      await apiFetch("/admin/breakfast/tasks", {
        method: "PATCH",
        body: JSON.stringify({
          service_date: item.service_date,
          item_key: item.item_key,
          booking_code: item.booking_code,
          status: nextStatus,
        }),
      });
      await loadSchedule({ silent: true });
      const label =
        nextStatus === "served"
          ? "marcat ca servit"
          : nextStatus === "preparing"
            ? "trecut în pregătire"
            : "readus în așteptare";
      toast(`${item.room_label} (${item.guest_name}) — ${label}.`, "success");
    } catch (err: any) {
      toast(err?.message || "Nu am putut actualiza statusul.", "error");
    } finally {
      setBusyKey(null);
    }
  };

  const openNotesModal = (item: BreakfastItem) => {
    setNotesModalItem(item);
    setNotesDraft(item.kitchen_notes || "");
  };

  const saveKitchenNotes = async () => {
    if (!notesModalItem) return;
    setSavingNotes(true);
    try {
      await apiFetch("/admin/breakfast/tasks", {
        method: "PATCH",
        body: JSON.stringify({
          service_date: notesModalItem.service_date,
          item_key: notesModalItem.item_key,
          booking_code: notesModalItem.booking_code,
          status: notesModalItem.status,
          kitchen_notes: notesDraft,
        }),
      });
      setNotesModalItem(null);
      await loadSchedule({ silent: true });
      toast("Observația pentru bucătărie a fost salvată.", "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la salvarea observației.", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredItems = useMemo(() => {
    const items = data?.items || [];
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (modeFilter !== "all" && item.service_mode !== modeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const fields = [
          item.room_label,
          item.room_title,
          item.guest_name,
          item.booking_code || "",
          item.package_title,
          item.notes || "",
          item.kitchen_notes || "",
        ];
        if (!fields.some((f) => f.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [data, statusFilter, modeFilter, search]);

  const paged = usePaged(filteredItems, 10);

  const exportCsv = () => {
    if (!data) return;
    const header = [
      "Data",
      "Camera",
      "Oaspete",
      "Rezervare",
      "Pachet Mic Dejun",
      "Mod Servire",
      "Portii",
      "Adulti",
      "Copii",
      "Status",
      "Note Oaspete",
      "Note Bucatarie",
    ];
    const escapeCell = (val: unknown) => {
      const s = String(val ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };
    const rows = data.items.map((it) => [
      it.service_date,
      it.room_label,
      it.guest_name,
      it.booking_code || "-",
      it.package_title,
      it.service_mode_label,
      it.portions,
      it.adults,
      it.children,
      it.status,
      it.notes || "",
      it.kitchen_notes || "",
    ]);
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mic-dejun-${data.service_date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = data?.summary;
  const completionPct =
    summary && summary.total_tasks > 0
      ? Math.round((summary.served_count / summary.total_tasks) * 100)
      : 0;

  const renderSourceBadge = (item: BreakfastItem) => {
    if (item.source === "loyalty_vip") {
      return <Badge tone="gold">{item.source_label}</Badge>;
    }
    if (item.source === "upsell_addon") {
      return <Badge tone="green">{item.source_label}</Badge>;
    }
    if (item.source === "room_service") {
      return <Badge tone="navy">{item.source_label}</Badge>;
    }
    return <Badge tone="muted">{item.source_label}</Badge>;
  };

  const renderStatusBadge = (item: BreakfastItem) => {
    if (item.status === "served") {
      const timeStr = formatShortTime(item.served_at);
      return (
        <Badge tone="green">
          Servit{timeStr ? ` · ${timeStr}` : " ✓"}
        </Badge>
      );
    }
    if (item.status === "preparing") {
      return <Badge tone="gold">În pregătire</Badge>;
    }
    return <Badge tone="navy">De pregătit</Badge>;
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Operațiuni zilnice & bucătărie"
        title="Mic dejun & pregătire zilnică"
        description="Lista completă a porțiilor plătite (plan tarifar, suplimente folio, recompense VIP și room service) pentru organizarea zilnică a bucătăriei și recepției."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <LiveSyncBadge status={connectionStatus} isSyncing={isSyncing} />
            <div className="relative">
              <Calendar
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#0d2c5c]"
              />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="rounded-full border border-[#e1e8f0] bg-white pl-8 pr-3.5 py-2 text-[12px] font-semibold text-[#0d2c5c] shadow-sm outline-none focus:border-[#c69a3f]"
              />
            </div>
            <GhostButton size="sm" onClick={exportCsv} disabled={!data || data.items.length === 0}>
              <Download size={13} />
              CSV
            </GhostButton>
            <GhostButton size="sm" onClick={() => window.print()}>
              <Printer size={13} />
              Printează
            </GhostButton>
            <GhostButton size="sm" onClick={() => void loadSchedule()}>
              <RefreshCw size={13} />
              Actualizează
            </GhostButton>
          </div>
        }
      />

      {/* 7-Day Forecast Strip */}
      {data?.forecast && data.forecast.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {data.forecast.map((day) => {
            const active = day.date === selectedDate;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                className={`group rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                  active
                    ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-[0_10px_24px_rgba(13,44,92,0.18)]"
                    : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f]/60 hover:bg-[#fdf8ec]/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[10.5px] font-bold uppercase tracking-[0.14em] ${
                      active ? "text-[#e6b85c]" : "text-[#6b7c99]"
                    }`}
                  >
                    {day.label}
                  </span>
                  {day.tasks_count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active
                          ? "bg-white/15 text-white"
                          : "bg-[#eef2f7] text-[#0d2c5c]"
                      }`}
                    >
                      {day.served_count}/{day.tasks_count}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-[20px] font-bold leading-none">
                    {day.total_portions}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      active ? "text-white/75" : "text-[#6b7c99]"
                    }`}
                  >
                    {day.total_portions === 1 ? "porție" : "porții"}
                  </span>
                </div>
                <p
                  className={`mt-1 text-[10.5px] ${
                    active ? "text-white/65" : "text-[#94a3b8]"
                  }`}
                >
                  {day.tasks_count === 0
                    ? "Fără programări"
                    : `${day.tasks_count} ${day.tasks_count === 1 ? "serviciu" : "servicii"}`}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Arriving Today Notice */}
      {summary && summary.arriving_today_count > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c69a3f]/35 bg-[#fdf8ec] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c69a3f]/15 text-[#8a6420]">
              <Sparkles size={17} />
            </span>
            <div>
              <p className="text-[13px] font-bold text-[#0d2c5c]">
                {summary.arriving_today_count}{" "}
                {summary.arriving_today_count === 1 ? "cameră sosește" : "camere sosesc"} în{" "}
                {data?.service_date === data?.today ? "cursul zilei de azi" : "această zi"} cu mic dejun inclus / plătit
              </p>
              <p className="text-[12px] text-[#6b7c99]">
                Totalul de{" "}
                <strong className="text-[#8a6420]">
                  {summary.arriving_today_portions}{" "}
                  {summary.arriving_today_portions === 1 ? "porție" : "porții"}
                </strong>{" "}
                intră la servire în dimineața următoare check-in-ului.
              </p>
            </div>
          </div>
          {data?.forecast && data.forecast.length > 1 && selectedDate === data.today && (
            <PrimaryButton
              size="sm"
              onClick={() => setSelectedDate(data.forecast[1].date)}
            >
              Vezi lista de mâine →
            </PrimaryButton>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0d2c5c] to-[#1d4ed8]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
                Porții totale ({formatReadableDate(selectedDate).split(",")[0]})
              </p>
              <p className="mt-2 text-[28px] font-bold text-[#0d2c5c] leading-none">
                {summary?.total_portions ?? 0}
              </p>
              <p className="mt-2 text-[12px] text-[#6b7c99]">
                {summary?.total_adults ?? 0} adulți · {summary?.total_children ?? 0} copii
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2f7] text-[#0d2c5c]">
              <Users size={18} />
            </span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#c69a3f] to-[#e6b85c]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
                Bufet restaurant
              </p>
              <p className="mt-2 text-[28px] font-bold text-[#0d2c5c] leading-none">
                {summary?.buffet_portions ?? 0}
              </p>
              <p className="mt-2 text-[12px] text-[#6b7c99]">
                Program 07:30 – 10:30
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf8ec] text-[#8a6420]">
              <Utensils size={18} />
            </span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-[#c69a3f]" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
                Servire în cameră
              </p>
              <p className="mt-2 text-[28px] font-bold text-[#0d2c5c] leading-none">
                {summary?.in_room_portions ?? 0}
              </p>
              <p className="mt-2 text-[12px] text-[#6b7c99]">
                Mic dejun regal, VIP & room service
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BedDouble size={18} />
            </span>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
                Progres servire azi
              </p>
              <p className="mt-2 text-[28px] font-bold text-[#0d2c5c] leading-none">
                {summary?.served_count ?? 0}
                <span className="text-[16px] font-semibold text-[#6b7c99]">
                  {" "}
                  / {summary?.total_tasks ?? 0}
                </span>
              </p>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#eef2f7]">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f2ea] text-[#1f6b45]">
              <CheckCircle2 size={18} />
            </span>
          </div>
        </Card>
      </div>

      {/* Centralizator Bucatarie: Ce trebuie pregatit */}
      {data && data.package_breakdown.length > 0 && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#e6b85c]">
                <ChefHat size={16} />
              </span>
              <div>
                <h3 className="text-[14px] font-bold text-[#0d2c5c]">
                  Necesar de pregătit la bucătărie · {formatReadableDate(selectedDate)}
                </h3>
                <p className="text-[11.5px] text-[#6b7c99]">
                  Sumarul automat al pachetelor de mic dejun plătite sau incluse pentru dimineața selectată
                </p>
              </div>
            </div>
            {summary && summary.special_notes_count > 0 && (
              <Badge tone="gold">
                {summary.special_notes_count}{" "}
                {summary.special_notes_count === 1 ? "mențiune specială" : "mențiuni speciale"}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.package_breakdown.map((pkg) => (
              <div
                key={`${pkg.title}-${pkg.service_mode}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[#0d2c5c]" title={pkg.title}>
                    {pkg.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-[#6b7c99]">
                    <span className="font-semibold text-[#8a6420]">
                      {pkg.service_mode === "in_room" ? "În cameră" : "Bufet"}
                    </span>
                    <span>·</span>
                    <span>
                      {pkg.tasks_count} {pkg.tasks_count === 1 ? "rezervare" : "rezervări"}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 rounded-xl bg-white border border-[#e1e8f0] px-3 py-1.5 text-center shadow-sm">
                  <span className="block text-[18px] font-bold text-[#0d2c5c] leading-none">
                    {pkg.portions}
                  </span>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#6b7c99]">
                    {pkg.portions === 1 ? "porție" : "porții"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters & Daily Execution Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#eef2f7] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { key: "all", label: `Toate (${summary?.total_tasks ?? 0})` },
                { key: "pending", label: `De pregătit (${summary?.pending_count ?? 0})` },
                { key: "preparing", label: `În preparare (${summary?.preparing_count ?? 0})` },
                { key: "served", label: `Servite (${summary?.served_count ?? 0})` },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition-all cursor-pointer ${
                  statusFilter === f.key
                    ? "bg-[#0d2c5c] text-white shadow-sm"
                    : "bg-[#f4f6f9] text-[#2a3b52] hover:bg-[#e1e8f0]"
                }`}
              >
                {f.label}
              </button>
            ))}

            <span className="mx-1 h-4 w-px bg-[#e1e8f0] hidden sm:inline-block" />

            {(
              [
                { key: "all", label: "Toate zonele" },
                { key: "buffet", label: "Bufet" },
                { key: "in_room", label: "În cameră" },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setModeFilter(m.key)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold border transition-all cursor-pointer ${
                  modeFilter === m.key
                    ? "border-[#c69a3f] bg-[#fdf8ec] text-[#8a6420]"
                    : "border-[#e1e8f0] bg-white text-[#6b7c99] hover:text-[#0d2c5c]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Caută cameră, oaspete, cod, note..."
          />
        </div>

        {loading ? (
          <div className="p-5">
            <TableSkeleton rows={5} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Niciun mic dejun programat pentru criteriile alese"
              hint={
                summary && summary.arriving_today_count > 0
                  ? `Pentru ${formatReadableDate(selectedDate)} nu sunt servicii restante, însă ${summary.arriving_today_count} camere sosesc azi și vor servi micul dejun mâine dimineață.`
                  : "Rezervările cu plan tarifar «Mic dejun inclus», suplimentele cumpărate pe folio și recompensele VIP apar automat aici în fiecare dimineață."
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#eef2f7] bg-[#f8fafd] text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7c99]">
                    <th className="px-5 py-3.5">Cameră & Sejur</th>
                    <th className="px-4 py-3.5">Oaspete</th>
                    <th className="px-4 py-3.5">Pachet & Mod servire</th>
                    <th className="px-4 py-3.5">Porții</th>
                    <th className="px-4 py-3.5">Observații & Alergii</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Acțiuni zilnice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f7] text-[13px]">
                  {paged.slice.map((item) => {
                    const isBusy = busyKey === item.item_key;
                    return (
                      <tr
                        key={item.item_key}
                        className={`transition-colors hover:bg-[#f8fafd]/80 ${
                          item.status === "served" ? "opacity-75" : ""
                        }`}
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="font-bold text-[#0d2c5c]">{item.room_label}</div>
                          {item.unit_number && (
                            <div className="text-[11.5px] text-[#6b7c99]">{item.room_title}</div>
                          )}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {item.booking_code && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#eef2f7] px-2 py-0.5 font-mono text-[10.5px] font-bold text-[#0d2c5c]">
                                #{item.booking_code}
                              </span>
                            )}
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                item.is_paid
                                  ? "bg-[#e6f2ea] text-[#1f6b45]"
                                  : "bg-amber-50 text-amber-800"
                              }`}
                            >
                              {item.is_paid ? "Achitat" : "Pe folio"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-[#0d2c5c]">
                              {item.guest_name}
                            </span>
                            {item.vip_tier && item.vip_tier !== "Bronze" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf8ec] border border-[#c69a3f]/40 px-2 py-0.5 text-[10px] font-bold text-[#8a6420]">
                                <Crown size={10} />
                                VIP {item.vip_tier}
                              </span>
                            )}
                          </div>
                          {item.guest_phone && (
                            <div className="mt-0.5 text-[11.5px] text-[#6b7c99]">
                              {item.guest_phone}
                            </div>
                          )}
                          {item.guest_email && (
                            <div className="text-[11px] text-[#94a3b8] truncate max-w-[180px]">
                              {item.guest_email}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="font-semibold text-[#0d2c5c]">{item.package_title}</div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {renderSourceBadge(item)}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${
                                item.service_mode === "in_room"
                                  ? "bg-amber-50 text-amber-900 border border-amber-200/80"
                                  : "bg-[#f4f6f9] text-[#2a3b52]"
                              }`}
                            >
                              {item.service_mode === "in_room" ? (
                                <BedDouble size={11} />
                              ) : (
                                <Utensils size={11} />
                              )}
                              {item.service_mode_label}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#f8fafd] border border-[#e1e8f0] px-2.5 py-1.5">
                            <span className="text-[15px] font-bold text-[#0d2c5c]">
                              {item.portions}
                            </span>
                            <span className="text-[11px] text-[#6b7c99]">
                              {item.portions === 1 ? "porție" : "porții"}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-[#6b7c99]">
                            {item.adults} ad.{item.children > 0 ? ` + ${item.children} cop.` : ""}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top max-w-[240px]">
                          {item.notes ? (
                            <div className="rounded-xl border border-amber-200/80 bg-[#fdf8ec] px-2.5 py-1.5 text-[11.5px] text-[#785315] flex items-start gap-1.5">
                              <AlertCircle size={13} className="shrink-0 mt-0.5 text-[#c69a3f]" />
                              <span>{item.notes}</span>
                            </div>
                          ) : (
                            <span className="text-[11.5px] text-[#94a3b8]">Fără mențiuni</span>
                          )}
                          {item.kitchen_notes && (
                            <div className="mt-1.5 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-1.5 text-[11.5px] text-[#0d2c5c] flex items-start gap-1.5">
                              <FileText size={12} className="shrink-0 mt-0.5 text-[#0d2c5c]" />
                              <span>{item.kitchen_notes}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          {renderStatusBadge(item)}
                        </td>

                        <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {item.status === "pending" && (
                              <>
                                <GhostButton
                                  size="sm"
                                  disabled={isBusy}
                                  onClick={() => void handleStatusUpdate(item, "preparing")}
                                >
                                  <Clock size={12} />
                                  Pregătește
                                </GhostButton>
                                <PrimaryButton
                                  size="sm"
                                  disabled={isBusy}
                                  onClick={() => void handleStatusUpdate(item, "served")}
                                >
                                  <CheckCircle2 size={12} />
                                  Servit
                                </PrimaryButton>
                              </>
                            )}
                            {item.status === "preparing" && (
                              <PrimaryButton
                                size="sm"
                                disabled={isBusy}
                                onClick={() => void handleStatusUpdate(item, "served")}
                              >
                                <CheckCircle2 size={12} />
                                Marchează servit
                              </PrimaryButton>
                            )}
                            {item.status === "served" && (
                              <GhostButton
                                size="sm"
                                disabled={isBusy}
                                onClick={() => void handleStatusUpdate(item, "pending")}
                              >
                                Reia
                              </GhostButton>
                            )}
                            <button
                              type="button"
                              title="Adaugă notă bucătărie / oră"
                              onClick={() => openNotesModal(item)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e1e8f0] bg-white text-[#6b7c99] hover:border-[#0d2c5c] hover:text-[#0d2c5c] transition-colors cursor-pointer"
                            >
                              <MessageSquarePlus size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={paged.page}
              pages={paged.pages}
              total={paged.total}
              perPage={paged.perPage}
              onPage={paged.setPage}
            />
          </>
        )}
      </Card>

      <Modal
        open={Boolean(notesModalItem)}
        onClose={() => setNotesModalItem(null)}
        title="Notă internă bucătărie / recepție"
        subtitle={
          notesModalItem
            ? `${notesModalItem.room_label} · ${notesModalItem.guest_name} (${notesModalItem.service_date})`
            : undefined
        }
        footer={
          <>
            <GhostButton size="sm" onClick={() => setNotesModalItem(null)}>
              Anulează
            </GhostButton>
            <PrimaryButton size="sm" disabled={savingNotes} onClick={() => void saveKitchenNotes()}>
              {savingNotes ? "Se salvează..." : "Salvează nota"}
            </PrimaryButton>
          </>
        }
      >
        <Field label="Observații pentru echipa de dimineață (ex: oră livrare, masă rezervată, alergeni)">
          <Textarea
            rows={4}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="Ex: Masă la geam pregătită la 08:30, omletă fără lactate pentru copil..."
          />
        </Field>
      </Modal>
    </div>
  );
}
