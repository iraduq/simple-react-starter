import { useEffect, useState } from "react";
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
  Star,
  ImageOff,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

type RoomImage = { id: number | string; url?: string; image_url?: string };

type ApiRoom = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  base_price?: number | null;
  capacity?: number | null;
  size_sqm?: number | null;
  room_type_id?: number | string | null;
  is_active?: boolean | null;
  images?: RoomImage[];
  units?: unknown[];
  facilities?: { id: number | string; name: string; icon?: string }[] | null;
  category?: string | null;
  badge?: string | null;
  rating?: number | null;
  reviews?: number | null;
  amenities?: string[] | null;
  max_guests_adults?: number;
  max_guests_children?: number;
};

type DisplayRoom = {
  id: number | string;
  category: string;
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  reviews: number;
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
  const totalGuests = (r.max_guests_adults || 2) + (r.max_guests_children || 0);

  let finalAmenities: string[] = ["WiFi", "Aer condiționat", "Baie privată"];
  if (r.facilities && r.facilities.length > 0) {
    finalAmenities = r.facilities.map((f) => f.name);
  } else if (r.amenities && r.amenities.length > 0) {
    finalAmenities = r.amenities;
  }

  return {
    id: r.id,
    category: r.category || "Cameră",
    title: r.name || r.title || "Cameră",
    subtitle: [
      `${r.max_guests_adults || 2} ${(r.max_guests_adults || 2) === 1 ? "adult" : "adulți"}`,
      (r.max_guests_children || 0) > 0
        ? `${r.max_guests_children} ${r.max_guests_children === 1 ? "copil" : "copii"}`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
    price: Number(r.base_price || 0),
    rating: Number(r.rating || 5.0),
    reviews: Number(r.reviews || 12),
    guests: totalGuests,
    size: r.size_sqm ? `${r.size_sqm} m²` : "30 m²",
    badge: r.badge || undefined,
    description: r.description || "",
    amenities: finalAmenities,
    images: imgs.length > 0 ? imgs : [FALLBACK_IMG],
  };
}

const amenityIcon = (label: string) => {
  const l = label.toLowerCase();
  if (
    l.includes("mare") ||
    l.includes("grădin") ||
    l.includes("teras") ||
    l.includes("piscin")
  )
    return Waves;
  if (l.includes("wi-fi") || l.includes("wifi") || l.includes("internet"))
    return Wifi;
  if (
    l.includes("baie") ||
    l.includes("duș") ||
    l.includes("jacuzzi") ||
    l.includes("băi") ||
    l.includes("toalet")
  )
    return Bath;

  return Coffee;
};

function RoomGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string;
}) {
  const [index, setIndex] = useState(0);
  const go = (dir: number) =>
    setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div className="group/gal relative h-[300px] md:h-full min-h-[340px] overflow-hidden bg-[#0d2c5c]">
      <div
        className="flex h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div
            key={src + i}
            className="w-full h-full shrink-0 relative overflow-hidden"
          >
            <motion.img
              src={src}
              alt={`${alt} – imaginea ${i + 1}`}
              loading="lazy"
              animate={
                i === index ? { scale: [1.02, 1.08, 1.02] } : { scale: 1 }
              }
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover/gal:scale-110"
            />
            <div className="absolute inset-0 bg-[#0d2c5c]/10 mix-blend-overlay" />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050b16]/70 via-[#0d2c5c]/20 to-transparent" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ x: "-150%" }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        />
      </div>

      <button
        type="button"
        aria-label="Imaginea anterioară"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/30 bg-black/20 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] hover:scale-110 opacity-0 group-hover/gal:opacity-100"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Imaginea următoare"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/30 bg-black/20 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] hover:scale-110 opacity-0 group-hover/gal:opacity-100"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Mergi la imaginea ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-[3px] rounded-full transition-all duration-500 ${
              i === index
                ? "w-8 bg-[#c69a3f] shadow-[0_0_8px_rgba(198,154,63,0.8)]"
                : "w-3 bg-white/40 hover:bg-white/90"
            }`}
          />
        ))}
      </div>

      {badge && (
        <span className="absolute top-5 left-5 bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#0d2c5c] text-[10.5px] font-bold tracking-[0.15em] uppercase px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-[#fdfcf9]/30">
          {badge}
        </span>
      )}
    </div>
  );
}

function RoomSkeleton() {
  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 rounded-[26px] overflow-hidden border border-[#e1e8f0] bg-white shadow-sm">
      <div className="h-[300px] md:min-h-[340px] bg-[#f4f7fb] animate-pulse" />
      <div className="flex flex-col justify-center p-7 md:p-12 gap-5">
        <div className="h-3 w-24 rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-8 w-3/4 rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-20 w-full rounded bg-[#eef2f7] animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 rounded-xl bg-[#eef2f7] animate-pulse" />
          <div className="h-16 rounded-xl bg-[#eef2f7] animate-pulse" />
          <div className="h-16 rounded-xl bg-[#eef2f7] animate-pulse" />
        </div>
      </div>
    </article>
  );
}

export default function Rooms() {
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Toate");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<unknown>("/rooms");
        const arr = Array.isArray(data)
          ? (data as ApiRoom[])
          : data &&
              typeof data === "object" &&
              Array.isArray((data as Record<string, unknown>).items)
            ? ((data as Record<string, unknown>).items as ApiRoom[])
            : [];
        if (!active) return;
        setRooms(arr.filter((r) => r.is_active !== false).map(mapRoom));
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setError(
          e instanceof Error ? e.message : "Nu am putut încărca camerele.",
        );
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = [
    "Toate",
    ...Array.from(new Set(rooms.map((r) => r.category))),
  ];
  const filtered =
    activeTab === "Toate"
      ? rooms
      : rooms.filter((r) => r.category === activeTab);

  return (
    <div className="text-[#1a1a1a] bg-[#f8fafd] relative overflow-hidden">
      {/* ── HEADER "ALIVE" (DARK NAVY) ── */}
      <section className="relative z-20 bg-[#0d2c5c] px-5 md:px-10 pt-32 md:pt-44 pb-24 md:pb-36 text-center overflow-hidden">
        {/* Glow Effects animate */}
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

        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0_200deg,#c69a3f_360deg)] rounded-full blur-[80px] pointer-events-none"
        />

        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c69a3f]/25 to-transparent pointer-events-none"
        />

        {/* Particule fine plutitoare */}
        {[...Array(12)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white pointer-events-none"
            style={{ left: `${5 + i * 8}%`, top: `${15 + (i % 4) * 20}%` }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.1, Math.random() * 0.5 + 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative z-10"
        >
          <p className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-5 flex items-center justify-center gap-4">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#c69a3f]/80" />
            Cazare · Vila Casa Esy
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#c69a3f]/80" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4.5rem)] font-normal text-white leading-[1.1] tracking-[-0.01em] mb-7 relative inline-block">
            Camerele noastre,{" "}
            <span className="relative inline-block">
              <em className="italic text-[#c69a3f] relative z-10">
                gândite pentru odihnă
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

          <p className="max-w-[640px] mx-auto text-[16px] text-white/80 leading-[1.85] font-light">
            De la camere luminoase cu vedere la grădină, până la suite cu terasă
            privată. Fiecare spațiu are propria poveste și este pregătit să
            devină refugiul tău.
          </p>
        </motion.div>

        {/* ── TRANZIȚIE JOS: Val fluid ── */}
        <div className="absolute bottom-[-1px] left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[50px] md:h-[90px]"
          >
            <path
              d="M0,120 C200,80 400,20 600,60 C800,100 1000,40 1200,80 L1200,120 L0,120 Z"
              className="fill-[#f8fafd]"
            />
          </svg>
        </div>
      </section>

      {/* ── AMBIENT BACKGROUND ORBS ── */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#c69a3f]/5 rounded-full blur-[100px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[-10%] w-[800px] h-[800px] bg-[#0d2c5c]/5 rounded-full blur-[120px] pointer-events-none z-0"
      />

      {/* ── LISTĂ CAMERE ── */}
      <section className="relative z-10 py-[60px] md:py-[100px] px-5 md:px-10">
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
                Alege-ți spațiul
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.15] text-[#0d2c5c]">
                Disponibile acum
              </h2>
              <span
                className="mt-4 flex items-center gap-2.5"
                aria-hidden="true"
              >
                <span className="h-px w-10 bg-[#c69a3f]/50" />
                <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
                <span className="h-px w-16 bg-[#c69a3f]/25" />
              </span>
            </div>
            {!loading && !error && categories.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {categories.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-full border text-[12px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-[0_8px_20px_-10px_rgba(13,44,92,0.6)]"
                        : "bg-white border-[#e1e8f0] text-[#3d4f6b] hover:border-[#c69a3f] hover:text-[#0d2c5c] hover:bg-[#c69a3f]/5 hover:-translate-y-0.5 shadow-sm hover:shadow"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-5 shadow-sm border border-red-100">
                <ImageOff size={28} />
              </span>
              <p className="text-[16px] font-semibold text-[#0d2c5c] mb-1">
                Nu am putut încărca camerele
              </p>
              <p className="text-[14px] text-[#8595aa]">{error}</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col gap-12">
              {Array.from({ length: 3 }).map((_, i) => (
                <RoomSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm text-[#8595aa] mb-5 border border-[#e1e8f0]">
                <ImageOff size={28} />
              </span>
              <p className="text-[16px] font-semibold text-[#0d2c5c]">
                Nicio cameră disponibilă momentan
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              <AnimatePresence mode="popLayout">
                {filtered.map((room, idx) => (
                  <motion.article
                    key={room.id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                    className="group relative grid grid-cols-1 lg:grid-cols-2 rounded-[26px] overflow-hidden border border-[#e1e8f0] bg-white shadow-[0_4px_20px_rgba(13,44,92,0.03),0_24px_60px_-30px_rgba(13,44,92,0.1)] transition-all duration-500 hover:border-[#c69a3f]/40 hover:shadow-[0_8px_30px_rgba(13,44,92,0.06),0_40px_90px_-32px_rgba(13,44,92,0.2)]"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 [box-shadow:inset_0_0_0_1.5px_rgba(198,154,63,0.3)] z-20" />

                    <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                      <RoomGallery
                        images={room.images}
                        alt={room.title}
                        badge={room.badge}
                      />
                    </div>

                    <div className="flex flex-col justify-center p-8 md:p-12 relative overflow-hidden">
                      <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        whileHover={{ x: "200%", opacity: 0.5 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f0f5fc] to-transparent pointer-events-none skew-x-12 z-0"
                      />

                      <div className="relative z-10 flex items-center justify-between mb-5 gap-4">
                        <p className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                          {room.category}
                        </p>
                        {room.rating > 0 && (
                          <div className="flex items-center gap-1.5 text-[12.5px] font-semibold bg-[#f8fafd] px-3 py-1.5 rounded-full border border-[#e1e8f0] transition-colors duration-300 group-hover:border-[#c69a3f]/40 group-hover:bg-[#c69a3f]/5">
                            <Star
                              size={13}
                              fill="#c69a3f"
                              color="#c69a3f"
                              className="animate-[pulse_4s_ease-in-out_infinite]"
                            />
                            <span className="text-[#0d2c5c]">
                              {room.rating.toFixed(1)}
                            </span>
                            {room.reviews > 0 && (
                              <span className="font-normal text-[#8595aa]">
                                ({room.reviews})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <h3 className="relative z-10 font-['Cormorant_Garamond',serif] text-[clamp(1.8rem,2.5vw,2.5rem)] font-normal leading-[1.15] mb-2 transition-colors duration-300 group-hover:text-[#0d2c5c]">
                        {room.title}
                      </h3>
                      {room.subtitle && (
                        <p className="relative z-10 font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8595aa] mb-6">
                          {room.subtitle}
                        </p>
                      )}

                      {room.description && (
                        <p className="relative z-10 font-sans text-[15px] leading-[1.8] font-light text-[#3d4f6b] mb-8">
                          {room.description}
                        </p>
                      )}

                      <div className="relative z-10 flex items-stretch mb-8 rounded-xl border border-[#e1e8f0] bg-[#f8fafd] overflow-hidden">
                        {[
                          {
                            Icon: Users,
                            label: room.guests
                              ? `max ${room.guests} oaspeți`
                              : "—",
                          },
                          { Icon: Maximize, label: room.size },
                        ].map(({ Icon, label }, i) => (
                          <div
                            key={label}
                            className={`group/icon flex flex-1 items-center justify-center gap-2.5 py-4 px-2 transition-colors duration-300 hover:bg-white ${
                              i > 0 ? "border-l border-[#e1e8f0]" : ""
                            }`}
                          >
                            <Icon
                              size={16}
                              strokeWidth={1.5}
                              className="text-[#c69a3f] shrink-0 transition-transform duration-300 group-hover/icon:scale-110 group-hover/icon:-translate-y-0.5"
                            />
                            <span className="font-sans text-[11px] font-semibold tracking-[0.08em] uppercase text-[#3d4f6b] leading-tight text-center">
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {room.amenities.length > 0 && (
                        <ul className="relative z-10 flex flex-wrap gap-2.5 mb-9">
                          {room.amenities.map((a, aIdx) => {
                            const Icon = amenityIcon(a);
                            return (
                              <motion.li
                                key={a}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                  duration: 0.4,
                                  delay: aIdx * 0.08,
                                  ease: "easeOut",
                                }}
                                className="group/tag flex items-center gap-2 font-sans text-[12.5px] font-medium text-[#0d2c5c] rounded-full border border-[#e1e8f0] bg-white px-4 py-2 transition-all duration-300 hover:border-[#c69a3f]/60 hover:bg-[#c69a3f]/5 shadow-sm hover:shadow-md"
                              >
                                <motion.span
                                  animate={{ y: [0, -2, 0] }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: aIdx * 0.2,
                                  }}
                                >
                                  <Icon
                                    size={14}
                                    strokeWidth={1.8}
                                    className="text-[#c69a3f] shrink-0 transition-transform duration-300 group-hover/tag:scale-110"
                                  />
                                </motion.span>
                                {a}
                              </motion.li>
                            );
                          })}
                        </ul>
                      )}

                      <div className="relative z-10 flex items-center justify-between gap-6 pt-7 border-t border-[#e1e8f0] flex-wrap mt-auto">
                        <div className="flex flex-col transition-transform duration-300 group-hover:translate-x-1">
                          <span className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-[#8595aa] mb-1.5">
                            Tarif de la
                          </span>
                          <span className="flex items-baseline gap-1.5">
                            <span className="font-sans text-[28px] font-bold leading-none tracking-[-0.02em] text-[#0d2c5c]">
                              {room.price}
                            </span>
                            <span className="font-sans text-[12px] font-bold tracking-[0.1em] uppercase text-[#0d2c5c]">
                              lei
                            </span>
                            <span className="font-sans text-[12px] font-medium text-[#8595aa]">
                              / noapte
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/camere/${room.id}`}
                            className="inline-flex items-center gap-2 rounded-full border border-[#0d2c5c]/20 bg-white px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] transition-all duration-300 hover:border-[#0d2c5c] hover:bg-[#f8fafd] hover:-translate-y-1 shadow-sm hover:shadow"
                          >
                            Detalii
                          </Link>
                          <Link
                            to="/disponibilitate"
                            className="group/cta relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] shadow-[0_10px_24px_-12px_rgba(198,154,63,0.9)] transition-all duration-300 hover:from-[#0d2c5c] hover:to-[#12386f] hover:text-white hover:-translate-y-1 hover:shadow-[0_14px_30px_-12px_rgba(13,44,92,0.5)] overflow-hidden"
                          >
                            <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover/cta:translate-x-full transition-transform duration-[800ms] ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                            <span className="relative">Rezervă</span>
                            <ArrowRight
                              size={16}
                              className="relative transition-transform duration-300 group-hover/cta:translate-x-1.5"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
