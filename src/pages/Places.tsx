import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  X,
  Image as ImageIcon,
  Loader2,
  Utensils,
  Phone,
  Clock,
  ArrowRight,
  Sparkles,
  Umbrella,
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
};

const EMPTY_FORM: PlaceForm = {
  title: "",
  category: "restaurant",
  description: "",
  lat: 0,
  lng: 0,
  thumb_url: "",
  image_url: "",
  badge: "",
  rating: 5.0,
  phone: "",
  schedule: "",
};

const CATEGORIES = ["toate", "restaurant", "hotel", "plaja", "bar", "atracție"];

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

/* ───────────────────────────────────────────────
   DECOR: Elemente plutitoare subtile pe fundal
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
    </div>
  );
}

const REVEAL_DELAY = 1200;

export default function Places() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("toate");
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
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
      const data = await apiFetch<Place[]>("/places");
      setPlaces(data);
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
    let result = places;
    if (category !== "toate") {
      result = result.filter((p) => p.category?.toLowerCase() === category);
    }
    return result;
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
    <div className="relative bg-white text-[#1a1a1a] overflow-hidden min-h-screen">
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

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-10 text-center [perspective:1200px]">
          <motion.p
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0}
            className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--gold)] mb-3 sm:mb-4 flex items-center justify-center gap-3"
          >
            <span className="w-6 sm:w-8 h-px bg-[var(--gold)]/60" />
            Locații Partenere & Facilități · Vila Casa Esy
            <span className="w-6 sm:w-8 h-px bg-[var(--gold)]/60" />
          </motion.p>

          <motion.h1
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.15}
            className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5.5vw,5.2rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-4 sm:mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]"
          >
            Restaurante, plaje & facilități, <br className="hidden md:block" />
            <em className="italic text-[var(--gold)]">
              recomandate pentru tine
            </em>
          </motion.h1>

          <motion.p
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.4}
            className="max-w-[620px] mx-auto text-[14px] sm:text-[17px] text-white/90 leading-[1.6] sm:leading-[1.85] font-light"
          >
            Explorează opțiunile noastre partenere, consultă meniurile digitale
            cu prețuri și bucură-te de un sejur complet în zonă.
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

      {/* ── LISTA DE LOCAȚII ── */}
      <section className="relative scroll-mt-24 py-16 md:py-24 px-5 md:px-10 z-10 bg-transparent">
        <div className="relative z-10 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[#c69a3f]">
              <Loader2 size={32} className="animate-spin mb-4" />
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#0d2c5c]">
                Se încarcă locațiile partenere...
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
                Nicio locație în această categorie
              </p>
              <p className="text-[15px] text-[#64748b] font-light">
                Selectează altă categorie sau adaugă un partener nou.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-14 md:gap-16">
              <AnimatePresence mode="popLayout">
                {filtered.map((place, idx) => {
                  const flip = idx % 2 === 1;
                  const cardCornerStyle = flip
                    ? "rounded-[36px] rounded-tr-[90px] rounded-bl-[90px]"
                    : "rounded-[36px] rounded-tl-[90px] rounded-br-[90px]";

                  const imageUrl = getPlaceImageUrl(place);

                  return (
                    <motion.article
                      key={place.id}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => setDetailPlace(place)}
                      className={`group cursor-pointer relative overflow-hidden bg-white/95 backdrop-blur border border-[#e2e8f0] shadow-[0_15px_40px_-15px_rgba(13,44,92,0.08)] hover:shadow-[0_25px_60px_-15px_rgba(13,44,92,0.14)] transition-all duration-500 p-6 md:p-10 ${cardCornerStyle}`}
                    >
                      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        {/* Imagine stânga */}
                        <div
                          className={`relative z-10 lg:col-span-7 ${
                            flip ? "lg:order-2" : ""
                          }`}
                        >
                          <div
                            className={`relative h-[280px] sm:h-[320px] md:h-[390px] overflow-hidden group bg-[#0d2c5c] shadow-md ${
                              flip
                                ? "rounded-tr-[80px] rounded-bl-[80px]"
                                : "rounded-tl-[80px] rounded-br-[80px]"
                            }`}
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={place.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white">
                                <ImageIcon size={40} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                            {place.badge && (
                              <span
                                className={`absolute top-5 z-10 rounded-full bg-white/95 backdrop-blur-md px-4 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] shadow ${
                                  flip ? "left-6" : "right-6"
                                }`}
                              >
                                {place.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Detalii dreapta */}
                        <div
                          className={`relative z-10 lg:col-span-5 flex flex-col justify-between h-full ${
                            flip ? "lg:order-1" : ""
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="inline-flex items-center gap-2.5 font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                                <span className="h-px w-6 bg-[#c69a3f]/60" />
                                {place.category}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#0d2c5c] bg-[#f8fafc] border border-[#e2e8f0] px-3.5 py-1 rounded-full">
                                <Star
                                  size={13}
                                  className="text-[#c69a3f] fill-[#c69a3f]"
                                />
                                {place.rating.toFixed(1)}
                              </span>
                            </div>

                            <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,2.8vw,2.8rem)] font-normal leading-[1.1] text-[#0d2c5c] mb-4">
                              {place.title}
                            </h3>

                            <p className="font-sans text-[14.5px] leading-[1.75] font-normal text-[#475569] mb-6 line-clamp-3">
                              {place.description}
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                                <Clock size={16} className="text-[#c69a3f]" />
                                <div>
                                  <span className="block text-[10px] uppercase font-bold text-[#94a3b8]">
                                    Program
                                  </span>
                                  <span className="text-[12.5px] font-semibold text-[#0d2c5c]">
                                    {place.schedule || "Zilnic"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9]">
                                <Phone size={16} className="text-[#c69a3f]" />
                                <div>
                                  <span className="block text-[10px] uppercase font-bold text-[#94a3b8]">
                                    Telefon
                                  </span>
                                  <span className="text-[12.5px] font-semibold text-[#0d2c5c]">
                                    {place.phone || "Disponibil"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Panou de acțiune */}
                          <div className="relative overflow-hidden rounded-3xl bg-[#0d2c5c] p-5 sm:p-6 shadow-[0_15px_35px_-10px_rgba(13,44,92,0.3)]">
                            <div className="flex items-center justify-between text-white">
                              <div>
                                <span className="block font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 mb-1">
                                  {place.category === "restaurant" ||
                                  place.category === "bar"
                                    ? "Meniu Digital & Prețuri"
                                    : "Informații & Facilități"}
                                </span>
                                <span className="font-['Cormorant_Garamond',serif] text-[22px] font-medium">
                                  {place.category === "restaurant" ||
                                  place.category === "bar"
                                    ? "Vezi Meniul cu Prețuri"
                                    : "Vezi Detalii & Tarife"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-2 bg-[#c69a3f] px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider text-white shadow">
                                  Detalii <ArrowRight size={14} />
                                </span>

                                {(canUpdate || canDelete) && (
                                  <div
                                    className="flex gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {canUpdate && (
                                      <button
                                        onClick={() => openEdit(place)}
                                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                                      >
                                        <Pencil size={14} />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        onClick={() => setDeleteTarget(place)}
                                        className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-white transition-all"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                )}
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

      {/* ── MODALE ── */}
      {detailPlace && (
        <PlaceDetailModal
          place={detailPlace}
          onClose={() => setDetailPlace(null)}
        />
      )}
      {formOpen && (
        <PlaceFormModal
          initial={
            editing
              ? {
                  ...editing,
                  thumb_url: editing.thumb_url ?? "",
                  image_url: editing.image_url ?? "",
                  badge: editing.badge ?? "",
                  phone: editing.phone ?? "",
                  schedule: editing.schedule ?? "",
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
          message={`Ești sigur că vrei să ștergi „${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────
   MODAL DETALII INTELIGENT
─────────────────────────────────────────────── */
function PlaceDetailModal({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (place.images && Array.isArray(place.images)) {
      place.images.forEach((img) => {
        const u = img.image_url || img.url;
        if (u) list.push(u);
      });
    }
    const mainThumb = getPlaceImageUrl(place);
    if (mainThumb && !list.includes(mainThumb)) {
      list.unshift(mainThumb);
    }
    return list;
  }, [place]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const activeImg = allImages[currentIndex] || "";
  const cat = place.category?.toLowerCase();

  const renderContentBycategory = () => {
    if (cat === "restaurant" || cat === "bar") {
      const sampleMenu: MenuCategory[] = place.menu || [
        {
          categoryName: "Specialități & Preparate Recomandate",
          items: [
            {
              id: 1,
              name: "File de doradă la grătar cu sos de lămâie",
              description: "Servit cu legume proaspete de sezon",
              price: "75 RON",
            },
            {
              id: 2,
              name: "Antricot de vită Black Angus",
              description: "Gătit la perfecțiune cu unt aromatizat cu ierburi",
              price: "120 RON",
            },
            {
              id: 3,
              name: "Paste cu fructe de mare proaspete",
              description: "Creveți, scoici, calamari și sos alb de vin",
              price: "68 RON",
            },
          ],
        },
        {
          categoryName: "Băuturi & Cocktailuri",
          items: [
            {
              id: 4,
              name: "Mojito Clasic / Fructul Pasiunii",
              description: "Rom, mentă proaspătă, lime, apă minerală",
              price: "34 RON",
            },
            {
              id: 5,
              name: "Vin alb sec - Domeniile Sâmburești",
              description: "Sticlă 750ml",
              price: "110 RON",
            },
          ],
        },
      ];

      return (
        <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-[#f1f5f9] pb-4">
            <Utensils className="text-[#c69a3f]" size={22} />
            <h3 className="font-['Cormorant_Garamond',serif] text-[26px] text-[#0d2c5c]">
              Meniu Digital & Prețuri
            </h3>
          </div>
          <div className="space-y-6">
            {sampleMenu.map((catItem, idx) => (
              <div key={idx}>
                <h5 className="text-[12px] font-bold uppercase tracking-widest text-[#c69a3f] mb-4">
                  {catItem.categoryName}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catItem.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] flex justify-between items-start gap-4"
                    >
                      <div>
                        <h6 className="font-semibold text-[14px] text-[#0d2c5c] mb-1">
                          {item.name}
                        </h6>
                        {item.description && (
                          <p className="text-[12px] text-[#64748b] font-light">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-[14px] text-[#c69a3f] shrink-0">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (cat === "plaja") {
      return (
        <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-[#f1f5f9] pb-4">
            <Umbrella className="text-[#c69a3f]" size={22} />
            <h3 className="font-['Cormorant_Garamond',serif] text-[26px] text-[#0d2c5c]">
              Tarife & Facilități Plajă Parteneră
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] flex justify-between items-center">
              <div>
                <h6 className="font-semibold text-[14px] text-[#0d2c5c]">
                  Șezlong standard + Umbrelă
                </h6>
                <p className="text-[12px] text-[#64748b]">
                  Tarif pe zi (include prosop)
                </p>
              </div>
              <span className="font-bold text-[14px] text-[#c69a3f]">
                50 RON
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] flex justify-between items-center">
              <div>
                <h6 className="font-semibold text-[14px] text-[#0d2c5c]">
                  Pat Baldachin VIP
                </h6>
                <p className="text-[12px] text-[#64748b]">
                  Capacitate 2-3 persoane
                </p>
              </div>
              <span className="font-bold text-[14px] text-[#c69a3f]">
                150 RON
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-[#c69a3f]" size={20} />
          <h3 className="font-['Cormorant_Garamond',serif] text-[24px] text-[#0d2c5c]">
            Informații Utile & Recomandări
          </h3>
        </div>
        <p className="text-[14.5px] text-[#64748b] font-light leading-relaxed">
          Această locație este partener oficial al vilei noastre. Oaspeții
          beneficiază de asistență la rezervare direct prin recepție.
        </p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-72 md:h-80 overflow-hidden bg-[#0d2c5c]">
          {activeImg ? (
            <img
              src={
                activeImg.startsWith("http")
                  ? activeImg
                  : `${API_URL}${activeImg}`
              }
              alt={place.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <ImageIcon size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c] via-[#0d2c5c]/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-[#c69a3f] transition-all z-30"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-6 right-6 z-20">
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-1 block">
              {place.category}
            </span>
            <h2 className="font-['Cormorant_Garamond',serif] text-[36px] md:text-[44px] text-white leading-none">
              {place.title}
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-8 bg-[#fafafc]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#e2e8f0]">
              <Star className="text-[#c69a3f] fill-[#c69a3f]" size={20} />
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#94a3b8]">
                  Rating
                </span>
                <span className="text-[14px] font-semibold text-[#0d2c5c]">
                  {place.rating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#e2e8f0]">
              <Clock className="text-[#c69a3f]" size={20} />
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#94a3b8]">
                  Program
                </span>
                <span className="text-[14px] font-semibold text-[#0d2c5c]">
                  {place.schedule || "09:00 - 23:00"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#e2e8f0]">
              <Phone className="text-[#c69a3f]" size={20} />
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#94a3b8]">
                  Contact
                </span>
                <span className="text-[14px] font-semibold text-[#0d2c5c]">
                  {place.phone || "+40 722 000 000"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#94a3b8] mb-2">
              Despre locație
            </h4>
            <p className="text-[15px] text-[#475569] font-light leading-relaxed">
              {place.description}
            </p>
          </div>

          {renderContentBycategory()}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   MODAL ADMIN (ADĂUGARE / EDITARE)
─────────────────────────────────────────────── */
function PlaceFormModal({ initial, isEdit, onClose, onSubmit }: any) {
  const [form, setForm] = useState<PlaceForm>(initial);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  const fieldInput =
    "w-full py-3.5 px-4 bg-[#f8fafd] border border-[#e2e8f0] rounded-2xl text-[14px] text-[#0d2c5c] outline-none focus:bg-white focus:border-[#c69a3f]/50";

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e1e8f0]">
          <h2 className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c]">
            {isEdit
              ? "Editează Locația Parteneră"
              : "Adaugă Locație Parteneră Nouă"}
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
          className="p-8 space-y-5 max-h-[75vh] overflow-y-auto"
        >
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
              placeholder="ex: Restaurant Terasa Malul Mării"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
              Categorie Partener
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={fieldInput}
            >
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="plaja">Plajă</option>
              <option value="bar">Bar</option>
              <option value="atracție">Atracție</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
              Descriere detaliată
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={`${fieldInput} min-h-[90px]`}
              placeholder="Detalii despre specific, atmosferă, servicii..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Telefon rezervări
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={fieldInput}
                placeholder="+40 7..."
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-1">
                Program de lucru
              </label>
              <input
                type="text"
                value={form.schedule}
                onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                className={fieldInput}
                placeholder="10:00 - 24:00"
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
          <div className="flex justify-end gap-3 pt-6 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#64748b] border border-[#e2e8f0]"
            >
              Renunță
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#c69a3f] hover:bg-[#b58933] px-7 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Salvează Modificările" : "Adaugă Partener"}
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
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c] mb-3">
          {title}
        </h3>
        <p className="text-[14px] text-[#64748b] mb-8 font-light">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#64748b] border border-[#e2e8f0]"
          >
            Anulează
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-600 text-white shadow hover:bg-red-700"
          >
            Șterge
          </button>
        </div>
      </div>
    </div>
  );
}
