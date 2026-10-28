import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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

/* ───────────────────────────────────────────────
   DECOR: SVG-uri plutitoare pe întreg fundalul paginii
─────────────────────────────────────────────── */
const float = (duration: number, amp = 25, rot = 6, delay = 0) => ({
  animate: { y: [0, -amp, 0], rotate: [0, rot, 0] },
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay,
  },
});

function SunRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.2" />
      <circle
        cx="60"
        cy="60"
        r="34"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 5"
      />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 16;
        const x1 = 60 + Math.cos(a) * 44;
        const y1 = 60 + Math.sin(a) * 44;
        const x2 = 60 + Math.cos(a) * (i % 2 ? 52 : 58);
        const y2 = 60 + Math.sin(a) * (i % 2 ? 52 : 58);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function Shell({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path
        d="M50 92 L8 44 Q50 -8 92 44 Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {[-30, -15, 0, 15, 30].map((o) => (
        <path
          key={o}
          d={`M50 92 Q${50 + o * 0.4} 50 ${50 + o * 0.7} 22`}
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M40 92 h20"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FloatingDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-[1]"
    >
      <div className="absolute top-[20%] -left-32 h-[500px] w-[500px] rounded-full bg-[#0d2c5c]/[0.02] blur-[140px]" />
      <div className="absolute top-[50%] -right-40 h-[600px] w-[600px] rounded-full bg-[#1e4d8c]/[0.03] blur-[150px]" />
      <div className="absolute top-[80%] -left-40 h-[500px] w-[500px] rounded-full bg-[#0d2c5c]/[0.02] blur-[140px]" />

      <motion.div
        {...float(12, 18, 5)}
        className="absolute top-[15%] right-[8%] opacity-15 hidden md:block"
      >
        <SunRing className="h-32 w-32 text-[#0d2c5c]" />
      </motion.div>

      <motion.div
        {...float(15, 14, -4, 1)}
        className="absolute top-[35%] left-[3%] opacity-10 hidden lg:block"
      >
        <Shell className="h-24 w-24 text-[#0d2c5c]" />
      </motion.div>

      <motion.div
        {...float(13, 16, 8, 2)}
        className="absolute top-[65%] right-[5%] opacity-12 hidden lg:block"
      >
        <Shell className="h-28 w-28 text-[#0d2c5c]" />
      </motion.div>

      <motion.div
        {...float(14, 20, -5, 1.5)}
        className="absolute top-[85%] left-[6%] opacity-15 hidden md:block"
      >
        <SunRing className="h-28 w-28 text-[#0d2c5c]" />
      </motion.div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   GALERIE FOTO MODERNĂ CU COLȚURI ASIMETRICE
─────────────────────────────────────────────── */
function RoomGallery({
  images,
  alt,
  badge,
  flip,
}: {
  images: string[];
  alt: string;
  badge?: string;
  flip?: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const mainImg = images[activeIdx] || FALLBACK_IMG;
  const thumbs = images.slice(0, 4);
  const extra = images.length - thumbs.length;

  const cornerStyle = flip
    ? "rounded-tr-[80px] rounded-bl-[80px]"
    : "rounded-tl-[80px] rounded-br-[80px]";

  return (
    <div className="relative flex flex-col gap-4">
      <div
        className={`relative h-[280px] sm:h-[320px] md:h-[390px] overflow-hidden group bg-[#0d2c5c] shadow-[0_15px_35px_-10px_rgba(13,44,92,0.15)] ${cornerStyle}`}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={mainImg}
            src={mainImg}
            alt={`${alt} – imagine ${activeIdx + 1}`}
            loading="lazy"
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)
            }
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {badge && (
          <span
            className={`absolute top-5 z-10 rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] shadow-md ${
              flip ? "left-6" : "right-6"
            }`}
          >
            {badge}
          </span>
        )}

        {images.length > 1 && (
          <span
            className={`absolute bottom-6 z-10 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold tracking-wider text-white shadow ${
              flip ? "right-6" : "left-6"
            }`}
          >
            {activeIdx + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="relative grid grid-cols-4 gap-3 px-1">
          {thumbs.map((src, idx) => {
            const isActive = activeIdx === idx;
            const isLast = idx === thumbs.length - 1 && extra > 0;
            return (
              <button
                type="button"
                key={src + idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-[68px] sm:h-[76px] rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
                  isActive
                    ? "ring-2 ring-[#0d2c5c] ring-offset-2 ring-offset-white scale-[1.02]"
                    : "opacity-70 hover:opacity-100 hover:-translate-y-0.5"
                }`}
              >
                <img
                  src={src}
                  alt={`${alt} – miniatură ${idx + 1}`}
                  loading="lazy"
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMG)
                  }
                  className="w-full h-full object-cover"
                />
                {isLast && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#0d2c5c]/75 text-[13px] font-bold text-white backdrop-blur-[2px]">
                    +{extra}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoomSkeleton() {
  return (
    <div className="rounded-[40px] overflow-hidden border border-[#e2e8f0] bg-white p-8 shadow-sm">
      <div className="h-[340px] bg-[#f1f5f9] rounded-[28px] animate-pulse mb-6" />
      <div className="h-8 w-1/2 rounded bg-[#f1f5f9] animate-pulse mb-4" />
      <div className="h-20 w-full rounded bg-[#f1f5f9] animate-pulse" />
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
    <div className="relative bg-white text-[#1a1a1a] overflow-hidden">
      {/* ── ELEMENTE PLUTITOARE PE ÎNTREGUL FUNDAL AL PAGINII ── */}
      <FloatingDecor />

      {/* ── HERO ── */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-28 sm:pt-36 md:pt-48 pb-28 md:pb-40 z-10">
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

      {/* ── LISTĂ CAMERE (FUNDAL ALB PUR) ── */}
      <section
        ref={listRef}
        className="relative scroll-mt-24 py-16 md:py-24 px-5 md:px-10 z-10 bg-transparent"
      >
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c69a3f]/60" />
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
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/9fta backdrop-blur border border-[#e2e8f0] px-4 py-2 text-[12.5px] font-semibold text-[#0d2c5c] shadow-sm">
                    {dayLabel(searched.in)} — {dayLabel(searched.out)} ·{" "}
                    {nights} {nights === 1 ? "noapte" : "nopți"} ·{" "}
                    {searched.guests} oaspeți
                  </span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] px-3.5 py-2 text-[12px] font-semibold text-[#64748b] bg-white hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
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
                    className={`px-5 py-2.5 rounded-full border text-[12px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                      activeTab === tab
                        ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                        : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
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
              <ImageOff size={32} className="mx-auto mb-4 text-[#94a3b8]" />
              <p className="text-[16px] font-semibold text-[#0d2c5c]">
                Nu am putut încărca camerele
              </p>
              <p className="text-[14px] text-[#94a3b8]">{error}</p>
            </div>
          ) : loading || searching ? (
            <div className="flex flex-col gap-10">
              {Array.from({ length: 2 }).map((_, i) => (
                <RoomSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-12 md:p-16 text-center max-w-2xl mx-auto shadow-sm">
              <CalendarX
                size={34}
                strokeWidth={1.5}
                className="mx-auto mb-5 text-[#94a3b8]"
              />
              <p className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] mb-3">
                Nicio cameră liberă
              </p>
              <p className="text-[15px] text-[#64748b] font-light">
                Încearcă alte date sau alt număr de oaspeți.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-14 md:gap-16">
              <AnimatePresence mode="popLayout">
                {filtered.map((room, idx) => {
                  const total = searched
                    ? (room.total ?? room.price * nights)
                    : null;
                  const flip = idx % 2 === 1;

                  const cardCornerStyle = flip
                    ? "rounded-[36px] rounded-tr-[90px] rounded-bl-[90px]"
                    : "rounded-[36px] rounded-tl-[90px] rounded-br-[90px]";

                  return (
                    <motion.article
                      key={room.id}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className={`relative overflow-hidden bg-white/95 backdrop-blur border border-[#e2e8f0] shadow-[0_15px_40px_-15px_rgba(13,44,92,0.08)] hover:shadow-[0_25px_60px_-15px_rgba(13,44,92,0.14)] transition-all duration-500 p-6 md:p-10 ${cardCornerStyle}`}
                    >
                      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        {/* ── GALERIE FOTO ── */}
                        <div
                          className={`relative z-10 lg:col-span-7 ${
                            flip ? "lg:order-2" : ""
                          }`}
                        >
                          <RoomGallery
                            images={room.images}
                            alt={room.title}
                            badge={room.badge}
                            flip={flip}
                          />
                        </div>

                        {/* ── DETALII CAMERĂ & PREȚ ── */}
                        <div
                          className={`relative z-10 lg:col-span-5 flex flex-col justify-between h-full ${
                            flip ? "lg:order-1" : ""
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="inline-flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                                <span className="h-px w-6 bg-[#c69a3f]/60" />
                                {room.category}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#0d2c5c] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1 rounded-full">
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </span>
                                Disponibil
                              </span>
                            </div>

                            <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,2.8vw,2.8rem)] font-normal leading-[1.1] text-[#0d2c5c] mb-4">
                              {room.title}
                            </h3>

                            {room.description && (
                              <p className="font-sans text-[14.5px] leading-[1.75] font-normal text-[#475569] mb-6 line-clamp-3">
                                {room.description}
                              </p>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0d2c5c]">
                                  <Users size={16} strokeWidth={1.8} />
                                </div>
                                <div>
                                  <span className="block text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">
                                    Capacitate
                                  </span>
                                  <span className="text-[13px] font-semibold text-[#0d2c5c]">
                                    Max {room.guests} oaspeți
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0d2c5c]">
                                  <Maximize size={16} strokeWidth={1.8} />
                                </div>
                                <div>
                                  <span className="block text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">
                                    Suprafață
                                  </span>
                                  <span className="text-[13px] font-semibold text-[#0d2c5c]">
                                    {room.size}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-8">
                                {room.amenities.slice(0, 4).map((a) => {
                                  const Icon = amenityIcon(a);
                                  return (
                                    <span
                                      key={a}
                                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-1.5 text-[12px] font-medium text-[#475569]"
                                    >
                                      <Icon
                                        size={13}
                                        strokeWidth={1.8}
                                        className="text-[#0d2c5c]"
                                      />
                                      {a}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Panou Preț & Butoane (Classic Navy, preț non-italic actualizat) */}
                          <div className="relative overflow-hidden rounded-3xl bg-[#0d2c5c] p-5 sm:p-6 shadow-[0_15px_35px_-10px_rgba(13,44,92,0.3)]">
                            <div className="relative flex items-end justify-between gap-4 flex-wrap">
                              <div>
                                <span className="block font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">
                                  {total != null
                                    ? `Total ${nights} ${
                                        nights === 1 ? "noapte" : "nopți"
                                      }`
                                    : "Tarif de la"}
                                </span>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-sans text-[24px] sm:text-[26px] font-semibold tracking-normal text-white">
                                    {total != null
                                      ? ron(total)
                                      : `${room.price} lei`}
                                  </span>
                                  <span className="text-[11px] font-light text-white/60 tracking-wider uppercase">
                                    {total != null
                                      ? `(${ron(room.price)}/noapte)`
                                      : "/ noapte"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/camere/${room.id}${bookingQuery}`}
                                  className="inline-flex items-center rounded-2xl border border-white/25 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:border-white hover:bg-white/10"
                                >
                                  Detalii
                                </Link>
                                <Link
                                  to={`/camere/${room.id}${bookingQuery}`}
                                  className="group/btn inline-flex items-center gap-2 rounded-2xl bg-[#c69a3f] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#d8ab50] shadow-md shadow-black/20"
                                >
                                  Rezervă
                                  <ArrowRight
                                    size={14}
                                    className="transition-transform group-hover/btn:translate-x-1"
                                  />
                                </Link>
                              </div>
                            </div>
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
