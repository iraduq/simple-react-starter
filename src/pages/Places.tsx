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

      {/* ── CONȚINUT PRINCIPAL FĂRĂ CARDURI (în stilul AboutSection.tsx de pe Home) ── */}
      <section className="relative py-16 md:py-24 px-5 md:px-10 z-10 bg-transparent">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header + Filtre */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-[#c69a3f] to-transparent" />
                Experiențe & Meniu Digital
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,4.5vw,3.6rem)] font-normal leading-[1.08] text-[#0d2c5c]">
                Arome & <em className="italic text-[#c69a3f]">Destinații</em>
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
                    className={`px-5 py-2.5 rounded-full border text-[11.5px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
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
                  className="w-full rounded-full border border-[#e2e8f0] bg-white py-2.5 pl-9 pr-8 text-[12.5px] text-[#0d2c5c] placeholder:text-[#94a3b8] focus:border-[#c69a3f] focus:outline-none"
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
            <div className="py-20 text-center max-w-xl mx-auto">
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
            /* Rânduri editoriale curate, aliniate — fără carduri, fără forme decupate */
            <div className="divide-y divide-[#0d2c5c]/10">
              {filtered.map((p, idx) => {
                const m = meta(p.category);
                const count = getPlaceItemsCount(p);
                const flip = idx % 2 === 1;
                const Icon = m.icon;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center py-14 first:pt-0 last:pb-0"
                  >
                    {/* Imagine curată, uniformă */}
                    <div
                      className={`relative lg:col-span-5 ${
                        flip ? "lg:order-2" : ""
                      }`}
                    >
                      <div
                        onClick={() => setOpen(p)}
                        className="group relative h-[260px] sm:h-[340px] w-full overflow-hidden rounded-2xl bg-[#0d2c5c] cursor-pointer shadow-[0_20px_50px_-24px_rgba(13,44,92,0.35)]"
                      >
                        <img
                          src={placeImage(p) || m.fallback}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071833]/55 via-transparent to-transparent" />

                        {p.badge && (
                          <span className="absolute bottom-5 left-5 rounded-full bg-white/92 backdrop-blur-md px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#0d2c5c]">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Text editorial aliniat */}
                    <div
                      className={`lg:col-span-7 flex flex-col items-start ${
                        flip ? "lg:order-1" : ""
                      }`}
                    >
                      <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
                        <Icon size={14} strokeWidth={2} />
                        {m.label}
                      </p>

                      <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.01em] text-[#0d2c5c] mb-4">
                        {p.title}
                      </h3>

                      <p className="font-sans text-[#475569] leading-[1.8] text-[15px] font-light mb-6 max-w-xl">
                        {placeDescription(p) ||
                          "Experimentează servicii de înaltă clasă, ingrediente proaspete și livrare direct în camera ta activă pe toată durata sejurului."}
                      </p>

                      {/* Detalii discrete, pe o singură linie */}
                      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mb-7 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0d2c5c]/70">
                        <span className="flex items-center gap-2">
                          <span className="h-1 w-1 rotate-45 bg-[#c69a3f]" />
                          {count > 0 ? `${count} preparate în meniu` : "Meniu live"}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="h-1 w-1 rotate-45 bg-[#c69a3f]" />
                          Room service în cameră
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpen(p)}
                        className="group inline-flex items-center gap-3 bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] text-[11.5px] tracking-[0.2em] uppercase font-bold py-3.5 px-7 rounded-full transition-all duration-300 shadow-[0_12px_30px_-12px_rgba(13,44,92,0.4)] cursor-pointer"
                      >
                        <span>Deschide Meniul & Comandă</span>
                        <ArrowRight
                          size={15}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── MODAL MENIU SLIDE-OVER (PĂSTRAT EXACT CUM L-AI APRECIAT) ── */}
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
