import { ArrowDown, MessageCircle, CalendarCheck, HelpCircle } from "lucide-react";
import { Card, Skeleton } from "../admin/ui";
import type { FunnelAttribution } from "../../types/analytics";
import { AiText, formatNum, formatRon } from "./shared";

export default function ConversionFunnelCard({
  data,
  loading,
}: {
  data?: FunnelAttribution | null;
  loading: boolean;
}) {
  if (loading) return <Skeleton className="h-96" />;
  const rate = Number(data?.conversion_rate_pct ?? 0);

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] pb-4">
        <div>
          <h3 className="text-[22px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
            Eficiență Asistență & Rezervări Directe
          </h3>
          <p className="text-[12px] text-[#6b7c99]">
            Măsurarea modului în care întrebările despre camere și facilități se transformă în rezervări
          </p>
        </div>
        <span className="rounded-full bg-[#0d2c5c] px-3.5 py-1.5 text-[12px] font-bold text-[#e6b85c]">
          Rată de conversie: {rate.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}%
        </span>
      </div>

      <div className="mx-auto flex max-w-xl flex-col items-center gap-2">
        <div className="flex w-full items-center justify-between rounded-2xl bg-[#0d2c5c] px-6 py-5 text-white shadow-sm">
          <span className="flex items-center gap-3 text-sm font-semibold">
            <MessageCircle size={18} className="text-[#e6b85c]" /> Solicitări disponibilitate în asistent
          </span>
          <span className="text-2xl font-bold">{formatNum(data?.chat_availability_inquiries)}</span>
        </div>

        <ArrowDown className="text-[#c69a3f] my-1" size={22} />

        <div
          className="flex items-center justify-between rounded-2xl bg-[#c69a3f] px-6 py-5 text-white shadow-sm"
          style={{ width: `${Math.max(60, Math.min(100, rate + 40))}%` }}
        >
          <span className="flex items-center gap-3 text-sm font-semibold">
            <CalendarCheck size={18} /> Rezervări confirmate
          </span>
          <span className="text-2xl font-bold">{formatNum(data?.direct_bookings_created)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7c99]">
            Venit Din Rezervări Ghidate
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#0d2c5c]">
            {formatRon(data?.estimated_chat_driven_revenue_ron)}
          </div>
          <p className="mt-1 text-[11px] text-[#6b7c99]">
            Calculat pe baza ponderii oaspeților care au verificat disponibilitatea online.
          </p>
        </div>

        <div className="rounded-xl border border-[#e1e8f0] bg-[#f8fafd] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7c99]">
            Rată de Finalizare Rezervare
          </div>
          <div className="mt-1 text-[22px] font-bold text-[#0d2c5c]">
            {rate.toLocaleString("ro-RO", { maximumFractionDigits: 1 })}%
          </div>
          <p className="mt-1 text-[11px] text-[#6b7c99]">
            Procentul întrebărilor de cazare din chat urmate de o rezervare fermă.
          </p>
        </div>
      </div>

      {data?.executive_assessment && (
        <div className="mt-6 rounded-xl border border-[#e1e8f0] bg-[#fafbfc] p-5">
          <h4 className="mb-2 text-[13px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] flex items-center gap-2">
            <HelpCircle size={15} className="text-[#c69a3f]" />
            Concluzii & Recomandări Comunicare Oaspeți
          </h4>
          <AiText text={data.executive_assessment} />
        </div>
      )}
    </Card>
  );
}
