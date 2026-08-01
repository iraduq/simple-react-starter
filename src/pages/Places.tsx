import { useEffect, useMemo, useState } from "react";
import { Search, LayoutGrid, List, Star, Plus, Pencil, Trash2, MapPin, X, Image as ImageIcon, Award, Sparkles, Loader as Loader2 } from "lucide-react";
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

const CATEGORIES = ["plaja", "restaurant", "hotel", "atracție", "bar", "magazin"];

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
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Header */}
      <div className="bg-[#0d2c5c] text-white">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-16">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-3">
            Explorează
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[44px] leading-tight font-medium">
            Locații & Destinații
          </h1>
          <p className="text-[14px] text-white/70 mt-3 max-w-[520px]">
            Descoperă cele mai bune locuri din zonă — plaje, restaurante și atracții turistice.
          </p>
          {canCreate && (
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[#c69a3f] hover:bg-[#b58933] text-white text-[13px] font-semibold rounded-[10px] transition-colors"
            >
              <Plus size={16} /> Adaugă locație
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 -mt-10 relative z-10">
        <div className="bg-white border border-[#e6ecf3] rounded-[16px] shadow-[0_10px_40px_rgba(13,44,92,0.06)] p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8595aa]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută locații…"
              className="w-full pl-12 pr-4 py-3 border border-[#e1e8f0] rounded-[10px] text-[14px] outline-none transition-all focus:border-[#1e4d8c] focus:shadow-[0_0_0_3px_rgba(30,77,140,0.08)]"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 border border-[#e1e8f0] rounded-[10px] text-[14px] text-[#3c4043] bg-white outline-none focus:border-[#1e4d8c] cursor-pointer"
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
            className="px-4 py-3 border border-[#e1e8f0] rounded-[10px] text-[14px] text-[#3c4043] bg-white outline-none focus:border-[#1e4d8c] cursor-pointer"
          >
            <option value="rating-desc">Rating: Descrescător</option>
            <option value="rating-asc">Rating: Crescător</option>
            <option value="title">Alfabetic</option>
          </select>
          <div className="flex gap-1 p-1 bg-[#f4f7fb] rounded-[10px]">
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 rounded-md transition-colors ${
                view === "grid" ? "bg-white text-[#0d2c5c] shadow-sm" : "text-[#8595aa]"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 rounded-md transition-colors ${
                view === "list" ? "bg-white text-[#0d2c5c] shadow-sm" : "text-[#8595aa]"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#8595aa]">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-['Cormorant_Garamond',serif] text-[24px] text-[#0d2c5c]">
              Nicio locație găsită
            </p>
            <p className="text-[13px] text-[#8595aa] mt-2">
              Încearcă alte cuvinte cheie sau schimbă categoria.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onClick={() => setDetailPlace(place)}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={() => openEdit(place)}
                onDelete={() => setDeleteTarget(place)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((place) => (
              <PlaceRow
                key={place.id}
                place={place}
                onClick={() => setDetailPlace(place)}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={() => openEdit(place)}
                onDelete={() => setDeleteTarget(place)}
              />
            ))}
          </div>
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

/* ─────────────── PLACE CARD (grid) ─────────────── */
function PlaceCard({
  place,
  onClick,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: {
  place: Place;
  onClick: () => void;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-white border border-[#e6ecf3] rounded-[16px] overflow-hidden shadow-[0_4px_20px_rgba(13,44,92,0.04)] hover:shadow-[0_12px_40px_rgba(13,44,92,0.1)] hover:border-[#c69a3f]/30 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden bg-[#f4f7fb]">
        {place.thumb_url ? (
          <img
            src={place.thumb_url}
            alt={place.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={32} />
          </div>
        )}
        {place.badge && <BadgePill badge={place.badge} />}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-sm">
          <Star size={13} className="text-[#c69a3f] fill-[#c69a3f]" />
          <span className="text-[12px] font-bold text-[#0d2c5c]">{place.rating.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-5">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
          {place.category}
        </span>
        <h3 className="font-['Cormorant_Garamond',serif] text-[22px] text-[#0d2c5c] mt-1 leading-tight">
          {place.title}
        </h3>
        <p className="text-[13px] text-[#5a6b85] mt-2 line-clamp-2">{place.description}</p>
        {(canUpdate || canDelete) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-[#eef2f7]">
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-lg hover:border-[#c69a3f] transition-colors"
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
}: {
  place: Place;
  onClick: () => void;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer flex gap-5 bg-white border border-[#e6ecf3] rounded-[14px] overflow-hidden shadow-[0_4px_20px_rgba(13,44,92,0.04)] hover:shadow-[0_8px_30px_rgba(13,44,92,0.08)] hover:border-[#c69a3f]/30 transition-all duration-300"
    >
      <div className="relative w-40 h-32 shrink-0 overflow-hidden bg-[#f4f7fb]">
        {place.thumb_url ? (
          <img
            src={place.thumb_url}
            alt={place.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={28} />
          </div>
        )}
      </div>
      <div className="flex-1 py-4 pr-5 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
            {place.category}
          </span>
          {place.badge && <BadgePill badge={place.badge} small />}
          <div className="flex items-center gap-1 ml-auto">
            <Star size={13} className="text-[#c69a3f] fill-[#c69a3f]" />
            <span className="text-[12px] font-bold text-[#0d2c5c]">{place.rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="font-['Cormorant_Garamond',serif] text-[20px] text-[#0d2c5c] leading-tight">
          {place.title}
        </h3>
        <p className="text-[13px] text-[#5a6b85] mt-1 line-clamp-1">{place.description}</p>
        {(canUpdate || canDelete) && (
          <div className="flex gap-2 mt-3">
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#0d2c5c] border border-[#e1e8f0] rounded-lg hover:border-[#c69a3f] transition-colors"
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
      className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${
        isRecommended
          ? "bg-[#c69a3f] text-white"
          : isNew
            ? "bg-emerald-500 text-white"
            : "bg-[#0d2c5c] text-white"
      } ${small ? "static" : ""}`}
    >
      <Icon size={11} />
      {badge}
    </div>
  );
}

/* ─────────────── DETAIL MODAL ─────────────── */
function PlaceDetailModal({ place, onClose }: { place: Place; onClose: () => void }) {
  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="relative h-64 overflow-hidden rounded-t-[16px] bg-[#f4f7fb]">
        {place.image_url || place.thumb_url ? (
          <img
            src={place.image_url || place.thumb_url!}
            alt={place.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8595aa]">
            <ImageIcon size={40} />
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#0d2c5c] hover:bg-white transition-colors"
        >
          <X size={18} />
        </button>
        {place.badge && (
          <div className="absolute bottom-4 left-4">
            <BadgePill badge={place.badge} />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
            {place.category}
          </span>
          <div className="flex items-center gap-1">
            <Star size={15} className="text-[#c69a3f] fill-[#c69a3f]" />
            <span className="text-[14px] font-bold text-[#0d2c5c]">{place.rating.toFixed(1)}</span>
          </div>
        </div>
        <h2 className="font-['Cormorant_Garamond',serif] text-[30px] text-[#0d2c5c] leading-tight">
          {place.title}
        </h2>
        <p className="text-[14px] text-[#5a6b85] mt-3 leading-relaxed">{place.description}</p>
        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-[#eef2f7] text-[13px] text-[#5a6b85]">
          <MapPin size={16} className="text-[#c69a3f]" />
          <span>
            Coordonate: {place.lat}, {place.lng}
          </span>
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
    "w-full py-2.5 px-3.5 border border-[#e1e8f0] rounded-[10px] text-[14px] text-[#1a1a1a] bg-white outline-none transition-all focus:border-[#1e4d8c] focus:shadow-[0_0_0_3px_rgba(30,77,140,0.08)] placeholder:text-[#a4b0c1]";

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef2f7]">
        <h2 className="font-['Cormorant_Garamond',serif] text-[24px] text-[#0d2c5c]">
          {isEdit ? "Editează locația" : "Adaugă locație nouă"}
        </h2>
        <button onClick={onClose} className="text-[#8595aa] hover:text-[#0d2c5c]">
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
            className={`${fieldInput} min-h-[80px] resize-y`}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-[#0d2c5c] rounded-[10px] hover:bg-[#1e4d8c] transition-colors disabled:opacity-60"
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
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-[#0d2c5c]/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-[16px] shadow-2xl w-full ${maxWidth} max-h-[85vh] overflow-hidden animate-[scaleIn_0.2s_ease-out]`}
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
