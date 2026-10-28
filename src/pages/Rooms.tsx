import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Maximize,
  Waves,
  Wifi,
  Coffee,
  Bath,
  ImageOff,
  ArrowRight,
  Calendar,
  Search,
  Loader2,
  X,
  CalendarX,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { searchAvailability } from "../services/roomsService";
import { httpErrorMessage } from "../services/apiClient";
import { useToast } from "../components/Toast";
import DatePicker from "../components/DatePicker";
import { ron, toISODate, nightsBetween, dayLabel } from "../lib/format";
import type { AvailableRoom } from "../types/rooms";

type RoomImage = { id?: number | string; url?: string; image_url?: string };

type ApiRoom = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  base_price?: number | null;
  price_per_night?: number | null;
  total_price?: number | null;
  capacity?: number | null;
  max_guests?: number | null;
  size_sqm?: number | null;
  is_active?: boolean | null;
  images?: RoomImage[];
  facilities?: { id: number | string; name: string }[] | null;
  category?: string | null;
  room_type?: { name?: string | null } | string | null;
  badge?: string | null;
  amenities?: string[] | null;
  max_guests_adults?: number;
  max_guests_children?: number;
};

type DisplayRoom = {
  id: number | string;
  category: string;
  title: string;
  price: number;
  total: number | null;
  guests: number;
  size: string;
  badge?: string;
  description: string;
  amenities: string[];
  images: string[];
};

const FALLBACK_IMG =
  "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop";

const imageUrl = (img: RoomImage) => img.url || img.image_url || "";

function mapRoom(r: ApiRoom): DisplayRoom {
  const imgs = (r.images || []).map(imageUrl).filter(Boolean);
  const guests =
    r.max_guests ??
    r.capacity ??
    (r.max_guests_adults || 2) + (r.max_guests_children || 0);
  const amenities =
    r.facilities && r.facilities.length
      ? r.facilities.map((f) => f.name)
      : r.amenities && r.amenities.length
        ? r.amenities
        : ["WiFi", "Aer condiționat", "Baie privată"];
  const type =
    typeof r.room_type === "string" ? r.room_type : r.room_type?.name;
  return {
    id: r.id,
    category: r.category || type || "Cameră",
    title: r.name || r.title || "Cameră",
    price: Number(r.price_per_night ?? r.base_price ?? 0),
    total: r.total_price != null ? Number(r.total_price) : null,
    guests,
    size: r.size_sqm ? `${r.size_sqm} m²` : "30 m²",
    badge: r.badge || undefined,
    description: r.description || "",
    amenities,
    images: imgs.length ? imgs : [FALLBACK_IMG],
  };
}

const amenityIcon = (label: string) => {
  const l = label.toLowerCase();
  if (/(mare|grădin|teras|piscin)/.test(l)) return Waves;
  if (/(wi-?fi|internet)/.test(l)) return Wifi;
  if (/(baie|duș|jacuzzi|băi|toalet)/.test(l)) return Bath;
  return Coffee;
};

