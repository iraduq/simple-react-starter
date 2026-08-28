import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wrench,
  BedDouble,
} from "lucide-react";
import {
  getHousekeepingUnits,
  activateUnit,
  type HousekeepingUnit,
} from "../services/housekeepingService";
import {
  fetchSession,
  getCachedUser,
  type SessionUser,
} from "../lib/auth";
import { useToast } from "../components/Toast";
import {
  Card,
  SectionHeader,
  Badge,
  SearchBox,
  Pagination,
  usePaged,
  EmptyState,
} from "../components/admin/ui";

const isHousekeepingStaff = (u: NonNullable<SessionUser>) =>
  u.role === "admin" || u.role === "housekeeping";

const unitId = (u: HousekeepingUnit) => u.id || u.unit_id || "";
const roomTitle = (u: HousekeepingUnit) =>
  u.room_title || u.title || "Cameră";
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

export default function Housekeeping() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<SessionUser>(getCachedUser());
  const [units, setUnits] = useState<HousekeepingUnit[]>([]);
  const [loading, setLoading] = useState(true);
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
      setUser(s);
      await loadUnits();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const loadUnits = async () => {
    try {
      const data = await getHousekeepingUnits();
      setUnits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast(err?.message || "Nu am putut încărca lista camerelor.", "error");
      setUnits([]);
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
      await loadUnits();
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#6b7c99] text-[11px] font-bold tracking-[0.2em] uppercase pt-32">
        Se încarcă panoul de curățenie…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafd] pt-20 lg:pt-24 pb-24">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Operațiuni cameriste"
          title="Panou Housekeeping"
          action={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Caută cameră sau număr unitate…"
                className="w-full sm:w-72"
              />
            </div>
          }
        />

        {/* Filtrare rapidă */}
        <div className="flex flex-wrap gap-2 mb-8">
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

        {filtered.length === 0 ? (
          <Card className="p-10">
            <EmptyState
              title="Nu am găsit unități"
              hint="Ajustează filtrul sau cautarea."
            />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paged.slice.map((u) => (
                <HousekeepingCard
                  key={unitId(u) || `${roomTitle(u)}-${unitNumber(u)}`}
                  unit={u}
                  updating={updatingId === unitId(u)}
                  onActivate={() => handleActivate(u)}
                />
              ))}
            </div>

            <div className="mt-8">
              <Card>
                <Pagination
                  page={paged.page}
                  pages={paged.pages}
                  total={paged.total}
                  perPage={paged.perPage}
                  onPage={paged.setPage}
                />
              </Card>
            </div>
          </>
        )}
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
      className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] border transition-all duration-200 ${
        active
          ? emphasis
            ? "bg-[#c69a3f] text-white border-[#c69a3f] shadow-[0_6px_16px_-6px_rgba(198,154,63,0.6)]"
            : "bg-[#0d2c5c] text-white border-[#0d2c5c]"
          : "bg-white text-[#0d2c5c] border-[#e1e8f0] hover:border-[#c69a3f] hover:text-[#c69a3f]"
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
}: {
  unit: HousekeepingUnit;
  updating: boolean;
  onActivate: () => void;
}) {
  const status = unit.status || "active";
  const needsCleaning = status === "cleaning";
  const isMaintenance = status === "maintenance";

  return (
    <Card
      className={`p-5 flex flex-col gap-4 transition-all duration-200 ${
        needsCleaning
          ? "border-[#c69a3f] shadow-[0_8px_24px_-8px_rgba(198,154,63,0.35)]"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2f7] text-[#0d2c5c]">
            <BedDouble size={20} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[#0d2c5c] truncate">
              {roomTitle(unit)}
            </p>
            <p className="text-[12px] text-[#6b7c99]">
              Unitatea {unitNumber(unit)}
            </p>
          </div>
        </div>
        <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
      </div>

      {unit.notes && (
        <p className="text-[12px] text-[#4f6280] leading-relaxed bg-[#f8fafd] rounded-lg p-3">
          {unit.notes}
        </p>
      )}

      {needsCleaning ? (
        <button
          onClick={onActivate}
          disabled={updating}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_20px_-8px_rgba(198,154,63,0.7)] transition-all hover:from-[#0d2c5c] hover:to-[#12386f] disabled:opacity-60"
        >
          {updating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Se actualizează…
            </>
          ) : (
            <>
              <Sparkles size={16} />
             Finalizează curățenia
            </>
          )}
        </button>
      ) : (
        <div
          className={`mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[12px] font-bold uppercase tracking-[0.12em] ${
            isMaintenance
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {isMaintenance ? (
            <>
              <Wrench size={16} />
              În mentenanță
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Cameră gata
            </>
          )}
        </div>
      )}
    </Card>
  );
}
