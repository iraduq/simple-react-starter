import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ImagePlus,
  UtensilsCrossed,
  Wine,
  Waves,
  Sparkles,
  Store,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../Toast";
import { get, post, patch, del, upload, list, errMsg } from "../../lib/admin";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  SectionHeader,
  TableSkeleton,
  SearchBox,
  inputCls,
  usePaged,
  Pagination,
} from "./ui";
import type { MenuCategory, MenuItem, Place } from "../../types/places";
import { lei } from "../../services/placesService";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";

const EMPTY_ITEM = {
  category_id: 0,
  title: "",
  description: "",
  ingredients: "",
  volume_or_weight: "",
  price: "",
  is_available: true,
  is_featured: false,
};

const EMPTY_CAT = {
  name: "",
  description: "",
  display_order: 0,
  is_active: true,
  place_id: "",
};

const getPlaceIcon = (cat?: string) => {
  const c = String(cat || "").toLowerCase();
  if (c.includes("restaur") || c.includes("manc")) return UtensilsCrossed;
  if (c.includes("bar") || c.includes("caf") || c.includes("baut") || c.includes("lounge")) return Wine;
  if (c.includes("plaj") || c.includes("beach") || c.includes("mar")) return Waves;
  if (c.includes("spa") || c.includes("relax") || c.includes("well")) return Sparkles;
  return Store;
};

