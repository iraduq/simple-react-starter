import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Users, Maximize, BedDouble, Save as Waves, Wifi, Coffee, Bath, Star, ImageOff } from "lucide-react";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";

type RoomImage = { id: number | string; url?: string; image_url?: string };

type ApiRoom = {
  id: number | string;
  name: string;
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
  category?: string | null;
  badge?: string | null;
  rating?: number | null;
  reviews?: number | null;
  bed?: string | null;
  amenities?: string[] | null;
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
  return {
    id: r.id,
    category: r.category || "Cameră",
    title: r.name || "Cameră",
    subtitle: r.capacity ? `${r.capacity} ${r.capacity === 1 ? "oaspete" : "oaspeți"}` : "",
    price: Number(r.base_price || 0),
    rating: Number(r.rating || 0),
    reviews: Number(r.reviews || 0),
    guests: Number(r.capacity || 0),
    size: r.size_sqm ? `${r.size_sqm} m²` : "—",
    bed: r.bed || "—",
    badge: r.badge || undefined,
    description: r.description || "",
    amenities: r.amenities || [],
    images: imgs.length > 0 ? imgs : [FALLBACK_IMG],
  };
}

const amenityIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("mare") || l.includes("grădin") || l.includes("teras")) return Waves;
  if (l.includes("wi-fi")) return Wifi;
  if (l.includes("baie") || l.includes("duș") || l.includes("jacuzzi") || l.includes("băi"))
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
            className="w-full h-full object-cover shrink-0"
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d2c5c]/60 to-transparent" />

      <button
        type="button"
        aria-label="Imaginea anterioară"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/40 bg-[#0d2c5c]/30 backdrop-blur-md text-white flex items-center justify-center transition-colors duration-200 hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c]"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Imaginea următoare"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/40 bg-[#0d2c5c]/30 backdrop-blur-md text-white flex items-center justify-center transition-colors duration-200 hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c]"
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
              i === index ? "w-7 bg-[#c69a3f]" : "w-3 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {badge && (
        <span className="absolute top-4 left-4 bg-[#c69a3f] text-[#0d2c5c] text-[10.5px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-full">
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
          : (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>).items)
            ? (data as Record<string, unknown>).items as ApiRoom[]
            : []);
        if (!active) return;
        setRooms(arr.filter((r) => r.is_active !== false).map(mapRoom));
        setLoading(false);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Nu am putut încărca camerele.");
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const categories = ["Toate", ...Array.from(new Set(rooms.map((r) => r.category)))];
  const filtered =
    activeTab === "Toate" ? rooms : rooms.filter((r) => r.category === activeTab);

  return (
    <div className="text-[#1a1a1a]">
      {/* ── HERO ── */}
      <section
        className="relative flex items-end min-h-[52vh] md:min-h-[62vh] px-5 md:px-10 pb-28 md:pb-36 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(13,44,92,0.55) 0%, rgba(13,44,92,0.9) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5 flex items-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            CAZARE · VILA CASA ESY
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5.5vw,4.4rem)] font-normal text-white leading-[1.12] mb-6 drop-shadow-md">
            Camerele noastre,
            <br />
            <em className="italic text-[#c69a3f]">gândite pentru odihnă</em>
          </h1>
          <p className="font-sans text-white/80 text-[15px] leading-[1.75] font-light max-w-xl">
            Spații de la camere luminoase cu vedere la grădină până la suite cu
            terasă privată. Fiecare cu propria poveste.
          </p>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full h-[80px] md:h-[120px] pointer-events-none z-[3] block"
          viewBox="0 0 1440 130"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
            fill="#c69a3f"
            opacity="0.35"
          />
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
            fill="#0d2c5c"
            opacity="0.5"
          />
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
            fill="#ffffff"
          />
        </svg>
      </section>

      {/* ── LISTĂ CAMERE ── */}
      <section className="bg-white py-[60px] md:py-[90px] px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
                Alege-ți spațiul
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.15]">
                Disponibile acum
              </h2>
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
                        ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                        : "border-[#e1e8f0] text-[#3c4043] hover:border-[#0d2c5c] hover:text-[#0d2c5c] hover:bg-[#e6efff]"
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
              <p className="text-[15px] font-semibold text-[#0d2c5c] mb-1">Nu am putut încărca camerele</p>
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
              <p className="text-[15px] font-semibold text-[#0d2c5c]">Nicio cameră disponibilă momentan</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {filtered.map((room, idx) => (
                <article
                  key={room.id}
                  className="group grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-[#e1e8f0] bg-white"
                >
                  <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                    <RoomGallery images={room.images} alt={room.title} badge={room.badge} />
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

                    <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(1.7rem,2.4vw,2.3rem)] font-normal leading-[1.2] mb-2">
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

                    <div className="grid grid-cols-3 gap-3 mb-7">
                      {[
                        { Icon: Users, label: room.guests ? `${room.guests} ${room.guests === 1 ? "persoană" : "persoane"}` : "—" },
                        { Icon: Maximize, label: room.size },
                        { Icon: BedDouble, label: room.bed },
                      ].map(({ Icon, label }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center text-center gap-2.5 py-4 px-2 rounded-xl bg-white border border-[#e1e8f0]"
                        >
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0d2c5c]/[0.05] border border-[#c69a3f]/30">
                            <Icon size={15} strokeWidth={1.6} className="text-[#c69a3f]" />
                          </span>
                          <span className="font-sans text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#3d4f6b] leading-tight">
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
                              className="flex items-center gap-2 font-sans text-[12.5px] font-light text-[#3d4f6b] rounded-full border border-[#e1e8f0] bg-[#f6f9fd] px-3.5 py-1.5"
                            >
                              <Icon size={13} strokeWidth={1.6} className="text-[#c69a3f] shrink-0" />
                              {a}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="flex items-center justify-between gap-6 pt-6 border-t border-[#e1e8f0] flex-wrap">
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] font-bold tracking-[0.18em] uppercase text-[#8595aa] mb-1.5">
                          De la
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

                      <a
                        href="#rezerva"
                        className="group/cta inline-flex items-center gap-[18px] text-[#0d2c5c] text-xs tracking-[0.25em] uppercase no-underline"
                      >
                        <span>Rezervă acum</span>
                        <span
                          className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#0d2c5c]/30 text-base transition-colors duration-200 group-hover/cta:bg-[#c69a3f] group-hover/cta:text-white group-hover/cta:border-[#c69a3f]"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
