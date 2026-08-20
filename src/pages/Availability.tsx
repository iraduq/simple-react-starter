import { useEffect, useRef, useState } from "react";
import { Search, Loader as Loader2, Users, BedDouble, CalendarX } from "lucide-react";
import { Link } from "react-router-dom";
import { searchAvailability } from "../services/roomsService";
import { httpErrorMessage } from "../services/apiClient";
import { imageUrl } from "../lib/admin";
import { useToast } from "../components/Toast";
import { ron, toISODate, nightsBetween, dayLabel } from "../lib/format";
import type { AvailableRoom } from "../types/rooms";

const inputCls =
  "w-full rounded-xl border border-[#e1e8f0] bg-white px-3.5 py-2.5 text-[14px] text-[#0d2c5c] outline-none focus:border-[#c69a3f]";
const labelCls =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8595aa]";

const roomTitle = (r: AvailableRoom) => r.title || r.name || "Cameră";
const roomCapacity = (r: AvailableRoom) => r.max_guests ?? r.capacity ?? null;
const typeLabel = (r: AvailableRoom) =>
  typeof r.room_type === "string" ? r.room_type : r.room_type?.name ?? null;

function Skeletons() {
  return (
    <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white"
        >
          <div className="h-44 w-full animate-pulse bg-[#eef2f8]" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#eef2f8]" />
            <div className="h-3 w-full animate-pulse rounded bg-[#f3f6fa]" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-[#f3f6fa]" />
            <div className="h-9 w-32 animate-pulse rounded-xl bg-[#eef2f8]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** POST /rooms/search/availability */
export default function Availability() {
  const today = toISODate(new Date());
  const { toast } = useToast();
  const initial =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const [checkIn, setCheckIn] = useState(initial.get("check_in") ?? "");
  const [checkOut, setCheckOut] = useState(initial.get("check_out") ?? "");
  const [adults, setAdults] = useState(Number(initial.get("adults")) || 2);
  const [children, setChildren] = useState(Number(initial.get("children")) || 0);
  const [rooms, setRooms] = useState<AvailableRoom[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<{ in: string; out: string } | null>(
    null,
  );

  const nights = nightsBetween(
    searched?.in ?? checkIn,
    searched?.out ?? checkOut,
  ).length;

  const run = async (ci: string, co: string, ad: number, ch: number) => {
    setError(null);
    if (!ci || !co || nightsBetween(ci, co).length === 0) {
      const msg = "Check-out trebuie să fie după check-in.";
      setError(msg);
      toast(msg, "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await searchAvailability({
        check_in: ci,
        check_out: co,
        adults: ad,
        children: ch,
        sort_by: "price",
      });
      setRooms(res);
      setSearched({ in: ci, out: co });
      if (res.length === 0) toast("Nicio cameră disponibilă în acest interval.", "info");
    } catch (err) {
      setRooms(null);
      const msg = httpErrorMessage(err, "Căutarea a eșuat.");
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void run(checkIn, checkOut, adults, children);
  };

  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current || !checkIn || !checkOut) return;
    autoRan.current = true;
    void run(checkIn, checkOut, adults, children);
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
      {searched && nights > 0 && (
        <p className="mt-2 text-[13.5px] text-[#6b7c99]">
          {dayLabel(searched.in)} — {dayLabel(searched.out)} ·{" "}
          {nights} {nights === 1 ? "noapte" : "nopți"} · {adults + children} oaspeți
        </p>
      )}

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
          <input type="number" min={1} max={12} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Copii</span>
          <input type="number" min={0} max={8} value={children} onChange={(e) => setChildren(Number(e.target.value))} className={inputCls} />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d2c5c] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c] disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Caută
        </button>
      </form>

      {error && !loading && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {error}
        </p>
      )}

      {loading && <Skeletons />}

      {!loading && rooms && rooms.length === 0 && !error && (
        <div className="mt-8 rounded-2xl border border-[#e1e8f0] bg-white px-6 py-14 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3e6c4] text-[#c69a3f]">
            <CalendarX size={24} />
          </span>
          <p className="text-[16px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
            Nicio cameră disponibilă
          </p>
          <p className="mx-auto mt-2 max-w-[420px] text-[13.5px] text-[#6b7c99]">
            Încearcă alte date sau ajustează numărul de oaspeți — avem des disponibilități
            în zilele apropiate.
          </p>
        </div>
      )}

      {!loading && rooms && rooms.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => {
            const base = r.base_price ?? null;
            const perNight =
              r.price_per_night ??
              (r.total_price != null && nights > 0 ? r.total_price / nights : base);
            const total =
              r.total_price ?? (perNight != null && nights > 0 ? perNight * nights : null);
            const discounted =
              base != null && perNight != null && perNight < base - 0.5;
            const cap = roomCapacity(r);
            return (
              <li
                key={String(r.id)}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white transition-shadow hover:shadow-[0_12px_32px_rgba(13,44,92,0.10)]"
              >
                {r.images?.[0] && (
                  <img src={imageUrl(r.images[0])} alt={roomTitle(r)} className="h-44 w-full object-cover" loading="lazy" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-[17px] text-[#0d2c5c]" style={{ fontFamily: "var(--font-display)" }}>
                      {roomTitle(r)}
                    </h2>
                    {discounted && (
                      <span className="shrink-0 rounded-full bg-[#f3e6c4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a6516]">
                        Ofertă
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#6b7c99]">
                    {typeLabel(r) && (
                      <span className="inline-flex items-center gap-1">
                        <BedDouble size={13} className="text-[#c69a3f]" /> {typeLabel(r)}
                      </span>
                    )}
                    {cap != null && (
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} className="text-[#c69a3f]" /> max {cap} oaspeți
                      </span>
                    )}
                    {r.available_units != null && (
                      <span>{r.available_units} unități libere</span>
                    )}
                  </div>

                  {r.description && (
                    <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-[#6b7c99]">
                      {r.description}
                    </p>
                  )}

                  {r.facilities && r.facilities.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {r.facilities.slice(0, 4).map((f) => (
                        <li
                          key={String(f.id)}
                          className="rounded-full border border-[#e1e8f0] px-2.5 py-1 text-[10.5px] text-[#0d2c5c]"
                        >
                          {f.name}
                        </li>
                      ))}
                      {r.facilities.length > 4 && (
                        <li className="rounded-full border border-[#e1e8f0] px-2.5 py-1 text-[10.5px] text-[#8595aa]">
                          +{r.facilities.length - 4}
                        </li>
                      )}
                    </ul>
                  )}

                  <div className="mt-auto pt-4">
                    <div className="flex items-end gap-2">
                      <p className="text-[18px] font-bold text-[#0d2c5c]">
                        {ron(total ?? perNight ?? base)}
                      </p>
                      {discounted && base != null && (
                        <span className="text-[12.5px] text-[#8595aa] line-through">
                          {ron(nights > 0 ? base * nights : base)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-[#8595aa]">
                      {nights > 0
                        ? `total ${nights} ${nights === 1 ? "noapte" : "nopți"} · ${ron(perNight)} / noapte`
                        : "preț pe noapte"}
                    </p>
                    <Link
                      to={`/camere/${r.id}?check_in=${searched?.in ?? ""}&check_out=${searched?.out ?? ""}&adults=${adults}&children=${children}`}
                      className="mt-4 inline-block rounded-xl bg-[#0d2c5c] px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#c69a3f] hover:text-[#0d2c5c]"
                    >
                      Rezervă
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
