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
  X,
  CalendarX,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { searchAvailability } from "../services/roomsService";
import { httpErrorMessage } from "../services/apiClient";
import { useToast } from "../components/Toast";
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

const REVEAL_DELAY = 1200;

function RoomGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const mainImg = images[activeIdx] || FALLBACK_IMG;
  const sideImages = images.filter((_, idx) => idx !== activeIdx).slice(0, 2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 lg:p-4 bg-[#f8fafd] h-full items-center">
      {/* ── IMAGINEA PRINCIPALĂ (Stânga / Mare) ── */}
      <div className="lg:col-span-8 relative h-[280px] sm:h-[340px] lg:h-[420px] rounded-[20px] overflow-hidden group shadow-md bg-[#0d2c5c]">
        <img
          src={mainImg}
          alt={`${alt} – principală`}
          loading="lazy"
          onError={(e) =>
            ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)
          }
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {badge && (
          <span className="absolute top-4 left-4 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0d2c5c] shadow-lg z-10">
            {badge}
          </span>
        )}

        {images.length > 1 && (
          <span className="absolute bottom-4 right-4 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white tracking-wider">
            {activeIdx + 1} / {images.length}
          </span>
        )}
      </div>

      {/* ── IMAGINILE SECUNDARE (Dreapta / Grid mic bento) ── */}
      {images.length > 1 && (
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 h-full">
          {images.slice(1, 3).map((src, idx) => {
            const actualIndex = idx + 1;
            const isActive = activeIdx === actualIndex;
            return (
              <div
                key={src + idx}
                onClick={() => setActiveIdx(actualIndex)}
                className={`relative h-[130px] sm:h-[160px] lg:h-[202px] rounded-[16px] overflow-hidden cursor-pointer group shadow-sm transition-all duration-300 ${
                  isActive
                    ? "ring-2 ring-[#c69a3f] scale-[0.98]"
                    : "opacity-85 hover:opacity-100 hover:scale-[1.02]"
                }`}
              >
                <img
                  src={src}
                  alt={`${alt} – miniatură ${actualIndex + 1}`}
                  loading="lazy"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)
                  }
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                {/* Dacă sunt mai mult de 3 imagini, punem un indicator pe ultima miniatură */}
                {idx === 1 && images.length > 3 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIdx(0); // Sau poți deschide un modal dacă vrei
                    }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-sm tracking-wider"
                  >
                    +{images.length - 3} altele
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  const checkIn = params.get("check_in") ?? "";
  const checkOut = params.get("check_out") ?? "";
  const adults = Number(params.get("adults")) || 2;
  const children = Number(params.get("children")) || 0;

  const [revealed, setRevealed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [allRooms, setAllRooms] = useState<DisplayRoom[]>([]);
  const [results, setResults] = useState<DisplayRoom[] | null>(null);
  const [searched, setSearched] = useState<{
    in: string;
    out: string;
    guests: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Toate");

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), REVEAL_DELAY);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<unknown>("/rooms");
        const arr = Array.isArray(data)
          ? (data as ApiRoom[])
          : ((data as { items?: ApiRoom[] })?.items ?? []);
        if (active)
          setAllRooms(arr.filter((r) => r.is_active !== false).map(mapRoom));
      } catch (e) {
        if (active)
          setError(
            e instanceof Error ? e.message : "Nu am putut încărca camerele.",
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const runSearch = async (ci: string, co: string, ad: number, ch: number) => {
    if (!ci || !co) return;
    setSearching(true);
    try {
      const res = await searchAvailability({
        check_in: ci,
        check_out: co,
        adults: ad,
        children: ch,
        sort_by: "price",
      });
      const mapped = (res as AvailableRoom[]).map((r) => {
        const base = allRooms.find((a) => String(a.id) === String(r.id));
        const m = mapRoom(r as ApiRoom);
        return base
          ? { ...base, price: m.price || base.price, total: m.total }
          : m;
      });
      setResults(mapped);
      setSearched({ in: ci, out: co, guests: ad + ch });
      setActiveTab("Toate");
    } catch (err) {
      toast(httpErrorMessage(err, "Căutarea a eșuat."), "error");
    } finally {
      setSearching(false);
    }
  };

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
    setParams({}, { replace: true });
  };

  const nights = searched ? nightsBetween(searched.in, searched.out).length : 0;
  const source = results ?? allRooms;
  const categories = [
    "Toate",
    ...Array.from(new Set(source.map((r) => r.category))),
  ];
  const filtered =
    activeTab === "Toate"
      ? source
      : source.filter((r) => r.category === activeTab);
  const bookingQuery = searched
    ? `?check_in=${searched.in}&check_out=${searched.out}&adults=${adults}&children=${children}`
    : "";

  const emerge = {
    hidden: { opacity: 0, scale: 0.55, y: 30, filter: "blur(18px)" },
    visible: (custom: number = 0) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: custom,
      },
    }),
  };

  return (
    <div className="bg-white text-[#1a1a1a]">
      {/* ── HERO 1:1 STILUL PRIMEI PAGINI (FĂRĂ CĂUTARE ÎNCĂRCATĂ) ── */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-28 sm:pt-36 md:pt-48 pb-28 md:pb-40">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/hero-poster.jpg"
            className="h-full w-full object-cover saturate-50 contrast-110 brightness-100"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />
          <div className="absolute inset-0 bg-[#0b2146]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/40 to-[#0d2c5c]/95" />
        </div>

        {/* Ornamente aurii/albastre ambientale */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#c69a3f]/10 blur-[100px] z-[1]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-40 -right-32 w-[520px] h-[520px] rounded-full bg-[#1e4d8c]/30 blur-[100px] z-[1]"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-10 text-center [perspective:1200px]">
          <motion.p
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0}
            className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--gold)] mb-3 sm:mb-4 flex items-center justify-center gap-3"
          >
            <span className="w-6 sm:w-8 h-px bg-[var(--gold)]/60" />
            Cazare · Vila Casa Esy
            <span className="w-6 sm:w-8 h-px bg-[var(--gold)]/60" />
          </motion.p>

          <motion.h1
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.15}
            className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5.5vw,5.2rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-4 sm:mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]"
          >
            Camerele noastre, <br className="hidden md:block" />
            <em className="italic text-[var(--gold)]">gândite pentru odihnă</em>
          </motion.h1>

          <motion.span
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.3}
            className="my-3 hidden sm:flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <span className="h-px w-14 bg-[var(--gold)]/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[var(--gold)]" />
            <span className="h-px w-14 bg-[var(--gold)]/50" />
          </motion.span>

          <motion.p
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.4}
            className="max-w-[620px] mx-auto text-[14px] sm:text-[17px] text-white/90 leading-[1.6] sm:leading-[1.85] font-light"
          >
            De la camere luminoase cu vedere la grădină, până la suite cu terasă
            privată. Răsfoiește opțiunile noastre și alege refugiul perfect
            pentru sejurul tău.
          </motion.p>
        </div>

        {/* ── TRANZIȚIE VAL FLUID (WAVE) JOS, EXACT CA PE MAIN ── */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[50px] md:h-[80px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </section>

      {/* ── LISTĂ CAMERE ── */}
      <section
        ref={listRef}
        className="scroll-mt-24 py-16 md:py-24 px-5 md:px-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3">
                {searched ? "Rezultatele căutării" : "Alege-ți spațiul"}
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,4vw,3.2rem)] font-normal leading-[1.1] text-[#0d2c5c]">
                {searched ? (
                  <>
                    Libere pentru{" "}
                    <em className="italic text-[#c69a3f]">datele tale</em>
                  </>
                ) : (
                  <>
                    Toate <em className="italic text-[#c69a3f]">camerele</em>
                  </>
                )}
              </h2>
              {searched && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f4f7fb] px-4 py-2 text-[12.5px] font-semibold text-[#0d2c5c]">
                    {dayLabel(searched.in)} — {dayLabel(searched.out)} ·{" "}
                    {nights} {nights === 1 ? "noapte" : "nopți"} ·{" "}
                    {searched.guests} oaspeți
                  </span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e1e8f0] px-3.5 py-2 text-[12px] font-semibold text-[#5a6b85] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
                  >
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
                        : "bg-white border-[#e1e8f0] text-[#3d4f6b] hover:border-[#c69a3f] hover:text-[#c69a3f]"
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
              <p className="text-[16px] font-semibold text-[#0d2c5c]">
                Nu am putut încărca camerele
              </p>
              <p className="text-[14px] text-[#8595aa]">{error}</p>
            </div>
          ) : loading || searching ? (
            <div className="flex flex-col gap-10">
              {Array.from({ length: 2 }).map((_, i) => (
                <RoomSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] border border-[#e1e8f0] bg-[#f8fafd] p-12 md:p-16 text-center max-w-2xl mx-auto">
              <CalendarX
                size={34}
                strokeWidth={1.5}
                className="mx-auto mb-5 text-[#8595aa]"
              />
              <p className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] mb-3">
                Nicio cameră liberă
              </p>
              <p className="text-[15px] text-[#5a6b85] font-light">
                Încearcă alte date sau alt număr de oaspeți.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10 md:gap-14">
              <AnimatePresence mode="popLayout">
                {filtered.map((room, idx) => {
                  const total = searched
                    ? (room.total ?? room.price * nights)
                    : null;
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
                        <RoomGallery
                          images={room.images}
                          alt={room.title}
                          badge={room.badge}
                        />
                      </div>

                      <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                        <p className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-3">
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
                          <span className="inline-flex items-center gap-2">
                            <Users size={16} strokeWidth={1.6} /> max{" "}
                            {room.guests} oaspeți
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Maximize size={16} strokeWidth={1.6} /> {room.size}
                          </span>
                        </div>

                        {room.amenities.length > 0 && (
                          <ul className="flex flex-wrap gap-2 mb-8">
                            {room.amenities.slice(0, 6).map((a) => {
                              const Icon = amenityIcon(a);
                              return (
                                <li
                                  key={a}
                                  className="flex items-center gap-2 rounded-full bg-[#f4f7fb] px-3.5 py-1.5 text-[12.5px] font-medium text-[#0d2c5c]"
                                >
                                  <Icon
                                    size={13}
                                    strokeWidth={1.8}
                                    className="text-[#c69a3f]"
                                  />{" "}
                                  {a}
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        <div className="mt-auto flex items-end justify-between gap-5 pt-7 border-t border-[#e1e8f0] flex-wrap">
                          <div>
                            <span className="block font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-[#8595aa] mb-1.5">
                              {total != null
                                ? `Total ${nights} ${nights === 1 ? "noapte" : "nopți"}`
                                : "Tarif de la"}
                            </span>
                            <span className="font-sans text-[28px] font-bold leading-none tracking-[-0.02em] text-[#0d2c5c]">
                              {total != null ? ron(total) : `${room.price} lei`}
                            </span>
                            <span className="ml-1.5 text-[12px] font-medium text-[#8595aa]">
                              {total != null
                                ? `(${ron(room.price)}/noapte)`
                                : "/ noapte"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/camere/${room.id}${bookingQuery}`}
                              className="inline-flex items-center rounded-full border border-[#0d2c5c]/25 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] transition-colors hover:border-[#c69a3f] hover:text-[#c69a3f]"
                            >
                              Detalii
                            </Link>
                            <Link
                              to={`/camere/${room.id}${bookingQuery}`}
                              className="group inline-flex items-center gap-2 rounded-full bg-[#c69a3f] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#b58933]"
                            >
                              Rezervă{" "}
                              <ArrowRight
                                size={15}
                                className="transition-transform group-hover:translate-x-1"
                              />
                            </Link>
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
