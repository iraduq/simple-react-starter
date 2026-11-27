import { RotateCcw, RefreshCw } from "lucide-react";
import { type CheckInInfo } from "../types";

interface RefundSectionProps {
  info: CheckInInfo;
  refundMeta: { eligible: boolean; daysLeft: number; reason: string };
  showRefundConfirm: boolean;
  setShowRefundConfirm: (show: boolean) => void;
  refundReason: string;
  setRefundReason: (reason: string) => void;
  refunding: boolean;
  refundError: string | null;
  setRefundError: (err: string | null) => void;
  onRequestRefund: () => Promise<void>;
}

export default function RefundSection({
  info,
  refundMeta,
  showRefundConfirm,
  setShowRefundConfirm,
  refundReason,
  setRefundReason,
  refunding,
  refundError,
  setRefundError,
  onRequestRefund,
}: RefundSectionProps) {
  if (info.status === "cancelled") {
    return (
      <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-[13px] text-rose-900 flex items-start gap-3">
        <RotateCcw size={18} className="text-rose-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Rezervare anulată</p>
          <p className="text-[12.5px] text-rose-800/90 mt-0.5">
            {info.payment_status === "refunded"
              ? "Suma achitată a fost rambursată automat prin Stripe pe cardul folosit la plată."
              : "Această rezervare a fost anulată."}
          </p>
        </div>
      </div>
    );
  }

  if (info.is_checked_in || (!refundMeta.eligible && !refundMeta.reason)) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#e1e8f0] bg-[#f8fafd] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <RotateCcw size={18} className="text-[#0d2c5c] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13.5px] font-bold text-[#0d2c5c]">
              Anulare & Rambursare Automată (max. 30 zile)
            </h4>
            <p className="text-[12px] text-[#6b7c99] mt-0.5">
              {refundMeta.eligible
                ? `Poți anula rezervarea și primi banii înapoi pe card în termen de 30 de zile de la rezervare (mai ai ${refundMeta.daysLeft} ${
                    refundMeta.daysLeft === 1 ? "zi" : "zile"
                  }).`
                : refundMeta.reason}
            </p>
          </div>
        </div>

        {refundMeta.eligible && !showRefundConfirm && (
          <button
            type="button"
            onClick={() => {
              setRefundError(null);
              setShowRefundConfirm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-[12px] font-bold text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <RotateCcw size={14} /> Anulare
          </button>
        )}
      </div>

      {refundMeta.eligible && showRefundConfirm && (
        <div className="mt-4 pt-4 border-t border-[#e1e8f0] space-y-3">
          <input
            type="text"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Motivul anulării (opțional)"
            className="w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-[12.5px] text-[#0d2c5c] placeholder-[#94a3b8] focus:border-[#0d2c5c] focus:outline-none"
          />
          {refundError && <p className="text-[12px] text-rose-600 font-medium">{refundError}</p>}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={refunding}
              onClick={() => void onRequestRefund()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-60"
            >
              {refunding ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              {refunding ? "Se procesează anularea..." : "Confirmă anularea"}
            </button>
            <button
              type="button"
              disabled={refunding}
              onClick={() => setShowRefundConfirm(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Renunță
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
