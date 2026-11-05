import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  X,
  Utensils,
  Wine,
  Sparkles,
  Search,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
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

const CATEGORIES = [
  { id: "toate", label: "Toate Locațiile", icon: LayoutGrid },
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "bar", label: "Bar & Lounge", icon: Wine },
  { id: "spa", label: "SPA & Wellness", icon: Sparkles },
];

const CAT_META: Record<
  string,
  { label: string; fallback: string; tags: string[] }
> = {
  restaurant: {
    label: "Gastronomie & Room Service",
    fallback:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80",
    tags: ["Fine Dining", "Room Service în Cameră", "Terasă Panoramică"],
  },
  bar: {
    label: "Bar & Lounge",
    fallback:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&auto=format&fit=crop&q=80",
    tags: ["Cocktailuri de Autor", "Selecție de Vinuri", "Servire în Cameră"],
  },
  spa: {
    label: "SPA & Wellness",
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
  const [expandedPlaceId, setExpandedPlaceId] = useState<number | string | null>(null);

  const reloadPlaces = () => {
    Promise.allSettled([listPlaces(), getFullMenu()]).then(([p, m]) => {
      if (p.status === "fulfilled") {
        const cleanPlaces = (p.value || []).filter(
          (item) => !/sezlong|șezlong/i.test(item.title || ""),
        );
        setPlaces(cleanPlaces);
        if (cleanPlaces.length > 0 && expandedPlaceId === null) {
          setExpandedPlaceId(cleanPlaces[0].id);
        }
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
    <div className="relative bg-white text-[#1a1a1a] min-h-screen">
      {/* ── HERO ── */}
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
            Gastronomie & Experiențe · Vila Casa Esy
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
            Răsfoiește meniul digital al Vilei Casa Esy și comandă preparatele preferate direct în camera ta activă.
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

      {/* ── CONȚINUT EDITORIAL FĂRĂ CARDURI ── */}
      <section className="relative py-14 md:py-24 px-5 md:px-10 z-10">
        <div className="max-w-6xl mx-auto">
          {/* Bară de navigare cu subliniere fină (fără pastile sau casete) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#0d2c5c]/15 pb-4 mb-12">
            <div className="flex flex-wrap items-center gap-8">
              {CATEGORIES.map((c) => {
                const isActive = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`relative pb-2 text-[12px] font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                      isActive
                        ? "text-[#0d2c5c]"
                        : "text-[#64748b] hover:text-[#0d2c5c]"
                    }`}
                  >
                    {c.label}
                    {isActive && (
                      <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#c69a3f]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-64">
              <Search
                size={15}
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută în locații…"
                className="w-full border-0 border-b border-transparent focus:border-[#c69a3f] bg-transparent py-1.5 pl-6 pr-6 text-[13px] text-[#0d2c5c] placeholder:text-[#94a3b8] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0d2c5c]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-[#c69a3f]">
              <Loader2 size={34} className="mb-4 animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0d2c5c]">
                Se încarcă meniul și locațiile…
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <MapPin
                size={32}
                strokeWidth={1.4}
                className="mx-auto mb-4 text-[#94a3b8]"
              />
              <p className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] mb-2">
                Nicio locație găsită
              </p>
              <p className="text-[15px] text-[#64748b] font-light">
                Încearcă un alt termen de căutare sau afișează toate locațiile.
              </p>
            </div>
          ) : (
            /* Secțiuni editoriale deschise, separate doar prin linii orizontale fine */
            <div className="divide-y divide-[#0d2c5c]/12">
              {filtered.map((p, idx) => {
                const m = meta(p.category);
                const count = getPlaceItemsCount(p);
                const flip = idx % 2 === 1;
                const isExpanded = expandedPlaceId === p.id;
                const placeCategories = menuForPlace(menu, p);

                return (
                  <section
                    key={p.id}
                    className="py-14 md:py-20 first:pt-4 last:pb-8"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                      {/* Fotografie curată, fără chenar de card */}
                      <div
                        className={`lg:col-span-6 ${
                          flip ? "lg:order-2" : ""
                        }`}
                      >
                        <div
                          onClick={() =>
                            setExpandedPlaceId(isExpanded ? null : p.id)
                          }
                          className="group relative aspect-[16/10] w-full overflow-hidden bg-[#f1f5f9] cursor-pointer"
                        >
                          <img
                            src={placeImage(p) || m.fallback}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      {/* Text editorial deschis (fără cutii sau carduri) */}
                      <div
                        className={`lg:col-span-6 ${
                          flip ? "lg:order-1" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c69a3f] mb-3">
                          <span className="h-px w-8 bg-[#c69a3f]" />
                          <span>{m.label}</span>
                          {p.badge && (
                            <>
                              <span className="text-[#0d2c5c]/25">·</span>
                              <span className="text-[#0d2c5c]">{p.badge}</span>
                            </>
                          )}
                        </div>

                        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,3.6vw,3.4rem)] font-normal leading-[1.08] text-[#0d2c5c] mb-4">
                          {p.title}
                        </h2>

                        <p className="text-[15.5px] leading-[1.85] text-[#475569] font-light mb-6">
                          {placeDescription(p) ||
                            "Preparate gătite proaspăt și băuturi fine, disponibile atât în locație, cât și prin Room Service direct în camera ta activă."}
                        </p>

                        {/* Detalii inline separate prin punct · (fără casete/carduri) */}
                        <div className="flex flex-wrap items-center gap-y-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#0d2c5c]/80 pb-6 border-b border-[#0d2c5c]/12 mb-6">
                          <span>Livrare în Cameră</span>
                          <span className="mx-3 text-[#c69a3f]">·</span>
                          <span>Oaspeți Cazați Astăzi</span>
                          {m.tags.map((t) => (
                            <span key={t} className="inline-flex items-center">
                              <span className="mx-3 text-[#c69a3f]">·</span>
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>

                        {/* Acțiune deschidere meniu */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <span className="font-['Cormorant_Garamond',serif] italic text-[20px] text-[#64748b]">
                            {count > 0
                              ? `${count} preparate în meniul digital`
                              : "Meniu în curs de actualizare"}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPlaceId(isExpanded ? null : p.id)
                            }
                            className="inline-flex items-center gap-2 border-b-2 border-[#0d2c5c] pb-1 text-[12px] font-bold uppercase tracking-[0.2em] text-[#0d2c5c] hover:text-[#c69a3f] hover:border-[#c69a3f] transition-colors cursor-pointer"
                          >
                            <span>
                              {isExpanded ? "Ascunde Meniul" : "Vezi Meniul & Comandă"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={15} />
                            ) : (
                              <ChevronDown size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Meniul Fine Dining afișat curat, direct sub secțiunea locației (fără carduri!) */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-12 pt-10 border-t border-[#0d2c5c]/10">
                            <div className="flex items-baseline justify-between mb-6">
                              <div>
                                <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c69a3f] block">
                                  Meniu Digital & Room Service
                                </span>
                                <h3 className="font-['Cormorant_Garamond',serif] text-[28px] sm:text-[34px] font-normal text-[#0d2c5c]">
                                  Selecția {p.title}
                                </h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedPlaceId(null)}
                                className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] hover:text-[#0d2c5c] inline-flex items-center gap-1 cursor-pointer"
                              >
                                Închide <X size={14} />
                              </button>
                            </div>

                            <PlaceMenu categories={placeCategories} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
