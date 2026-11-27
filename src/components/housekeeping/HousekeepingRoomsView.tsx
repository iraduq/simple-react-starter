import { RefreshCw, LayoutGrid, CheckCircle2, BrushCleaning, SearchCode, Wrench } from "lucide-react";
import { Button, EmptyState, Pagination, SectionHeader, Skeleton } from "../admin/ui";
import { LiveSyncBadge } from "../../context/AdminLiveSyncContext";
import type { HousekeepingUnit } from "../../services/housekeepingService";
import { unitId, roomTitle, unitNumber } from "../../types/housekeeping";
import Kpi from "./HousekeepingKpi";
import HousekeepingFilters from "./HousekeepingFilters";
import HousekeepingCard from "./HousekeepingCard";

interface HousekeepingRoomsViewProps {
  roleCopy: { eyebrow: string; heading: string; badge: string };
  isSyncing: boolean;
  connectionStatus: any;
  loadUnits: (silent?: boolean) => Promise<void>;
  refreshing: boolean;
  loading: boolean;
  counts: {
    all: number;
    clean: number;
    dirty: number;
    inspecting: number;
    maintenance: number;
    checkoutToday: number;
    openTickets: number;
  };
  floors: number[];
  filter: string;
  setFilter: (f: string) => void;
  search: string;
  setSearch: (s: string) => void;
  floorFilter: number | "all";
  setFloorFilter: (fl: number | "all") => void;
  filtered: HousekeepingUnit[];
  paged: {
    slice: HousekeepingUnit[];
    page: number;
    pages: number;
    total: number;
    perPage: number;
    setPage: (p: number) => void;
  };
  updatingId: string | null;
  handleStatusChange: (
    u: HousekeepingUnit,
    payload: { status: "active" | "cleaning" | "maintenance"; clean_status?: "clean" | "dirty" | "inspecting" },
    successText: string
  ) => Promise<void>;
  onOpenMaintenanceModal: (u: HousekeepingUnit) => void;
  onOpenLostFoundModal: (u: HousekeepingUnit) => void;
}

export default function HousekeepingRoomsView({
  roleCopy,
  isSyncing,
  connectionStatus,
  loadUnits,
  refreshing,
  loading,
  counts,
  floors,
  filter,
  setFilter,
  search,
  setSearch,
  floorFilter,
  setFloorFilter,
  filtered,
  paged,
  updatingId,
  handleStatusChange,
  onOpenMaintenanceModal,
  onOpenLostFoundModal,
}: HousekeepingRoomsViewProps) {
  return (
    <>
      <SectionHeader
        eyebrow={roleCopy.eyebrow}
        title={roleCopy.heading}
        description="Monitorizează starea igienizării, prioritățile de check-out de azi, inspecția camerelor și raportează instant defecțiuni."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <LiveSyncBadge isSyncing={isSyncing} status={connectionStatus} />
            <Button variant="ghost" size="sm" onClick={() => void loadUnits(false)} disabled={refreshing || loading}>
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Reîmprospătează
            </Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[118px] rounded-2xl" />) : (
          <>
            <Kpi icon={LayoutGrid} label="Total Camere" value={String(counts.all)} hint={`${floors.length} etaje monitorizate`} tone="navy" />
            <Kpi icon={CheckCircle2} label="Curate & Pregătite" value={String(counts.clean)} hint="Disponibile check-in" delay={0.05} tone="green" />
            <Kpi icon={BrushCleaning} label="Necesită Curățenie" value={String(counts.dirty)} hint={counts.checkoutToday > 0 ? `${counts.checkoutToday} check-out azi` : "În așteptare"} delay={0.1} tone="gold" />
            <Kpi icon={SearchCode} label="În Inspecție" value={String(counts.inspecting)} hint="Verificare calitate" delay={0.15} tone="navy" />
            <Kpi icon={Wrench} label="În Mentenanță" value={String(counts.maintenance)} hint={counts.openTickets > 0 ? `${counts.openTickets} tichete active` : "Fără defecțiuni"} delay={0.2} tone="red" />
          </>
        )}
      </div>
      <HousekeepingFilters counts={counts} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} floors={floors} floorFilter={floorFilter} setFloorFilter={setFloorFilter} />
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[290px] rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#e1e8f0] bg-white p-8">
            <EmptyState title="Nicio cameră găsită" hint="Modifică filtrul de etaj, status sau căutarea." />
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
                  onReportMaintenance={() => onOpenMaintenanceModal(u)}
                  onReportLostFound={() => onOpenLostFoundModal(u)}
                />
              ))}
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white">
              <Pagination page={paged.page} pages={paged.pages} total={paged.total} perPage={paged.perPage} onPage={paged.setPage} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
