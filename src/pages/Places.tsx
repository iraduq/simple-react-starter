import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  X,
  Image as ImageIcon,
  Loader2,
  Phone,
  Clock,
  ArrowUpRight,
  ArrowRight,
  Utensils,
} from "lucide-react";
import { apiFetch, ApiError } from "../lib/api";
import { getCachedUser, type SessionUser } from "../lib/auth";
import { useToast } from "../components/Toast";
import { API_URL } from "../lib/admin";

type MenuItem = {
  id: string | number;
  name: string;
  description?: string;
  price: string;
};

type MenuCategory = {
  categoryName: string;
  items: MenuItem[];
};

type Place = {
  id: number;
  title: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  thumb?: string | null;
  img?: string | null;
  thumb_url?: string | null;
  image_url?: string | null;
  images?: Array<{ id: string | number; image_url?: string; url?: string }>;
  badge: string | null;
  rating: number;
  phone?: string | null;
  schedule?: string | null;
  menu?: MenuCategory[];
};

type PlaceForm = {
  title: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  thumb_url: string;
  image_url: string;
  badge: string;
  rating: number;
  phone: string;
  schedule: string;
  menu: MenuCategory[];
};

const DEFAULT_HIGHLIGHTS: Record<
  string,
  {
    tag: string;
    quote: string;
    caption: string;
    cta: string;
    items: MenuItem[];
  }
