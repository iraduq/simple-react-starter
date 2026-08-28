import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Wrench,
  BedDouble,
  BrushCleaning,
  LayoutGrid,
  RefreshCw,
} from "lucide-react";
import {
  getHousekeepingUnits,
  activateUnit,
  type HousekeepingUnit,
} from "../services/housekeepingService";
import { fetchSession, type SessionUser } from "../lib/auth";
import { useToast } from "../components/Toast";
import {
  Badge,
  SearchBox,
  Pagination,
  usePaged,
  EmptyState,
  Skeleton,
} from "../components/admin/ui";

const isHousekeepingStaff = (u: NonNullable<SessionUser>) =>
  u.role === "admin" || u.role === "menajera";

const unitId = (u: HousekeepingUnit) => u.id || u.unit_id || "";
const roomTitle = (u: HousekeepingUnit) => u.room_title || u.title || "Cameră";
const unitNumber = (u: HousekeepingUnit) =>
  u.unit_number || u.number || u.code || "—";

const STATUSES: {
  value: string;
  label: string;
  tone: "green" | "gold" | "red" | "navy" | "muted";
}[] = [
  { value: "active", label: "Curată / Activă", tone: "green" },
  { value: "cleaning", label: "Necesită curățenie", tone: "gold" },
  { value: "maintenance", label: "Mentenanță", tone: "red" },
];

const statusLabel = (s?: string | null) =>
  STATUSES.find((x) => x.value === s)?.label || s || "Necunoscut";

const statusTone = (s?: string | null) =>
  STATUSES.find((x) => x.value === s)?.tone || "muted";

const EASE = [0.22, 1, 0.36, 1] as const;

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  delay = 0,
  accent,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
  hint?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={`rounded-[24px] border bg-white p-6 shadow-[0_4px_20px_rgba(13,44,92,0.03)] transition-shadow duration-500 hover:shadow-[0_12px_40px_rgba(13,44,92,0.08)] ${
        accent ? "border-[#c69a3f]/45" : "border-[#e1e8f0]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7c99]">
            {label}
          </span>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[#0d2c5c]">
            {value}
          </p>
          {hint && (
            <span className="mt-2 block text-[12px] text-[#6b7c99]">
              {hint}
            </span>
          )}
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-transform duration-500 hover:scale-110 ${
            accent
              ? "border-[#c69a3f]/35 bg-[#f4e5c8]/60 text-[#8a6420]"
              : "border-[#e1e8f0] bg-[#f4f6f9] text-[#0d2c5c]"
          }`}
        >
          <Icon size={20} strokeWidth={1.5} />
        </span>
      </div>
    </motion.div>
  );
}

