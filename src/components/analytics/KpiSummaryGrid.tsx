import { BedDouble, CalendarCheck, Users, Wallet, Percent, Hotel } from "lucide-react";
import { Card, Skeleton } from "../admin/ui";
import type { BusinessComparison, MonthlyBusinessReport } from "../../types/analytics";
import { GrowthBadge, formatNum, formatRon } from "./shared";

export default function KpiSummaryGrid({
  report,
  compare,
  loading,
  year = 2026,
  month = 11,
  totalUnits = 17,
}: {
  report?: MonthlyBusinessReport | null;
  compare?: BusinessComparison | null;
  loading: boolean;
  year?: number;
  month?: number;
  totalUnits?: number;
}) {
  if (loading)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );

  const daysInMonth = new Date(year, month, 0).getDate();
  const capacityNights = totalUnits * daysInMonth;
  const roomNights = report?.total_room_nights ?? 0;
  const occupancyPct =
    capacityNights > 0 ? Math.min(100, Math.round((roomNights / capacityNights) * 100)) : 0;
  const revPar =
    capacityNights > 0 ? Math.round((report?.total_revenue_ron ?? 0) / capacityNights) : 0;
  const bookingsCount = report?.total_bookings ?? 0;
  const alos =
    bookingsCount > 0 ? (roomNights / bookingsCount).toFixed(1) : "0";
  const guests = (report?.total_guests_adults ?? 0) + (report?.total_guests_children ?? 0);

  const items = [
    {
      label: "Venituri Totale",
      icon: Wallet,
      value: formatRon(report?.total_revenue_ron),
      badge: compare?.revenue_growth_pct,
      sub: "Valoare rezervări confirmate",
    },
    {
      label: "Grad Mediu Ocupare",
      icon: Percent,
      value: `${occupancyPct}%`,
      badge: undefined,
      sub: `${formatNum(roomNights)} din ${capacityNights} nopți posibile`,
    },
    {
      label: "Tarif Mediu / Noapte (ADR)",
      icon: BedDouble,
      value: `${formatRon(report?.adr_ron)}`,
      badge: undefined,
      sub: "Venit mediu per noapte vândută",
    },
    {
      label: "RevPAR Hotel",
      icon: Hotel,
      value: `${formatRon(revPar)}/zi`,
      badge: undefined,
      sub: `Raportat la ${totalUnits} camere fizice`,
    },
    {
      label: "Sejururi & Nopți",
      icon: CalendarCheck,
      value: `${formatNum(bookingsCount)} rezervări`,
      badge: compare?.bookings_growth_pct,
      sub: `Durată medie sejur: ${alos} nopți`,
    },
    {
      label: "Total Oaspeți",
      icon: Users,
      value: `${formatNum(guests)} oaspeți`,
      badge: compare?.guests_growth_pct,
      sub: `${formatNum(report?.total_guests_adults)} adulți, ${formatNum(report?.total_guests_children)} copii`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {items.map(({ label, icon: Icon, value, badge, sub }) => (
        <Card key={label} className="p-4 flex flex-col justify-between border border-[#e1e8f0] shadow-xs">
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#4f6280]">
                {label}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0f4fa] text-[#0d2c5c]">
                <Icon size={16} className="text-[#c69a3f]" />
              </span>
            </div>
            <div className="text-[20px] font-['Outfit',sans-serif] font-bold text-[#0d2c5c]">
              {value}
            </div>
            {sub && <div className="mt-1 text-[11.5px] text-[#6b7c99] leading-tight">{sub}</div>}
          </div>
          {badge !== undefined && (
            <div className="mt-3 pt-2.5 border-t border-[#f1f5f9]">
              <GrowthBadge pct={badge} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
