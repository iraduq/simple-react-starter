import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Maximize,
  BedDouble,
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

// 🌟 Am adăugat tipul corect pentru facilities care vin din backend
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
  bed_type_id?: number | string | null;
  is_active?: boolean | null;
  images?: RoomImage[];
  units?: unknown[];
  facilities?: { id: number | string; name: string; icon?: string }[] | null; // <-- AICI
  category?: string | null;
  badge?: string | null;
  rating?: number | null;
  reviews?: number | null;
  bed?: string | null;
  amenities?: string[] | null; // Păstrat ca rezervă
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
  bed: string;
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

  // 🌟 Aici tragem facilitățile REALE din baza de date, nu pe cele hardcodate
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
    bed: r.bed || "Pat King",
    badge: r.badge || undefined,
    description: r.description || "",
    amenities: finalAmenities, // 🌟 Pasăm facilitățile corecte
    images: imgs.length > 0 ? imgs : [FALLBACK_IMG],
  };
}

// 🌟 Am adăugat mai multe cuvinte cheie pentru a potrivi corect iconițele
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

  return Coffee; // Fallback elegant (folosit pt Minibar, Mic dejun, etc)
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
    <div className="group/gal relative h-[300px] md:h-full min-h-[340px] overflow-hidden">
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${alt} – imaginea ${i + 1}`}
            loading="lazy"
            className="w-full h-full object-cover shrink-0 transition-transform duration-[1400ms] ease-out group-hover/gal:scale-[1.04]"
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d2c5c]/60 to-transparent" />

      <button
        type="button"
        aria-label="Imaginea anterioară"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/40 bg-[#0d2c5c]/30 backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] hover:scale-110 opacity-0 group-hover/gal:opacity-100"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Imaginea următoare"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/40 bg-[#0d2c5c]/30 backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] hover:scale-110 opacity-0 group-hover/gal:opacity-100"
      >
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Mergi la imaginea ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              i === index
                ? "w-7 bg-[#c69a3f]"
                : "w-3 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {badge && (
        <span className="absolute top-4 left-4 bg-[#c69a3f] text-[#0d2c5c] text-[10.5px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-full shadow-[0_6px_16px_-6px_rgba(198,154,63,0.7)] animate-[pulse_3s_ease-in-out_infinite]">
          {badge}
        </span>
      )}

      <span className="absolute top-4 right-4 text-[10.5px] font-bold tracking-[0.14em] uppercase text-white/90 bg-[#0d2c5c]/45 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}

function RoomSkeleton() {
  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-[#e1e8f0] bg-white">
      <div className="h-[300px] md:min-h-[340px] bg-[#f4f7fb] animate-pulse" />
      <div className="flex flex-col justify-center p-7 md:p-12 gap-4">
        <div className="h-3 w-24 rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-7 w-3/4 rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-[#eef2f7] animate-pulse" />
        <div className="h-16 w-full rounded bg-[#eef2f7] animate-pulse" />
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
    <div className="text-[#1a1a1a] bg-white relative">
      {/* Linie subtilă sus */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--border-light)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[var(--gold)]" />

      {/* ── HEADER ── */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pt-24 md:pt-36 pb-10 md:pb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--gold)] mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[var(--gold)]/60" />
            Cazare · Vila Casa Esy
            <span className="w-8 h-px bg-[var(--gold)]/60" />
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4.2rem)] font-normal text-[var(--text-primary)] leading-[1.1] tracking-[-0.01em] mb-6">
            Camerele noastre,{" "}
            <em className="italic text-[var(--gold)]">gândite pentru odihnă</em>
          </h1>
          <p className="max-w-[620px] mx-auto text-[15px] text-[var(--text-secondary)] leading-[1.8] font-light">
            De la camere luminoase cu vedere la grădină, până la suite cu terasă
            privată. Fiecare spațiu are propria poveste și este pregătit să
            devină refugiul tău.
          </p>
        </motion.div>
      </section>

      {/* ── LISTĂ CAMERE ── */}
      <section className="relative bg-white py-[60px] md:py-[90px] px-5 md:px-10 overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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
              <div className="flex gap-2 flex-wrap">
                {categories.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-full border text-[12.5px] font-semibold transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-[0_8px_20px_-10px_rgba(13,44,92,0.6)]"
                        : "border-[#e1e8f0] text-[#3c4043] hover:border-[#0d2c5c] hover:text-[#0d2c5c] hover:bg-[#f0f5fc] hover:-translate-y-0.5"
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
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
                <ImageOff size={26} />
              </span>
              <p className="text-[15px] font-semibold text-[#0d2c5c] mb-1">
                Nu am putut încărca camerele
              </p>
              <p className="text-[13px] text-[#8595aa]">{error}</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col gap-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <RoomSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f7fb] text-[#8595aa] mb-4">
                <ImageOff size={26} />
              </span>
              <p className="text-[15px] font-semibold text-[#0d2c5c]">
                Nicio cameră disponibilă momentan
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {filtered.map((room, idx) => (
                <motion.article
                  key={room.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="group grid grid-cols-1 lg:grid-cols-2 rounded-[26px] overflow-hidden border border-[#e6ecf4] bg-white shadow-[0_2px_6px_rgba(13,44,92,0.04),0_24px_60px_-30px_rgba(13,44,92,0.28)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c69a3f]/45 hover:shadow-[0_2px_8px_rgba(13,44,92,0.08),0_40px_90px_-32px_rgba(13,44,92,0.4)]"
                >
                  <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                    <RoomGallery
                      images={room.images}
                      alt={room.title}
                      badge={room.badge}
                    />
                  </div>

                  <div className="flex flex-col justify-center p-7 md:p-12">
                    <div className="flex items-center justify-between mb-4 gap-4">
                      <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f]">
                        {room.category}
                      </p>
                      {room.rating > 0 && (
                        <div className="flex items-center gap-1 text-[12.5px] font-semibold">
                          <Star size={13} fill="#c69a3f" color="#c69a3f" />
                          {room.rating.toFixed(1)}
                          {room.reviews > 0 && (
                            <span className="font-normal text-[#8595aa]">
                              ({room.reviews})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(1.7rem,2.4vw,2.3rem)] font-normal leading-[1.2] mb-2 transition-colors duration-300 group-hover:text-[#0d2c5c]">
                      {room.title}
                    </h3>
                    {room.subtitle && (
                      <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8595aa] mb-5">
                        {room.subtitle}
                      </p>
                    )}

                    {room.description && (
                      <p className="font-sans text-[15px] leading-[1.75] font-light text-[#3d4f6b] mb-7">
                        {room.description}
                      </p>
                    )}

                    <div className="flex items-stretch mb-7 rounded-xl border border-[#e1e8f0] bg-[#f9fafc] overflow-hidden">
                      {[
                        {
                          Icon: Users,
                          label: room.guests
                            ? `max ${room.guests} oaspeți`
                            : "—",
                        },
                        { Icon: Maximize, label: room.size },
                        { Icon: BedDouble, label: room.bed },
                      ].map(({ Icon, label }, i) => (
                        <div
                          key={label}
                          className={`flex flex-1 items-center justify-center gap-2 py-4 px-2 ${
                            i > 0 ? "border-l border-[#e1e8f0]" : ""
                          }`}
                        >
                          <Icon
                            size={15}
                            strokeWidth={1.5}
                            className="text-[#c69a3f] shrink-0"
                          />
                          <span className="font-sans text-[11px] font-semibold tracking-[0.06em] uppercase text-[#3d4f6b] leading-tight text-center">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {room.amenities.length > 0 && (
                      <ul className="flex flex-wrap gap-2 mb-8">
                        {room.amenities.map((a) => {
                          const Icon = amenityIcon(a);
                          return (
                            <li
                              key={a}
                              className="flex items-center gap-2 font-sans text-[12.5px] font-light text-[#3d4f6b] rounded-full border border-[#e1e8f0] bg-[#f9fafc] px-3.5 py-1.5 transition-all duration-200 hover:border-[#c69a3f]/50 hover:bg-white hover:-translate-y-0.5"
                            >
                              <Icon
                                size={13}
                                strokeWidth={1.6}
                                className="text-[#c69a3f] shrink-0"
                              />
                              {a}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="flex items-center justify-between gap-6 pt-6 border-t border-[#e1e8f0] flex-wrap">
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] font-bold tracking-[0.18em] uppercase text-[#8595aa] mb-1.5">
                          Tarif de la
                        </span>
                        <span className="flex items-baseline gap-1.5">
                          <span className="font-sans text-[26px] font-bold leading-none tracking-[-0.02em] text-[#0d2c5c]">
                            {room.price}
                          </span>
                          <span className="font-sans text-[12px] font-semibold tracking-[0.08em] uppercase text-[#0d2c5c]">
                            lei
                          </span>
                          <span className="font-sans text-[12px] font-light text-[#8595aa]">
                            / noapte
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to={`/camere/${room.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#0d2c5c]/15 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] transition-all duration-200 hover:border-[#0d2c5c] hover:bg-[#f0f5fc] hover:-translate-y-0.5"
                        >
                          Detalii
                        </Link>
                        <Link
                          to="/disponibilitate"
                          className="group/cta inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] shadow-[0_10px_24px_-12px_rgba(198,154,63,0.9)] transition-all duration-200 hover:from-[#0d2c5c] hover:to-[#12386f] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgba(13,44,92,0.5)]"
                        >
                          Verifică disponibilitatea
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-200 group-hover/cta:translate-x-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
