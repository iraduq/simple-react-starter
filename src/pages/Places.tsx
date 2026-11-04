import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MapPin,
  X,
  ArrowUpRight,
  Utensils,
  Wine,
  Waves,
  Sparkles,
  Search,
  LayoutGrid,
  Clock,
  Compass,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { useToast } from "../components/Toast";
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
   DECOR: SVG-uri plutitoare în stilul Vila Casa Esy
─────────────────────────────────────────────── */
const floatAnim = (duration: number, amp = 20, rot = 5, delay = 0) => ({
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

const CATEGORIES = [
  { id: "toate", label: "Toate", icon: LayoutGrid },
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "bar", label: "Bar & Lounge", icon: Wine },
  { id: "plaja", label: "Plajă Privată", icon: Waves },
  { id: "spa", label: "SPA & Wellness", icon: Sparkles },
];

const CAT_META: Record<
  string,
  { label: string; icon: typeof Utensils; fallback: string; tags: string[] }
> = {
  restaurant: {
    label: "Restaurant",
    icon: Utensils,
    fallback:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=60",
    tags: ["Fine Dining", "Fructe de Mare", "Terasă Panoramică"],
  },
  bar: {
    label: "Bar & Lounge",
    icon: Wine,
    fallback:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&auto=format&fit=crop&q=60",
    tags: ["Signature Cocktails", "Apusuri de Soare", "Muzică Ambient"],
  },
  plaja: {
    label: "Plajă Privată",
    icon: Waves,
    fallback:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=60",
    tags: ["Șezlonguri Premium", "Servire pe Plajă", "Briza Mării"],
  },
  spa: {
    label: "SPA & Wellness",
    icon: Sparkles,
    fallback:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&auto=format&fit=crop&q=60",
    tags: ["Masaj Terapeutic", "Aromaterapie", "Relaxare Totală"],
  },
};

const meta = (c?: string) =>
  CAT_META[c?.toLowerCase() ?? ""] ?? CAT_META.restaurant;

export default function Places() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("toate");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState<Place | null>(null);

  const reloadPlaces = () => {
    Promise.allSettled([listPlaces(), getFullMenu()]).then(([p, m]) => {
      if (p.status === "fulfilled") setPlaces(p.value);
      if (m.status === "fulfilled") setMenu(m.value);
      setLoading(false);
    });
  };

  useEffect(() => {
    reloadPlaces();

    const onLiveSync = () => {
      reloadPlaces();
    };

    window.addEventListener("live-places-sync", onLiveSync);
    return () => {
      window.removeEventListener("live-places-sync", onLiveSync);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Filtrare combinată după categorie și text căutat
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
          p.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [places, category, searchQuery]);

  // Număr total de produse din meniul asociat unui loc
  const getPlaceItemsCount = (p: Place) => {
    return menuForPlace(menu, p).reduce(
      (s, c) => s + (c.items?.length ?? 0),
      0
    );
  };

  return (
    <div className="relative min-h-screen bg-[#fbfbf9] text-[#0d2c5c]">
      {/* ── HERO LUXURY SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#07172e] via-[#0c2242] to-[#07172e] px-5 pt-36 pb-24 text-center sm:pt-44 sm:pb-32">
        {/* Glow-uri radiale de fundal */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-[450px] w-[450px] rounded-full bg-[#c69a3f]/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-36 -right-32 h-[500px] w-[500px] rounded-full bg-[#1e4d8c]/35 blur-[130px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-40 w-full max-w-4xl bg-[#c69a3f]/5 blur-[100px]"
        />

        {/* Motive plutitoare marine SVG */}
        <motion.div
          {...floatAnim(13, 16, 5)}
          className="pointer-events-none absolute top-[20%] right-[8%] hidden opacity-20 md:block"
        >
          <SunRing className="h-32 w-32 text-[#c69a3f]" />
        </motion.div>
        <motion.div
          {...floatAnim(16, 14, -6, 1)}
          className="pointer-events-none absolute top-[35%] left-[6%] hidden opacity-15 lg:block"
        >
          <Shell className="h-28 w-28 text-[#c69a3f]" />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-4xl px-4">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#c69a3f]/40 bg-[#c69a3f]/10 px-4 py-1.5 backdrop-blur-md shadow-[0_2px_12px_rgba(198,154,63,0.12)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#c69a3f] shadow-[0_0_8px_#c69a3f]" />
            <span className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#e8c878]">
              Experiențe & Gastronomie · Vila Casa Esy
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#c69a3f] shadow-[0_0_8px_#c69a3f]" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5.5vw,4.5rem)] font-light leading-[1.08] tracking-tight text-white"
          >
            Atracții, Gastronomie &{" "}
            <em className="italic font-normal text-[#c69a3f]">Relaxare</em> la Malul
            Mării
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-[15px] sm:text-[16px] font-light leading-relaxed text-white/80"
          >
            Descoperă facilitățile exclusiviste ale resortului Vila Casa Esy:
            restaurant fine dining, cocktail bar la apus, plajă privată și sanctuar
            SPA — fiecare cu meniul digital actualizat în timp real.
          </motion.p>

          {/* Luxury Highlights Grid */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
          >
            {[
              {
                icon: Utensils,
                title: "Restaurant",
                subtitle: "Preparate gourmet",
              },
              {
                icon: Wine,
                title: "Sunset Bar",
                subtitle: "Cocktailuri de autor",
              },
              {
                icon: Waves,
                title: "Plajă Privată",
                subtitle: "Șezlonguri & briza mării",
              },
              {
                icon: Sparkles,
                title: "SPA & Masaj",
                subtitle: "Sanctuar de relaxare",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-[#c69a3f]/50 hover:bg-white/[0.08]"
                >
                  <Icon
                    size={20}
                    className="mx-auto mb-2 text-[#c69a3f] transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="text-[13px] font-semibold text-white">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/60">
                    {item.subtitle}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── BARA DE FILTRE ȘI CĂUTARE LUXURY ── */}
      <section className="relative z-20 -mt-7 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-3 sm:p-4 shadow-[0_12px_40px_rgba(7,23,46,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const isActive = category === c.id;
                const count =
                  c.id === "toate"
                    ? places.length
                    : places.filter((p) => p.category?.toLowerCase() === c.id)
                        .length;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                      isActive
                        ? "bg-[#0d2c5c] text-white shadow-md shadow-[#0d2c5c]/20 ring-1 ring-[#c69a3f]/40"
                        : "border border-slate-200/80 bg-slate-50/60 text-[#0d2c5c] hover:border-[#c69a3f]/40 hover:bg-white"
                    }`}
                  >
                    <Icon
                      size={13}
                      className={isActive ? "text-[#c69a3f]" : "text-slate-400"}
                    />
                    <span>{c.label}</span>
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Căutare rapidă */}
            <div className="relative min-w-[240px] md:max-w-xs">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută o locație sau preparat…"
                className="w-full rounded-full border border-slate-200/80 bg-slate-50/70 py-2.5 pl-9 pr-8 text-[12.5px] text-[#0d2c5c] placeholder:text-slate-400 focus:border-[#c69a3f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c69a3f]/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── GRID LOCAȚII ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-[#c69a3f]">
            <Loader2 size={36} className="mb-4 animate-spin" />
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0d2c5c]">
              Se încarcă facilitățile Vila Casa Esy…
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#c69a3f]/10 text-[#c69a3f]">
              <MapPin size={26} strokeWidth={1.5} />
            </div>
            <h3 className="font-['Cormorant_Garamond',serif] text-[24px] font-medium text-[#0d2c5c]">
              Nicio locație găsită
            </h3>
            <p className="mt-2 text-[14px] text-slate-500">
              {searchQuery
                ? `Nu am găsit rezultate pentru căutarea „${searchQuery}”.`
                : "Nu există locații înregistrate în această categorie deocamdată."}
            </p>
            {(searchQuery || category !== "toate") && (
              <button
                type="button"
                onClick={() => {
                  setCategory("toate");
                  setSearchQuery("");
                }}
                className="mt-5 rounded-full bg-[#0d2c5c] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white hover:bg-[#143565] transition-colors"
              >
                Resetează filtrele
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, idx) => {
              const m = meta(p.category);
              const Icon = m.icon;
              const count = getPlaceItemsCount(p);

              return (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
                  onClick={() => setOpen(p)}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(7,23,46,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c69a3f]/50 hover:shadow-[0_20px_45px_rgba(7,23,46,0.12)]"
                >
                  {/* Container Imagine */}
                  <div className="relative h-64 overflow-hidden bg-slate-100 sm:h-72">
                    <img
                      src={placeImage(p) || m.fallback}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />

                    {/* Gradient protector */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07172e]/80 via-transparent to-black/25 opacity-80" />

                    {/* Badge categorie stânga sus */}
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#07172e]/80 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md shadow-sm">
                        <Icon size={12} className="text-[#c69a3f]" />
                        {m.label}
                      </span>
                    </div>

                    {/* Badge custom dreapta sus */}
                    {p.badge && (
                      <div className="absolute right-4 top-4">
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#c69a3f] to-[#e8c878] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#07172e] shadow-md">
                          {p.badge}
                        </span>
                      </div>
                    )}

                    {/* Indicator disponibilitate meniu pe imagine */}
                    <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        {count > 0
                          ? `Meniu digital · ${count} preparate`
                          : "Locație activă"}
                      </span>
                      <span className="text-[11px] font-medium text-white/80">
                        Vila Casa Esy
                      </span>
                    </div>
                  </div>

                  {/* Conținut Card */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    {/* Tag-uri tematice */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {m.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Titlu */}
                    <h3 className="font-['Cormorant_Garamond',serif] text-[26px] font-semibold leading-snug text-[#07172e] transition-colors duration-300 group-hover:text-[#c69a3f]">
                      {p.title}
                    </h3>

                    {/* Descriere */}
                    <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-slate-600">
                      {placeDescription(p) ||
                        "Experimentează servicii de înaltă clasă, ingrediente proaspete și o atmosferă distinsă la malul mării."}
                    </p>

                    {/* Footer card cu buton CTA rafinat */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] group-hover:text-[#c69a3f] transition-colors">
                        {count > 0 ? "Răsfoiește Meniul" : "Vezi Detalii"}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d2c5c]/5 text-[#0d2c5c] transition-all duration-300 group-hover:bg-[#0d2c5c] group-hover:text-white">
                        <ArrowUpRight
                          size={16}
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SECȚIUNE HOSPITALITY & CONCIERGE BANNER ── */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#0d2c5c] p-8 sm:p-12 text-white shadow-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#c69a3f]/20 blur-[90px]"
          />
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c69a3f]">
                Servicii de Concierge
              </span>
              <h2 className="mt-2 font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-light leading-tight">
                Dorești o rezervare specială sau un eveniment privat?
              </h2>
              <p className="mt-2 text-[14px] text-white/75 leading-relaxed">
                Echipa noastră de ospitalitate vă stă la dispoziție pentru rezervări
                la restaurant, mese de degustare sau pachete personalizate pe plajă.
              </p>
            </div>
            <a
              href="tel:+40700000000"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#c69a3f] to-[#e8c878] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#07172e] shadow-lg transition-transform hover:scale-105"
            >
              <Phone size={15} />
              <span>Contactează Recepția</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── MODAL / SLIDE-OVER PENTRU MENIU ȘI DETALII LOCAȚIE ── */}
      {/* ATENȚIE: Nu se modifică logica internă a PlaceMenu conform instrucțiunii utilizatorului */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[600] flex justify-end bg-[#07203f]/60 backdrop-blur-sm"
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
              {/* Header Drawer Identic cu Screenshot-ul */}
              <div className="relative h-56 bg-[#0d2c5c] sm:h-64">
                <img
                  src={placeImage(open) || meta(open.category).fallback}
                  alt={open.title}
                  className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c] to-transparent" />
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Închide"
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0d2c5c] shadow-md transition-transform hover:scale-110"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-5 left-6 right-6">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">
                    {meta(open.category).label}
                  </span>
                  <h2 className="font-['Cormorant_Garamond',serif] text-[34px] leading-tight text-white">
                    {open.title}
                  </h2>
                </div>
              </div>

              {/* Conținut Drawer (PlaceMenu integrat exact așa cum dorește utilizatorul) */}
              <div className="p-6 sm:p-8">
                <p className="mb-8 text-[15px] leading-relaxed text-[#4f6280]">
                  {placeDescription(open)}
                </p>
                <PlaceMenu categories={menuForPlace(menu, open)} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
