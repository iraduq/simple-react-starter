import { useEffect, useRef, useState } from "react";
import { Search, Loader as Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { searchAvailability } from "../services/roomsService";
import { httpErrorMessage } from "../services/apiClient";
import { imageUrl } from "../lib/admin";
import { ron, toISODate, nightsBetween } from "../lib/format";
import type { AvailableRoom } from "../types/rooms";

const inputCls =
  "w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f]";
const labelCls = "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]";

/** POST /rooms/search/availability */
export default function Availability() {
  const today = toISODate(new Date());
  const initial =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const [checkIn, setCheckIn] = useState(initial.get("check_in") ?? "");
  const [checkOut, setCheckOut] = useState(initial.get("check_out") ?? "");
  const [adults, setAdults] = useState(Number(initial.get("adults")) || 2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState<AvailableRoom[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nightsBetween(checkIn, checkOut).length === 0) {
      setError("Check-out trebuie să fie după check-in.");
      return;
    }
    setLoading(true);
    try {
      setRooms(
        await searchAvailability({
          check_in: checkIn,
          check_out: checkOut,
          adults,
          children,
          guests: adults + children,
        }),
      );
    } catch (err) {
      setRooms(null);
      setError(httpErrorMessage(err, "Căutarea a eșuat."));
    } finally {
      setLoading(false);
    }
  };

  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current || !checkIn || !checkOut) return;
    autoRan.current = true;
    void submit({ preventDefault: () => {} } as React.FormEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 lg:py-14">
      <h1
        className="text-[clamp(1.6rem,3vw,2.2rem)] text-[#0d2c5c]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Verifică disponibilitatea
      </h1>

      <form
        onSubmit={submit}
        className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-[#e1e8f0] bg-white p-5 sm:grid-cols-5"
      >
        <label className="block">
          <span className={labelCls}>Check-in</span>
          <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} required />
        </label>
        <label className="block">
          <span className={labelCls}>Check-out</span>
          <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} required />
        </label>
        <label className="block">
          <span className={labelCls}>Adulți</span>
          <input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Copii</span>
          <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} className={inputCls} />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c] disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Caută
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {error}
        </p>
      )}

      {rooms && rooms.length === 0 && !error && (
        <p className="mt-8 rounded-2xl border border-[#e1e8f0] bg-white px-6 py-14 text-center text-[14px] text-[#6b7c99]">
          Nicio cameră disponibilă pentru perioada selectată.
        </p>
      )}

      {rooms && rooms.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <li key={String(r.id)} className="overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white">
              {r.images?.[0] && (
                <img src={imageUrl(r.images[0])} alt={r.name} className="h-44 w-full object-cover" loading="lazy" />
              )}
              <div className="p-5">
                <h2 className="text-[17px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
                  {r.name}
                </h2>
                <p className="mt-1 text-[12.5px] text-[#6b7c99]">
                  {r.available_units != null ? `${r.available_units} unități libere` : "Disponibil"}
                </p>
                <p className="mt-2 text-[15px] font-bold text-[#0d2c5c]">
                  {ron(r.total_price ?? r.price_per_night ?? r.base_price)}
                </p>
                <Link
                  to={`/camere/${r.id}`}
                  className="mt-4 inline-block rounded-xl bg-[#0d2c5c] px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c]"
                >
                  Rezervă
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
