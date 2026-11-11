import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Loader as Loader2, XCircle, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import { cancelBooking, myBookings } from "../services/bookingsService";
import { httpErrorMessage } from "../services/apiClient";
import { ron, dayLabel } from "../lib/format";
import { ratePlanLabel, type Booking } from "../types/bookings";

const STATUS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-[#e8f0fb] text-[#0d2c5c] border-[#cfe0f7]",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function MyBookings() {
  const { toast } = useToast();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await myBookings());
    } catch (e) {
      setItems([]);
      setError(httpErrorMessage(e, "Nu am putut încărca rezervările."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const onLiveSync = () => {
      void load();
    };
    window.addEventListener("live-bookings-sync", onLiveSync);
    return () => {
      window.removeEventListener("live-bookings-sync", onLiveSync);
    };
  }, [load]);

  const cancel = async (b: Booking) => {
    const isPaid = b.payment_status === "paid";
    const promptMsg = isPaid
      ? `Sigur dorești să anulezi rezervarea #${b.booking_code || b.id}? Deoarece nu au trecut 30 de zile de la rezervare, vei primi automat rambursarea integrală de ${ron(b.total_price)} pe cardul tău prin Stripe.`
      : "Sigur dorești să anulezi această rezervare?";

    if (!window.confirm(promptMsg)) return;

    setBusy(String(b.id));
    try {
      await cancelBooking(b.id);
      if (isPaid) {
        toast(
          `Rezervarea a fost anulată! Restituirea de ${ron(b.total_price)} a fost procesată prin Stripe.`,
          "success",
        );
      } else {
        toast("Rezervarea a fost anulată.", "success");
      }
      await load();
    } catch (e) {
      toast(httpErrorMessage(e, "Anularea a eșuat."), "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 lg:py-14">
      <h1
        className="text-[clamp(1.6rem,3vw,2.2rem)] text-[#0d2c5c]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Rezervările mele
      </h1>

      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-[#eef2f7]"
            />
          ))}
        </div>
      ) : error ? (
        <p
          role="alert"
          className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] text-red-700"
        >
          {error}
        </p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#e1e8f0] bg-white px-6 py-14 text-center">
          <CalendarDays size={22} className="mx-auto text-[#c69a3f]" />
          <p className="mt-3 text-[14.5px] font-semibold text-[#0d2c5c]">
            Nu ai nicio rezervare
          </p>
          <Link
            to="/camere"
            className="mt-4 inline-block rounded-xl bg-[#0d2c5c] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c]"
          >
            Vezi camerele
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((b) => {
            const plan = b.rate_plan_code || b.plan_code || "flexible";
            const isNonRefundable = plan === "non_refundable";
            const isPaid = b.payment_status === "paid";
            const isRefunded = b.payment_status === "refunded";
            const isCancelled = b.status === "cancelled";
            const isCompleted = b.status === "completed";

            // Calcul zile scurse de la rezervare (fereastră de 30 de zile pentru refund automat)
            const today = new Date();
            const todayUtcDay = Date.UTC(
              today.getUTCFullYear(),
              today.getUTCMonth(),
              today.getUTCDate(),
            );
            const bookedAt = b.created_at ? new Date(b.created_at) : today;
            const bookedUtcDay = Date.UTC(
              bookedAt.getUTCFullYear(),
              bookedAt.getUTCMonth(),
              bookedAt.getUTCDate(),
            );
            const daysElapsed = Math.max(
              0,
              Math.floor((todayUtcDay - bookedUtcDay) / 86400000),
            );
            const daysLeft = Math.max(0, 30 - daysElapsed);

            const checkInDate = b.check_in ? new Date(b.check_in) : null;
            const hasCheckedInPassed = checkInDate
              ? Date.UTC(
                  checkInDate.getUTCFullYear(),
                  checkInDate.getUTCMonth(),
                  checkInDate.getUTCDate(),
                ) < todayUtcDay
              : false;

            const isEligibleForFreeCancel =
              !isNonRefundable && daysElapsed <= 30 && !hasCheckedInPassed;
            const canCancel =
              !isCancelled &&
              !isCompleted &&
              !hasCheckedInPassed &&
              (!isPaid || isEligibleForFreeCancel);

            return (
              <li
                key={String(b.id)}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e1e8f0] bg-white p-5 shadow-2xs"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-[#0d2c5c]">
                      {b.room_name || `Cameră #${b.room_id}`}
                    </p>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        STATUS[String(b.status)] ??
                        "bg-[#f4f7fb] text-[#3d4f6b] border-[#e1e8f0]"
                      }`}
                    >
                      {b.status === "cancelled" ? "Anulată" : b.status === "confirmed" ? "Confirmată" : b.status}
                    </span>
                    {isPaid && !isRefunded && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Achitat (Stripe)
                      </span>
                    )}
                    {isRefunded && (
                      <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
                        Rambursat Stripe
                      </span>
                    )}
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-medium text-slate-700">
                      Plan: {ratePlanLabel(plan)}
                    </span>
                  </div>

                  <p className="mt-1 text-[13px] text-[#6b7c99]">
                    {b.check_in ? dayLabel(b.check_in) : "—"} →{" "}
                    {b.check_out ? dayLabel(b.check_out) : "—"}
                  </p>

                  {/* Informații despre politica de anulare / restituire */}
                  {!isCancelled && !isCompleted && (
                    <div className="mt-1 text-[11.5px]">
                      {isNonRefundable ? (
                        <span className="text-slate-500 font-medium">
                          • Plan Nerambursabil (anularea sau restituirea nu sunt disponibile)
                        </span>
                      ) : hasCheckedInPassed ? (
                        <span className="text-slate-500 font-medium">
                          • Data de check-in a trecut
                        </span>
                      ) : isPaid && isEligibleForFreeCancel ? (
                        <span className="text-emerald-700 font-medium">
                          • Anulare & rambursare automată 100% Stripe disponibilă ({daysLeft} zile rămase din termenul de 30 de zile)
                        </span>
                      ) : isPaid && !isEligibleForFreeCancel ? (
                        <span className="text-amber-700 font-medium">
                          • Termenul de 30 de zile pentru rambursare automată a expirat ({daysElapsed} zile de la rezervare)
                        </span>
                      ) : null}
                    </div>
                  )}

                  {b.booking_code && !isCancelled && (
                    <div className="mt-2.5">
                      <Link
                        to={`/checkin/${b.booking_code}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d2c5c] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-[#c69a3f] transition-all"
                      >
                        <KeyRound size={12} />
                        {b.access_pin ? `Cheie Smart Lock: ${b.access_pin}` : "Self Check-in Online"}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  <span className="text-[16px] font-bold tabular-nums text-[#0d2c5c]">
                    {ron(b.total_price)}
                  </span>

                  {canCancel ? (
                    <button
                      onClick={() => void cancel(b)}
                      disabled={busy === String(b.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-50 hover:border-red-300 disabled:opacity-60 cursor-pointer shadow-2xs"
                      title={isPaid ? "Anulează cu rambursare 100% prin Stripe" : "Anulează rezervarea"}
                    >
                      {busy === String(b.id) ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      <span>{isPaid ? "Anulează (Rambursare 100%)" : "Anulează"}</span>
                    </button>
                  ) : !isCancelled && !isCompleted && isNonRefundable ? (
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      Nerambursabil
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
