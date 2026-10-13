import { ArrowDown, MessageCircle, CalendarCheck } from "lucide-react";
import { Card, Skeleton } from "../admin/ui";
import type { FunnelAttribution } from "../../types/analytics";
import { AiText, formatNum, formatRon } from "./shared";

export default function ConversionFunnelCard({ data, loading }: { data?: FunnelAttribution | null; loading: boolean }) {
  if (loading) return <Skeleton className="h-96" />;
  const rate = Number(data?.conversion_rate_pct ?? 0);
  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[22px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>Conversie AI Concierge</h3>
        <span className="rounded-full bg-[#0d2c5c] px-3 py-1.5 text-[12px] font-bold text-[#e6b85c]">
          Rată de conversie: {rate.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}%
        </span>
      </div>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-2">
        <div className="flex w-full items-center justify-between rounded-2xl bg-[#0d2c5c] px-6 py-5 text-white">
          <span className="flex items-center gap-3 text-sm font-semibold"><MessageCircle size={18} /> Întrebări disponibilitate în chat</span>
          <span className="text-2xl font-bold">{formatNum(data?.chat_availability_inquiries)}</span>
        </div>
        <ArrowDown className="text-[#c69a3f]" />
        <div className="flex items-center justify-between rounded-2xl bg-[#c69a3f] px-6 py-5 text-white" style={{ width: `${Math.max(55, Math.min(100, rate + 40))}%` }}>
          <span className="flex items-center gap-3 text-sm font-semibold"><CalendarCheck size={18} /> Rezervări confirmate</span>
          <span className="text-2xl font-bold">{formatNum(data?.direct_bookings_created)}</span>
        </div>
      </div>
      <div className="mt-6 rounded-xl bg-[#f4f6f9] p-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4f6280]">Venit Generat/Influențat de AI</div>
        <div className="mt-1 text-[24px] font-bold text-[#0d2c5c]">{formatRon(data?.estimated_chat_driven_revenue_ron)}</div>
      </div>
      <div className="mt-6"><AiText text={data?.executive_assessment} /></div>
    </Card>
  );
}
