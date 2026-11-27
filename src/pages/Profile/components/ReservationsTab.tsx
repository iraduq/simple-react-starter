import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import type { Booking } from "../types";
import { apiFetch } from "../../../lib/api";
import { useToast } from "../../../components/Toast";
import BookingCardItem from "./BookingCardItem";

export default function ReservationsTab({ bookings }: { bookings: Booking[] }) {
  const { toast } = useToast();
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<Record<string, boolean>>({});

  const now = Date.now();
  const items = useMemo(() => {
    return bookings
      .map((b) => (cancelledIds[b.id] ? { ...b, status: "cancelled" } : b))
      .filter((b) => {
        const isPast =
          new Date(b.check_out).getTime() < now ||
          b.status === "completed" ||
          b.status === "cancelled";
        return scope === "past" ? isPast : !isPast;
      })
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
  }, [bookings, scope, now, cancelledIds]);

  const handleCancelRefund = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await apiFetch(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
        method: "POST",
        body: JSON.stringify({
          status: "cancelled",
          cancellation_reason: "Anulare solicitată de client în termen de 30 de zile",
        }),
      });
      setCancelledIds((prev) => ({ ...prev, [bookingId]: true }));
      setConfirmCancelId(null);
      toast("Rezervarea a fost anulată și rambursarea a fost inițiată prin Stripe.", "success");
    } catch (e: any) {
      toast(e?.message || "Anularea nu a putut fi procesată.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    toast(`PIN copiat: ${pin}`, "success");
    setTimeout(() => setCopiedPin(null), 2500);
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)] border border-[#e1e8f0] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11px] font-bold tracking-[0.22em] uppercase text-[#0d2c5c] mb-2 flex items-center gap-2">
            <span className="w-5 h-px bg-[#c69a3f]" />
            <span>Sejururi și documente</span>
          </p>
          <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0d2c5c]">
            Rezervările tale la Casa Esy
          </h2>
        </div>

        <div className="flex p-1 bg-[#f8fafc] border border-[#e1e8f0] rounded-full self-start sm:self-auto font-['Plus_Jakarta_Sans',sans-serif]">
          {[
            { k: "upcoming" as const, label: "Active și viitoare" },
            { k: "past" as const, label: "Istoric sejururi" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setScope(t.k)}
              className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-all cursor-pointer ${
                scope === t.k
                  ? "bg-[#0d2c5c] text-white shadow-xs"
                  : "text-[#64748b] hover:text-[#0d2c5c]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-[#e1e8f0] rounded-[20px] bg-[#f8fafd]">
          <CalendarCheck size={32} className="mx-auto text-[#c69a3f] mb-3 opacity-60" />
          <p className="text-[20px] font-semibold text-[#0d2c5c]">Nicio rezervare în această categorie</p>
          <p className="text-[12.5px] text-[#6b7c99] mt-1 max-w-[340px] mx-auto">
            Când vei efectua o rezervare la Casa Esy, detaliile sejurului vor apărea automat aici.
          </p>
          <Link
            to="/camere"
            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[12px] bg-[#0d2c5c] text-white text-[12px] font-semibold no-underline"
          >
            Vezi camerele disponibile
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((r) => (
            <BookingCardItem
              key={r.id}
              booking={r}
              now={now}
              copiedPin={copiedPin}
              onCopyPin={handleCopyPin}
              confirmCancelId={confirmCancelId}
              cancellingId={cancellingId}
              onConfirmCancel={handleCancelRefund}
              onCancelClick={(id) => setConfirmCancelId(id)}
              onCancelDismiss={() => setConfirmCancelId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