> = {
  restaurant: {
    tag: "FINE DINING & MARE",
    quote: "„Seara pe terasă, sub briza mării...”",
    caption: "Rezervare prioritară la mesele de pe malul mării pentru oaspeți",
    cta: "Explorează meniul complet",
    items: [
      {
        id: "r1",
        name: "Platou Fructe de Mare pentru Două Persoane",
        description:
          "Creveți sălbatici, scoici Saint-Jacques, calamari, midii în sos de vin alb și ierburi mediteraneene.",
        price: "240 RON",
      },
      {
        id: "r2",
        name: "File de Doradă Regală în Crustă de Sare",
        description:
          "Servit cu sparanghel verde la grătar, emulsie de lămâie coaptă și ulei de măsline extravirgin.",
        price: "98 RON",
      },
      {
        id: "r3",
        name: "Tagliolini de Casă cu Homar & Roșii Cherry",
        description:
          "Paste proaspete artizanale, bisque fin de crustacee, busuioc proaspăt și unt maturat.",
        price: "135 RON",
      },
    ],
  },
  plaja: {
    tag: "PRIVATE BEACH & LOUNGE",
    quote: "„Liniștea valurilor, în intimitate absolută.”",
    caption: "Zonă exclusivă cu servicii la șezlong pentru oaspeții vilei",
    cta: "Vezi harta plajei & tarifele complete",
    items: [
      {
        id: "p1",
        name: "Set 2 Șezlonguri Ultra-Confort (Rândul 1 la Mare)",
        description:
          "Include saltele groase, umbrelă din stuf natural, două prosoape mari de bumbac și apă plată rece.",
        price: "120 RON / zi",
      },
      {
        id: "p2",
        name: "Baldachin Privat din Lemn cu Voaluri Albe",
        description:
          "Capacitate 2-4 persoane, fructieră proaspătă de sezon și o sticlă de Prosecco rece incluse.",
        price: "320 RON / zi",
      },
      {
        id: "p3",
        name: "Serviciu Beach Bar & Cocktailuri la Șezlong",
        description:
          "Comandă direct de pe plajă prin cod QR — servire rapidă cu fructe proaspete și băuturi reci.",
        price: "De la 34 RON",
      },
    ],
  },
  bar: {
    tag: "SUNSET COCKTAILS & LOUNGE",
    quote: "„Ora de aur, când cerul se topește în pahare.”",
    caption: "Muzică ambientală live în fiecare seară de vară",
    cta: "Răsfoiește carta de vinuri & cocktailuri",
    items: [
      {
        id: "b1",
        name: "Esy Golden Sunset Spritz (Signature Cocktail)",
        description:
          "Lichior de soc artizanal, Prosecco DOCG, infuzie de portocală roșie, rozmarin și fulgi de aur.",
        price: "48 RON",
      },
      {
        id: "b2",
        name: "Selecție de Vinuri Albe & Rosé de Coastă",
        description:
          "Etichete atent alese din Dobrogea, Provence și Santorini, servite la temperatura ideală.",
        price: "145 RON / sticlă",
      },
      {
        id: "b3",
        name: "Platou Mediteranean de Degustare",
        description:
          "Brânzeturi maturate, prosciutto crudo, măsline kalamata marinate, nuci coapte și focaccia caldă.",
        price: "110 RON",
      },
    ],
  },
  hotel: {
    tag: "PARTENERIAT & HOSPITALITY",
    quote: "„Armonie arhitecturală și ospitalitate discretă.”",
    caption: "Acces preferențial la centru SPA și piscină încălzită",
    cta: "Descoperă toate serviciile partenere",
    items: [
      {
        id: "h1",
        name: "Day-Pass Piscină Infinity & Zonă de Relaxare",
        description:
          "Acces complet la piscina exterioară încălzită, șezlong rezervat, halat și prosop incluse.",
        price: "150 RON / pers",
      },
      {
        id: "h2",
        name: "Ritual Masaj de Relaxare cu Uleiuri Calde",
        description:
          "Sesiune de 60 de minute realizată de terapeuți certificați cu esențe naturale de lavandă și bergamotă.",
        price: "220 RON",
      },
      {
        id: "h3",
        name: "Acces Circuit Thermal & Saună Panoramică",
        description:
          "Saună uscată finlandeză, baie de aburi cu eucalipt, dușuri emoționale și zonă de ceaiuri bio.",
        price: "130 RON",
      },
    ],
  },
  atracție: {
    tag: "EXPERIENȚE & DESCOPERIRE",
    quote: "„Amintiri croite între ape și orizont.”",
    caption: "Organizare privată prin recepția Vila Casa Esy",
    cta: "Vezi detaliile experienței",
    items: [
      {
        id: "a1",
        name: "Croazieră Privată la Apus cu Velierul",
        description:
          "2 ore pe mare alături de skipper dedicat, pahar de șampanie și gustări fine la bord.",
        price: "650 RON / grup",
      },
      {
        id: "a2",
        name: "Tur Ghidat & Degustare la Cramă Dobrogeană",
        description:
          "Transport privat dus-întors, vizită în podgorie și degustare de 5 vinuri de colecție cu somelier.",
        price: "290 RON / pers",
      },
      {
        id: "a3",
        name: "Sesiune Stand Up Paddle (SUP) la Răsărit",
        description:
          "Echipament complet inclus, instructaj de bază și fotografii digitale pe apele liniștite ale dimineții.",
        price: "120 RON / pers",
      },
    ],
  },
};

const ESSENTIAL_EXPERIENCES = [
  {
    num: "01",
    title: "Închiriere Stand Up Paddle (SUP) & Caiac",
    price: "80 RON / oră",
    desc: "Explorează apele calme ale dimineții direct de pe plaja parteneră. Echipament complet, veste și instructaj incluse pentru oaspeții vilei.",
    meta: "Disponibil zilnic 07:00 – 19:00 · Rezervare la recepție",
  },
  {
    num: "02",
    title: "Masaj Terapeutic & Ritual Somatic în Grădină",
    price: "210 RON / 60 min",
    desc: "Sesiuni private de masaj de relaxare sau deep-tissue, desfășurate în foișorul umbrit din grădină sau în intimitatea propriei camere.",
    meta: "Cu programare prealabilă de minim 24h",
  },
  {
    num: "03",
    title: "Mic Dejun Gourmet à la Carte pe Terasă",
    price: "65 RON / pers",
    desc: "Ingrediente locale proaspete, ouă bio, brânzeturi artizanale, patiserie caldă și cafea de specialitate servite fără grabă pe terasă.",
    meta: "Servit zilnic între 08:00 – 11:00",
  },
  {
    num: "04",
    title: "Transfer Privat & Excursii în Delta Dunării",
    price: "La cerere",
    desc: "Organizăm transferuri private de la aeroport și excursii de o zi cu barca rapidă în inima Deltei Dunării, cu prânz pescăresc tradițional.",
    meta: "Asistență completă prin Concierge Casa Esy",
  },
];