function RoomGallery({ images, alt, badge }: { images: string[]; alt: string; badge?: string }) {
  const [index, setIndex] = useState(0);
  const go = (dir: number) => setIndex((i) => (i + dir + images.length) % images.length);
  return (
    <div className="group/gal relative h-[280px] sm:h-[340px] lg:h-full lg:min-h-[420px] overflow-hidden bg-[#0d2c5c]">
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${alt} – imaginea ${i + 1}`}
            loading="lazy"
            onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)}
            className="w-full h-full shrink-0 object-cover"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0d2c5c]/70 to-transparent" />

      {images.length > 1 && (
        <>
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? "Imaginea anterioară" : "Imaginea următoare"}
              onClick={() => go(d)}
              className={`absolute top-1/2 -translate-y-1/2 ${d < 0 ? "left-4" : "right-4"} w-10 h-10 rounded-full bg-white/90 text-[#0d2c5c] flex items-center justify-center shadow-md transition-opacity duration-300 opacity-100 lg:opacity-0 lg:group-hover/gal:opacity-100 hover:bg-white`}
            >
              {d < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          ))}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Imaginea ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-[3px] rounded-full transition-all duration-500 ${i === index ? "w-8 bg-white" : "w-3 bg-white/45"}`}
              />
            ))}
          </div>
          <span className="absolute top-5 right-5 rounded-full bg-[#0d2c5c]/70 backdrop-blur px-3 py-1 text-[11px] font-semibold text-white">
            {index + 1} / {images.length}
          </span>
        </>
      )}
      {badge && (
        <span className="absolute top-5 left-5 rounded-full bg-white px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-[#0d2c5c] shadow">
          {badge}
        </span>
      )}
    </div>
  );
}

function RoomSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 rounded-[24px] overflow-hidden border border-[#e1e8f0] bg-white">
      <div className="h-[300px] lg:min-h-[420px] bg-[#f4f7fb] animate-pulse" />
      <div className="p-8 md:p-12 flex flex-col gap-4">
        <div className="h-3 w-24 rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-9 w-3/4 rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-20 w-full rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-12 w-1/2 rounded bg-[#eef2f7] animate-pulse" />
      </div>
    </div>
  );
}

export default function Rooms() {
  const today = toISODate(new Date());
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  const [checkIn, setCheckIn] = useState(params.get("check_in") ?? "");
  const [checkOut, setCheckOut] = useState(params.get("check_out") ?? "");
  const [adults, setAdults] = useState(Number(params.get("adults")) || 2);
  const [children, setChildren] = useState(Number(params.get("children")) || 0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [allRooms, setAllRooms] = useState<DisplayRoom[]>([]);
  const [results, setResults] = useState<DisplayRoom[] | null>(null);
  const [searched, setSearched] = useState<{ in: string; out: string; guests: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Toate");

  useEffect(() => {
    if (!guestsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!guestsRef.current?.contains(e.target as Node)) setGuestsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [guestsOpen]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<unknown>("/rooms");
        const arr = Array.isArray(data)
          ? (data as ApiRoom[])
          : ((data as { items?: ApiRoom[] })?.items ?? []);
        if (active) setAllRooms(arr.filter((r) => r.is_active !== false).map(mapRoom));
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Nu am putut încărca camerele.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const runSearch = async (ci: string, co: string, ad: number, ch: number) => {
    if (!ci || !co) {
      toast("Selectează datele de check-in și check-out.", "warning");
      return;
    }
    if (nightsBetween(ci, co).length === 0) {
      toast("Check-out trebuie să fie după check-in.", "warning");
      return;
    }
    setSearching(true);
    try {
      const res = await searchAvailability({ check_in: ci, check_out: co, adults: ad, children: ch, sort_by: "price" });
      const mapped = (res as AvailableRoom[]).map((r) => {
        const base = allRooms.find((a) => String(a.id) === String(r.id));
        const m = mapRoom(r as ApiRoom);
        return base ? { ...base, price: m.price || base.price, total: m.total } : m;
      });
      setResults(mapped);
      setSearched({ in: ci, out: co, guests: ad + ch });
      setActiveTab("Toate");
      setParams({ check_in: ci, check_out: co, adults: String(ad), children: String(ch) }, { replace: true });
      if (mapped.length === 0) toast("Nicio cameră liberă în acest interval.", "info");
      setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      toast(httpErrorMessage(err, "Căutarea a eșuat."), "error");
    } finally {
      setSearching(false);
    }
  };

  // Rulează automat căutarea când vii cu date din prima pagină
  const autoRan = useRef(false);
  useEffect(() => {
    if (loading || autoRan.current || !checkIn || !checkOut) return;
    autoRan.current = true;
    void runSearch(checkIn, checkOut, adults, children);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const clearSearch = () => {
    setResults(null);
    setSearched(null);
    setCheckIn("");
    setCheckOut("");
    setParams({}, { replace: true });
  };

  const nights = searched ? nightsBetween(searched.in, searched.out).length : 0;
  const source = results ?? allRooms;
  const categories = ["Toate", ...Array.from(new Set(source.map((r) => r.category)))];
  const filtered = activeTab === "Toate" ? source : source.filter((r) => r.category === activeTab);
  const bookingQuery = searched
    ? `?check_in=${searched.in}&check_out=${searched.out}&adults=${adults}&children=${children}`
    : "";

  const counter = (label: string, hint: string | null, value: number, set: (n: number) => void, min: number, max: number) => (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 border-b last:border-0 border-[#eef2f7]">
      <span className="text-[13px] font-semibold text-[#0d2c5c]">
        {label}
        {hint && <span className="block text-[11px] font-normal text-[#8595aa]">{hint}</span>}
      </span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={value <= min} onClick={() => set(Math.max(min, value - 1))} className="w-8 h-8 rounded-full border border-[#e1e8f0] text-[#0d2c5c] disabled:opacity-30 hover:border-[#0d2c5c]">−</button>
        <span className="w-5 text-center text-sm font-semibold text-[#0d2c5c]">{value}</span>
        <button type="button" disabled={value >= max} onClick={() => set(Math.min(max, value + 1))} className="w-8 h-8 rounded-full border border-[#e1e8f0] text-[#0d2c5c] disabled:opacity-30 hover:border-[#0d2c5c]">+</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white text-[#1a1a1a]">
      {/* ── HERO (același stil ca prima pagină) ── */}
      <section className="relative overflow-hidden bg-[#0d2c5c]">
        <div className="absolute inset-0">
          <video autoPlay muted loop playsInline preload="auto" poster="/hero-poster.jpg" className="h-full w-full object-cover saturate-50 contrast-110">
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />
          <div className="absolute inset-0 bg-[#0b2146]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/55 to-[#0d2c5c]/95" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-10 pt-32 md:pt-44 pb-16 md:pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--gold)] mb-4 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-[var(--gold)]/60" />
              Cazare · Vila Casa Esy
              <span className="w-8 h-px bg-[var(--gold)]/60" />
            </p>
            <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,4.6rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-5 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]">
              Camerele noastre, <br className="hidden md:block" />
              <em className="italic text-[var(--gold)]">gândite pentru odihnă</em>
            </h1>
            <span className="my-3 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-14 bg-[var(--gold)]/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[var(--gold)]" />
              <span className="h-px w-14 bg-[var(--gold)]/50" />
            </span>
            <p className="max-w-[620px] mx-auto text-[15px] sm:text-[16px] text-white/85 leading-[1.8] font-light">
              De la camere luminoase cu vedere la grădină, până la suite cu terasă privată.
              Alege datele și vezi pe loc ce e liber pentru tine.
            </p>
          </motion.div>

          {/* Bara de căutare */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            onSubmit={(e) => {
              e.preventDefault();
              void runSearch(checkIn, checkOut, adults, children);
            }}
            className="mt-10 md:mt-12 mx-auto max-w-[960px] flex flex-col lg:flex-row items-stretch rounded-[20px] bg-white shadow-[0_25px_60px_-20px_rgba(0,0,0,0.5)] text-left"
          >
            <DatePicker
              label={<><Calendar size={10} className="inline mr-1 text-[#0d2c5c] -mt-0.5" />Check-in</>}
              value={checkIn}
              onChange={(v: string) => {
                setCheckIn(v);
                if (checkOut && v >= checkOut) setCheckOut("");
              }}
              minDate={today}
              variant="bar"
            />
            <DatePicker
              label={<><Calendar size={10} className="inline mr-1 text-[#0d2c5c] -mt-0.5" />Check-out</>}
              value={checkOut}
              onChange={setCheckOut}
              minDate={checkIn || today}
              variant="bar"
            />
            <div ref={guestsRef} className="relative flex-1 flex flex-col justify-center px-6 py-4 lg:py-0 border-t lg:border-t-0 lg:border-l border-[#eef2f7]">
              <button type="button" onClick={() => setGuestsOpen((o) => !o)} className="text-left">
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-1.5">
                  <Users size={10} className="text-[#0d2c5c]" /> Oaspeți
                </span>
                <span className="block truncate text-sm font-semibold text-[#3c4043]">
                  {adults} {adults === 1 ? "adult" : "adulți"}
                  {children > 0 && ` · ${children} ${children === 1 ? "copil" : "copii"}`}
                </span>
              </button>
              {guestsOpen && (
                <div className="absolute left-0 right-0 lg:left-auto lg:w-[280px] top-[calc(100%+10px)] z-30 rounded-[18px] border border-[#e1e8f0] bg-white p-5 shadow-[0_15px_40px_rgba(13,44,92,0.18)]">
                  {counter("Adulți", null, adults, setAdults, 1, 6)}
                  {counter("Copii", "Până la 12 ani", children, setChildren, 0, 4)}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={searching}
              className="flex items-center justify-center gap-2 min-h-[60px] lg:min-h-[74px] px-9 rounded-b-[20px] lg:rounded-bl-none lg:rounded-r-[20px] bg-[#0d2c5c] text-white text-[12.5px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-[#1a3f7a] disabled:opacity-60"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Verifică
            </button>
          </motion.form>
        </div>
      </section>

      {/* ── LISTĂ CAMERE ── */}
      <section ref={listRef} className="scroll-mt-24 py-16 md:py-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--gold)] mb-3">
                {searched ? "Rezultatele căutării" : "Alege-ți spațiul"}
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.1] text-[#0d2c5c]">
                {searched ? (
                  <>Libere pentru <em className="italic">datele tale</em></>
                ) : (
                  <>Toate <em className="italic">camerele</em></>
                )}
              </h2>
              {searched && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f4f7fb] px-4 py-2 text-[12.5px] font-semibold text-[#0d2c5c]">
                    {dayLabel(searched.in)} — {dayLabel(searched.out)} · {nights} {nights === 1 ? "noapte" : "nopți"} · {searched.guests} oaspeți
                  </span>
                  <button type="button" onClick={clearSearch} className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] px-3.5 py-2 text-[12px] font-semibold text-[#5a6b85] hover:border-[#0d2c5c] hover:text-[#0d2c5c]">
                    <X size={13} /> Arată toate camerele
                  </button>
                </div>
              )}
            </div>
            {!loading && !error && categories.length > 2 && (
              <div className="flex gap-2.5 flex-wrap">
                {categories.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 rounded-full border text-[12px] font-bold uppercase tracking-wider transition-colors ${
                      activeTab === tab
                        ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                        : "bg-white border-[#e1e8f0] text-[#3d4f6b] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error ? (
            <div className="py-20 text-center">
              <ImageOff size={32} className="mx-auto mb-4 text-[#8595aa]" />
              <p className="text-[16px] font-semibold text-[#0d2c5c]">Nu am putut încărca camerele</p>
              <p className="text-[14px] text-[#8595aa]">{error}</p>
            </div>
          ) : loading || searching ? (
            <div className="flex flex-col gap-10">
              {Array.from({ length: 2 }).map((_, i) => <RoomSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] border border-[#e1e8f0] bg-[#f8fafd] p-12 md:p-16 text-center max-w-2xl mx-auto">
              <CalendarX size={34} strokeWidth={1.5} className="mx-auto mb-5 text-[#8595aa]" />
              <p className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] mb-3">Nicio cameră liberă</p>
              <p className="text-[15px] text-[#5a6b85] font-light">Încearcă alte date sau alt număr de oaspeți.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10 md:gap-14">
              <AnimatePresence mode="popLayout">
                {filtered.map((room, idx) => {
                  const total = searched ? (room.total ?? room.price * nights) : null;
                  return (
                    <motion.article
                      key={room.id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="grid grid-cols-1 lg:grid-cols-2 rounded-[24px] overflow-hidden border border-[#e1e8f0] bg-white shadow-[0_24px_60px_-35px_rgba(13,44,92,0.25)]"
                    >
                      <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                        <RoomGallery images={room.images} alt={room.title} badge={room.badge} />
                      </div>

                      <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                        <p className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-3">
                          {String(idx + 1).padStart(2, "0")} · {room.category}
                        </p>
                        <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(1.9rem,2.8vw,2.7rem)] font-normal leading-[1.1] text-[#0d2c5c] mb-4">
                          {room.title}
                        </h3>
                        {room.description && (
                          <p className="font-sans text-[15px] leading-[1.8] font-light text-[#3d4f6b] mb-7 line-clamp-4">
                            {room.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 text-[13px] font-semibold text-[#0d2c5c]">
                          <span className="inline-flex items-center gap-2"><Users size={16} strokeWidth={1.6} /> max {room.guests} oaspeți</span>
                          <span className="inline-flex items-center gap-2"><Maximize size={16} strokeWidth={1.6} /> {room.size}</span>
                        </div>

                        {room.amenities.length > 0 && (
                          <ul className="flex flex-wrap gap-2 mb-8">
                            {room.amenities.slice(0, 6).map((a) => {
                              const Icon = amenityIcon(a);
                              return (
                                <li key={a} className="flex items-center gap-2 rounded-full bg-[#f4f7fb] px-3.5 py-1.5 text-[12.5px] font-medium text-[#0d2c5c]">
                                  <Icon size={13} strokeWidth={1.8} /> {a}
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        <div className="mt-auto flex items-end justify-between gap-5 pt-7 border-t border-[#e1e8f0] flex-wrap">
                          <div>
                            <span className="block font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-[#8595aa] mb-1.5">
                              {total != null ? `Total ${nights} ${nights === 1 ? "noapte" : "nopți"}` : "Tarif de la"}
                            </span>
                            <span className="font-sans text-[28px] font-bold leading-none tracking-[-0.02em] text-[#0d2c5c]">
                              {total != null ? ron(total) : `${room.price} lei`}
                            </span>
                            <span className="ml-1.5 text-[12px] font-medium text-[#8595aa]">
                              {total != null ? `(${ron(room.price)}/noapte)` : "/ noapte"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/camere/${room.id}${bookingQuery}`}
                              className="inline-flex items-center rounded-full border border-[#0d2c5c]/20 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] transition-colors hover:border-[#0d2c5c]"
                            >
                              Detalii
                            </Link>
                            {searched ? (
                              <Link
                                to={`/camere/${room.id}${bookingQuery}`}
                                className="group inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#1a3f7a]"
                              >
                                Rezervă <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                  toast("Alege datele ca să vezi disponibilitatea.", "info");
                                }}
                                className="group inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#1a3f7a]"
                              >
                                Rezervă <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
