import { useCallback, useEffect, useState } from "react";
import { CalendarRange, Sparkles } from "lucide-react";
import { Card, Skeleton } from "../admin/ui";
import { useToast } from "../Toast";
import type { PricingForecast } from "../../types/analytics";
import { getPricingForecast } from "../../services/analyticsService";
import { httpErrorMessage } from "../../services/apiClient";
import AnalyticsPeriodPicker from "./AnalyticsPeriodPicker";
import { AiText, formatNum, formatRon, periodLabel } from "./shared";

export default function PricingForecastCard({
  baseYear,
  baseMonth,
}: {
  baseYear: number;
  baseMonth: number;
}) {
  const { toast } = useToast();
  const next = baseMonth === 12 ? { y: baseYear + 1, m: 1 } : { y: baseYear, m: baseMonth + 1 };
  const [y, setY] = useState(next.y);
  const [m, setM] = useState(next.m);
  const [data, setData] = useState<PricingForecast | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getPricingForecast(y, m));
    } catch (e) {
      toast(httpErrorMessage(e, "Prognoza tarifară nu a putut fi încărcată."), "error");
    } finally {
      setLoading(false);
    }
  }, [y, m, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-[22px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
            <CalendarRange size={22} className="text-[#c69a3f]" /> Prognoză Rezervări & Strategie Tarifară
          </h3>
          <p className="text-[12px] text-[#6b7c99]">
            Situația contractată în avans și ajustări sugerate de tarife pentru lunile următoare
          </p>
        </div>
        <AnalyticsPeriodPicker
          year={y}
          month={m}
          loading={loading}
          onChange={(a, b) => {
            setY(a);
            setM(b);
          }}
          onRefresh={load}
        />
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-[#f4f6f9] px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#0d2c5c]">
            <span>Perioadă vizată:</span>
            <span className="text-[#c69a3f]">{periodLabel(data?.target_period)}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7c99]">
                Venituri deja garantate din rezervări
              </div>
              <div className="mt-1 text-[24px] font-bold text-[#0d2c5c]">
                {formatRon(data?.current_booked_revenue_ron)}
              </div>
              <p className="mt-1 text-[11px] text-[#6b7c99]">
                Valoarea totală a rezervărilor confirmate pentru această lună viitoare.
              </p>
            </div>

            <div className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7c99]">
                Rezervări confirmate în avans
              </div>
              <div className="mt-1 text-[24px] font-bold text-[#0d2c5c]">
                {formatNum(data?.confirmed_bookings_count)}
              </div>
              <p className="mt-1 text-[11px] text-[#6b7c99]">
                Număr de sejururi deja rezervate și blocate în calendar.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#e1e8f0] bg-[#fafbfc] p-5">
            <h4 className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] flex items-center gap-2">
              <Sparkles size={15} className="text-[#c69a3f]" />
              Recomandări pentru politica tarifară & sejur minim
            </h4>
            <AiText text={data?.ai_pricing_strategy} />
          </div>
        </>
      )}
    </Card>
  );
}
