import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
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
  Loader as Loader2,
  Waves,
  UtensilsCrossed,
  Sun,
  Hotel,
  Wine,
  ShoppingBag,
  Compass,
  ArrowUpRight,
  MapPinned,
  SlidersHorizontal,
} from "lucide-react";
import { apiFetch, ApiError } from "../lib/api";
import { getCachedUser, type SessionUser } from "../lib/auth";
import { useToast } from "../components/Toast";
import { usePreviewMode } from "../hooks/usePreviewMode";

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

const CATEGORIES = ["plaja", "restaurant", "hotel", "atracție", "bar", "magazin"] as const;

const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  all: { label: "Toate", icon: Compass },
  plaja: { label: "Plajă", icon: Waves },
  restaurant: { label: "Restaurant", icon: UtensilsCrossed },
  hotel: { label: "Hotel", icon: Hotel },
  atracție: { label: "Atracție", icon: MapPinned },
  bar: { label: "Bar", icon: Wine },
  magazin: { label: "Magazin", icon: ShoppingBag },
};

export default function Places() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"rating-desc" | "rating-asc" | "title">("rating-desc");
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Place | null>(null);
  const user = getCachedUser() as NonNullable<SessionUser> | null;

  const preview = usePreviewMode();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const canCreate = hydrated && (preview || (user?.permissions?.includes("places:create") ?? false));
  const canUpdate = hydrated && (preview || (user?.permissions?.includes("places:update") ?? false));
  const canDelete = hydrated && (preview || (user?.permissions?.includes("places:delete") ?? false));

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
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Header tematic — litoral */}
      <div
        className="relative overflow-hidden text-white bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(13,44,92,0.88) 0%, rgba(13,44,92,0.55) 60%, rgba(198,154,63,0.35) 100%), url(https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920&h=900&fit=crop)",
        }}
      >
        <div className="relative z-[2] max-w-[1240px] mx-auto px-6 lg:px-10 pt-16 pb-28">
          <p className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#e6c579] mb-3">
            <span className="inline-block w-8 h-px bg-[#e6c579]/60" />
            Descoperă Eforie Nord
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.08] font-medium">
            Ghidul Zonei <em className="not-italic italic text-[#e6c579]">Eforie Nord</em>
          </h1>
          <p className="text-[15px] text-white/80 mt-4 max-w-[600px] leading-relaxed font-light">
            Plaje cu apă limpede, terase cu vedere la mare și atracții la câțiva pași de vilă — selecția noastră pentru un sejur fără compromisuri.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {[
              { icon: Waves, label: "Plaje la 3 min" },
              { icon: UtensilsCrossed, label: "Terase & restaurante" },
              { icon: Sun, label: "Atracții de vacanță" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-[12px] tracking-[0.03em] text-white/90 ring-1 ring-white/25 backdrop-blur-sm"
              >
                <Icon size={13} className="text-[#e6c579]" />
                {label}
              </span>
            ))}
          </div>

          {canCreate && (
            <button
              onClick={openCreate}
              className="mt-7 inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-[#d8ae52] to-[#b8882e] hover:-translate-y-px text-white text-[13px] font-bold uppercase tracking-[0.08em] rounded-[12px] shadow-[0_10px_24px_-10px_rgba(198,154,63,0.9)] transition-all duration-300"
            >
              <Plus size={16} /> Adaugă locație
            </button>
          )}
        </div>

        {/* val decorativ */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[70px] md:h-[90px] pointer-events-none z-[1] block"
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            transform="translate(0, 110) scale(1, -1)"
            d="M0 0 L1440 0 L1440 55 C1260 90, 1080 35, 900 58 S540 96, 360 60 S120 28, 0 62 Z"
            fill="#c69a3f"
            opacity="0.3"
          />
          <path
            transform="translate(0, 110) scale(1, -1)"
            d="M0 0 L1440 0 L1440 42 C1260 76, 1080 24, 900 46 S540 86, 360 48 S120 18, 0 52 Z"
            fill="#f7f9fc"
          />
        </svg>
      </div>

      {/* Toolbar */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 -mt-10 relative z-10">
        <div className="bg-white border border-[#e6ecf3] rounded-[20px] shadow-[0_20px_50px_-18px_rgba(13,44,92,0.28)] overflow-hidden">
          <div className="p-5 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1 group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8595aa] group-focus-within:text-[#c69a3f] transition-colors"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută plaje, restaurante, atracții…"
                className="w-full pl-12 pr-10 py-3 border border-[#e1e8f0] rounded-[12px] text-[14px] outline-none transition-all focus:border-[#c69a3f] focus:shadow-[0_0_0_3px_rgba(198,154,63,0.12)] placeholder:text-[#a4b0c1]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8595aa] hover:text-[#0d2c5c] hover:bg-[#f4f7fb] transition-colors"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
              <div className="relative">
                <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8595aa] pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="pl-9 pr-8 py-3 border border-[#e1e8f0] rounded-[12px] text-[13px] text-[#3c4043] bg-white outline-none focus:border-[#c69a3f] cursor-pointer appearance-none"
                >
                  <option value="rating-desc">Rating: descrescător</option>
                  <option value="rating-asc">Rating: crescător</option>
                  <option value="title">Alfabetic</option>
                </select>
              </div>
              <div className="flex gap-1 p-1 bg-[#f4f7fb] rounded-[12px] border border-[#e1e8f0]">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2.5 rounded-[10px] transition-all ${
                    view === "grid"
                      ? "bg-white text-[#0d2c5c] shadow-sm ring-1 ring-[#e1e8f0]"
                      : "text-[#8595aa] hover:text-[#0d2c5c]"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2.5 rounded-[10px] transition-all ${
                    view === "list"
                      ? "bg-white text-[#0d2c5c] shadow-sm ring-1 ring-[#e1e8f0]"
                      : "text-[#8595aa] hover:text-[#0d2c5c]"
                  }`}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Pastile categorii */}
          <div className="px-5 pb-5 pt-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#5a6b85] shrink-0">
                Filtrează după:
              </span>
              {[{ value: "all", label: "Toate", icon: Compass }, ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_META[c].label, icon: CATEGORY_META[c].icon }))].map(
                ({ value, label, icon: Icon }) => {
                  const active = category === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setCategory(value)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] transition-all duration-200 ${
                        active
                          ? "border-[#c69a3f] bg-gradient-to-r from-[#c69a3f] to-[#d8ae52] text-white shadow-[0_6px_16px_-8px_rgba(198,154,63,0.9)]"
                          : "border-[#e1e8f0] bg-white text-[#3c4043] hover:border-[#c69a3f] hover:text-[#0d2c5c]"
                      }`}
                    >
                      <Icon size={13} className={active ? "text-white" : "text-[#c69a3f]"} />
                      {label}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-12">
        {loading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState onClear={() => { setSearch(""); setCategory("all"); }} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[13px] text-[#5a6b85]">
                <span className="font-semibold text-[#0d2c5c]">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "locație găsită" : "locații găsite"}
              </p>
              <div className="hidden sm:flex items-center gap-2 text-[12px] text-[#8595aa]">
                <Star size={12} className="text-[#c69a3f] fill-[#c69a3f]" />
                <span>Rating bazat pe experiența oaspeților noștri</span>
              </div>
            </div>
            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {filtered.map((place, idx) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onClick={() => setDetailPlace(place)}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEdit={() => openEdit(place)}
                    onDelete={() => setDeleteTarget(place)}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((place, idx) => (
                  <PlaceRow
                    key={place.id}
                    place={place}
                    onClick={() => setDetailPlace(place)}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEdit={() => openEdit(place)}
                    onDelete={() => setDeleteTarget(place)}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {detailPlace && (
        <PlaceDetailModal place={detailPlace} onClose={() => setDetailPlace(null)} />
      )}

      {/* Create/Edit Modal */}
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

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Șterge locația"
          message={`Ești sigur că vrei să ștergi „${deleteTarget.title}"? Această acțiune nu poate fi anulată.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

/* ─────────────── SKELETON GRID ─────────────── */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#e6ecf3] rounded-[16px] overflow-hidden shadow-[0_4px_20px_rgba(13,44,92,0.04)]"
        >
          <div className="h-48 bg-[#eef2f7] animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-20 bg-[#eef2f7] rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-[#eef2f7] rounded animate-pulse" />
            <div className="h-3 w-full bg-[#eef2f7] rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-[#eef2f7] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────── EMPTY STATE ─────────────── */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-24 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-16 h-16 mx-auto rounded-full bg-[#f4f7fb] flex items-center justify-center text-[#c69a3f] mb-5">
        <Search size={28} />
      </div>
      <p className="font-['Cormorant_Garamond',serif] text-[26px] text-[#0d2c5c]">
        Nicio locație găsită
      </p>
      <p className="text-[13px] text-[#8595aa] mt-2 max-w-[360px] mx-auto leading-relaxed">
        Încearcă alte cuvinte cheie sau schimbă categoria pentru a descoperi locuri noi.
      </p>
      <button
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-[10px] hover:border-[#c69a3f] hover:text-[#c69a3f] transition-colors"
      >
        <X size={14} /> Resetează filtrele
      </button>
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
  style,
}: {
  place: Place;
  onClick: () => void;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  style?: React.CSSProperties;
}) {
  const Meta = CATEGORY_META[place.category] ?? { label: place.category, icon: MapPin };
  const Icon = Meta.icon;

  return (
    <article
      onClick={onClick}
      style={style}
      className="group cursor-pointer bg-white border border-[#e6ecf3] rounded-[18px] overflow-hidden shadow-[0_4px_22px_rgba(13,44,92,0.04)] hover:shadow-[0_14px_44px_rgba(13,44,92,0.1)] hover:border-[#c69a3f]/40 transition-all duration-300 hover:-translate-y-1 animate-[slideUp_0.4s_ease-out_both]"
    >
      <div className="relative h-52 overflow-hidden bg-[#f4f7fb]">
        {place.thumb_url ? (
          <img
            src={place.thumb_url}
            alt={place.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={36} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {place.badge && <BadgePill badge={place.badge} />}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-sm">
          <Star size={13} className="text-[#c69a3f] fill-[#c69a3f]" />
          <span className="text-[12px] font-bold text-[#0d2c5c]">{place.rating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0d2c5c] text-[12px] font-bold rounded-full shadow-lg">
            Vezi detalii <ArrowUpRight size={13} className="text-[#c69a3f]" />
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Icon size={13} className="text-[#c69a3f]" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
            {Meta.label}
          </span>
        </div>
        <h3 className="font-['Cormorant_Garamond',serif] text-[22px] text-[#0d2c5c] leading-tight">
          {place.title}
        </h3>
        <div className="w-10 h-0.5 bg-[#c69a3f] mt-3 mb-2 rounded-full opacity-60" />
        <p className="text-[13px] text-[#5a6b85] line-clamp-2">{place.description}</p>
        {(canUpdate || canDelete) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-[#eef2f7]">
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-lg hover:border-[#c69a3f] hover:text-[#c69a3f] transition-colors"
              >
                <Pencil size={13} /> Editează
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Șterge
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
  style,
}: {
  place: Place;
  onClick: () => void;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  style?: React.CSSProperties;
}) {
  const Meta = CATEGORY_META[place.category] ?? { label: place.category, icon: MapPin };
  const Icon = Meta.icon;

  return (
    <article
      onClick={onClick}
      style={style}
      className="group cursor-pointer flex gap-5 bg-white border border-[#e6ecf3] rounded-[16px] overflow-hidden shadow-[0_4px_22px_rgba(13,44,92,0.04)] hover:shadow-[0_12px_36px_rgba(13,44,92,0.08)] hover:border-[#c69a3f]/40 transition-all duration-300 animate-[slideUp_0.4s_ease-out_both]"
    >
      <div className="relative w-44 h-36 shrink-0 overflow-hidden bg-[#f4f7fb]">
        {place.thumb_url ? (
          <img
            src={place.thumb_url}
            alt={place.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={28} />
          </div>
        )}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#c69a3f] to-[#d8ae52] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex-1 py-5 pr-5 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-1">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
            <Icon size={12} /> {Meta.label}
          </span>
          {place.badge && <BadgePill badge={place.badge} small />}
          <div className="flex items-center gap-1 ml-auto">
            <Star size={13} className="text-[#c69a3f] fill-[#c69a3f]" />
            <span className="text-[12px] font-bold text-[#0d2c5c]">{place.rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="font-['Cormorant_Garamond',serif] text-[21px] text-[#0d2c5c] leading-tight">
          {place.title}
        </h3>
        <p className="text-[13px] text-[#5a6b85] mt-1.5 line-clamp-1">{place.description}</p>
        {(canUpdate || canDelete) && (
          <div className="flex gap-2 mt-3">
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-lg hover:border-[#c69a3f] hover:text-[#c69a3f] transition-colors"
              >
                <Pencil size={13} /> Editează
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Șterge
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─────────────── BADGE ─────────────── */
function BadgePill({ badge, small }: { badge: string; small?: boolean }) {
  const isRecommended = badge.toLowerCase() === "recomandat";
  const isNew = badge.toLowerCase() === "nou";
  const Icon = isRecommended ? Award : isNew ? Sparkles : Award;
  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${
        isRecommended
          ? "bg-[#c69a3f] text-white"
          : isNew
            ? "bg-emerald-500 text-white"
            : "bg-[#0d2c5c] text-white"
      } ${small ? "static" : "absolute top-3 left-3"}`}
    >
      <Icon size={11} />
      {badge}
    </div>
  );
}

/* ─────────────── DETAIL MODAL ─────────────── */
function PlaceDetailModal({ place, onClose }: { place: Place; onClose: () => void }) {
  const Meta = CATEGORY_META[place.category] ?? { label: place.category, icon: MapPin };
  const Icon = Meta.icon;

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="relative h-72 overflow-hidden rounded-t-[18px] bg-[#f4f7fb]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c]/70 via-[#0d2c5c]/10 to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center text-[#0d2c5c] hover:bg-white hover:text-[#c69a3f] hover:scale-105 transition-all shadow-lg"
        >
          <X size={18} />
        </button>
        {place.badge && (
          <div className="absolute bottom-5 left-5">
            <BadgePill badge={place.badge} />
          </div>
        )}
        <div className="absolute bottom-5 right-5 flex items-center gap-1 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
          <Star size={14} className="text-[#c69a3f] fill-[#c69a3f]" />
          <span className="text-[13px] font-bold text-[#0d2c5c]">{place.rating.toFixed(1)} / 5</span>
        </div>
      </div>
      <div className="p-7">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
            <Icon size={12} /> {Meta.label}
          </span>
        </div>
        <h2 className="font-['Cormorant_Garamond',serif] text-[32px] text-[#0d2c5c] leading-tight">
          {place.title}
        </h2>
        <div className="w-12 h-0.5 bg-[#c69a3f] mt-4 mb-3 rounded-full opacity-70" />
        <p className="text-[14px] text-[#5a6b85] leading-[1.8]">{place.description}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 pt-5 border-t border-[#eef2f7]">
          <div className="flex items-center gap-2 text-[13px] text-[#5a6b85]">
            <MapPin size={16} className="text-[#c69a3f]" />
            <span>
              {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
            </span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#0d2c5c] border border-[#e1e8f0] rounded-[10px] hover:border-[#c69a3f] hover:text-[#c69a3f] transition-colors"
          >
            <MapPin size={14} /> Vezi pe hartă
          </a>
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────── FORM MODAL ─────────────── */
function PlaceFormModal({
  initial,
  isEdit,
  onClose,
  onSubmit,
}: {
  initial: PlaceForm;
  isEdit: boolean;
  onClose: () => void;
  onSubmit: (data: PlaceForm) => void;
}) {
  const [form, setForm] = useState<PlaceForm>(initial);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  };

  const fieldInput =
    "w-full py-2.5 px-3.5 border border-[#e1e8f0] rounded-[10px] text-[14px] text-[#1a1a1a] bg-white outline-none transition-all focus:border-[#c69a3f] focus:shadow-[0_0_0_3px_rgba(198,154,63,0.12)] placeholder:text-[#a4b0c1]";

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <div className="relative flex items-center justify-between px-6 py-4 border-b border-[#eef2f7]">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#c69a3f] to-[#d8ae52]" />
        <h2 className="font-['Cormorant_Garamond',serif] text-[24px] text-[#0d2c5c]">
          {isEdit ? "Editează locația" : "Adaugă locație nouă"}
        </h2>
        <button onClick={onClose} className="text-[#8595aa] hover:text-[#0d2c5c] transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={submit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Titlu">
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={fieldInput}
              placeholder="ex: Plaja Eforie Nord"
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
                  {CATEGORY_META[c].label}
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
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Latitudine">
            <input
              type="number"
              step="any"
              required
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
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
              onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })}
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
        {form.thumb_url && (
          <div className="rounded-[10px] border border-[#e1e8f0] overflow-hidden h-32 bg-[#f4f7fb]">
            <img src={form.thumb_url} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <FormField label="URL Imagine (high-res)">
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className={fieldInput}
            placeholder="https://…"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
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
              onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
              className={fieldInput}
            />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-[13px] font-semibold text-[#3c4043] border border-[#e1e8f0] rounded-[10px] hover:bg-[#f4f7fb] transition-colors"
          >
            Renunță
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-gradient-to-r from-[#0d2c5c] to-[#1e4d8c] rounded-[10px] hover:from-[#1e4d8c] hover:to-[#0d2c5c] transition-all duration-300 disabled:opacity-60"
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

/* ─────────────── CONFIRM DIALOG ─────────────── */
function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal onClose={onCancel} maxWidth="max-w-md">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-[#0d2c5c]">{title}</h3>
            <p className="text-[13.5px] text-[#5a6b85] mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-[13px] font-semibold text-[#3c4043] border border-[#e1e8f0] rounded-[10px] hover:bg-[#f4f7fb] transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-red-600 rounded-[10px] hover:bg-red-700 transition-colors"
          >
            <Trash2 size={15} /> Șterge definitiv
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────── MODAL SHELL ─────────────── */
function Modal({
  children,
  onClose,
  maxWidth,
}: {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/45 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-[18px] shadow-2xl w-full ${maxWidth} max-h-[85vh] overflow-hidden animate-[scaleIn_0.2s_ease-out]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ─────────────── FORM FIELD ─────────────── */
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#5a6b85]">
        {label}
      </span>
      {children}
    </label>
  );
}
