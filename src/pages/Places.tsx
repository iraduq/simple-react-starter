import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  X,
  ArrowRight,
  Utensils,
  Wine,
  Sparkles,
  Search,
  LayoutGrid,
  Compass,
  BedDouble,
} from "lucide-react";
import PlaceMenu from "../components/PlaceMenu";
import type { MenuCategory, Place } from "../types/places";
import {
  getFullMenu,
  listPlaces,
  menuForPlace,
  placeDescription,
  placeImage,
} from "../services/placesService";

/* ───────────────────────────────────────────────
   DECOR: SVG-uri plutitoare identice cu Rooms.tsx
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
      className="pointer-events-none absolute inset-0 overflow-hidden z-[5]"
    >
      <motion.div
        {...float(14, 28, 8, 0)}
        className="hidden md:block absolute top-[520px] right-[5%] text-[#c69a3f]/25"
      >
        <SunRing className="w-28 h-28" />
      </motion.div>
      <motion.div
        {...float(18, 22, -6, 1.5)}
        className="hidden md:block absolute top-[980px] left-[4%] text-[#0d2c5c]/15"
      >
        <Shell className="w-24 h-24" />
      </motion.div>
    </div>
  );
}

const CATEGORIES = [
  { id: "toate", label: "Toate", icon: LayoutGrid },
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "bar", label: "Bar & Lounge", icon: Wine },
  { id: "spa", label: "SPA & Wellness", icon: Sparkles },
];

const CAT_META: Record<
  string,
  { label: string; icon: typeof Utensils; fallback: string; tags: string[] }
> = {
  restaurant: {
    label: "Restaurant & Room Service",
    icon: Utensils,
    fallback:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80",
    tags: ["Fine Dining", "Room Service în Cameră", "Terasă Panoramică"],
  },
  bar: {
    label: "Bar & Lounge",
    icon: Wine,
    fallback:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&auto=format&fit=crop&q=80",
    tags: ["Cocktailuri de Autor", "Selecție de Vinuri", "Servire în Cameră"],
  },
  spa: {
    label: "SPA & Wellness",
    icon: Sparkles,
    fallback:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&auto=format&fit=crop&q=80",
    tags: ["Masaj Terapeutic", "Saună Finlandeză", "Relaxare Totală"],
  },
};

const meta = (c?: string) =>
  CAT_META[c?.toLowerCase() ?? ""] ?? CAT_META.restaurant;

export default function Places() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("toate");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState<Place | null>(null);

  const reloadPlaces = () => {
    Promise.allSettled([listPlaces(), getFullMenu()]).then(([p, m]) => {
      if (p.status === "fulfilled") {
        // Excludem locațiile strict de tip șezlong dacă există
        const cleanPlaces = (p.value || []).filter(
          (item) => !/sezlong|șezlong/i.test(item.title || ""),
        );
        setPlaces(cleanPlaces);
      }
      if (m.status === "fulfilled") setMenu(m.value);
      setLoading(false);
    });
  };

  useEffect(() => {
    reloadPlaces();
    const onLiveSync = () => reloadPlaces();
    window.addEventListener("live-places-sync", onLiveSync);
    return () => window.removeEventListener("live-places-sync", onLiveSync);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(() => {
    let list = places;
    if (category !== "toate") {
      list = list.filter((p) => p.category?.toLowerCase() === category);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          placeDescription(p).toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [places, category, searchQuery]);

  const getPlaceItemsCount = (p: Place) =>
    menuForPlace(menu, p).reduce((s, c) => s + (c.items?.length ?? 0), 0);

  return (
    <div className="relative bg-white text-[#1a1a1a] overflow-hidden min-h-screen">
      <FloatingDecor />

      {/* ── HERO IDENTIC CU ROOMS.TSX & HOME.TSX ── */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-28 sm:pt-36 md:pt-48 pb-28 md:pb-40 z-10">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
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

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-10 text-center">
          <p className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 sm:mb-4 flex items-center justify-center gap-3">
            <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
            Gastronomie & Atracții · Vila Casa Esy
            <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5.5vw,5.2rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-4 sm:mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]">
            Locațiile noastre & <br className="hidden md:block" />
            <em className="italic text-[#c69a3f]">Room Service în cameră</em>
          </h1>

          <span
            className="my-3 hidden sm:flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <span className="h-px w-14 bg-[#c69a3f]/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
            <span className="h-px w-14 bg-[#c69a3f]/50" />
          </span>

          <p className="max-w-[640px] mx-auto text-[14px] sm:text-[17px] text-white/90 leading-[1.6] sm:leading-[1.85] font-light">
            Răsfoiește locațiile și meniul digital al Vilei Casa Esy. Dacă ești cazat în prezent, poți comanda preparatele preferate direct în camera ta activă.
          </p>
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
            />
          </svg>
        </div>
      </section>

      {/* ── CONȚINUT PRINCIPAL ÎN STILUL ROOMS.TSX ── */}
      <section className="relative py-16 md:py-24 px-5 md:px-10 z-10 bg-transparent">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header + Filtre identic cu Rooms.tsx */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c69a3f]/60" />
                Experiențe & Meniu Digital
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,4vw,3.2rem)] font-normal leading-[1.1] text-[#0d2c5c]">
                Toate <em className="italic text-[#c69a3f]">locațiile</em>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {CATEGORIES.map((c) => {
                const isActive = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`px-5 py-2.5 rounded-full border text-[12px] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                      isActive
                        ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                        : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}

              <div className="relative min-w-[220px]">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Caută o locație…"
                  className="w-full rounded-full border border-[#e2e8f0] bg-white py-2.5 pl-9 pr-8 text-[12.5px] text-[#0d2c5c] placeholder:text-[#94a3b8] focus:border-[#c69a3f] focus:outline-none shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0d2c5c]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-[#c69a3f]">
              <Loader2 size={36} className="mb-4 animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0d2c5c]">
                Se încarcă locațiile Vila Casa Esy…
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-12 md:p-16 text-center max-w-2xl mx-auto shadow-sm">
              <MapPin
                size={34}
                strokeWidth={1.5}
                className="mx-auto mb-5 text-[#94a3b8]"
              />
              <p className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] mb-3">
                Nicio locație găsită
              </p>
              <p className="text-[15px] text-[#64748b] font-light">
                Încearcă un alt termen de căutare sau afișează toate categoriile.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-14 md:gap-16">
              {filtered.map((p, idx) => {
                const m = meta(p.category);
                const count = getPlaceItemsCount(p);
                const flip = idx % 2 === 1;
                const cardCornerStyle = flip
                  ? "rounded-[36px] rounded-tr-[90px] rounded-bl-[90px]"
                  : "rounded-[36px] rounded-tl-[90px] rounded-br-[90px]";
                const imgCornerStyle = flip
                  ? "rounded-[26px] rounded-tr-[72px] rounded-bl-[72px]"
                  : "rounded-[26px] rounded-tl-[72px] rounded-br-[72px]";

                return (
                  <motion.article
                    key={p.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={`relative overflow-hidden bg-white/95 backdrop-blur border border-[#e2e8f0] shadow-[0_15px_40px_-15px_rgba(13,44,92,0.08)] hover:shadow-[0_25px_60px_-15px_rgba(13,44,92,0.14)] transition-all duration-500 p-6 md:p-10 ${cardCornerStyle}`}
                  >
                    <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                      {/* Imagine în stilul RoomGallery */}
                      <div
                        className={`relative z-10 lg:col-span-7 ${
                          flip ? "lg:order-2" : ""
                        }`}
                      >
                        <div
                          onClick={() => setOpen(p)}
                          className={`group relative h-[300px] sm:h-[380px] w-full overflow-hidden bg-[#f1f5f9] cursor-pointer shadow-md ${imgCornerStyle}`}
                        >
                          <img
                            src={placeImage(p) || m.fallback}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c]/65 via-transparent to-transparent" />
                          {p.badge && (
                            <span className="absolute top-5 left-5 rounded-full bg-[#c69a3f] px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] shadow">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detalii în stilul Rooms.tsx */}
                      <div
                        className={`relative z-10 lg:col-span-5 flex flex-col justify-between h-full ${
                          flip ? "lg:order-1" : ""
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                              <span className="h-px w-6 bg-[#c69a3f]/60" />
                              {m.label}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#0d2c5c] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1 rounded-full">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                              </span>
                              {count > 0 ? `${count} preparate` : "Activ"}
                            </span>
                          </div>

                          <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,2.8vw,2.8rem)] font-normal leading-[1.1] text-[#0d2c5c] mb-4">
                            {p.title}
                          </h3>

                          <p className="font-sans text-[14.5px] leading-[1.75] font-normal text-[#475569] mb-6">
                            {placeDescription(p) ||
                              "Experimentează servicii de înaltă clasă, ingrediente proaspete și livrare direct în camera ta activă."}
                          </p>

                          {/* Stats Grid matching Rooms.tsx */}
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0d2c5c]">
                                <BedDouble size={16} strokeWidth={1.8} />
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">
                                  Room Service
                                </span>
                                <span className="text-[13px] font-semibold text-[#0d2c5c]">
                                  Livrare în Cameră
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                              <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#0d2c5c]">
                                <Compass size={16} strokeWidth={1.8} />
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">
                                  Disponibilitate
                                </span>
                                <span className="text-[13px] font-semibold text-[#0d2c5c]">
                                  Oaspeți Cazați
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {m.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#0d2c5c]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-5 border-t border-[#f1f5f9] flex items-center justify-between gap-4">
                          <div>
                            <span className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#94a3b8]">
                              Meniu Digital
                            </span>
                            <span className="font-['Cormorant_Garamond',serif] text-2xl font-semibold text-[#0d2c5c]">
                              {count > 0 ? `${count} produse disponibile` : "Vezi detalii"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setOpen(p)}
                            className="inline-flex items-center gap-2.5 rounded-full bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-6 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.16em] transition-all shadow-md cursor-pointer"
                          >
                            <span>Deschide Meniul</span>
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── MODAL MENIU ÎN STILUL SITE-ULUI ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[600] flex justify-end bg-[#07203f]/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-2xl"
            >
              <div className="relative h-60 bg-[#0d2c5c] sm:h-68 overflow-hidden">
                <img
                  src={placeImage(open) || meta(open.category).fallback}
                  alt={open.title}
                  className="h-full w-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c] via-[#0d2c5c]/40 to-transparent" />
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Închide"
                  className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#0d2c5c] cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-8 left-6 right-6 sm:left-8 sm:right-8">
                  <span className="inline-flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#e6b85c]">
                    <span className="h-px w-6 bg-[#e6b85c]" />
                    {meta(open.category).label}
                  </span>
                  <h2 className="mt-1 font-['Cormorant_Garamond',serif] text-[36px] sm:text-[42px] leading-tight text-white">
                    {open.title}
                  </h2>
                </div>
                <svg
                  viewBox="0 0 400 24"
                  preserveAspectRatio="none"
                  className="absolute bottom-0 left-0 h-5 w-full text-white"
                >
                  <path
                    d="M0 24 V12 Q50 0 100 12 T200 12 T300 12 T400 12 V24 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div className="p-6 sm:p-8">
                <p className="mb-8 text-[15px] leading-relaxed text-[#475569]">
                  {placeDescription(open)}
                </p>
                <PlaceMenu
                  categories={menuForPlace(menu, open)}
                  onOrderRedirect={() => setOpen(null)}
                />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
