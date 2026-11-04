import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BedDouble, TrendingDown, TrendingUp } from "lucide-react";
import { Card, Skeleton } from "../admin/ui";
import type { BusinessComparison, MonthlyBusinessReport } from "../../types/analytics";
import { formatNum, formatRon, periodLabel } from "./shared";

const NAVY = "#0d2c5c";
const GOLD = "#c69a3f";

export default function AnalyticsCharts({
  report,
  compare,
  loading,
}: {
  report?: MonthlyBusinessReport | null;
  compare?: BusinessComparison | null;
  loading: boolean;
}) {
  const rooms = Object.entries(report?.top_booked_rooms ?? {})
    .map(([name, count]) => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name);
      return { name: isUuid ? "Cameră Standard" : name, count };
    })
    .sort((a, b) => b.count - a.count);

  const cur = periodLabel(compare?.current_period) || "Luna curentă";
  const prev = periodLabel(compare?.previous_period) || "Luna anterioară";

  const volumeCmp = compare
    ? [
        { metric: "Rezervări", [cur]: compare.current_bookings, [prev]: compare.previous_bookings },
        { metric: "Total Oaspeți", [cur]: compare.current_total_guests, [prev]: compare.previous_total_guests },
      ]
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ── CARD 1: TOP TIPURI DE CAMERE ── */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[20px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
              Top Camere Solicitate
            </h3>
            <p className="text-[12px] text-[#6b7c99]">Distribuția rezervărilor pe tipuri de camere</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#f4f6f9] px-3 py-1 text-[11px] font-semibold text-[#0d2c5c]">
            <BedDouble size={14} className="text-[#c69a3f]" />
            {report?.total_room_nights ?? 0} nopți vândute
          </span>
        </div>

        {loading ? (
          <Skeleton className="h-64" />
        ) : rooms.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <BedDouble size={32} className="text-[#94a3b8] mb-2" />
            <p className="text-sm font-semibold text-[#0d2c5c]">Nu există rezervări în această perioadă</p>
            <p className="text-xs text-[#6b7c99] mt-0.5">Selectează o altă lună din selectorul de perioadă.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, rooms.length * 48)}>
            <BarChart data={rooms} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7c99" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fontSize: 12, fill: "#0d2c5c", fontWeight: 500 }}
              />
              <Tooltip
                formatter={(v) => [`${formatNum(Number(v))} rezervări`, "Volum"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e1e8f0" }}
              />
              <Bar dataKey="count" fill={NAVY} radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── CARD 2: EVOLUȚIE COMPARATIVĂ ── */}
      <Card className="p-6 flex flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[20px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
                Evoluție Lunară ({cur} vs {prev})
              </h3>
              <p className="text-[12px] text-[#6b7c99]">Comparația vânzărilor și a volumului de oaspeți</p>
            </div>
          </div>

          {compare && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7c99]">Încasări Lunare</span>
                <div className="text-[17px] font-bold text-[#0d2c5c] mt-0.5">
                  {formatRon(compare.current_revenue_ron)}
                </div>
                <div className="mt-1 text-[11px] text-[#6b7c99]">
                  anterior: {formatRon(compare.previous_revenue_ron)}
                </div>
              </div>

              <div className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7c99]">Variație Venituri</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {compare.revenue_growth_pct >= 0 ? (
                    <TrendingUp size={16} className="text-emerald-600" />
                  ) : (
                    <TrendingDown size={16} className="text-red-600" />
                  )}
                  <span
                    className={`text-[17px] font-bold ${
                      compare.revenue_growth_pct >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {compare.revenue_growth_pct >= 0 ? "+" : ""}
                    {compare.revenue_growth_pct.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}%
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#6b7c99]">
                  {compare.current_bookings} vs {compare.previous_bookings} rezervări
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <Skeleton className="h-44" />
          ) : volumeCmp.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#6b7c99]">Date insuficiente pentru comparație.</p>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={volumeCmp} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "#0d2c5c", fontWeight: 500 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7c99" }} />
                <Tooltip
                  formatter={(v) => Number(v).toLocaleString("ro-RO")}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e1e8f0" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: "8px" }} />
                <Bar dataKey={prev} fill={GOLD} radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey={cur} fill={NAVY} radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
