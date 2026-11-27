import { useCallback, useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import { cancelBooking, myBookings } from "../services/bookingsService";
import { httpErrorMessage } from "../services/apiClient";
import { ron } from "../lib/format";
import { type Booking } from "../types/bookings";
import BookingListItem from "./MyBookings/components/BookingListItem";

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
    const onLiveSync = () => void load();
    window.addEventListener("live-bookings-sync", onLiveSync);
    return () => window.removeEventListener("live-bookings-sync", onLiveSync);
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
        toast(`Rezervarea a fost anulată! Restituirea de ${ron(b.total_price)} a fost procesată prin Stripe.`, "success");
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
      <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
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
            <BookingListItem key={String(b.id)} booking={b} busy={busy} onCancel={cancel} />
          ))}
        </ul>
      )}
    </div>
  );
}
