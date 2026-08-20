import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import BookingPriceSummary from "./BookingPriceSummary";
import { useToast } from "../Toast";
import { useAuth } from "../../hooks/useAuth";
import { calculateStay } from "../../services/pricingService";
import { createBooking } from "../../services/bookingsService";
import { httpErrorMessage } from "../../services/apiClient";
import { nightsBetween, toISODate } from "../../lib/format";
import { RATE_PLANS, type RatePlanCode } from "../../types/bookings";
import type { PricingNight } from "../../types/pricing";
import type { Room } from "../../types/rooms";

const inputCls =
  "w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none transition-colors focus:border-[#c69a3f]";
const labelCls =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]";

/**
 * Formular de rezervare.
 * Tarifele vin din GET /api/pricing/calculate (un apel per noapte),
 * rezervarea se trimite la POST /bookings.
 */
export default function BookingForm({ room }: { room: Room }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const today = toISODate(new Date());
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [plan, setPlan] = useState<RatePlanCode>("flexible");
  const [notes, setNotes] = useState("");

  const [nights, setNights] = useState<PricingNight[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nightDates = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const roomTypeId = room.room_type_id ?? room.id;

  useEffect(() => {
    if (nightDates.length === 0) {
      setNights([]);
      setPriceError(null);
      return;
    }
    let active = true;
    setPriceLoading(true);
    setPriceError(null);
    const bookingDate = toISODate(new Date());
    calculateStay(
      nightDates.map((date) => ({
        room_type_id: roomTypeId,
        date,
        booking_date: bookingDate,
        length_of_stay: nightDates.length,
        plan_code: plan,
        adults,
        extra_guests: children,
      })),
    )
      .then((res) => {
        if (!active) return;
        setNights(res);
      })
      .catch((e) => {
        if (!active) return;
        setNights([]);
        setPriceError(httpErrorMessage(e, "Nu am putut calcula tariful."));
      })
      .finally(() => {
        if (active) setPriceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [nightDates.join(","), plan, adults, children, roomTypeId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!checkIn || !checkOut) return setFormError("Alege datele de check-in și check-out.");
    if (nightDates.length === 0)
      return setFormError("Data de check-out trebuie să fie după cea de check-in.");
    if (adults < 1) return setFormError("Este necesar cel puțin un adult.");
    if (!isAuthenticated) {
      toast("Autentifică-te pentru a finaliza rezervarea.", "info");
      navigate("/login", { replace: false });
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        adults,
        children,
        plan_code: plan,
        guest_email: user?.email,
        guest_name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || undefined,
        notes: notes || undefined,
      });
      toast("Rezervare trimisă. Îți confirmăm în cel mai scurt timp.", "success");
      navigate("/rezervarile-mele");
    } catch (e) {
      // 422 din backend (min_stay, CTA, CTD etc.) e afișat direct în formular.
      setFormError(httpErrorMessage(e, "Rezervarea nu a putut fi trimisă."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#e1e8f0] bg-white p-5 md:p-6">
      <h2 className="text-[20px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
        Rezervă această cameră
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="check-in">
            Check-in
          </label>
          <input
            id="check-in"
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="check-out">
            Check-out
          </label>
          <input
            id="check-out"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="adults">
            Adulți
          </label>
          <input
            id="adults"
            type="number"
            min={1}
            max={room.max_adults ?? room.capacity ?? 10}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="children">
            Copii
          </label>
          <input
            id="children"
            type="number"
            min={0}
            max={room.max_children ?? 6}
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className={labelCls}>Plan tarifar</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {RATE_PLANS.map((p) => (
            <label
              key={p.code}
              className={`cursor-pointer rounded-xl border px-3.5 py-3 text-[13px] transition-colors ${
                plan === p.code
                  ? "border-[#c69a3f] bg-[#f4e5c8]/40 text-[#0d2c5c]"
                  : "border-[#e1e8f0] text-[#3d4f6b] hover:border-[#0d2c5c]"
              }`}
            >
              <input
                type="radio"
                name="plan_code"
                value={p.code}
                checked={plan === p.code}
                onChange={() => setPlan(p.code)}
                className="sr-only"
              />
              <span className="block font-semibold">{p.label}</span>
              <span className="mt-0.5 block text-[11.5px] text-[#8595aa]">{p.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label className={labelCls} htmlFor="notes">
          Mențiuni (opțional)
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputCls}
        />
      </div>

      <div className="mt-6">
        <BookingPriceSummary
          nights={nights}
          planCode={plan}
          loading={priceLoading}
          error={priceError}
        />
      </div>

      {formError && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || priceLoading || authLoading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#c69a3f] hover:text-[#0d2c5c] disabled:opacity-60"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
        {isAuthenticated ? "Confirmă rezervarea" : "Autentifică-te și rezervă"}
      </button>
    </form>
  );
}
