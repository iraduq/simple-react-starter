import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Loader as Loader2, XCircle } from "lucide-react";
import { Link } from "@/lib/router-compat";
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

/** GET /bookings/my-bookings + POST /bookings/{id}/cancel */
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
  }, [load]);

  const cancel = async (b: Booking) => {
    if (!window.confirm("Sigur vrei să anulezi această rezervare?")) return;
    setBusy(String(b.id));
    try {
      await cancelBooking(b.id);
      toast("Rezervare anulată.", "success");
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
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#eef2f7]" />
          ))}
        </div>
      ) : error ? (
        <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {error}
        </p>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#e1e8f0] bg-white px-6 py-14 text-center">
          <CalendarDays size={22} className="mx-auto text-[#c69a3f]" />
          <p className="mt-3 text-[14.5px] font-semibold text-[#0d2c5c]">Nu ai nicio rezervare</p>
          <Link
            to="/camere"
            className="mt-4 inline-block rounded-xl bg-[#0d2c5c] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c]"
          >
            Vezi camerele
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((b) => (
            <li
              key={String(b.id)}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e1e8f0] bg-white p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold text-[#0d2c5c]">
                    {b.room_name || `Cameră #${b.room_id}`}
                  </p>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      STATUS[String(b.status)] ?? "bg-[#f4f7fb] text-[#3d4f6b] border-[#e1e8f0]"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[#6b7c99]">
                  {b.check_in ? dayLabel(b.check_in) : "—"} → {b.check_out ? dayLabel(b.check_out) : "—"} ·{" "}
                  {ratePlanLabel(b.plan_code)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[15px] font-bold tabular-nums text-[#0d2c5c]">{ron(b.total_price)}</span>
                {b.status !== "cancelled" && b.status !== "completed" && (
                  <button
                    onClick={() => void cancel(b)}
                    disabled={busy === String(b.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-[12px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    {busy === String(b.id) ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <XCircle size={14} />
                    )}
                    Anulează
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
