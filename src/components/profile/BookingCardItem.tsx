import { Link } from "react-router-dom";
import { CalendarCheck, KeyRound, Check, Copy, Download, RefreshCcw } from "lucide-react";
import type { Booking } from "../../types/profile";
import { downloadBookingInvoicePdf } from "../../lib/admin";
import { useToast } from "../Toast";

interface BookingCardItemProps {
  booking: Booking;
  now: number;
  copiedPin: string | null;
  onCopyPin: (pin: string) => void;
  confirmCancelId: string | null;
  cancellingId: string | null;
  onConfirmCancel: (id: string) => void;
  onCancelClick: (id: string) => void;
  onCancelDismiss: () => void;
}

export default function BookingCardItem({
  booking: r,
  now,
  copiedPin,
  onCopyPin,
  confirmCancelId,
  cancellingId,
  onConfirmCancel,
  onCancelClick,
  onCancelDismiss,
}: BookingCardItemProps) {
  const { toast } = useToast();
  const isPaid = r.payment_status === "paid";
  const plan = (r as any).rate_plan_code || "flexible";
  const createdRaw = (r as any).created_at || (r as any).booking_date;
  const createdMs = createdRaw ? new Date(createdRaw).getTime() : now;
  const daysElapsed = Math.max(0, Math.floor((now - createdMs) / 864e5));
  const canRefund =
    r.status === "confirmed" &&
    plan !== "non_refundable" &&
    new Date(r.check_in).getTime() >= now &&
    daysElapsed <= 30;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const calcNights = (a: string, b: string) =>
    Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 864e5));

  return (
    <article className="p-5 sm:p-6 rounded-[20px] border border-[#e1e8f0] bg-white hover:border-[#c69a3f]/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {r.booking_code && (
            <span className="text-[11px] font-bold tracking-wider text-[#c69a3f] bg-[#c69a3f]/10 px-2.5 py-1 rounded-md">
              #{r.booking_code}
            </span>
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              r.status === "confirmed"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : r.status === "pending"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {r.status === "confirmed" ? "Confirmat" : r.status === "pending" ? "În așteptare" : r.status}
          </span>
          {isPaid && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Achitat
            </span>
          )}
          {r.unit_number && (
            <span className="text-[11px] font-medium text-[#6b7c99] bg-[#f8fafd] border border-[#e1e8f0] px-2.5 py-1 rounded-md">
              Cameră {r.unit_number}
            </span>
          )}
        </div>

        <h3 className="text-[18px] font-bold text-[#0d2c5c]">
          {r.room?.title || "Cameră Casa Esy"}
        </h3>

        <div className="flex items-center gap-2 text-[12.5px] text-[#6b7c99] flex-wrap">
          <CalendarCheck size={14} className="text-[#c69a3f]" />
          <span>
            {fmtDate(r.check_in)} → {fmtDate(r.check_out)}
          </span>
          <span>•</span>
          <span>{calcNights(r.check_in, r.check_out)} nopți</span>
        </div>

        {/* SMART LOCK PIN & CHECK-IN */}
        {r.access_pin ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[14px] bg-[#0d2c5c] p-3 text-white">
            <div className="flex items-center gap-1.5">
              <KeyRound size={15} className="text-[#c69a3f]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c69a3f]">
                PIN Smart Lock:
              </span>
              <span className="font-mono text-[14px] font-black tracking-widest text-white px-2 py-0.5 rounded bg-white/10">
                {r.access_pin}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onCopyPin(r.access_pin!)}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/20 transition-colors cursor-pointer"
            >
              {copiedPin === r.access_pin ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copiedPin === r.access_pin ? "Copiat" : "Copiază"}
            </button>
            {r.booking_code && (
              <Link
                to={`/checkin/${r.booking_code}`}
                className="ml-auto text-[11px] font-bold text-[#c69a3f] hover:underline no-underline"
              >
                Permis digital și tastatură →
              </Link>
            )}
          </div>
        ) : r.booking_code && r.status === "confirmed" ? (
          <div className="mt-2">
            <Link
              to={`/checkin/${r.booking_code}`}
              className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#0d2c5c] px-3.5 py-2 text-[11.5px] font-bold text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition-all no-underline"
            >
              <KeyRound size={13} />
              Check-in online și cheie digitală
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex md:flex-col items-center md:items-end justify-between pt-3 md:pt-0 border-t md:border-t-0 border-[#e1e8f0] shrink-0">
        {r.total_price != null && (
          <div className="text-left md:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] block md:hidden">
              Total
            </span>
            <span className="text-[18px] sm:text-[20px] font-bold text-[#0d2c5c]">
              {r.total_price.toLocaleString("ro-RO")} RON
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() =>
            void downloadBookingInvoicePdf(
              String(r.booking_code || r.id),
              r.booking_code || String(r.id)
            ).catch((e: any) =>
              toast(e?.message || "Factura nu a putut fi descărcată.", "error")
            )
          }
          className="mt-2 flex items-center gap-1.5 rounded-full border border-[#c69a3f]/40 bg-[#fdf8ec] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c] hover:bg-[#c69a3f]/15 hover:border-[#c69a3f] transition-all cursor-pointer"
        >
          <Download size={13} className="text-[#9c7624]" />
          <span>Factură</span>
        </button>

        {canRefund && confirmCancelId === r.id ? (
          <div className="mt-2 flex items-center gap-1.5">
            <button
              type="button"
              disabled={cancellingId === r.id}
              onClick={() => onConfirmCancel(r.id)}
              className="flex items-center gap-1 rounded-full bg-rose-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-rose-700 transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCcw size={12} className={cancellingId === r.id ? "animate-spin" : ""} />
              <span>{cancellingId === r.id ? "Procesare..." : "Confirmă anularea"}</span>
            </button>
            <button
              type="button"
              disabled={cancellingId === r.id}
              onClick={onCancelDismiss}
              className="rounded-full border border-[#dce4ef] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6b7c99] hover:bg-slate-50 cursor-pointer"
            >
              Nu
            </button>
          </div>
        ) : canRefund ? (
          <button
            type="button"
            onClick={() => onCancelClick(r.id)}
            className="mt-2 flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
          >
            <RefreshCcw size={12} />
            <span>Anulare</span>
          </button>
        ) : null}
      </div>
    </article>
  );
}
