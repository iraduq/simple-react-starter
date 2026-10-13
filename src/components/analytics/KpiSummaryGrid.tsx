import { BedDouble, CalendarCheck, Users, Wallet } from "lucide-react";
import { Card, Skeleton } from "../admin/ui";
import type { BusinessComparison, MonthlyBusinessReport } from "../../types/analytics";
import { GrowthBadge, formatNum, formatRon } from "./shared";

export default function KpiSummaryGrid({
  report, compare, loading,
}: { report?: MonthlyBusinessReport | null; compare?: BusinessComparison | null; loading: boolean }) {
  if (loading)
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36" />)}
      </div>
    );

  const guests = (report?.total_guests_adults ?? 0) + (report?.total_guests_children ?? 0);
  const items = [
    { label: "Venituri Totale", icon: Wallet, value: formatRon(report?.total_revenue_ron), badge: compare?.revenue_growth_pct },
    { label: "Rezervări Confirmate", icon: CalendarCheck, value: formatNum(report?.total_bookings), badge: compare?.bookings_growth_pct },
    {
      label: "Total Oaspeți", icon: Users, value: formatNum(guests), badge: compare?.guests_growth_pct,
      sub: `${formatNum(report?.total_guests_adults)} adulți, ${formatNum(report?.total_guests_children)} copii`,
    },
    {
      label: "ADR (Tarif Mediu/Noapte)", icon: BedDouble, value: `${formatRon(report?.adr_ron)}/noapte`,
      sub: `${formatNum(report?.total_room_nights)} nopți vândute`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, icon: Icon, value, badge, sub }) => (
        <Card key={label} className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6280]">{label}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f6f9] text-[#c69a3f]">
              <Icon size={17} />
            </span>
          </div>
          <div className="text-[22px] font-bold text-[#0d2c5c]">{value}</div>
          {sub && <div className="mt-1 text-[12px] text-[#6b7c99]">{sub}</div>}
          {badge !== undefined && <div className="mt-3"><GrowthBadge pct={badge} /></div>}
        </Card>
      ))}
    </div>
  );
}
