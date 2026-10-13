import { useCallback, useEffect, useState } from "react";
import { LineChart as LineIcon } from "lucide-react";
import { Card, Skeleton } from "../admin/ui";
import { useToast } from "../Toast";
import type { PricingForecast } from "../../types/analytics";
import { getPricingForecast } from "../../services/analyticsService";
import { httpErrorMessage } from "../../services/apiClient";
import AnalyticsPeriodPicker from "./AnalyticsPeriodPicker";
import { AiText, formatNum, formatRon, periodLabel } from "./shared";

export default function PricingForecastCard({ baseYear, baseMonth }: { baseYear: number; baseMonth: number }) {
  const { toast } = useToast();
  const next = baseMonth === 12 ? { y: baseYear + 1, m: 1 } : { y: baseYear, m: baseMonth + 1 };
  const [y, setY] = useState(next.y);
  const [m, setM] = useState(next.m);
  const [data, setData] = useState<PricingForecast | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await getPricingForecast(y, m)); }
    catch (e) { toast(httpErrorMessage(e, "Prognoza tarifară nu a putut fi încărcată."), "error"); }
    finally { setLoading(false); }
  }, [y, m, toast]);

  useEffect(() => { void load(); }, [load]);

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[22px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
          <LineIcon size={20} className="text-[#c69a3f]" /> Prognoză & Preț Dinamic
        </h3>
        <AnalyticsPeriodPicker year={y} month={m} loading={loading} onChange={(a, b) => { setY(a); setM(b); }} onRefresh={load} />
      </div>
      {loading ? <Skeleton className="h-64" /> : (
        <>
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">
            Perioadă țintă: {periodLabel(data?.target_period)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[#f4f6f9] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6280]">Venituri deja garantate</div>
              <div className="mt-1 text-[24px] font-bold text-[#0d2c5c]">{formatRon(data?.current_booked_revenue_ron)}</div>
            </div>
            <div className="rounded-xl bg-[#f4f6f9] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6280]">Rezervări confirmate în avans</div>
              <div className="mt-1 text-[24px] font-bold text-[#0d2c5c]">{formatNum(data?.confirmed_bookings_count)}</div>
            </div>
          </div>
          <h4 className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c]">Recomandare AI de politică tarifară</h4>
          <AiText text={data?.ai_pricing_strategy} />
        </>
      )}
    </Card>
  );
}