export default function Housekeeping() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [units, setUnits] = useState<HousekeepingUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let active = true;
    (async () => {
      const s = await fetchSession(true);
      if (!active) return;
      if (!s || !isHousekeepingStaff(s)) {
        navigate(s ? "/" : "/login", { replace: true });
        return;
      }
      try {
        const data = await getHousekeepingUnits();
        if (active) setUnits(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (active) {
          toast(
            err?.message || "Nu am putut încărca lista camerelor.",
            "error",
          );
          setUnits([]);
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [navigate, toast]);

  const reload = async () => {
    setRefreshing(true);
    try {
      const data = await getHousekeepingUnits();
      setUnits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast(err?.message || "Nu am putut reîncărca lista.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleActivate = async (u: HousekeepingUnit) => {
    const id = unitId(u);
    if (!id) return;
    setUpdatingId(id);
    try {
      await activateUnit(id);
      toast(
        `${roomTitle(u)} · Unitatea ${unitNumber(u)} a fost marcată ca curată.`,
        "success",
      );
      const data = await getHousekeepingUnits();
      setUnits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast(err?.message || "Nu am putut actualiza statusul.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return units.filter((u) => {
      const matchesSearch =
        !q ||
        roomTitle(u).toLowerCase().includes(q) ||
        unitNumber(u).toLowerCase().includes(q) ||
        (u.notes || "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" || (u.status || "active") === filter;
      return matchesSearch && matchesFilter;
    });
  }, [units, search, filter]);

  const counts = useMemo(() => {
    return {
      all: units.length,
      cleaning: units.filter((u) => u.status === "cleaning").length,
      maintenance: units.filter((u) => u.status === "maintenance").length,
      active: units.filter((u) => u.status === "active" || !u.status).length,
    };
  }, [units]);

  const paged = usePaged(filtered, 12);

  return (
    <div className="min-h-screen bg-[#f9f7f2] pt-[76px] lg:pt-[96px]">
      {/* Header */}
      <div className="border-b border-[#e1e8f0] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-[#c69a3f]">
                Operațiuni cameriste
              </span>
              <h1
                className="mt-2 text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.05] text-[#0d2c5c]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Panou Housekeeping
              </h1>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-[#4f6280]">
                Urmărește starea fiecărei unități și marchează curățenia
                finalizată dintr-un singur click.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Caută cameră sau număr unitate…"
                className="w-full sm:w-72"
              />
              <button
                onClick={reload}
                disabled={refreshing || loading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e1e8f0] bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] transition-colors hover:border-[#c69a3f] hover:text-[#c69a3f] disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
                Reîmprospătează
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* KPI */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[128px] rounded-[24px]" />
            ))
          ) : (
            <>
              <Kpi
                icon={LayoutGrid}
                label="Total unități"
                value={String(counts.all)}
                hint="Toate camerele monitorizate"
              />
              <Kpi
                icon={BrushCleaning}
                label="Necesită curățenie"
                value={String(counts.cleaning)}
                hint="Prioritate imediată"
                delay={0.06}
                accent={counts.cleaning > 0}
              />
              <Kpi
                icon={CheckCircle2}
                label="Curate / active"
                value={String(counts.active)}
                hint="Gata pentru oaspeți"
                delay={0.12}
              />
              <Kpi
                icon={Wrench}
                label="În mentenanță"
                value={String(counts.maintenance)}
                hint="Indisponibile temporar"
                delay={0.18}
              />
            </>
          )}
        </div>

        {/* Filtre */}
        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip
            label={`Toate · ${counts.all}`}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterChip
            label={`Curățenie · ${counts.cleaning}`}
            active={filter === "cleaning"}
            onClick={() => setFilter("cleaning")}
            emphasis
          />
          <FilterChip
            label={`Mentenanță · ${counts.maintenance}`}
            active={filter === "maintenance"}
            onClick={() => setFilter("maintenance")}
          />
          <FilterChip
            label={`Curate · ${counts.active}`}
            active={filter === "active"}
            onClick={() => setFilter("active")}
          />
        </div>

        {/* Listă */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[196px] rounded-[24px]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-8">
              <EmptyState
                title="Nu am găsit unități"
                hint="Ajustează filtrul sau căutarea."
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.slice.map((u, i) => (
                  <HousekeepingCard
                    key={unitId(u) || `${roomTitle(u)}-${unitNumber(u)}`}
                    unit={u}
                    index={i}
                    updating={updatingId === unitId(u)}
                    onActivate={() => handleActivate(u)}
                  />
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[#e1e8f0] bg-white">
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
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 ${
        active
          ? emphasis
            ? "border-[#c69a3f] bg-[#c69a3f] text-white shadow-[0_6px_16px_-6px_rgba(198,154,63,0.6)]"
            : "border-[#0d2c5c] bg-[#0d2c5c] text-white"
          : "border-[#e1e8f0] bg-white text-[#0d2c5c] hover:border-[#c69a3f] hover:text-[#c69a3f]"
      }`}
    >
      {label}
    </button>
  );
}

function HousekeepingCard({
  unit,
  updating,
  onActivate,
  index,
}: {
  unit: HousekeepingUnit;
  updating: boolean;
  onActivate: () => void;
  index: number;
}) {
  const status = unit.status || "active";
  const needsCleaning = status === "cleaning";
  const isMaintenance = status === "maintenance";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.3),
        ease: EASE,
      }}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-[24px] border bg-white p-6 shadow-[0_4px_20px_rgba(13,44,92,0.03)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(13,44,92,0.09)] ${
        needsCleaning ? "border-[#c69a3f]/55" : "border-[#e1e8f0]"
      }`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-[3px] ${
          needsCleaning
            ? "bg-gradient-to-r from-[#c69a3f] to-[#e6b85c]"
            : isMaintenance
              ? "bg-[#8c2f39]"
              : "bg-[#0d2c5c]/15"
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-transform duration-500 group-hover:scale-105 ${
              needsCleaning
                ? "border-[#c69a3f]/35 bg-[#f4e5c8]/60 text-[#8a6420]"
                : "border-[#e1e8f0] bg-[#f4f6f9] text-[#0d2c5c]"
            }`}
          >
            <BedDouble size={19} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p
              className="truncate text-[17px] leading-tight text-[#0d2c5c]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {roomTitle(unit)}
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7c99]">
              Unitatea {unitNumber(unit)}
            </p>
          </div>
        </div>
      </div>

      <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>

      {unit.notes && (
        <p className="rounded-xl bg-[#f9f7f2] p-3 text-[12px] leading-relaxed text-[#4f6280]">
          {unit.notes}
        </p>
      )}

      {needsCleaning ? (
        <button
          onClick={onActivate}
          disabled={updating}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c69a3f] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_-8px_rgba(198,154,63,0.7)] transition-colors hover:bg-[#0d2c5c] disabled:opacity-60"
        >
          {updating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Se actualizează…
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Finalizează curățenia
            </>
          )}
        </button>
      ) : (
        <div
          className={`mt-auto flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] ${
            isMaintenance
              ? "bg-[#8c2f39]/[0.08] text-[#8c2f39]"
              : "bg-[#e6f2ea] text-[#1f6b45]"
          }`}
        >
          {isMaintenance ? (
            <>
              <Wrench size={15} />
              În mentenanță
            </>
          ) : (
            <>
              <CheckCircle2 size={15} />
              Cameră gata
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