export default function AdminMenuTab() {
  const { toast } = useToast();
  useAdminLiveSync({
    topic: "menu",
    onSync: () => void load(true),
  });

  const [cats, setCats] = useState<MenuCategory[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre intuitive
  const [placeFilter, setPlaceFilter] = useState<number | string | "all">("all");
  const [catFilter, setCatFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [showEmptyPlaces, setShowEmptyPlaces] = useState(false);

  const [itemForm, setItemForm] = useState<typeof EMPTY_ITEM | null>(null);
  const [itemEditing, setItemEditing] = useState<MenuItem | null>(null);
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [catForm, setCatForm] = useState<typeof EMPTY_CAT | null>(null);
  const [catEditing, setCatEditing] = useState<MenuCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [m, p] = await Promise.all([get<unknown>("/menu/full"), get<unknown>("/places")]);
      setCats(list<MenuCategory>(m).map((c) => ({ ...c, items: Array.isArray(c.items) ? c.items : [] })));
      setPlaces(list<Place>(p));
    } catch (e) {
      if (!silent) toast(errMsg(e), "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const placeName = (id?: number | string | null) =>
    places.find((p) => String(p.id) === String(id))?.title;

  // Locații ordonate descrescător după numărul de preparate / categorii
  const placeStats = useMemo(() => {
    const mapped = places.map((p) => {
      const pCats = cats.filter((c) => String(c.place_id) === String(p.id));
      const itemsCount = pCats.reduce((acc, c) => acc + (c.items?.length || 0), 0);
      return {
        place: p,
        catsCount: pCats.length,
        itemsCount,
      };
    });
    return mapped.sort((a, b) => {
      if (b.itemsCount !== a.itemsCount) return b.itemsCount - a.itemsCount;
      if (b.catsCount !== a.catsCount) return b.catsCount - a.catsCount;
      return String(a.place.title || "").localeCompare(String(b.place.title || ""), "ro");
    });
  }, [places, cats]);

  const activePlaceStats = useMemo(
    () => placeStats.filter((s) => s.itemsCount > 0 || s.catsCount > 0),
    [placeStats],
  );
  const emptyPlacesCount = placeStats.length - activePlaceStats.length;
  const displayedPlaceStats =
    showEmptyPlaces || activePlaceStats.length === 0 ? placeStats : activePlaceStats;

  // Categoriile vizibile în funcție de locația selectată
  const visibleCats = useMemo(() => {
    if (placeFilter === "all") return cats;
    return cats.filter((c) => String(c.place_id) === String(placeFilter));
  }, [cats, placeFilter]);

  // Gruparea categoriilor pe locație pentru afișare curată în panoul din stânga
  const groupedVisibleCats = useMemo(() => {
    const groups: Array<{ key: string; title: string; items: MenuCategory[] }> = [];
    const byKey = new Map<string, { key: string; title: string; items: MenuCategory[] }>();

    for (const stat of placeStats) {
      const key = String(stat.place.id);
      const grp = { key, title: stat.place.title || "Locație", items: [] as MenuCategory[] };
      byKey.set(key, grp);
    }

    for (const c of visibleCats) {
      const key = c.place_id ? String(c.place_id) : "general";
      let grp = byKey.get(key);
      if (!grp) {
        grp = {
          key,
          title: c.place_id ? placeName(c.place_id) || "Altă locație" : "General / Fără locație",
          items: [],
        };
        byKey.set(key, grp);
      }
      grp.items.push(c);
    }

    for (const stat of placeStats) {
      const grp = byKey.get(String(stat.place.id));
      if (grp && grp.items.length > 0) groups.push(grp);
    }
    const generalGrp = byKey.get("general");
    if (generalGrp && generalGrp.items.length > 0) groups.push(generalGrp);
    for (const [k, grp] of byKey.entries()) {
      if (grp.items.length > 0 && !groups.some((g) => g.key === k)) {
        groups.push(grp);
      }
    }
    return groups;
  }, [visibleCats, placeStats, places]);

  // Lista tuturor produselor filtrate conform locației, categoriei, stocului și căutării
  const allFilteredItems = useMemo(() => {
    let candidateCats = cats;

    if (placeFilter !== "all") {
      candidateCats = candidateCats.filter((c) => String(c.place_id) === String(placeFilter));
    }

    if (catFilter !== "all") {
      candidateCats = candidateCats.filter((c) => c.id === catFilter);
    }

    let flat = candidateCats.flatMap((c) =>
      (c.items ?? []).map((i) => ({
        ...i,
        _cat: c.name,
        _placeId: c.place_id,
        _placeName: placeName(c.place_id),
      }))
    );

    if (stockFilter === "in_stock") {
      flat = flat.filter((i) => i.is_available);
    } else if (stockFilter === "out_of_stock") {
      flat = flat.filter((i) => !i.is_available);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      flat = flat.filter((i) =>
        [i.title, i.description, i.ingredients, i._cat, i._placeName]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q))
      );
    }

    return flat;
  }, [cats, placeFilter, catFilter, stockFilter, searchQuery, places]);

  const paged = usePaged(allFilteredItems, 12);
  const { setPage } = paged;

  useEffect(() => {
    setPage(1);
  }, [placeFilter, catFilter, stockFilter, searchQuery, setPage]);

  const activeCategoryObj = useMemo(
    () => (catFilter === "all" ? null : cats.find((c) => c.id === catFilter) || null),
    [catFilter, cats],
  );

  // Contorizări pentru stoc
  const { totalInScope, inStockCount, outOfStockCount } = useMemo(() => {
    let candidateCats = cats;
    if (placeFilter !== "all") {
      candidateCats = candidateCats.filter((c) => String(c.place_id) === String(placeFilter));
    }
    if (catFilter !== "all") {
      candidateCats = candidateCats.filter((c) => c.id === catFilter);
    }
    const all = candidateCats.flatMap((c) => c.items ?? []);
    const inStock = all.filter((i) => i.is_available).length;
    return {
      totalInScope: all.length,
      inStockCount: inStock,
      outOfStockCount: all.length - inStock,
    };
  }, [cats, placeFilter, catFilter]);

  const toggleStock = async (it: MenuItem) => {
    try {
      await patch(`/menu/items/${it.id}`, { is_available: !it.is_available });
      setCats((cs) =>
        cs.map((c) => ({
          ...c,
          items: c.items?.map((i) => (i.id === it.id ? { ...i, is_available: !i.is_available } : i)),
        }))
      );
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const saveItem = async () => {
    if (!itemForm) return;
    const price = Number(String(itemForm.price).replace(",", "."));
    if (!itemForm.title.trim() || !itemForm.category_id || !Number.isFinite(price) || price < 0) {
      toast("Completează titlul, categoria și un preț valid.", "warning");
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...itemForm,
        price: Math.round(price * 100) / 100,
        description: itemForm.description.trim() || null,
        ingredients: itemForm.ingredients.trim() || null,
        volume_or_weight: itemForm.volume_or_weight.trim() || null,
      };
      const saved = itemEditing
        ? await patch<MenuItem>(`/menu/items/${itemEditing.id}`, body)
        : await post<MenuItem>("/menu/items", body);
      const id = saved?.id ?? itemEditing?.id;
      if (itemFile && id) {
        const fd = new FormData();
        fd.append("file", itemFile);
        await upload(`/menu/items/${id}/image`, fd);
      }
      toast(itemEditing ? "Produs actualizat." : "Produs adăugat.", "success");
      setItemForm(null);
      await load(true);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const saveCat = async () => {
    if (!catForm || !catForm.name.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: catForm.name.trim(),
        description: catForm.description.trim() || null,
        display_order: Number(catForm.display_order) || 0,
        is_active: catForm.is_active,
      };
      if (catForm.place_id) body.place_id = Number(catForm.place_id);
      if (catEditing) await patch(`/menu/categories/${catEditing.id}`, body);
      else await post("/menu/categories", body);
      toast("Categorie salvată.", "success");
      setCatForm(null);
      await load(true);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (path: string) => {
    if (!confirm("Sigur ștergi? Acțiunea nu poate fi anulată.")) return;
    try {
      await del(path);
      toast("Șters.", "success");
      await load(true);
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const openNewItem = () => {
    setItemEditing(null);
    setItemFile(null);
    // Auto-selectează prima categorie a locației curente dacă este filtrată
    let defaultCatId = cats[0]?.id ?? 0;
    if (placeFilter !== "all") {
      const matchInPlace = cats.find((c) => String(c.place_id) === String(placeFilter));
      if (matchInPlace) defaultCatId = matchInPlace.id;
    }
    if (catFilter !== "all") {
      defaultCatId = catFilter;
    }
    setItemForm({ ...EMPTY_ITEM, category_id: defaultCatId });
  };

  const openNewCat = () => {
    setCatEditing(null);
    setCatForm({
      ...EMPTY_CAT,
      place_id: placeFilter !== "all" ? String(placeFilter) : (places[0]?.id ? String(places[0].id) : ""),
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Gastronomie și bar"
        title="Meniu digital"
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={openNewCat}>
              <Plus size={14} /> Categorie nouă
            </Button>
            <Button onClick={openNewItem}>
              <Plus size={14} /> Produs nou
            </Button>
          </div>
        }
      />

      {/* ── 1. SELECTOR PRINCIPAL: LOCAȚIE GASTRONOMICĂ ── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] flex items-center gap-2">
            <Store size={14} className="text-[#c69a3f]" /> Locații gastronomice & bar
          </p>
          <div className="flex items-center gap-3">
            {emptyPlacesCount > 0 && (
              <button
                type="button"
                onClick={() => setShowEmptyPlaces((v) => !v)}
                className="text-[11px] font-semibold text-[#6b7c99] hover:text-[#0d2c5c] underline decoration-dotted underline-offset-4 transition-colors cursor-pointer"
              >
                {showEmptyPlaces
                  ? "Ascunde locațiile fără meniu"
                  : `Vezi și locațiile fără meniu (${emptyPlacesCount})`}
              </button>
            )}
            <span className="text-[11px] font-semibold text-[#6b7c99]">
              {activePlaceStats.length} active cu meniu
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Card Toate Locațiile */}
          <button
            type="button"
            onClick={() => {
              setPlaceFilter("all");
              setCatFilter("all");
            }}
            className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              placeFilter === "all"
                ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md shadow-[#0d2c5c]/10"
                : "border-[#e1e8f0] bg-white text-[#2a3b52] hover:border-[#c69a3f]/50 hover:bg-[#f8fafd]"
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                placeFilter === "all" ? "bg-white/15 text-[#e6b85c]" : "bg-[#0d2c5c]/5 text-[#0d2c5c]"
              }`}
            >
              <Layers size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold leading-tight truncate">Toate locațiile</span>
              <span
                className={`block text-[10px] mt-0.5 truncate ${
                  placeFilter === "all" ? "text-white/75" : "text-[#6b7c99]"
                }`}
              >
                {cats.length} categorii · {cats.reduce((a, c) => a + (c.items?.length || 0), 0)} prep.
              </span>
            </div>
          </button>

          {/* Locații ordonate descrescător după produse */}
          {displayedPlaceStats.map(({ place: p, itemsCount }) => {
            const isSelected = String(placeFilter) === String(p.id);
            const Icon = getPlaceIcon(p.category);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPlaceFilter(isSelected ? "all" : p.id);
                  setCatFilter("all");
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md shadow-[#0d2c5c]/10 ring-2 ring-[#c69a3f]/40"
                    : "border-[#e1e8f0] bg-white text-[#2a3b52] hover:border-[#c69a3f]/50 hover:bg-[#f8fafd]"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? "bg-white/15 text-[#e6b85c]" : "bg-[#0d2c5c]/5 text-[#0d2c5c]"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold leading-tight truncate">{p.title}</span>
                  <span
                    className={`block text-[10px] mt-0.5 truncate uppercase tracking-wider font-semibold ${
                      isSelected ? "text-[#e6b85c]" : "text-[#c69a3f]"
                    }`}
                  >
                    {p.category} · {itemsCount} prep.
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. LAYOUT MASTER-DETAIL: CATEGORII (STÂNGA) + PRODUSE & FILTRE (DREAPTA) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLOANA STÂNGĂ: PANOU VERTICAL CATEGORII */}
        <Card className="lg:col-span-4 xl:col-span-3 p-4 bg-white border border-[#e1e8f0]">
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#eef2f7]">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c]">
                Categorii meniu
              </p>
              <p className="text-[11px] text-[#6b7c99] mt-0.5">
                {placeFilter !== "all" ? placeName(placeFilter) : "Toate locațiile"}
              </p>
            </div>
            <button
              type="button"
              onClick={openNewCat}
              className="inline-flex items-center gap-1 rounded-lg border border-[#e1e8f0] bg-[#f8fafd] px-2.5 py-1.5 text-[11px] font-bold text-[#0d2c5c] hover:border-[#c69a3f] hover:text-[#8a6420] transition-colors cursor-pointer"
            >
              <Plus size={12} /> Adaugă
            </button>
          </div>

          {/* Opțiune Toate Categoriile */}
          <button
            type="button"
            onClick={() => setCatFilter("all")}
            className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all cursor-pointer mb-3 ${
              catFilter === "all"
                ? "bg-[#0d2c5c] text-white shadow-sm"
                : "bg-[#f8fafd] text-[#0d2c5c] hover:bg-[#eef2f7]"
            }`}
          >
            <span className="truncate">Toate categoriile</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                catFilter === "all"
                  ? "bg-white/20 text-[#e6b85c]"
                  : "bg-white text-[#4f6280] border border-[#e1e8f0]"
              }`}
            >
              {visibleCats.reduce((acc, c) => acc + (c.items?.length || 0), 0)}
            </span>
          </button>

          {/* Listă verticală grupată pe locații */}
          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-0.5">
            {groupedVisibleCats.length === 0 ? (
              <p className="text-xs text-[#6b7c99] text-center py-6">
                Nu există categorii definite pentru această locație.
              </p>
            ) : (
              groupedVisibleCats.map((group) => (
                <div key={group.key} className="space-y-1">
                  {placeFilter === "all" && (
                    <div className="px-2 pt-1 pb-1 text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-[#c69a3f]">
                      {group.title}
                    </div>
                  )}
                  {group.items.map((c) => {
                    const isCatActive = catFilter === c.id;
                    const count = c.items?.length || 0;
                    return (
                      <div
                        key={c.id}
                        className={`group flex items-center justify-between gap-1.5 rounded-xl px-2.5 py-2 transition-all border ${
                          isCatActive
                            ? "bg-[#0d2c5c] border-[#0d2c5c] text-white shadow-xs"
                            : "bg-white border-transparent hover:border-[#e1e8f0] hover:bg-[#f8fafd] text-[#2a3b52]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCatFilter(isCatActive ? "all" : c.id)}
                          className="flex-1 min-w-0 flex items-center gap-2 text-left cursor-pointer"
                        >
                          <ChevronRight
                            size={12}
                            className={`shrink-0 transition-transform ${
                              isCatActive ? "text-[#e6b85c] rotate-90" : "text-[#94a3b8]"
                            }`}
                          />
                          <span className="truncate text-[12.5px] font-semibold">
                            {c.name}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              isCatActive
                                ? "bg-white/15 text-white"
                                : "bg-[#f1f5f9] text-[#64748b]"
                            }`}
                          >
                            {count}
                          </span>
                          <button
                            type="button"
                            aria-label="Editează categoria"
                            title="Editează categoria"
                            onClick={() => {
                              setCatEditing(c);
                              setCatForm({
                                name: c.name,
                                description: c.description ?? "",
                                display_order: c.display_order ?? 0,
                                is_active: c.is_active,
                                place_id: c.place_id ? String(c.place_id) : "",
                              });
                            }}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              isCatActive
                                ? "text-white/80 hover:text-white hover:bg-white/15"
                                : "text-[#94a3b8] hover:text-[#0d2c5c] hover:bg-[#eef2f7]"
                            }`}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            type="button"
                            aria-label="Șterge categoria"
                            title="Șterge categoria"
                            onClick={() => void remove(`/menu/categories/${c.id}`)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              isCatActive
                                ? "text-red-300 hover:text-red-100 hover:bg-red-500/25"
                                : "text-[#94a3b8] hover:text-red-600 hover:bg-red-50"
                            }`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* COLOANA DREAPTĂ: TOOLBAR INTEGRAT + TABEL PRODUSE CU PAGINARE */}
        <Card className="lg:col-span-8 xl:col-span-9 overflow-hidden bg-white border border-[#e1e8f0]">
          {/* Header & Toolbar integrat */}
          <div className="p-4 sm:p-5 border-b border-[#eef2f7] bg-[#fbfcfe] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#0d2c5c]">
                  {activeCategoryObj
                    ? activeCategoryObj.name
                    : placeFilter !== "all"
                      ? `Meniu ${placeName(placeFilter)}`
                      : "Toate preparatele"}
                </h3>
                <Badge tone="navy">{allFilteredItems.length} afișate</Badge>
                {activeCategoryObj?.place_id && (
                  <Badge tone="gold">{placeName(activeCategoryObj.place_id)}</Badge>
                )}
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#e1e8f0]">
                <button
                  type="button"
                  onClick={() => setStockFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    stockFilter === "all"
                      ? "bg-[#0d2c5c] text-white shadow-2xs"
                      : "text-[#64748b] hover:text-[#0d2c5c]"
                  }`}
                >
                  Toate ({totalInScope})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter("in_stock")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    stockFilter === "in_stock"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-[#64748b] hover:text-emerald-700"
                  }`}
                >
                  În stoc ({inStockCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter("out_of_stock")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    stockFilter === "out_of_stock"
                      ? "bg-[#8c2f39] text-white shadow-2xs"
                      : "text-[#64748b] hover:text-red-700"
                  }`}
                >
                  Epuizat ({outOfStockCount})
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchBox
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Caută preparat, ingredient, categorie..."
                />
              </div>
              {(placeFilter !== "all" || catFilter !== "all" || searchQuery || stockFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setPlaceFilter("all");
                    setCatFilter("all");
                    setSearchQuery("");
                    setStockFilter("all");
                  }}
                  className="text-xs font-semibold text-[#8a6420] hover:text-[#0d2c5c] transition-colors self-start sm:self-auto cursor-pointer"
                >
                  Resetează filtrele
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-5">
              <TableSkeleton rows={6} />
            </div>
          ) : allFilteredItems.length === 0 ? (
            <EmptyState
              title="Niciun preparat găsit"
              hint={
                searchQuery
                  ? "Niciun preparat nu corespunde căutării tale. Încearcă alți termeni."
                  : "Nu există preparate în această selecție. Apasă pe 'Produs nou' pentru a adăuga unul."
              }
            />
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f7f9fc] text-[10px] uppercase tracking-[0.14em] text-[#4f6280] border-b border-[#eef2f7]">
                    <tr>
                      <th className="px-5 py-3.5">Produs</th>
                      <th className="px-5 py-3.5">Locație & Categorie</th>
                      <th className="px-5 py-3.5">Gramaj / Volum</th>
                      <th className="px-5 py-3.5">Preț</th>
                      <th className="px-5 py-3.5">Stoc</th>
                      <th className="px-5 py-3.5 text-right">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.slice.map((it) => (
                      <tr
                        key={it.id}
                        className="border-b border-[#f4f6f9] last:border-0 hover:bg-[#0d2c5c]/[0.015] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {it.image_url ? (
                              <img
                                src={it.image_url}
                                alt=""
                                className="h-11 w-11 rounded-xl object-cover border border-[#e1e8f0]"
                              />
                            ) : (
                              <div className="h-11 w-11 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8] border border-[#e1e8f0]">
                                <UtensilsCrossed size={18} strokeWidth={1.5} />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#0d2c5c] text-[13.5px]">{it.title}</span>
                                {it.is_featured && (
                                  <Badge tone="gold">Top Recomandat</Badge>
                                )}
                              </div>
                              {it.description && (
                                <p className="text-[11.5px] text-[#6b7c99] line-clamp-1 mt-0.5">
                                  {it.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[12px] font-bold text-[#0d2c5c]">{it._cat}</span>
                            {it._placeName ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c69a3f] bg-[#fdf8ec] border border-[#f4e5c8] px-2 py-0.5 rounded-md">
                                {it._placeName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#94a3b8]">General</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#4f6280] font-medium text-[12.5px]">
                          {it.volume_or_weight || "—"}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#0d2c5c] text-[13.5px]">
                          {lei(it.price)}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => void toggleStock(it)}
                            title="Click pentru a comuta stocul"
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            {it.is_available ? (
                              <Badge tone="green">În stoc</Badge>
                            ) : (
                              <Badge tone="red">Epuizat</Badge>
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setItemEditing(it);
                                setItemFile(null);
                                setItemForm({
                                  category_id: it.category_id,
                                  title: it.title,
                                  description: it.description ?? "",
                                  ingredients: it.ingredients ?? "",
                                  volume_or_weight: it.volume_or_weight ?? "",
                                  price: String(it.price),
                                  is_available: it.is_available,
                                  is_featured: !!it.is_featured,
                                });
                              }}
                            >
                              <Pencil size={12} /> Editează
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => void remove(`/menu/items/${it.id}`)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={paged.page}
                pages={paged.pages}
                total={paged.total}
                perPage={paged.perPage}
                onPage={paged.setPage}
              />
            </div>
          )}
        </Card>
      </div>

      {/* ── MODAL: PRODUS NOU / EDITARE PRODUS ── */}
      <Modal
        open={!!itemForm}
        title={itemEditing ? `Editează: ${itemEditing.title}` : "Produs nou în meniu"}
        onClose={() => setItemForm(null)}
        width="max-w-xl"
      >
        {itemForm && (
          <div className="space-y-4">
            <Field label="Titlu produs">
              <input
                className={inputCls}
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                placeholder="ex: Coaste de porc BBQ / Cocktail Mojito"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Categorie & Locație">
                <select
                  className={inputCls}
                  value={itemForm.category_id}
                  onChange={(e) => setItemForm({ ...itemForm, category_id: Number(e.target.value) })}
                >
                  <option value={0} disabled>
                    — Alege categoria —
                  </option>
                  {places.map((p) => {
                    const pCats = cats.filter((c) => String(c.place_id) === String(p.id));
                    if (!pCats.length) return null;
                    return (
                      <optgroup key={p.id} label={`${p.title} (${p.category})`}>
                        {pCats.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                  {cats.some((c) => !c.place_id) && (
                    <optgroup label="General / Fără locație">
                      {cats
                        .filter((c) => !c.place_id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </Field>

              <Field label="Preț (lei)">
                <input
                  className={inputCls}
                  inputMode="decimal"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="34.00"
                />
              </Field>
            </div>

            <Field label="Gramaj / Volum">
              <input
                className={inputCls}
                value={itemForm.volume_or_weight}
                onChange={(e) => setItemForm({ ...itemForm, volume_or_weight: e.target.value })}
                placeholder="ex: 450g / 330ml / 50ml"
              />
            </Field>

            <Field label="Descriere">
              <textarea
                rows={2}
                className={inputCls}
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Descriere atrăgătoare a preparatului..."
              />
            </Field>

            <Field label="Ingrediente / Alergeni">
              <textarea
                rows={2}
                className={inputCls}
                value={itemForm.ingredients}
                onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })}
                placeholder="ex: carne porc, cartofi, sos soia, semințe susan..."
              />
            </Field>

            <Field label="Imagine preparat (convertită automat în WebP)">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#e1e8f0] px-3.5 py-2.5 text-sm text-[#4f6280] hover:border-[#c69a3f] transition-colors">
                <ImagePlus size={16} className="text-[#0d2c5c]" />
                <span className="truncate">{itemFile ? itemFile.name : "Alege o imagine din calculator"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setItemFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </Field>

            <div className="flex gap-6 text-sm text-[#0d2c5c] pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemForm.is_available}
                  onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                />
                Disponibil în stoc
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemForm.is_featured}
                  onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })}
                />
                Top Recomandat (Specialitatea casei)
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
              <Button variant="ghost" onClick={() => setItemForm(null)}>
                Renunță
              </Button>
              <Button disabled={saving} onClick={() => void saveItem()}>
                {saving ? "Se salvează…" : "Salvează preparatul"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL: CATEGORIE NOUĂ / EDITARE CATEGORIE ── */}
      <Modal
        open={!!catForm}
        title={catEditing ? `Editează categoria: ${catEditing.name}` : "Categorie nouă de meniu"}
        onClose={() => setCatForm(null)}
      >
        {catForm && (
          <div className="space-y-4">
            <Field label="Nume categorie">
              <input
                className={inputCls}
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="ex: Mic Dejun, Supe & Ciorbe, Cocktailuri, Paste..."
              />
            </Field>

            <Field label="Locație / Tip (cărui loc îi aparține această categorie)">
              <select
                className={inputCls}
                value={catForm.place_id}
                onChange={(e) => setCatForm({ ...catForm, place_id: e.target.value })}
              >
                <option value="">— Categorie generală (toate locațiile) —</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Descriere (opțională)">
              <textarea
                rows={2}
                className={inputCls}
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="ex: Servite zilnic între orele 08:00 - 11:30"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Ordine afișare">
                <input
                  type="number"
                  className={inputCls}
                  value={catForm.display_order}
                  onChange={(e) => setCatForm({ ...catForm, display_order: Number(e.target.value) })}
                />
              </Field>
              <Field label="Status">
                <label className="flex items-center gap-2 py-2.5 text-sm text-[#0d2c5c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catForm.is_active}
                    onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
                  />
                  Activă pe site
                </label>
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
              <Button variant="ghost" onClick={() => setCatForm(null)}>
                Renunță
              </Button>
              <Button disabled={saving} onClick={() => void saveCat()}>
                {saving ? "Se salvează…" : "Salvează categoria"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
