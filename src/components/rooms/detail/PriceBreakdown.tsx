import { Crown, Loader2, ShieldCheck } from "lucide-react";
import { ron } from "../../../lib/format";
import type { BookingPriceCalculation, RatePlanCode } from "../../../types/rooms";

interface PriceBreakdownProps {
  quoteError: string | null;
  hasConflict: boolean;
  isHeldConflict: boolean;
  nights: number;
  quote: BookingPriceCalculation | null;
  subtotal: number | null;
  taxes: number | null;
  total: number | null;
  finalTotal: number | null;
  baseRatePerNight: number;
  plan: RatePlanCode;
  breakfastAddonPerNight: number;
  totalGuestsCount: number;
  vipStayBenefit: {
    tier: string;
    stay_discount_percent: number;
    stay_discount_reason?: string | null;
  } | null;
  vipStayDiscount: number;
  couponDiscount: number;
  quoting: boolean;
  submitting: boolean;
  baseTotal: number | null;
  isDeal: boolean;
  onFinalize: () => void;
}

export default function PriceBreakdown({
  quoteError,
  hasConflict,
  isHeldConflict,
  nights,
  quote,
  subtotal,
  taxes,
  total,
  finalTotal,
  baseRatePerNight,
  plan,
  breakfastAddonPerNight,
  totalGuestsCount,
  vipStayBenefit,
  vipStayDiscount,
  couponDiscount,
  quoting,
  submitting,
  baseTotal,
  isDeal,
  onFinalize,
}: PriceBreakdownProps) {
  return (
    <div className="mt-4 space-y-1.5 border-t border-[#eef2f8] pt-4 text-[13.5px]">
      {quoteError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          {quoteError}
        </p>
      )}
      {hasConflict && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
          Perioada selectată conține zile indisponibile. Vă rugăm să alegeți alte date.
        </p>
      )}
      {isHeldConflict && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[12.5px] text-amber-900"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500 animate-pulse" />
          <span>
            Această cameră este reținută temporar de un alt oaspete. Vă rugăm să așteptați câteva minute.
          </span>
        </div>
      )}
      {nights === 0 && !quoteError && (
        <p className="text-[12.5px] text-[#8595aa]">Alege datele pentru a vedea prețul total.</p>
      )}
      {quote && subtotal != null && taxes != null && total != null && (
        <>
          <div className="flex justify-between items-center text-[#3d4f6b]">
            <span>{quote.nights} {quote.nights === 1 ? "noapte" : "nopți"} · cazare</span>
            <span>{ron(Math.round(baseRatePerNight * quote.nights * 100) / 100)}</span>
          </div>
          <div className="flex justify-between items-center text-[#3d4f6b]">
            <span className="flex items-center gap-1.5">
              <span>Plan tarifar</span>
              <span className="text-[10.5px] font-bold text-[#0d2c5c] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
                {plan === "flexible" && "Flexibil"}
                {plan === "non_refundable" && "Nerambursabil"}
                {plan === "breakfast" && "Mic dejun"}
              </span>
            </span>
            <span
              className={`text-xs font-bold ${
                plan === "non_refundable"
                  ? "text-emerald-700"
                  : plan === "breakfast"
                    ? "text-amber-800"
                    : "text-[#3d4f6b]"
              }`}
            >
              {plan === "flexible" && "Inclus"}
              {plan === "non_refundable" && `-${ron(Math.round(baseRatePerNight * quote.nights * 0.1 * 100) / 100)} (-10%)`}
              {plan === "breakfast" && `+${ron(breakfastAddonPerNight * quote.nights)} (35 RON / pers × ${totalGuestsCount})`}
            </span>
          </div>
          {plan !== "flexible" && (
            <div className="flex justify-between items-center text-[#3d4f6b] text-[12px] font-medium pt-0.5 border-t border-[#f1f5f9]">
              <span>Subtotal ajustat</span>
              <span className="font-semibold text-[#0d2c5c]">{ron(subtotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#3d4f6b]">
            <span>Taxe (TVA 19%)</span>
            <span>{ron(taxes)}</span>
          </div>
          {vipStayBenefit && vipStayDiscount > 0 && (
            <div className="rounded-xl border border-[#c69a3f]/40 bg-[#fdf8ec] px-3 py-2 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <Crown size={13} className="text-[#c69a3f] shrink-0 mt-0.5" />
                <div className="text-[11.5px] leading-snug">
                  <div className="font-bold text-[#0d2c5c]">
                    Reducere automată VIP {vipStayBenefit.tier} (-{vipStayBenefit.stay_discount_percent}%)
                  </div>
                  <div className="text-[10.5px] text-[#7c5817]">
                    {vipStayBenefit.stay_discount_reason || `Aplicată automat deoarece ai statutul VIP ${vipStayBenefit.tier}`}
                  </div>
                </div>
              </div>
              <span className="font-bold text-xs text-emerald-700 shrink-0">-{ron(vipStayDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 text-[16px] font-bold text-[#0d2c5c]">
            <span>Total</span>
            <span>
              {quoting ? "…" : ron(finalTotal ?? total)}
              {couponDiscount > 0 && (
                <span className="ml-2 text-xs font-semibold text-emerald-700">(-{ron(couponDiscount)} cupon)</span>
              )}
            </span>
          </div>
          <p className="pt-1 text-[11.5px] leading-relaxed text-[#8595aa]">
            Preț total pentru {quote.nights} {quote.nights === 1 ? "noapte" : "nopți"}, incluzând taxele și reducerile aplicate.
          </p>
          {isDeal && baseTotal != null && (
            <p className="text-[11.5px] text-[#8595aa]">Preț standard <span className="line-through">{ron(baseTotal)}</span></p>
          )}
        </>
      )}

      <button
        type="button"
        onClick={onFinalize}
        disabled={submitting || quoting || nights === 0 || hasConflict || isHeldConflict || !!quoteError}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#c69a3f] hover:text-[#0d2c5c] disabled:opacity-60 cursor-pointer"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
        Plătește prin Stripe
      </button>
      <p className="mt-2 text-center text-[11px] text-[#8595aa]">
        Plată securizată prin Stripe · Confirmare instantanee pe email
      </p>
    </div>
  );
}