const EMPTY_FORM: PlaceForm = {
  title: "",
  category: "restaurant",
  description: "",
  lat: 44.1598,
  lng: 28.6348,
  thumb_url: "",
  image_url: "",
  badge: "",
  rating: 5.0,
  phone: "",
  schedule: "",
  menu: [
    {
      categoryName: "Selecție Recomandată",
      items: [
        { id: 1, name: "", description: "", price: "" },
        { id: 2, name: "", description: "", price: "" },
        { id: 3, name: "", description: "", price: "" },
      ],
    },
  ],
};

const CATEGORIES = [
  { id: "toate", label: "Toate Experiențele" },
  { id: "restaurant", label: "Gastronomie & Mese" },
  { id: "plaja", label: "Plaje & Solarium" },
  { id: "bar", label: "Sunset Lounge & Bar" },
  { id: "hotel", label: "SPA & Relaxare" },
  { id: "atracție", label: "Excursii & Activități" },
];

const getPlaceImageUrl = (place: any) => {
  const rawUrl =
    place.thumb ||
    place.image_url ||
    place.thumb_url ||
    place.img ||
    place.images?.[0]?.image_url ||
    place.images?.[0]?.url ||
    "";

  if (!rawUrl) return "";
  if (rawUrl.startsWith("http")) return rawUrl;
  return `${API_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
};

const getPlaceMenu = (place: Place): MenuItem[] => {
  const customItems =
    (Array.isArray(place.menu) ? place.menu : [])
      .flatMap((c) => (Array.isArray(c?.items) ? c.items : []))
      .filter((i) => typeof i?.name === "string" && i.name.trim() !== "");
  if (customItems.length > 0) return customItems;
  const fallback =
    DEFAULT_HIGHLIGHTS[place.category?.toLowerCase()] ||
    DEFAULT_HIGHLIGHTS.restaurant;
  return fallback.items;
};

const REVEAL_DELAY = 600;

export default function Places() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("toate");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Place | null>(null);
  const [revealed, setRevealed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const user = getCachedUser() as NonNullable<SessionUser> | null;
  const canCreate = user?.permissions?.includes("places:create") ?? false;
  const canUpdate = user?.permissions?.includes("places:update") ?? false;
  const canDelete = user?.permissions?.includes("places:delete") ?? false;

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), REVEAL_DELAY);
    return () => clearTimeout(t);
  }, []);

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<unknown>("/places");
      const list = Array.isArray(data)
        ? data
        : ((data as { items?: Place[]; places?: Place[]; data?: Place[] } | null)?.items ??
          (data as { places?: Place[] } | null)?.places ??
          (data as { data?: Place[] } | null)?.data ??
          []);
      setPlaces(Array.isArray(list) ? (list as Place[]) : []);
    } catch (e) {
      if (e instanceof ApiError) toast(e.message, "error");
      else toast("Nu am putut încărca locațiile partenere.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const filtered = useMemo(() => {
    if (category === "toate") return places;
    return places.filter((p) => p.category?.toLowerCase() === category);
  }, [places, category]);

  const openEdit = (place: Place) => {
    setEditing(place);
    setFormOpen(true);
  };

  const handleSubmit = async (formData: PlaceForm) => {
    try {
      if (editing) {
        await apiFetch(`/places/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
        toast("Locația parteneră a fost actualizată.", "success");
      } else {
        await apiFetch("/places", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast("Locația parteneră a fost adăugată.", "success");
      }
      setFormOpen(false);
      setEditing(null);
      await loadPlaces();
    } catch (e) {
      if (e instanceof ApiError) toast(e.message, "error");
      else toast("A apărut o problemă.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/places/${deleteTarget.id}`, { method: "DELETE" });
      toast("Locația a fost ștearsă.", "success");
      setDeleteTarget(null);
      await loadPlaces();
    } catch (e) {
      if (e instanceof ApiError) toast(e.message, "error");
      else toast("A apărut o problemă.", "error");
    }
  };

  const emerge = {
    hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: custom,
      },
    }),
  };

  return (
    <div className="relative bg-white text-[#0d2c5c] min-h-screen selection:bg-[#c69a3f]/20">
      {/* ── HERO CINEMATOGRAFIC ── */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-32 sm:pt-40 md:pt-48 pb-32 md:pb-44 z-10">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-poster.jpg"
            className="h-full w-full object-cover saturate-50 contrast-110 brightness-95"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0d2c5c]/75 mix-blend-color" />
          <div className="absolute inset-0 bg-[#081c3a]/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/40 to-[#0d2c5c]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <motion.p
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0}
            className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.26em] uppercase text-[#c69a3f] mb-4 flex items-center justify-center gap-3"
          >
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            Ghidul Oaspetelui · Vila Casa Esy
            <span className="w-8 h-px bg-[#c69a3f]/60" />
          </motion.p>

          <motion.h1
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.12}
            className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5.5vw,5rem)] font-normal text-white leading-[1.06] tracking-[-0.01em] mb-6"
          >
            Restaurante, plaje & facilități, <br className="hidden sm:block" />
            <em className="italic text-[#c69a3f]">recomandate pentru tine</em>
          </motion.h1>

          <motion.p
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.24}
            className="max-w-[580px] mx-auto text-[14.5px] sm:text-[16px] text-white/85 leading-[1.8] font-light"
          >
            Am ales cu grijă câteva locuri partenere unde mâncarea este
            întotdeauna proaspătă, șezlongurile sunt aerisite, iar atmosfera
            păstrează liniștea vacanței tale.
          </motion.p>

          <motion.div
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.36}
            className="mt-10 flex flex-col items-center gap-2 text-white/50 text-[10px] uppercase tracking-[0.25em]"
          >
            <span>Descoperă Selecția</span>
            <span className="w-px h-7 bg-gradient-to-b from-[#c69a3f] to-transparent" />
          </motion.div>
        </div>

        {/* Decupaj val jos */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[45px] md:h-[75px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      {/* ── INTRODUCERE EDITORIALĂ & NAVIGAȚIE TIPOGRAFICĂ (FĂRĂ BARĂ DE SEARCH) ── */}
      <section className="max-w-4xl mx-auto px-5 pt-14 md:pt-20 pb-10 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#c69a3f] mb-4">
          Colecția Casa Esy · Sezonul Estival
        </p>
        <blockquote className="font-['Cormorant_Garamond',serif] text-[clamp(1.35rem,2.4vw,1.9rem)] italic text-[#0d2c5c] leading-[1.45] max-w-2xl mx-auto">
          „O selecție discretă de experiențe mediteraneene, create fără excese
          vizuale, unde gustul rafinat și orizontul mării se împletesc firesc.”
        </blockquote>

        {/* Navigație tipografică fină, stil revistă */}
        <nav
          aria-label="Categorii parteneri"
          className="mt-12 pt-6 border-t border-b border-[#e8edf3] flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`relative py-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  active
                    ? "text-[#0d2c5c]"
                    : "text-[#8595aa] hover:text-[#0d2c5c]"
                }`}
              >
                {c.label}
                {active && (
                  <motion.span
                    layoutId="editorialUnderline"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#c69a3f]"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </section>

      {/* ── SELECȚIA EDITORIALĂ (ZINE ZIG-ZAG LAYOUT) ── */}
      <section className="py-12 md:py-20 px-5 sm:px-8 md:px-12">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 text-[#c69a3f]">
              <Loader2 size={30} className="animate-spin mb-4" />
              <span className="font-sans text-[10px] font-bold tracking-[0.24em] uppercase text-[#0d2c5c]">
                Se pregătește catalogul...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center max-w-md mx-auto border-t border-b border-[#e8edf3]">
              <MapPin
                size={28}
                strokeWidth={1.3}
                className="mx-auto mb-4 text-[#c69a3f]"
              />
              <p className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c] mb-2">
                Nicio recomandare în această secțiune
              </p>
              <p className="text-[14px] text-[#64748b] font-light">
                Selectează altă categorie din jurnalul de mai sus.
              </p>
            </div>
          ) : (
            <div className="space-y-24 md:space-y-36">
              {filtered.map((place, idx) => {
                const imageUrl = getPlaceImageUrl(place);
                const isEven = idx % 2 === 0;
                const catKey = place.category?.toLowerCase() || "restaurant";
                const defaults =
                  DEFAULT_HIGHLIGHTS[catKey] || DEFAULT_HIGHLIGHTS.restaurant;
                const menuItems = getPlaceMenu(place);
                const numLabel = String(idx + 1).padStart(2, "0");

                return (
                  <motion.article
                    key={place.id}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
                  >
                    {/* COLOANA FOTO VERTICALĂ (STIL REVISTĂ) */}
                    <div
                      className={`lg:col-span-6 ${
                        isEven ? "lg:order-1" : "lg:order-2"
                      }`}
                    >
                      <div
                        onClick={() => setSelectedPlace(place)}
                        className="group cursor-pointer relative aspect-[4/5] w-full overflow-hidden bg-[#0d2c5c] shadow-[0_25px_60px_-20px_rgba(13,44,92,0.18)]"
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={place.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30">
                            <ImageIcon size={48} strokeWidth={1} />
                          </div>
                        )}

                        {/* Gradient editorial jos și sus */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06152d]/90 via-transparent to-black/25" />

                        {/* Etichetă numerotată colț stânga-sus */}
                        <div className="absolute top-6 left-6 z-10 bg-[#0d2c5c]/85 backdrop-blur-md px-4 py-2 border border-white/15">
                          <span className="font-sans text-[9.5px] font-bold uppercase tracking-[0.22em] text-white">
                            {numLabel} · {place.badge || defaults.tag}
                          </span>
                        </div>

                        {/* Controale Admin discrete */}
                        {(canUpdate || canDelete) && (
                          <div
                            className="absolute top-6 right-6 z-20 flex gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {canUpdate && (
                              <button
                                onClick={() => openEdit(place)}
                                className="p-2.5 bg-white/90 text-[#0d2c5c] hover:bg-[#c69a3f] hover:text-white transition-colors"
                                title="Editează locația și meniul"
                              >
                                <Pencil size={13} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleteTarget(place)}
                                className="p-2.5 bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                                title="Șterge"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Citat / Atmosferă în partea de jos a fotografiei */}
                        <div className="absolute bottom-7 left-7 right-7 z-10">
                          <p className="font-['Cormorant_Garamond',serif] italic text-[22px] sm:text-[25px] text-white leading-snug mb-1">
                            {defaults.quote}
                          </p>
                          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#c69a3f]">
                            {defaults.caption}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* COLOANA EDITORIALĂ + MENIU DIGITAL ÎNCORPORAT */}
                    <div
                      className={`lg:col-span-6 flex flex-col justify-center ${
                        isEven ? "lg:order-2 lg:pl-4" : "lg:order-1 lg:pr-4"
                      }`}
                    >
                      {/* Meta-linie sus */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c69a3f] mb-3">
                        <span>{place.category}</span>
                        <span className="text-[#cbd5e1]">•</span>
                        <span className="text-[#64748b] font-semibold">
                          Program: {place.schedule || "10:00 – 23:00"}
                        </span>
                        {place.rating > 0 && (
                          <>
                            <span className="text-[#cbd5e1]">•</span>
                            <span className="text-[#0d2c5c]">
                              ★ {place.rating.toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Titlu locație */}
                      <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,3.6vw,3.3rem)] font-normal leading-[1.06] text-[#0d2c5c] mb-5">
                        {place.title}
                      </h2>

                      {/* Descriere */}
                      <p className="font-sans text-[14.5px] leading-[1.85] font-light text-[#5a6b85] mb-9">
                        {place.description}
                      </p>

                      {/* Lista de Meniu Digital / Servicii (Stil Fine-Dining) */}
                      <div className="border-t border-[#e8edf3] divide-y divide-[#e8edf3] mb-8">
                        {menuItems.slice(0, 3).map((item, i) => (
                          <div key={item.id || i} className="py-4">
                            <div className="flex items-baseline justify-between gap-4 mb-1">
                              <h4 className="font-['Cormorant_Garamond',serif] text-[19px] sm:text-[20px] font-medium text-[#0d2c5c]">
                                {item.name}
                              </h4>
                              <span className="font-sans text-[13px] font-bold tracking-[0.06em] text-[#c69a3f] shrink-0">
                                {item.price}
                              </span>
                            </div>
                            {item.description && (
                              <p className="font-sans text-[12.5px] text-[#7b8ba3] font-light leading-relaxed pr-8">
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Link explorare meniu complet + telefon */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPlace(place)}
                          className="group inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0d2c5c] hover:text-[#c69a3f] transition-colors w-fit pb-1 border-b border-[#0d2c5c] hover:border-[#c69a3f]"
                        >
                          {defaults.cta}
                          <ArrowUpRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </button>

                        {place.phone && (
                          <a
                            href={`tel:${place.phone}`}
                            className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#7b8ba3] hover:text-[#0d2c5c] transition-colors"
                          >
                            <Phone size={12} className="text-[#c69a3f]" />
                            Rezervări: {place.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SECȚIUNEA: FACILITĂȚI, ACTIVITĂȚI & RĂSFĂȚ ESENȚIAL (CA ÎN POZĂ) ── */}
      <section className="bg-[#fbf9f5] border-t border-[#ece6da] py-20 md:py-28 px-5 sm:px-8 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#c69a3f] mb-3">
              Servicii & Experiențe la Vila Casa Esy
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.1rem,3.6vw,3.1rem)] font-normal text-[#0d2c5c] leading-[1.1] mb-4">
              Facilități, Activități & Răsfăț Esențial
            </h2>
            <p className="text-[14.5px] text-[#5a6b85] font-light leading-[1.8]">
              Fiecare zi petrecută la noi poate fi completată cu activități pe
              apă, momente de relaxare în grădină sau experiențe gastronomice
              locale, pregătite la cerere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-12">
            {ESSENTIAL_EXPERIENCES.map((exp) => (
              <div
                key={exp.num}
                className="relative pt-8 border-t border-[#e5dec9]"
              >
                <span
                  aria-hidden="true"
                  className="font-['Cormorant_Garamond',serif] text-[54px] leading-none text-[#c69a3f]/20 select-none block mb-2"
                >
                  {exp.num}
                </span>
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h3 className="font-['Cormorant_Garamond',serif] text-[22px] font-medium text-[#0d2c5c]">
                    {exp.title}
                  </h3>
                  <span className="font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-[#c69a3f] shrink-0">
                    {exp.price}
                  </span>
                </div>
                <p className="text-[13.5px] text-[#5a6b85] font-light leading-[1.75] mb-3">
                  {exp.desc}
                </p>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#94a3b8]">
                  {exp.meta}
                </p>
              </div>
            ))}
          </div>

          {/* Buton discret pentru administrator */}
          {canCreate && (
            <div className="mt-20 pt-10 border-t border-[#e5dec9] flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#0d2c5c] text-white text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-[#163a73] transition-all"
              >
                <Plus size={15} /> Adaugă Partener în Catalog
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── BANDA CONCIERGE NAVY JOS (1:1 CU IMAGINEA) ── */}
      <section className="bg-[#0d2c5c] text-white py-16 md:py-20 px-5 sm:px-8 md:px-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#c69a3f] mb-2">
              Concierge Dedicat Oaspeților
            </p>
            <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(1.8rem,3vw,2.5rem)] font-normal leading-tight mb-2">
              Ai nevoie de o rezervare particulară sau recomandări culinare?
            </h3>
            <p className="text-[13.5px] text-white/75 font-light leading-relaxed">
              Echipa recepției Vila Casa Esy se ocupă cu plăcere de rezervarea
              mesei la restaurant, a șezlongurilor pe plajă sau a excursiilor
              private.
            </p>
          </div>

          <a
            href="/contact"
            className="inline-flex items-center gap-3 bg-[#c69a3f] hover:bg-[#b58933] text-white px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-all shrink-0"
          >
            Contactează Recepția Concierge <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ── MODAL MENIU DIGITAL COMPLET ── */}
      <AnimatePresence>
        {selectedPlace && (
          <EditorialMenuModal
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>

      {/* ── MODALE ADMIN (ADĂUGARE / EDITARE CU MENIU DIGITAL) ── */}
      {formOpen && (
        <PlaceFormModal
          initial={
            editing
              ? {
                  title: editing.title,
                  category: editing.category,
                  description: editing.description,
                  lat: editing.lat,
                  lng: editing.lng,
                  thumb_url: editing.thumb_url ?? "",
                  image_url: getPlaceImageUrl(editing),
                  badge: editing.badge ?? "",
                  rating: editing.rating,
                  phone: editing.phone ?? "",
                  schedule: editing.schedule ?? "",
                  menu:
                    Array.isArray(editing.menu) && editing.menu.length > 0
                      ? editing.menu
                      : [
                          {
                            categoryName: "Selecție Recomandată",
                            items: getPlaceMenu(editing),
                          },
                        ],
                }
              : EMPTY_FORM
          }
          isEdit={!!editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Șterge locația parteneră"
          message={`Ești sigur că vrei să ștergi „${deleteTarget.title}" din catalog?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   MODAL CARTE DE MENIU DIGITAL & TARIFE
─────────────────────────────────────────────── */
function EditorialMenuModal({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  const imageUrl = getPlaceImageUrl(place);
  const items = getPlaceMenu(place);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#071936]/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#e2e8f0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header imagine */}
        <div className="relative h-64 bg-[#0d2c5c] shrink-0">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={place.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c] via-[#0d2c5c]/50 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 bg-black/40 hover:bg-[#c69a3f] text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-6 left-8 right-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c69a3f] block mb-1">
              {place.category} · Meniu Digital & Tarife
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-[34px] sm:text-[42px] text-white leading-none">
              {place.title}
            </h2>
          </div>
        </div>

        {/* Conținut meniu */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-8 bg-[#fcfbf9]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e8e2d5] text-[12px] text-[#5a6b85]">
            <span className="inline-flex items-center gap-2 font-medium text-[#0d2c5c]">
              <Clock size={14} className="text-[#c69a3f]" />
              Program: {place.schedule || "Zilnic 10:00 – 23:00"}
            </span>
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.14em] text-[#c69a3f] hover:underline"
              >
                <Phone size={14} /> Rezervări: {place.phone}
              </a>
            )}
          </div>

          <p className="text-[14.5px] text-[#5a6b85] font-light leading-[1.8]">
            {place.description}
          </p>

          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <Utensils size={16} className="text-[#c69a3f]" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0d2c5c]">
                Selecție de Meniu & Tarife Oficiale
              </h3>
            </div>

            <div className="divide-y divide-[#e8e2d5] border-t border-b border-[#e8e2d5]">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="py-5">
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <h4 className="font-['Cormorant_Garamond',serif] text-[21px] font-medium text-[#0d2c5c]">
                      {item.name}
                    </h4>
                    <span className="font-sans text-[14px] font-bold text-[#c69a3f] shrink-0">
                      {item.price}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-[13px] text-[#64748b] font-light leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   MODAL ADMIN (CU EDITOR DE MENIU DIGITAL)
─────────────────────────────────────────────── */
function PlaceFormModal({ initial, isEdit, onClose, onSubmit }: any) {
  const [form, setForm] = useState<PlaceForm>(initial);
  const [saving, setSaving] = useState(false);

  const items: MenuItem[] = form.menu?.[0]?.items || [];

  const updateMenuItem = (
    index: number,
    field: keyof MenuItem,
    value: string,
  ) => {
    const nextItems = [...items];
    nextItems[index] = { ...nextItems[index], [field]: value };
    setForm({
      ...form,
      menu: [{ categoryName: "Selecție Recomandată", items: nextItems }],
    });
  };

  const addMenuItem = () => {
    setForm({
      ...form,
      menu: [
        {
          categoryName: "Selecție Recomandată",
          items: [
            ...items,
            { id: Date.now(), name: "", description: "", price: "" },
          ],
        },
      ],
    });
  };

  const removeMenuItem = (index: number) => {
    const nextItems = items.filter((_, i) => i !== index);
    setForm({
      ...form,
      menu: [{ categoryName: "Selecție Recomandată", items: nextItems }],
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  const fieldInput =
    "w-full py-3 px-4 bg-[#f8fafd] border border-[#e2e8f0] text-[14px] text-[#0d2c5c] outline-none focus:bg-white focus:border-[#c69a3f]";

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e1e8f0]">
          <h2 className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c]">
            {isEdit
              ? "Editează Partenerul & Meniul Digital"
              : "Adaugă Locație Parteneră"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8595aa] hover:text-[#0d2c5c]"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="p-8 space-y-5 max-h-[78vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Titlu Locație
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldInput}
                placeholder="ex: Aura Mediterranean & Seafood"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Categorie
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={fieldInput}
              >
                <option value="restaurant">Restaurant</option>
                <option value="plaja">Plajă</option>
                <option value="bar">Bar & Lounge</option>
                <option value="hotel">SPA & Hotel</option>
                <option value="atracție">Atracție / Excursie</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
              Descriere Editorială
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={`${fieldInput} min-h-[80px]`}
              placeholder="Descrierea atmosferei și a specificului locației..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Etichetă Foto (Badge)
              </label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className={fieldInput}
                placeholder="FINE DINING & MARE"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Program
              </label>
              <input
                type="text"
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                className={fieldInput}
                placeholder="12:00 – 23:30"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Telefon Rezervări
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={fieldInput}
                placeholder="+40 722..."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
              URL Imagine Principală
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className={fieldInput}
              placeholder="https://images.pexels.com/..."
            />
          </div>

          {/* Editor Meniu Digital */}
          <div className="pt-4 border-t border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c]">
                Meniu Digital / Produse & Tarife Afișate
              </label>
              <button
                type="button"
                onClick={addMenuItem}
                className="text-[11px] font-bold uppercase tracking-wider text-[#c69a3f] hover:underline"
              >
                + Adaugă Produs / Tarif
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] space-y-2"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateMenuItem(idx, "name", e.target.value)
                      }
                      placeholder="Denumire preparat / serviciu"
                      className="flex-1 py-2 px-3 bg-white border border-[#e2e8f0] text-[13px]"
                    />
                    <input
                      type="text"
                      value={item.price}
                      onChange={(e) =>
                        updateMenuItem(idx, "price", e.target.value)
                      }
                      placeholder="Preț (ex: 95 RON)"
                      className="w-36 py-2 px-3 bg-white border border-[#e2e8f0] text-[13px] font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => removeMenuItem(idx)}
                      className="px-2.5 text-red-500 hover:bg-red-50"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.description || ""}
                    onChange={(e) =>
                      updateMenuItem(idx, "description", e.target.value)
                    }
                    placeholder="Descriere scurtă ingrediente / detalii..."
                    className="w-full py-1.5 px-3 bg-white border border-[#e2e8f0] text-[12px] text-[#64748b]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[#64748b] border border-[#e2e8f0]"
            >
              Renunță
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#c69a3f] hover:bg-[#b58933] px-7 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Salvează Modificările" : "Publică în Catalog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }: any) {
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/75 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white p-8 max-w-md w-full shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c] mb-3">
          {title}
        </h3>
        <p className="text-[14px] text-[#64748b] mb-8 font-light">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[#64748b] border border-[#e2e8f0]"
          >
            Anulează
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider bg-red-600 text-white shadow hover:bg-red-700"
          >
            Șterge Definitiv
          </button>
        </div>
      </div>
    </div>
  );
}
