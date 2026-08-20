import { useCallback, useEffect, useState } from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { Card, SectionHeader, Button, EmptyState, TableSkeleton, inputCls } from "./ui";
import PricingOverrideModal from "./PricingOverrideModal";
import { pricingDashboard } from "../../services/pricingService";
import { roomTypes as roomTypesApi } from "../../services/roomsService";
import { httpErrorMessage } from "../../services/apiClient";
import { ron, occupancyValue, toISODate, dayLabel } from "../../lib/format";
import type { PricingDashboard, PricingDashboardRow } from "../../types/pricing";
import type { Nomenclature } from "../../types/rooms";

const rowName = (r: PricingDashboardRow) => r.room_type_name || r.name || `#${r.room_type_id}`;
const rowPrice = (r: PricingDashboardRow) => r.override_price ?? r.final_price ?? r.price ?? 0;

function OccupancyBadge({ value }: { value?: number | null }) {
  const pct = occupancyValue(value);
  const cls =
    pct >= 80
      ? "bg-red-50 text-red-700 border-red-200"
      : pct >= 40
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {pct.toFixed(0)}%
    </span>
  );
}

function SourceBadge({ source }: { source?: string | null }) {
  if (source === "admin_override")
    return (
      <span className="rounded-full bg-[#f4e5c8] px-2.5 py-0.5 text-[11px] font-semibold text-[#8a6413]">
        Manual override
      </span>
    );
  if (source === "dynamic_pipeline")
    return (
      <span className="rounded-full bg-[#e8f0fb] px-2.5 py-0.5 text-[11px] font-semibold text-[#0d2c5c]">
        Dynamic
      </span>
    );
  return <span className="text-[12px] text-[#8595aa]">{source || "—"}</span>;
}

/** GET /api/pricing/dashboard + POST /api/pricing/override */
export default function PricingDashboardTab() {
  const [date, setDate] = useState(toISODate(new Date()));
  const [data, setData] = useState<PricingDashboard | null>(null);
  const [types, setTypes] = useState<Nomenclature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<number | string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await pricingDashboard(date));
    } catch (e) {
      setData(null);
      setError(httpErrorMessage(e, "Nu am putut încărca dashboardul de pricing."));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    roomTypesApi.all().then(setTypes).catch(() => setTypes([]));
  }, []);

  const rows = data?.rows ?? [];
  const overrides = data?.overrides ?? [];

  return (
    <div>
      <SectionHeader
        eyebrow="Dynamic pricing"
        title="Tarife dinamice pe zi"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label="Data analizată"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputCls} w-auto`}
            />
            <Button variant="ghost" onClick={() => void load()}>
              <RefreshCw size={14} /> Reîncarcă
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalType(null);
                setModalOpen(true);
              }}
            >
              <SlidersHorizontal size={14} /> Override
            </Button>
          </div>
        }
      />

      <Card>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <p role="alert" className="px-6 py-10 text-center text-[13px] text-red-600">
            {error}
          </p>
        ) : rows.length === 0 ? (
          <EmptyState title="Nicio informație de pricing" hint={`Nu există date pentru ${dayLabel(date)}.`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="border-b border-[#eef2f7] text-[10.5px] uppercase tracking-[0.14em] text-[#8595aa]">
                <tr>
                  <th className="px-5 py-3">Tip cameră</th>
                  <th className="px-5 py-3 text-right">Preț/noapte</th>
                  <th className="px-5 py-3 text-right">Ocupare</th>
                  <th className="px-5 py-3 text-right">Pace index</th>
                  <th className="px-5 py-3">Sursă</th>
                  <th className="px-5 py-3 text-right">Acțiune</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={String(r.room_type_id)} className="border-b border-[#f4f7fb] last:border-0">
                    <td className="px-5 py-3.5 font-semibold text-[#0d2c5c]">{rowName(r)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[#0d2c5c]">
                      {ron(rowPrice(r))}
                      {r.override_price != null && r.override_expires_at && (
                        <span className="mt-0.5 block text-[11px] text-[#8a6413]">
                          expiră {new Date(r.override_expires_at).toLocaleString("ro-RO")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <OccupancyBadge value={r.occupancy ?? r.occupancy_rate} />
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[#3d4f6b]">
                      {r.pace_index != null ? Number(r.pace_index).toFixed(2) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <SourceBadge source={r.source} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setModalType(r.room_type_id);
                          setModalOpen(true);
                        }}
                      >
                        Override
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-8">
        <SectionHeader eyebrow="Istoric" title="Override-uri manuale" />
        <Card>
          {overrides.length === 0 ? (
            <EmptyState title="Niciun override înregistrat" />
          ) : (
            <ul className="divide-y divide-[#f4f7fb]">
              {overrides.map((o, i) => (
                <li key={String(o.id ?? i)} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#0d2c5c]">
                      {o.room_type_name || `Tip #${o.room_type_id}`} · {ron(o.fixed_price ?? o.price)}
                    </p>
                    <p className="text-[12px] text-[#6b7c99]">
                      {o.start_date} → {o.end_date}
                      {o.reason ? ` · ${o.reason}` : ""}
                    </p>
                  </div>
                  <p className="text-[11.5px] text-[#8595aa]">
                    {o.expires_at ? `expiră ${new Date(o.expires_at).toLocaleString("ro-RO")}` : ""}
                    {o.created_by ? ` · ${o.created_by}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <PricingOverrideModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void load()}
        roomTypes={types}
        defaultRoomTypeId={modalType}
        defaultDate={date}
      />
    </div>
  );
}
