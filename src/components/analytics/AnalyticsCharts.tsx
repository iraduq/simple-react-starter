import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, Skeleton } from "../admin/ui";
import type { BusinessComparison, MonthlyBusinessReport } from "../../types/analytics";
import { formatNum, periodLabel } from "./shared";

const NAVY = "#0d2c5c";
const GOLD = "#c69a3f";

export default function AnalyticsCharts({
  report, compare, loading,
}: { report?: MonthlyBusinessReport | null; compare?: BusinessComparison | null; loading: boolean }) {
  const rooms = Object.entries(report?.top_booked_rooms ?? {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const cur = periodLabel(compare?.current_period) || "Luna curentă";
  const prev = periodLabel(compare?.previous_period) || "Luna precedentă";
  const cmp = compare
    ? [
        { metric: "Venituri (mii RON)", [cur]: compare.current_revenue_ron / 1000, [prev]: compare.previous_revenue_ron / 1000 },
        { metric: "Rezervări", [cur]: compare.current_bookings, [prev]: compare.previous_bookings },
        { metric: "Conversații", [cur]: compare.current_chat_inquiries, [prev]: compare.previous_chat_inquiries },
      ]
    : [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-4 text-[20px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>Top Camere Solicitate</h3>
        {loading ? <Skeleton className="h-64" /> : rooms.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#6b7c99]">Nu există rezervări în această perioadă.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, rooms.length * 44)}>
            <BarChart data={rooms} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [formatNum(Number(v)), "Rezervări"]} />
              <Bar dataKey="count" fill={NAVY} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
      <Card className="p-6">
        <h3 className="mb-4 text-[20px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>Comparație Lună vs. Lună</h3>
        {loading ? <Skeleton className="h-64" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cmp}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => Number(v).toLocaleString("ro-RO", { maximumFractionDigits: 2 })} />
              <Legend />
              <Bar dataKey={prev} fill={GOLD} radius={[6, 6, 0, 0]} />
              <Bar dataKey={cur} fill={NAVY} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
