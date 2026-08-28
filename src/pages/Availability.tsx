import { useEffect, useRef, useState } from "react";
import {
  Search,
  Loader as Loader2,
  Users,
  BedDouble,
  CalendarX,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { searchAvailability } from "../services/roomsService";
import { httpErrorMessage } from "../services/apiClient";
import { imageUrl } from "../lib/admin";
import { useToast } from "../components/Toast";
import { ron, toISODate, nightsBetween, dayLabel } from "../lib/format";
import DatePicker from "../components/DatePicker";
import type { AvailableRoom } from "../types/rooms";

const roomTitle = (r: AvailableRoom) => r.title || r.name || "Cameră";
const roomCapacity = (r: AvailableRoom) => r.max_guests ?? r.capacity ?? null;
const typeLabel = (r: AvailableRoom) =>
  typeof r.room_type === "string" ? r.room_type : (r.room_type?.name ?? null);

function Skeletons() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <article
          key={i}
          className="rounded-[26px] overflow-hidden border border-[#e1e8f0] bg-white shadow-sm flex flex-col"
        >
          <div className="h-56 w-full animate-pulse bg-[#f4f7fb]" />
          <div className="flex flex-col flex-1 p-6 md:p-8 gap-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#eef2f7]" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-[#eef2f7]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#f4f7fb] mt-2" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-[#f4f7fb]" />
            <div className="mt-auto pt-6 flex justify-between items-end border-t border-[#eef2f7]">
              <div className="h-10 w-24 animate-pulse rounded-lg bg-[#eef2f7]" />
              <div className="h-12 w-32 animate-pulse rounded-full bg-[#eef2f7]" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

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
  const [children, setChildren] = useState(
    Number(initial.get("children")) || 0,
  );
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  const [rooms, setRooms] = useState<AvailableRoom[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<{ in: string; out: string } | null>(
    null,
  );

  useEffect(() => {
    if (!guestsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!guestsRef.current?.contains(e.target as Node)) setGuestsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [guestsOpen]);

  const nights = nightsBetween(
    searched?.in ?? checkIn,
    searched?.out ?? checkOut,
  ).length;

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (checkOut && val >= checkOut) setCheckOut("");
  };

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
      if (res.length === 0)
        toast("Nicio cameră disponibilă în acest interval.", "info");
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
    <div className="min-h-screen bg-[#0d2c5c] relative overflow-x-hidden flex flex-col">
      {/* ── HEADER "ALIVE" (DARK NAVY) ── */}
      <section className="relative z-20 bg-[#0d2c5c] px-5 md:px-10 pt-32 md:pt-40 pb-32 md:pb-44 text-center overflow-hidden">
        {/* Glow Effects animate în Header */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#c69a3f]/15 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#1e4d8c]/30 rounded-full blur-[120px] pointer-events-none"
        />

        {/* Auroră auriu rotativ pentru senzația de viață */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0_200deg,#c69a3f_360deg)] rounded-full blur-[80px] pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <p className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-5 flex items-center justify-center gap-4">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#c69a3f]/80" />
            Rezervări · Vila Casa Esy
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#c69a3f]/80" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4.5rem)] font-normal text-white leading-[1.1] tracking-[-0.01em]">
            Verifică {/* Shimmer effect pe textul auriu */}
            <span className="relative inline-block">
              <em className="italic text-[#c69a3f] relative z-10">
                disponibilitatea
              </em>
              <span className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                <motion.span
                  animate={{ left: ["-100%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 4,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                />
              </span>
            </span>
          </h1>
        </motion.div>
      </section>

      {/* ── ZONE CU FUNDAL ALB CARE CONȚINE REZULTATELE ── */}
      <div className="bg-[#f8fafd] flex-1 relative flex flex-col rounded-t-[30px] md:rounded-t-[40px] shadow-[0_-20px_40px_rgba(5,11,22,0.3)] z-20">
        {/* ── SEARCH WIDGET (Folosind DatePicker elegant) ── */}
        <div className="relative z-30 max-w-[1000px] mx-auto px-5 md:px-10 -mt-10 md:-mt-12 w-full">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={submit}
            className="bg-white rounded-[20px] md:rounded-full shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] border border-[#e1e8f0] p-2 md:p-3 flex flex-col md:flex-row gap-2 items-stretch md:items-center"
          >
            <div className="flex flex-1 flex-col md:flex-row gap-2 bg-[#f8fafd] border border-[#e1e8f0] rounded-[16px] md:rounded-full p-1.5">
              {/* Check-in DatePicker */}
              <DatePicker
                label={
                  <>
                    <Calendar
                      size={10}
                      className="inline mr-1 text-[#c69a3f] -mt-0.5"
                    />
                    Check-in
                  </>
                }
                value={checkIn}
                onChange={handleCheckIn}
                minDate={today}
                variant="bar"
              />

              {/* Check-out DatePicker */}
              <DatePicker
                label={
                  <>
                    <Calendar
                      size={10}
                      className="inline mr-1 text-[#c69a3f] -mt-0.5"
                    />
                    Check-out
                  </>
                }
                value={checkOut}
                onChange={setCheckOut}
                minDate={checkIn || today}
                variant="bar"
              />

              {/* OASPEȚI Dropdown */}
              <div
                ref={guestsRef}
                className="relative flex-1 flex flex-col justify-center px-6 py-4.5"
              >
                <button
                  type="button"
                  onClick={() => setGuestsOpen((o) => !o)}
                  className="font-sans text-left w-full leading-[1.3] transition-colors duration-150 bg-transparent border-none p-0 text-sm cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-1.5 select-none">
                    <Users
                      size={10}
                      className="inline mr-1 text-[#c69a3f] -mt-0.5"
                    />
                    Oaspeți
                  </span>
                  <span
                    className={
                      guestsOpen
                        ? "text-[#0d2c5c] block truncate font-semibold"
                        : "text-[#3c4043]/70 block truncate font-semibold"
                    }
                  >
                    {adults} {adults === 1 ? "adult" : "adulți"}
                    {children > 0 &&
                      ` · ${children} ${children === 1 ? "copil" : "copii"}`}
                  </span>
                </button>

                {guestsOpen && (
                  <div className="absolute left-0 right-0 md:left-auto md:right-0 md:w-[280px] top-[calc(100%+12px)] z-30 rounded-[20px] border border-[#e1e8f0] bg-white p-5 shadow-[0_15px_40px_rgba(13,44,92,0.15)]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold text-[#0d2c5c]">
                        Adulți
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={adults <= 1}
                          onClick={() => setAdults((g) => Math.max(1, g - 1))}
                          className="w-7 h-7 rounded-full border border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[#c69a3f] hover:bg-[#c69a3f]/5 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold text-[#0d2c5c] w-5 text-center">
                          {adults}
                        </span>
                        <button
                          type="button"
                          disabled={adults >= 6}
                          onClick={() => setAdults((g) => Math.min(6, g + 1))}
                          className="w-7 h-7 rounded-full border border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[#c69a3f] hover:bg-[#c69a3f]/5 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#eef2f7] flex items-start justify-between gap-3">
                      <span className="text-[12px] font-semibold text-[#0d2c5c]">
                        Copii
                        <span className="mt-1 block text-[10px] font-normal leading-snug text-[#8595aa]">
                          Până la 12 ani.
                        </span>
                      </span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          disabled={children <= 0}
                          onClick={() => setChildren((g) => Math.max(0, g - 1))}
                          className="w-7 h-7 rounded-full border border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[#c69a3f] hover:bg-[#c69a3f]/5 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold text-[#0d2c5c] w-5 text-center">
                          {children}
                        </span>
                        <button
                          type="button"
                          disabled={children >= 4}
                          onClick={() => setChildren((g) => Math.min(4, g + 1))}
                          className="w-7 h-7 rounded-full border border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[#c69a3f] hover:bg-[#c69a3f]/5 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group md:w-auto w-full inline-flex items-center justify-center gap-2 rounded-[16px] md:rounded-full bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-8 py-3.5 md:h-14 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_6px_16px_-6px_rgba(198,154,63,0.8)] transition-all hover:shadow-[0_10px_20px_-6px_rgba(198,154,63,0.9)] hover:-translate-y-0.5 shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              Caută
            </button>
          </motion.form>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 mx-auto max-w-[1280px] w-full px-5 md:px-10 pb-20 pt-12 relative z-10">
          {searched && nights > 0 && !loading && !error && rooms !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center flex flex-col items-center gap-2"
            >
              <span className="inline-flex items-center gap-2 bg-white border border-[#e1e8f0] px-4 py-2 rounded-full text-[12px] font-bold tracking-[0.1em] text-[#0d2c5c] uppercase shadow-sm">
                <CheckCircle2 size={14} className="text-emerald-600" />
                {rooms.length}{" "}
                {rooms.length === 1
                  ? "opțiune disponibilă"
                  : "opțiuni disponibile"}
              </span>
              <p className="text-[14.5px] text-[#5a6b85] font-light mt-2">
                {dayLabel(searched.in)} — {dayLabel(searched.out)}{" "}
                <span className="mx-2 text-[#c69a3f]">|</span> {nights}{" "}
                {nights === 1 ? "noapte" : "nopți"}{" "}
                <span className="mx-2 text-[#c69a3f]">|</span>{" "}
                {adults + children} oaspeți
              </p>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 rounded-2xl bg-red-50 border border-red-100 p-6 text-center shadow-sm max-w-2xl mx-auto"
            >
              <p className="text-[15px] font-medium text-red-700">{error}</p>
            </motion.div>
          )}

          {loading && <Skeletons />}

          {!loading && rooms && rooms.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 rounded-[28px] border border-[#e1e8f0] bg-white p-12 md:p-20 text-center shadow-sm max-w-3xl mx-auto"
            >
              <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f8fafd] text-[#8595aa] border border-[#e1e8f0]">
                <CalendarX size={32} strokeWidth={1.5} />
              </span>
              <p className="text-[32px] text-[#0d2c5c] font-['Cormorant_Garamond',serif] leading-tight mb-4">
                Nicio cameră disponibilă
              </p>
              <p className="mx-auto max-w-[480px] text-[15px] text-[#5a6b85] font-light leading-relaxed">
                Ne pare rău, dar pentru datele selectate nu mai avem camere
                libere. Încearcă alte date sau ajustează numărul de oaspeți —
                avem des disponibilități în zilele apropiate.
              </p>
            </motion.div>
          )}

          {/* ── ROOM CARDS GRID ── */}
          {!loading && rooms && rooms.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {rooms.map((r, idx) => {
                  const calculatedTotal =
                    r.total_price ??
                    Number(r.base_price ?? 0) * (nights > 0 ? nights : 1);
                  const displayPerNight =
                    nights > 0
                      ? calculatedTotal / nights
                      : Number(r.base_price ?? 0);

                  const cap = roomCapacity(r);

                  return (
                    <motion.article
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: idx * 0.08,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      key={String(r.id)}
                      className="group relative flex flex-col overflow-hidden rounded-[26px] border border-[#e1e8f0] bg-white shadow-[0_4px_16px_rgba(13,44,92,0.03)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(13,44,92,0.12)]"
                    >
                      <div className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 [box-shadow:inset_0_0_0_1.5px_rgba(198,154,63,0.3)] z-20" />

                      <div className="relative h-60 w-full overflow-hidden bg-[#0d2c5c]">
                        {r.images?.[0] ? (
                          <div className="w-full h-full relative overflow-hidden">
                            <img
                              src={imageUrl(r.images[0])}
                              alt={roomTitle(r)}
                              className="h-full w-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-[#0d2c5c]/10 mix-blend-overlay" />
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-[#f4f7fb] text-[#8595aa]">
                            <BedDouble size={40} strokeWidth={1} />
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
                          <motion.div
                            initial={{ x: "-150%" }}
                            whileHover={{ x: "200%" }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                          />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 z-10"></div>
                      </div>

                      <div className="flex flex-1 flex-col p-7 relative z-10">
                        <h2 className="text-[26px] text-[#0d2c5c] font-normal leading-tight font-['Cormorant_Garamond',serif] transition-colors duration-300 group-hover:text-[#c69a3f] mb-3">
                          {roomTitle(r)}
                        </h2>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#5a6b85] font-medium mb-4">
                          {typeLabel(r) && (
                            <span className="inline-flex items-center gap-1.5 bg-[#f8fafd] px-2.5 py-1 rounded-md border border-[#e1e8f0]">
                              <BedDouble size={14} className="text-[#c69a3f]" />{" "}
                              {typeLabel(r)}
                            </span>
                          )}
                          {cap != null && (
                            <span className="inline-flex items-center gap-1.5 bg-[#f8fafd] px-2.5 py-1 rounded-md border border-[#e1e8f0]">
                              <Users size={14} className="text-[#c69a3f]" /> max{" "}
                              {cap} oaspeți
                            </span>
                          )}
                        </div>

                        {r.description && (
                          <p className="line-clamp-2 text-[14px] leading-relaxed text-[#6b7c99] font-light mb-5">
                            {r.description}
                          </p>
                        )}

                        {r.facilities && r.facilities.length > 0 && (
                          <ul className="flex flex-wrap gap-1.5 mb-6">
                            {r.facilities.slice(0, 3).map((f) => (
                              <li
                                key={String(f.id)}
                                className="rounded-full border border-[#e1e8f0] bg-white px-3 py-1 text-[11px] text-[#3d4f6b] shadow-sm"
                              >
                                {f.name}
                              </li>
                            ))}
                            {r.facilities.length > 3 && (
                              <li className="rounded-full border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-1 text-[11px] text-[#8595aa] font-medium">
                                +{r.facilities.length - 3}
                              </li>
                            )}
                          </ul>
                        )}

                        <div className="mt-auto pt-6 flex items-end justify-between border-t border-[#e1e8f0]">
                          <div className="flex flex-col">
                            <p className="text-[24px] font-bold text-[#0d2c5c] leading-none tracking-[-0.02em]">
                              {ron(calculatedTotal)}
                            </p>
                            <p className="mt-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#8595aa]">
                              {nights > 0
                                ? `pt. ${nights} ${nights === 1 ? "noapte" : "nopți"} (${ron(displayPerNight)}/noapte)`
                                : "preț / noapte"}
                            </p>
                          </div>

                          <Link
                            to={`/camere/${r.id}?check_in=${searched?.in ?? ""}&check_out=${searched?.out ?? ""}&adults=${adults}&children=${children}`}
                            className="group/btn inline-flex items-center gap-2 rounded-full border border-[#0d2c5c]/20 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] transition-all duration-300 hover:bg-[#0d2c5c] hover:border-[#0d2c5c] hover:text-white shadow-sm"
                          >
                            Rezervă
                            <ArrowRight
                              size={14}
                              className="transition-transform duration-300 group-hover/btn:translate-x-1"
                            />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
