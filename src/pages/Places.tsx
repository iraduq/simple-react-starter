import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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

type Place = {
  id: number;
  title: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  thumb_url: string | null;
  image_url: string | null;
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
    <div className="min-h-screen bg-white relative">
      {/* Linie subtilă sus */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--border-light)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[var(--gold)]" />

      {/* ── HEADER ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-24 md:pt-36 pb-10 md:pb-14 text-center">
        <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[var(--gold)] mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-[var(--gold)]/60" />
          Explorare · Vila Casa Esy
          <span className="w-8 h-px bg-[var(--gold)]/60" />
        </p>
        <h1 className="font-[var(--font-display)] text-[clamp(2.6rem,5vw,4.2rem)] font-normal text-[var(--text-primary)] leading-[1.1] tracking-[-0.01em] mb-6">
          Locații & destinații,{" "}
          <em className="italic text-[var(--gold)]">de neratat în zonă</em>
        </h1>
        <p className="max-w-[600px] mx-auto text-[15px] text-[var(--text-secondary)] leading-[1.8] font-light">
          Descoperă cele mai bune locuri din apropiere — de la plaje liniștite
          și atracții turistice, până la restaurante cu specific local.
        </p>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 relative z-20">
        <div className="bg-white border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow-soft)] p-4 md:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--gold)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută locații, restaurante, plaje..."
              className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-soft)] border border-transparent rounded-full text-[14px] text-[var(--text-primary)] outline-none transition-all hover:bg-[var(--bg-cream)] focus:bg-white focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 placeholder:text-[var(--text-light)]"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-5 py-3.5 bg-[var(--bg-soft)] border border-transparent rounded-full text-[13px] font-semibold text-[var(--text-primary)] outline-none hover:bg-[var(--bg-cream)] focus:bg-white focus:border-[var(--gold)] cursor-pointer transition-all shrink-0"
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
              className="px-5 py-3.5 bg-[var(--bg-soft)] border border-transparent rounded-full text-[13px] font-semibold text-[var(--text-primary)] outline-none hover:bg-[var(--bg-cream)] focus:bg-white focus:border-[var(--gold)] cursor-pointer transition-all shrink-0"
            >
              <option value="rating-desc">Rating: Descrescător</option>
              <option value="rating-asc">Rating: Crescător</option>
              <option value="title">Alfabetic</option>
            </select>
            <div className="flex gap-1 p-1 bg-[var(--bg-soft)] rounded-full shrink-0 items-center border border-transparent">
              <button
                onClick={() => setView("grid")}
                className={`p-2.5 rounded-full transition-all ${
                  view === "grid"
                    ? "bg-white text-[var(--gold)] shadow-sm"
                    : "text-[var(--text-light)] hover:text-[var(--text-primary)]"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2.5 rounded-full transition-all ${
                  view === "list"
                    ? "bg-white text-[var(--gold)] shadow-sm"
                    : "text-[var(--text-light)] hover:text-[var(--text-primary)]"
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {canCreate && (
              <>
                <div className="hidden md:block w-px h-8 bg-[var(--border-light)] mx-1 shrink-0"></div>
                <button
                  onClick={openCreate}
                  className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[var(--navy)] px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-[var(--navy-soft)]"
                >
                  <Plus size={15} /> Adaugă locație
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#c69a3f]">
            <Loader2 size={32} className="animate-spin mb-4" />
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#0d2c5c]">
              Se încarcă locațiile...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f7fb] text-[#8595aa] mb-5">
              <MapPin size={28} />
            </span>
            <p className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c]">
              Nicio locație găsită
            </p>
            <p className="text-[14px] text-[#8595aa] mt-2 max-w-sm">
              Încearcă alte cuvinte cheie sau schimbă categoria pentru a găsi
              ceea ce cauți.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((place, idx) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.05,
                  ease: [0.22, 1, 0.36, 1],
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
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((place, idx) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.05,
                  ease: [0.22, 1, 0.36, 1],
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
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border-light)]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[var(--navy)]" />
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
      className="group cursor-pointer rounded-[26px] overflow-hidden border border-[#e6ecf4] bg-white shadow-[0_2px_6px_rgba(13,44,92,0.04),0_24px_60px_-30px_rgba(13,44,92,0.28)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c69a3f]/45 hover:shadow-[0_2px_8px_rgba(13,44,92,0.08),0_40px_90px_-32px_rgba(13,44,92,0.4)] flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden bg-[#f4f7fb]">
        {place.thumb_url || place.image_url ? (
          <img
            src={place.thumb_url || place.image_url}
            alt={place.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

        {place.badge && (
          <div className="absolute top-4 left-4">
            <BadgePill badge={place.badge} />
          </div>
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-sm">
          <Star size={12} className="text-[#c69a3f] fill-[#c69a3f]" />
          <span className="text-[12px] font-bold text-[#0d2c5c] pt-0.5">
            {place.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-1.5">
          {place.category}
        </span>
        <h3 className="font-['Cormorant_Garamond',serif] text-[26px] font-normal text-[#0d2c5c] leading-tight transition-colors duration-300 group-hover:text-[#c69a3f]">
          {place.title}
        </h3>
        <p className="font-sans text-[14px] leading-[1.6] font-light text-[#5a6b85] mt-3 line-clamp-3">
          {place.description}
        </p>

        {(canUpdate || canDelete) && (
          <div className="flex gap-2 mt-auto pt-6 border-t border-[#eef2f7]">
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex-1 inline-flex justify-center items-center gap-2 rounded-full border border-[#0d2c5c]/15 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] transition-all hover:border-[#0d2c5c] hover:bg-[#f0f5fc]"
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
                className="flex-1 inline-flex justify-center items-center gap-2 rounded-full border border-red-200 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-red-600 transition-all hover:bg-red-50"
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
      className="group cursor-pointer flex flex-col sm:flex-row bg-white rounded-[26px] overflow-hidden border border-[#e6ecf4] shadow-[0_2px_6px_rgba(13,44,92,0.04),0_24px_60px_-30px_rgba(13,44,92,0.28)] transition-all duration-500 hover:-translate-y-1 hover:border-[#c69a3f]/45 hover:shadow-[0_2px_8px_rgba(13,44,92,0.08),0_40px_90px_-32px_rgba(13,44,92,0.4)]"
    >
      <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#f4f7fb]">
        {place.thumb_url || place.image_url ? (
          <img
            src={place.thumb_url || place.image_url}
            alt={place.title}
            className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={32} />
          </div>
        )}
        {place.badge && (
          <div className="absolute top-4 left-4">
            <BadgePill badge={place.badge} />
          </div>
        )}
      </div>
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
            {place.category}
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <Star size={13} className="text-[#c69a3f] fill-[#c69a3f]" />
            <span className="text-[13px] font-bold text-[#0d2c5c] pt-0.5">
              {place.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <h3 className="font-['Cormorant_Garamond',serif] text-[26px] font-normal text-[#0d2c5c] leading-tight transition-colors duration-300 group-hover:text-[#c69a3f]">
          {place.title}
        </h3>
        <p className="font-sans text-[14px] leading-[1.6] font-light text-[#5a6b85] mt-2 line-clamp-2">
          {place.description}
        </p>
        {(canUpdate || canDelete) && (
          <div className="flex gap-2 mt-5">
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#0d2c5c]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] transition-all hover:border-[#0d2c5c] hover:bg-[#f0f5fc]"
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
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-red-600 transition-all hover:bg-red-50"
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.15em] uppercase shadow-md ${
        isRecommended
          ? "bg-[#c69a3f] text-white"
          : isNew
            ? "bg-emerald-600 text-white"
            : "bg-[#0d2c5c] text-white"
      }`}
    >
      <Icon size={10} />
      {badge}
    </div>
  );
}

/* ─────────────── DETAIL MODAL ─────────────── */
function PlaceDetailModal({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose} maxWidth="max-w-3xl">
      <div className="relative h-72 md:h-96 overflow-hidden bg-[#f4f7fb]">
        {place.image_url || place.thumb_url ? (
          <img
            src={place.image_url || place.thumb_url!}
            alt={place.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c]/80 to-transparent opacity-80"></div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-[#0d2c5c] transition-all"
        >
          <X size={20} />
        </button>
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 right-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
              {place.category}
            </span>
            {place.badge && <BadgePill badge={place.badge} />}
          </div>
          <h2 className="font-['Cormorant_Garamond',serif] text-[36px] md:text-[44px] text-white leading-none">
            {place.title}
          </h2>
        </div>
      </div>
      <div className="p-6 md:p-8 bg-white">
        <div className="flex items-center gap-2 mb-6">
          <Star size={18} className="text-[#c69a3f] fill-[#c69a3f]" />
          <span className="text-[16px] font-bold text-[#0d2c5c] pt-1">
            {place.rating.toFixed(1)} / 5
          </span>
          <span className="text-[#8595aa] text-[14px] font-light ml-1">
            din recenzii
          </span>
        </div>
        <p className="text-[15px] text-[#3d4f6b] leading-[1.8] font-light">
          {place.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-[#eef2f7]">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f9fafc] rounded-xl border border-[#e1e8f0]">
            <MapPin size={18} className="text-[#c69a3f]" />
            <span className="text-[13px] text-[#0d2c5c] font-semibold">
              Lat: <span className="font-light">{place.lat}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-[#f9fafc] rounded-xl border border-[#e1e8f0]">
            <MapPin size={18} className="text-[#c69a3f]" />
            <span className="text-[13px] text-[#0d2c5c] font-semibold">
              Lng: <span className="font-light">{place.lng}</span>
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
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-[26px] shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col`}
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
    "w-full py-3 px-4 bg-[#f9fafc] border border-[#e1e8f0] rounded-xl text-[14px] text-[#0d2c5c] outline-none transition-all focus:bg-white focus:border-[#c69a3f]/50 focus:shadow-[0_0_0_3px_rgba(198,154,63,0.1)] placeholder:text-[#a4b0c1]";

  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#eef2f7]">
        <h2 className="font-['Cormorant_Garamond',serif] text-[26px] text-[#0d2c5c]">
          {isEdit ? "Editează locația" : "Adaugă locație nouă"}
        </h2>
        <button
          onClick={onClose}
          className="text-[#8595aa] hover:text-[#0d2c5c] transition-colors"
        >
          <X size={22} />
        </button>
      </div>
      <form onSubmit={submit} className="p-8 space-y-5 overflow-y-auto">
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
            className={`${fieldInput} min-h-[90px] resize-y`}
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
          <FormField label="Badge">
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
        <div className="flex justify-end gap-3 pt-4 border-t border-[#eef2f7]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] text-[#3c4043] border border-[#e1e8f0] hover:bg-[#f4f7fb] transition-colors"
          >
            Renunță
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] transition-all hover:shadow-lg disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
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
      <div className="p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-['Cormorant_Garamond',serif] text-[28px] text-[#0d2c5c] leading-tight">
              {title}
            </h3>
            <p className="text-[14px] text-[#5a6b85] mt-2 leading-relaxed max-w-[280px] mx-auto">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] text-[#3c4043] border border-[#e1e8f0] hover:bg-[#f4f7fb] transition-colors"
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
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#8595aa] ml-1">
        {label}
      </span>
      {children}
    </label>
  );
}
