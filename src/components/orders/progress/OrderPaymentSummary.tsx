import { Link } from "react-router-dom";
import { CheckCircle2, CreditCard, Banknote, Receipt, ShieldCheck, PhoneCall } from "lucide-react";
import type { OrderData } from "../../../types/orderProgress";
import { lei } from "../../../types/orderProgress";

interface OrderPaymentSummaryProps {
  order: OrderData;
  loc: { primary: string; secondary: string | null };
  isCardPaid: boolean;
  isCancelled: boolean;
  payingWithCard: boolean;
  onPayWithCard: () => void;
}

export default function OrderPaymentSummary({
  order,
  loc,
  isCardPaid,
  isCancelled,
  payingWithCard,
  onPayWithCard,
}: OrderPaymentSummaryProps) {
  return (
    <div className="lg:col-span-5 space-y-5">
      <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)]">
        <div className="pb-5 border-b border-[#e1e8f0]">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
            Detalii Financiare
          </p>
          <h2 className="font-['Outfit',sans-serif] text-xl font-bold text-[#0d2c5c] mt-0.5">
            Sumar &amp; Metodă de Plată
          </h2>
        </div>

        <div className="mt-5 space-y-3.5 text-sm">
          <div className="flex items-center justify-between text-[#64748b]">
            <span>Locație livrare</span>
            <span className="font-bold text-[#0d2c5c]">{loc.primary}</span>
          </div>

          {order.booking_code && (
            <div className="flex items-center justify-between text-[#64748b]">
              <span>Cod sejur asociat</span>
              <span className="font-bold text-[#0d2c5c]">
                #{order.booking_code.replace(/^#/, "")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[#64748b]">
            <span>Metodă de plată</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-[#0d2c5c]">
              {isCardPaid ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Achitat Online (Stripe)
                </span>
              ) : order.payment_method === "card" ? (
                <>
                  <CreditCard size={14} className="text-[#c69a3f]" /> Card la livrare (POS)
                </>
              ) : order.payment_method === "cash" ? (
                <>
                  <Banknote size={14} className="text-[#c69a3f]" /> Numerar la livrare
                </>
              ) : (
                <>
                  <Receipt size={14} className="text-[#c69a3f]" /> Pe Contul Camerei
                </>
              )}
            </span>
          </div>

          {order.discount_amount && order.discount_amount > 0 && order.subtotal_amount ? (
            <>
              <div className="flex items-center justify-between text-[#64748b] pt-2 border-t border-[#e1e8f0]">
                <span>Subtotal produse</span>
                <span className="line-through">{lei(order.subtotal_amount)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>Reducere VIP</span>
                <span>−{lei(order.discount_amount)}</span>
              </div>
            </>
          ) : null}

          <div className="pt-4 border-t border-[#e1e8f0] flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">
              Total Comandă
            </span>
            <span className="font-['Outfit',sans-serif] text-3xl font-bold text-[#0d2c5c]">
              {lei(order.total_amount)}
            </span>
          </div>
        </div>

        {order.payment_method === "room_charge" && !isCardPaid && !isCancelled && (
          <div className="mt-6 pt-6 border-t border-[#e1e8f0]">
            <div className="flex items-start gap-2.5 mb-4">
              <ShieldCheck size={16} className="text-[#c69a3f] shrink-0 mt-0.5" />
              <p className="text-xs text-[#64748b] leading-relaxed">
                Comanda este trecută pe nota camerei. Dacă dorești, o poți achita chiar acum online cu cardul prin Stripe.
              </p>
            </div>

            <button
              type="button"
              disabled={payingWithCard}
              onClick={onPayWithCard}
              className="w-full h-12 rounded-xl bg-[#0d2c5c] hover:bg-[#163c78] text-white text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 shadow-[0_6px_20px_rgba(13,44,92,0.18)] transition-all disabled:opacity-60 cursor-pointer"
            >
              <CreditCard size={15} className="text-[#c69a3f]" />
              {payingWithCard ? "Se deschide Stripe..." : `Plătește Online · ${lei(order.total_amount)}`}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-[20px] border border-[#e1e8f0] bg-white p-5 flex items-center justify-between gap-4 shadow-[0_6px_24px_rgba(13,44,92,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f8fafc] border border-[#e1e8f0] flex items-center justify-center text-[#0d2c5c] shrink-0">
            <PhoneCall size={17} className="text-[#c69a3f]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#0d2c5c]">Dorești să modifici comanda?</div>
            <div className="text-[11.5px] text-[#64748b]">Recepția și bucătăria îți stau la dispoziție.</div>
          </div>
        </div>
        <Link
          to="/contact"
          className="rounded-xl border border-[#e1e8f0] bg-[#f8fafc] hover:border-[#0d2c5c] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c] no-underline transition shrink-0"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
