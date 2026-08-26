import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutGrid,
  List,
  Star,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  X,
  Image as ImageIcon,
  Award,
  Sparkles,
  Loader2,
} from "lucide-react";
import { apiFetch, ApiError } from "../lib/api";
import { getCachedUser, type SessionUser } from "../lib/auth";
import { useToast } from "../components/Toast";
import { API_URL } from "../lib/admin";

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
};

const EMPTY_FORM: PlaceForm = {
  title: "",
  category: "",
  description: "",
  lat: 0,
  lng: 0,
  thumb_url: "",
  image_url: "",
  badge: "",
  rating: 0,
};

const CATEGORIES = [
  "plaja",
  "restaurant",
  "hotel",
  "atracție",
  "bar",
  "magazin",
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

export default function Places() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"rating-desc" | "rating-asc" | "title">(
    "rating-desc",
  );
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Place | null>(null);
  const user = getCachedUser() as NonNullable<SessionUser> | null;

  const canCreate = user?.permissions?.includes("places:create") ?? false;
  const canUpdate = user?.permissions?.includes("places:update") ?? false;
  const canDelete = user?.permissions?.includes("places:delete") ?? false;

  const loadPlaces = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Place[]>("/places");
      setPlaces(data);
    } catch (e) {
      if (e instanceof ApiError) toast(e.message, "error");
      else toast("Nu am putut încărca locațiile.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const filtered = useMemo(() => {
    let result = places;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    result = [...result].sort((a, b) => {
      if (sortBy === "rating-desc") return b.rating - a.rating;
      if (sortBy === "rating-asc") return a.rating - b.rating;
      return a.title.localeCompare(b.title);
    });
    return result;
  }, [places, search, category, sortBy]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

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
        toast("Locația a fost actualizată.", "success");
      } else {
        await apiFetch("/places", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast("Locația a fost adăugată.", "success");
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

  return (
    <div className="min-h-screen bg-[#f8fafd] relative overflow-hidden">
      {/* ── HEADER BOGAT (DARK NAVY) ── */}
      <section className="relative z-20 bg-[#0d2c5c] px-5 md:px-10 pt-32 md:pt-44 pb-32 md:pb-40 text-center overflow-hidden">
        {/* Glow Effects animate în Header */}
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

        {/* Auroră / Vortex auriu rotativ pentru senzația de viață */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0_200deg,#c69a3f_360deg)] rounded-full blur-[80px] pointer-events-none"
        />

        {/* Particule fine plutitoare (Praf de stele / Explorare) */}
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
          className="relative z-10 max-w-4xl mx-auto"
        >
          <p className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-5 flex items-center justify-center gap-4">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#c69a3f]/80" />
            Explorare · Vila Casa Esy
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#c69a3f]/80" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4.5rem)] font-normal text-white leading-[1.1] tracking-[-0.01em] mb-7 relative inline-block">
            Locații & destinații,{" "}
            {/* Shimmer effect pe textul auriu (Acum e aliniat perfect) */}
            <span className="relative inline-block">
              <em className="italic text-[#c69a3f] relative z-10">
                de neratat în zonă
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
            Descoperă cele mai bune locuri din apropiere — de la plaje liniștite
            și atracții turistice, până la restaurante cu specific local.
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

      {/* ── AMBIENT BACKGROUND ORBS (CONTENT) ── */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-[#c69a3f]/5 rounded-full blur-[100px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[-10%] w-[800px] h-[800px] bg-[#0d2c5c]/5 rounded-full blur-[120px] pointer-events-none z-0"
      />

      {/* ── SVG WATERMARKS (TEMATICĂ EXPLORARE / HARTĂ) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mt-[400px]">
        {/* 1. Hartă cu Pin (AURIU) - Dreapta Sus */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] right-[2%] w-[220px] h-[220px] opacity-[0.06] md:opacity-[0.08]"
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            stroke="#c69a3f"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M30 60 L80 40 L140 60 L140 160 L80 140 L30 160 Z"
              fill="#c69a3f"
              fillOpacity="0.05"
            />
            <path d="M80 40 L80 140 M140 60 L140 160" strokeOpacity="0.6" />
            {/* Location Pin */}
            <path
              d="M120 70 C120 50, 150 50, 150 70 C150 90, 135 110, 135 110 C135 110, 120 90, 120 70 Z"
              fill="#c69a3f"
              fillOpacity="0.1"
            />
            <circle cx="135" cy="70" r="6" />
          </svg>
        </motion.div>

        {/* 2. Binoclu (NAVY) - Centru Stânga */}
        <motion.div
          animate={{ rotate: [-3, 3, -3], scale: [1, 1.02, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[35%] left-[2%] w-[280px] h-[280px] opacity-[0.03] md:opacity-[0.04]"
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            stroke="#122F5B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M40 70 L60 150 L90 150 L80 70 Z"
              fill="#122F5B"
              fillOpacity="0.05"
            />
            <path
              d="M160 70 L140 150 L110 150 L120 70 Z"
              fill="#122F5B"
              fillOpacity="0.05"
            />
            {/* Lents */}
            <ellipse cx="60" cy="150" rx="15" ry="5" />
            <ellipse cx="140" cy="150" rx="15" ry="5" />
            {/* Bridge */}
            <path d="M85 100 L115 100 M83 120 L117 120" strokeWidth="6" />
            {/* Eye pieces */}
            <path d="M45 70 L75 70 M125 70 L155 70" strokeWidth="8" />
          </svg>
        </motion.div>

        {/* 3. Balon cu aer cald (NAVY) - Stânga Jos */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[5%] left-[5%] w-[250px] h-[250px] opacity-[0.03] md:opacity-[0.04]"
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            stroke="#122F5B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M100 20 C150 20, 150 80, 100 130 C50 80, 50 20, 100 20 Z"
              fill="#122F5B"
              fillOpacity="0.05"
            />
            <path
              d="M100 20 L100 130 M70 40 Q100 130 100 130 M130 40 Q100 130 100 130"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <path
              d="M85 150 L115 150 L110 170 L90 170 Z"
              fill="#122F5B"
              fillOpacity="0.1"
            />
            <path d="M90 130 L85 150 M110 130 L115 150" strokeWidth="2" />
            {/* Clouds */}
            <path
              d="M20 100 Q40 80 60 100 T100 100 M140 60 Q160 40 180 60 T220 60"
              strokeWidth="2"
              strokeOpacity="0.3"
            />
          </svg>
        </motion.div>

        {/* 4. Busolă terestră (AURIU+NAVY) - Dreapta Jos */}
        <div
          className="absolute bottom-[15%] right-[-5%] w-[400px] h-[400px] opacity-[0.05]"
          style={{ animation: "spin 200s linear infinite" }}
        >
          <svg viewBox="0 0 200 200" fill="none">
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#c69a3f"
              strokeWidth="2"
              strokeDasharray="5 10"
            />
            <circle cx="100" cy="100" r="65" stroke="#122F5B" strokeWidth="1" />
            <path
              d="M100 10 L110 90 L190 100 L110 110 L100 190 L90 110 L10 100 L90 90 Z"
              fill="#122F5B"
              fillOpacity="0.2"
            />
            <path
              d="M100 30 L105 95 L170 100 L105 105 L100 170 L95 105 L30 100 L95 95 Z"
              fill="#c69a3f"
              fillOpacity="0.4"
            />
            <circle cx="100" cy="100" r="8" fill="#122F5B" />
          </svg>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 relative z-20 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border border-[#e1e8f0] rounded-2xl md:rounded-full shadow-[0_8px_30px_rgba(13,44,92,0.06)] p-3 md:p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[#c69a3f]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută locații, atracții, restaurante..."
              className="w-full pl-12 pr-4 py-3 bg-[#f8fafd] border border-transparent rounded-full text-[14px] text-[#0d2c5c] outline-none transition-all hover:bg-[#f0f5fc] focus:bg-white focus:border-[#c69a3f]/40 focus:ring-2 focus:ring-[#c69a3f]/10 placeholder:text-[#8595aa]"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-5 py-3 bg-[#f8fafd] border border-transparent rounded-full text-[13px] font-semibold text-[#0d2c5c] outline-none hover:bg-[#f0f5fc] focus:bg-white focus:border-[#c69a3f]/40 focus:ring-2 focus:ring-[#c69a3f]/10 cursor-pointer transition-all shrink-0"
            >
              <option value="all">Toate categoriile</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-5 py-3 bg-[#f8fafd] border border-transparent rounded-full text-[13px] font-semibold text-[#0d2c5c] outline-none hover:bg-[#f0f5fc] focus:bg-white focus:border-[#c69a3f]/40 focus:ring-2 focus:ring-[#c69a3f]/10 cursor-pointer transition-all shrink-0"
            >
              <option value="rating-desc">Rating: Descrescător</option>
              <option value="rating-asc">Rating: Crescător</option>
              <option value="title">Alfabetic</option>
            </select>

            <div className="flex gap-1 p-1 bg-[#f8fafd] rounded-full shrink-0 items-center border border-transparent">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-full transition-all ${
                  view === "grid"
                    ? "bg-white text-[#c69a3f] shadow-sm border border-[#e1e8f0]"
                    : "text-[#8595aa] hover:text-[#0d2c5c]"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-full transition-all ${
                  view === "list"
                    ? "bg-white text-[#c69a3f] shadow-sm border border-[#e1e8f0]"
                    : "text-[#8595aa] hover:text-[#0d2c5c]"
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {canCreate && (
              <>
                <div className="hidden md:block w-px h-8 bg-[#e1e8f0] mx-1 shrink-0"></div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#c69a3f]">
            <Loader2 size={32} className="animate-spin mb-4" />
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#0d2c5c]">
              Se încarcă locațiile...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white border border-[#e1e8f0] shadow-sm text-[#8595aa] mb-5">
              <MapPin size={28} />
            </span>
            <p className="font-['Cormorant_Garamond',serif] text-[32px] text-[#0d2c5c] leading-tight">
              Nicio locație găsită
            </p>
            <p className="text-[15px] text-[#5a6b85] mt-2 max-w-sm font-light">
              Încearcă alte cuvinte cheie sau schimbă categoria pentru a găsi
              ceea ce cauți.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((place, idx) => (
                <motion.div
                  layout
                  key={place.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: (idx % 3) * 0.08,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                >
                  <PlaceCard
                    place={place}
                    onClick={() => setDetailPlace(place)}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEdit={() => openEdit(place)}
                    onDelete={() => setDeleteTarget(place)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((place, idx) => (
                <motion.div
                  layout
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: (idx % 5) * 0.05,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                >
                  <PlaceRow
                    place={place}
                    onClick={() => setDetailPlace(place)}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEdit={() => openEdit(place)}
                    onDelete={() => setDeleteTarget(place)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
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
          title="Șterge locația"
          message={`Ești sigur că vrei să ștergi „${deleteTarget.title}"? Această acțiune nu poate fi anulată.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Linie subtilă jos */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border-light)] z-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[var(--gold)] z-20" />
    </div>
  );
}

/* ─────────────── PLACE CARD (grid) ─────────────── */
function PlaceCard({
  place,
  onClick,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: any) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer relative rounded-[4px] overflow-hidden border border-[#e1e8f0] bg-white shadow-[0_2px_20px_rgba(13,44,92,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(13,44,92,0.13)] flex flex-col h-full"
    >
      {/* Linie aurie subțire sus, apare la hover */}
      <span className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#c69a3f] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center z-30" />

      <div className="relative h-[250px] overflow-hidden bg-[#0d2c5c]">
        {getPlaceImageUrl(place) ? (
          <img
            src={getPlaceImageUrl(place)}
            alt={place.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa] bg-[#f8fafd]">
            <ImageIcon size={32} strokeWidth={1.4} />
          </div>
        )}

        {/* Voal navy elegant */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c]/85 via-[#0d2c5c]/10 to-transparent z-10" />

        {place.badge && (
          <div className="absolute top-4 left-4 z-20">
            <BadgePill badge={place.badge} />
          </div>
        )}

        {/* Rating discret, editorial */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 shadow-[0_4px_14px_rgba(13,44,92,0.18)]">
          <Star size={12} className="text-[#c69a3f] fill-[#c69a3f]" />
          <span className="text-[11.5px] font-semibold text-[#0d2c5c] pt-[1px]">
            {Number(place.rating || 0).toFixed(1)}
          </span>
        </div>

        {/* Categorie + titlu peste imagine */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-7 pb-6">
          <span className="flex items-center gap-2.5 text-[9.5px] font-bold tracking-[0.22em] uppercase text-[#e6c67c] mb-2">
            <span className="w-6 h-px bg-[#c69a3f]/70" />
            {place.category}
          </span>
          <h3 className="font-['Cormorant_Garamond',serif] text-[27px] md:text-[29px] font-normal text-white leading-[1.15]">
            {place.title}
          </h3>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-1 relative z-10">
        <p className="font-sans text-[14.5px] leading-[1.8] font-light text-[#5a6b85] line-clamp-3">
          {place.description}
        </p>

        <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d2c5c] transition-colors duration-300 group-hover:text-[#c69a3f]">
          Descoperă locația
          <span className="w-6 h-px bg-current transition-all duration-500 group-hover:w-10" />
        </span>

        {(canUpdate || canDelete) && (
          <div className="flex gap-2 mt-auto pt-6 mt-6 border-t border-[#eef2f7]">
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex-1 inline-flex justify-center items-center gap-2 rounded-full border border-[#0d2c5c]/15 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] transition-all hover:border-[#c69a3f] hover:bg-[#c69a3f]/5"
              >
                <Pencil size={12} /> Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex-1 inline-flex justify-center items-center gap-2 rounded-full border border-red-200 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-red-600 transition-all hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 size={12} /> Șterge
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}


/* ─────────────── PLACE ROW (list) ─────────────── */
function PlaceRow({
  place,
  onClick,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: any) {
  return (
    <article
      onClick={onClick}
      className="group relative cursor-pointer flex flex-col sm:flex-row bg-white rounded-[26px] overflow-hidden border border-[#e1e8f0] shadow-[0_4px_12px_rgba(13,44,92,0.02)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(13,44,92,0.08)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 [box-shadow:inset_0_0_0_1.5px_rgba(198,154,63,0.3)] z-20" />

      <div className="relative w-full sm:w-72 h-56 sm:h-auto shrink-0 overflow-hidden bg-[#0d2c5c]">
        {getPlaceImageUrl(place) ? (
          <div className="w-full h-full relative overflow-hidden">
            <motion.img
              src={getPlaceImageUrl(place)}
              alt={place.title}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#0d2c5c]/10 mix-blend-overlay" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa] bg-[#f8fafd]">
            <ImageIcon size={32} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
          <motion.div
            initial={{ x: "-150%" }}
            whileHover={{ x: "200%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
          />
        </div>

        {place.badge && (
          <div className="absolute top-4 left-4 z-20">
            <BadgePill badge={place.badge} />
          </div>
        )}
      </div>

      <div className="flex-1 p-7 md:p-8 flex flex-col justify-center relative z-10">
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
            {place.category}
          </span>
          <div className="flex items-center gap-1.5 ml-auto bg-[#f8fafd] px-2.5 py-1 rounded-full border border-[#e1e8f0]">
            <Star
              size={12}
              className="text-[#c69a3f] fill-[#c69a3f] animate-[pulse_3s_ease-in-out_infinite]"
            />
            <span className="text-[12px] font-bold text-[#0d2c5c] pt-0.5">
              {place.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <h3 className="font-['Cormorant_Garamond',serif] text-[28px] font-normal text-[#0d2c5c] leading-tight transition-colors duration-300 group-hover:text-[#c69a3f]">
          {place.title}
        </h3>
        <p className="font-sans text-[14.5px] leading-[1.65] font-light text-[#5a6b85] mt-3 line-clamp-2">
          {place.description}
        </p>

        {(canUpdate || canDelete) && (
          <div className="flex gap-2 mt-6">
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#e1e8f0] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] transition-all hover:border-[#c69a3f] hover:bg-[#c69a3f]/5"
              >
                <Pencil size={12} /> Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-red-100 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-red-600 transition-all hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 size={12} /> Șterge
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─────────────── BADGE ─────────────── */
function BadgePill({ badge }: { badge: string }) {
  const isRecommended = badge.toLowerCase() === "recomandat";
  const isNew = badge.toLowerCase() === "nou";
  const Icon = isRecommended ? Award : isNew ? Sparkles : Award;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[9px] font-bold tracking-[0.18em] uppercase shadow-md border ${
        isRecommended
          ? "bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#0d2c5c] border-[#fdfcf9]/30"
          : isNew
            ? "bg-emerald-600 text-white border-emerald-500/50"
            : "bg-[#0d2c5c] text-white border-white/20"
      }`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {badge}
    </div>
  );
}

/* ─────────────── DETAIL MODAL ─────────────── */
/* ─────────────── DETAIL MODAL (Cu butoane stânga/dreapta pe poza principală) ─────────────── */
function PlaceDetailModal({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  // Colectăm toate imaginile disponibile
  const allImages = useMemo(() => {
    const list = [];
    if (place.images && Array.isArray(place.images)) {
      place.images.forEach((img) => {
        const u = img.image_url || img.url;
        if (u) list.push(u);
      });
    }
    const mainThumb =
      place.thumb || place.image_url || place.thumb_url || place.img;
    if (mainThumb && !list.includes(mainThumb)) {
      list.unshift(mainThumb);
    }
    return list;
  }, [place]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const activeImg = allImages[currentIndex] || "";

  // Funcții de navigare stânga / dreapta
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-3xl">
      {/* ── Imaginea principală cu butoane de navigare ── */}
      <div className="relative h-72 md:h-96 overflow-hidden bg-[#0d2c5c] group">
        {activeImg ? (
          <img
            src={
              activeImg.startsWith("http")
                ? activeImg
                : `${API_URL}${activeImg}`
            }
            alt={place.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c] via-[#0d2c5c]/40 to-transparent opacity-90"></div>

        {/* Buton Închidere X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] hover:scale-110 transition-all z-30"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Butoane Stânga / Dreapta (Apar la hover sau sunt vizibile pe mobil) */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] transition-all z-30"
              title="Imaginea anterioară"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] transition-all z-30"
              title="Imaginea următoare"
            >
              ›
            </button>

            {/* Indicator număr imagini (ex: 1 / 4) */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wider z-30">
              {currentIndex + 1} / {allImages.length}
            </div>
          </>
        )}

        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 right-6 z-20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
              {place.category}
            </span>
            {place.badge && <BadgePill badge={place.badge} />}
          </div>
          <h2 className="font-['Cormorant_Garamond',serif] text-[40px] md:text-[52px] text-white leading-none">
            {place.title}
          </h2>
        </div>
      </div>

      <div className="p-6 md:p-10 bg-white overflow-y-auto max-h-[calc(90vh-24rem)]">
        {/* ── Galerie Thumbnails cu sincronizare ── */}
        {allImages.length > 1 && (
          <div className="mb-8">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8595aa] block mb-3">
              Galerie foto ({allImages.length})
            </span>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar cursor-pointer">
              {allImages.map((url, idx) => {
                const fullUrl = url.startsWith("http")
                  ? url
                  : `${API_URL}${url}`;
                const isSelected = currentIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-[#c69a3f] scale-105 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={fullUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-7 bg-[#f8fafd] border border-[#e1e8f0] w-fit px-4 py-2 rounded-full">
          <Star size={16} className="text-[#c69a3f] fill-[#c69a3f]" />
          <span className="text-[15px] font-bold text-[#0d2c5c] pt-0.5">
            {place.rating.toFixed(1)}{" "}
            <span className="font-medium text-[#8595aa]">/ 5</span>
          </span>
          <span className="text-[#8595aa] text-[13px] font-light ml-1 pt-0.5">
            (recenzii oaspeți)
          </span>
        </div>

        <p className="text-[15.5px] text-[#3d4f6b] leading-[1.85] font-light">
          {place.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-[#e1e8f0]">
          <div className="flex items-center gap-3 px-5 py-4 bg-[#f8fafd] rounded-xl border border-[#e1e8f0] flex-1">
            <MapPin size={20} className="text-[#c69a3f]" strokeWidth={1.5} />
            <span className="text-[13px] text-[#0d2c5c] font-semibold tracking-wide uppercase">
              Latitudine:{" "}
              <span className="font-light text-[#5a6b85] ml-1">
                {place.lat}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 bg-[#f8fafd] rounded-xl border border-[#e1e8f0] flex-1">
            <MapPin size={20} className="text-[#c69a3f]" strokeWidth={1.5} />
            <span className="text-[13px] text-[#0d2c5c] font-semibold tracking-wide uppercase">
              Longitudine:{" "}
              <span className="font-light text-[#5a6b85] ml-1">
                {place.lng}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────── MODALS (Form, Confirm, Shell) ─────────────── */

function Modal({ children, onClose, maxWidth }: any) {
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-[26px] shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden animate-[scaleIn_0.3s_ease-out] flex flex-col border border-white/20`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

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
    "w-full py-3.5 px-4 bg-[#f8fafd] border border-[#e1e8f0] rounded-xl text-[14px] text-[#0d2c5c] outline-none transition-all focus:bg-white focus:border-[#c69a3f]/50 focus:ring-2 focus:ring-[#c69a3f]/10 placeholder:text-[#a4b0c1]";

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <div className="flex items-center justify-between px-8 py-6 border-b border-[#e1e8f0]">
        <h2 className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c] leading-none">
          {isEdit ? "Editează locația" : "Adaugă locație nouă"}
        </h2>
        <button
          onClick={onClose}
          className="text-[#8595aa] hover:text-[#0d2c5c] transition-colors p-1"
        >
          <X size={22} strokeWidth={1.5} />
        </button>
      </div>
      <form
        onSubmit={submit}
        className="p-8 space-y-6 overflow-y-auto hide-scrollbar"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Titlu">
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={fieldInput}
              placeholder="ex: Plaja Mamaia Nord"
            />
          </FormField>
          <FormField label="Categorie">
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={fieldInput}
            >
              <option value="">Selectează…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Descriere">
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${fieldInput} min-h-[100px] resize-y`}
            placeholder="Descriere scurtă a locației…"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-5">
          <FormField label="Latitudine">
            <input
              type="number"
              step="any"
              required
              value={form.lat}
              onChange={(e) =>
                setForm({ ...form, lat: parseFloat(e.target.value) })
              }
              className={fieldInput}
              placeholder="44.2488"
            />
          </FormField>
          <FormField label="Longitudine">
            <input
              type="number"
              step="any"
              required
              value={form.lng}
              onChange={(e) =>
                setForm({ ...form, lng: parseFloat(e.target.value) })
              }
              className={fieldInput}
              placeholder="28.6653"
            />
          </FormField>
        </div>
        <FormField label="URL Thumbnail">
          <input
            type="url"
            value={form.thumb_url}
            onChange={(e) => setForm({ ...form, thumb_url: e.target.value })}
            className={fieldInput}
            placeholder="https://…"
          />
        </FormField>
        <FormField label="URL Imagine (high-res)">
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className={fieldInput}
            placeholder="https://…"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-5">
          <FormField label="Badge (Opțional)">
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className={fieldInput}
              placeholder="Recomandat / Nou"
            />
          </FormField>
          <FormField label="Rating (0-5)">
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              required
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: parseFloat(e.target.value) })
              }
              className={fieldInput}
            />
          </FormField>
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t border-[#e1e8f0] mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] text-[#3d4f6b] border border-[#e1e8f0] hover:bg-[#f8fafd] hover:border-[#0d2c5c] hover:text-[#0d2c5c] transition-all"
          >
            Renunță
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] transition-all hover:shadow-[0_8px_20px_-8px_rgba(198,154,63,0.8)] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            {isEdit ? "Salvează" : "Adaugă"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }: any) {
  return (
    <Modal onClose={onCancel} maxWidth="max-w-md">
      <div className="p-8 md:p-10">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 shadow-sm">
            <Trash2 size={26} className="text-red-500" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] leading-tight mb-2">
              {title}
            </h3>
            <p className="text-[14.5px] text-[#5a6b85] leading-relaxed max-w-[280px] mx-auto font-light">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-10">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] text-[#3d4f6b] border border-[#e1e8f0] hover:bg-[#f8fafd] hover:border-[#0d2c5c] transition-all"
          >
            Anulează
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-red-700 hover:shadow-lg"
          >
            <Trash2 size={14} /> Șterge definitiv
          </button>
        </div>
      </div>
    </Modal>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8595aa] ml-1">
        {label}
      </span>
      {children}
    </label>
  );
}
