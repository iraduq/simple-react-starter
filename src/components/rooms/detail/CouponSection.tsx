import { TicketPercent } from "lucide-react";
import { MARKETING_PROMO_KEY } from "../../../components/CookieConsentBanner";

interface CouponSectionProps {
  couponCodeInput: string;
  setCouponCodeInput: (c: string) => void;
  validatingCoupon: boolean;
  onApplyCoupon: (override?: string) => Promise<void>;
  vipCoupons: Array<{ code: string; discount_value: number; status: string }>;
  cookieConsentMarketing?: boolean;
  appliedCoupon: {
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
    discount_amount: number;
    final_total: number;
  } | null;
  onRemoveCoupon: () => void;
}

export default function CouponSection({
  couponCodeInput,
  setCouponCodeInput,
  validatingCoupon,
  onApplyCoupon,
  vipCoupons,
  cookieConsentMarketing,
  appliedCoupon,
  onRemoveCoupon,
}: CouponSectionProps) {
  return (
    <div className="mt-4">
      <span className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]">
        Cod Promoțional / Cupon
      </span>
      <div className="flex gap-2">
        <input
          value={couponCodeInput}
          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
          placeholder="Ex: VARA2026 sau ESYVIP"
          className="w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f] font-mono uppercase"
        />
        <button
          type="button"
          disabled={validatingCoupon || !couponCodeInput.trim()}
          onClick={() => void onApplyCoupon()}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#fdf8ec] border border-[#c69a3f] px-3.5 py-2 text-xs font-bold text-[#0d2c5c] hover:bg-[#c69a3f] transition cursor-pointer disabled:opacity-50"
        >
          <TicketPercent size={14} />
          {validatingCoupon ? "..." : "Aplică"}
        </button>
      </div>

      {vipCoupons.length > 0 && !appliedCoupon && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#6b7c99]">
            Voucherele tale VIP:
          </span>
          {vipCoupons.map((vc) => (
            <button
              key={vc.code}
              type="button"
              onClick={() => void onApplyCoupon(vc.code)}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-[#c69a3f]/40 px-2.5 py-1 text-[11px] font-mono font-bold text-[#0d2c5c] hover:bg-amber-100 transition cursor-pointer"
            >
              <TicketPercent size={12} className="text-[#c69a3f]" />
              <span>{vc.code} (-{vc.discount_value}%)</span>
            </button>
          ))}
        </div>
      )}

      {cookieConsentMarketing && !appliedCoupon && (
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-[#c69a3f]/35 bg-[#fdf8ec] px-3 py-2">
          <span className="text-[11px] font-medium text-[#0d2c5c]">
            Ofertă sezonieră activă: <strong className="font-mono text-[#9c7624]">VARA2026</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem(MARKETING_PROMO_KEY, "VARA2026");
              } catch {}
              void onApplyCoupon("VARA2026");
            }}
            className="shrink-0 rounded-lg bg-[#0d2c5c] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition cursor-pointer"
          >
            Aplică cupon
          </button>
        </div>
      )}

      {appliedCoupon && (
        <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-900">
          <span>
            Cupon <strong>{appliedCoupon.code}</strong> aplicat!
          </span>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="text-rose-700 font-bold hover:underline cursor-pointer"
          >
            Elimină
          </button>
        </div>
      )}
    </div>
  );
}
