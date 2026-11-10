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
  Search,
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

  // Categoriile vizibile în funcție de locația selectată
  const visibleCats = useMemo(() => {
    if (placeFilter === "all") return cats;
    return cats.filter((c) => String(c.place_id) === String(placeFilter));
  }, [cats, placeFilter]);

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

      {/* ── 1. SELECTOR PRINCIPAL: DUPĂ TIP / LOCAȚIE (Restaurant / Plajă / Bar etc.) ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] flex items-center gap-2">
            <Store size={14} className="text-[#c69a3f]" /> Selectează Tipul / Locația:
          </p>
          <span className="text-xs text-[#6b7c99]">
            {places.length} {places.length === 1 ? "locație definită" : "locații definite"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {/* Buton Toate Locațiile */}
          <button
            onClick={() => {
              setPlaceFilter("all");
              setCatFilter("all");
            }}
            className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
              placeFilter === "all"
                ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md shadow-[#0d2c5c]/10"
                : "border-[#e1e8f0] bg-white text-[#2a3b52] hover:border-[#c69a3f]/50 hover:bg-[#f8fafd]"
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                placeFilter === "all" ? "bg-white/15 text-white" : "bg-[#0d2c5c]/5 text-[#0d2c5c]"
              }`}
            >
              <Layers size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold leading-tight truncate">Toate tipurile</span>
              <span
                className={`block text-[10px] mt-0.5 truncate ${
                  placeFilter === "all" ? "text-white/70" : "text-[#6b7c99]"
                }`}
              >
                {cats.length} categorii
              </span>
            </div>
          </button>

          {/* Butoane pentru fiecare Locație (Restaurant, Plajă, Bar, etc.) */}
          {places.map((p) => {
            const isSelected = String(placeFilter) === String(p.id);
            const pCats = cats.filter((c) => String(c.place_id) === String(p.id));
            const pItemsCount = pCats.reduce((acc, c) => acc + (c.items?.length || 0), 0);
            const Icon = getPlaceIcon(p.category);

            return (
              <button
                key={p.id}
                onClick={() => {
                  setPlaceFilter(isSelected ? "all" : p.id);
                  setCatFilter("all");
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-md shadow-[#0d2c5c]/10 ring-2 ring-[#c69a3f]/40"
                    : "border-[#e1e8f0] bg-white text-[#2a3b52] hover:border-[#c69a3f]/50 hover:bg-[#f8fafd]"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? "bg-white/15 text-white" : "bg-[#0d2c5c]/5 text-[#0d2c5c]"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold leading-tight truncate">{p.title}</span>
                  <span
                    className={`block text-[10px] mt-0.5 truncate uppercase tracking-wider font-semibold ${
                      isSelected ? "text-amber-300" : "text-[#c69a3f]"
                    }`}
                  >
                    {p.category} · {pItemsCount} prep.
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. SELECTOR SECUNDAR: CATEGORII DE PREPARATE ── */}
      <Card className="p-4 bg-white border border-[#e1e8f0]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7c99] flex items-center gap-1.5">
            <UtensilsCrossed size={12} className="text-[#0d2c5c]" />
            Categorii {placeFilter !== "all" ? `pentru: ${placeName(placeFilter)}` : "(Toate locațiile)"}:
          </p>

          <button
            onClick={openNewCat}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0d2c5c] hover:text-[#c69a3f] transition-colors"
          >
            <Plus size={12} /> Adaugă categorie
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setCatFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all ${
              catFilter === "all"
                ? "bg-[#0d2c5c] text-white shadow-sm"
                : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
            }`}
          >
            Toate categoriile ({visibleCats.reduce((acc, c) => acc + (c.items?.length || 0), 0)})
          </button>

          {visibleCats.map((c) => {
            const isCatActive = catFilter === c.id;
            const count = c.items?.length || 0;
            return (
              <span
                key={c.id}
                className={`inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 text-[11px] font-bold transition-all border ${
                  isCatActive
                    ? "bg-[#0d2c5c] border-[#0d2c5c] text-white shadow-sm"
                    : "bg-[#f8fafd] border-[#e1e8f0] text-[#334155] hover:border-[#c69a3f]/40 hover:bg-white"
                }`}
              >
                <button
                  onClick={() => setCatFilter(isCatActive ? "all" : c.id)}
                  className="hover:underline flex items-center gap-1.5"
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isCatActive ? "bg-white/20 text-white" : "bg-[#e2e8f0] text-[#64748b]"
                    }`}
                  >
                    {count}
                  </span>
                  {placeFilter === "all" && c.place_id && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded ${
                        isCatActive ? "bg-amber-400 text-[#0d2c5c]" : "bg-[#0d2c5c]/10 text-[#0d2c5c]"
                      }`}
                    >
                      {placeName(c.place_id)}
                    </span>
                  )}
                </button>
                <button
                  aria-label="Editează categoria"
                  className={`p-1 rounded-full transition-opacity ${
                    isCatActive
                      ? "text-white/80 hover:text-white hover:bg-white/20"
                      : "text-[#64748b] hover:text-[#0d2c5c] hover:bg-[#e2e8f0]"
                  }`}
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
                  title="Editează categoria"
                >
                  <Pencil size={11} />
                </button>
                <button
                  aria-label="Șterge categoria"
                  className={`p-1 rounded-full transition-opacity ${
                    isCatActive
                      ? "text-red-300 hover:text-red-100 hover:bg-red-500/30"
                      : "text-red-500/70 hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={() => void remove(`/menu/categories/${c.id}`)}
                  title="Șterge categoria"
                >
                  <Trash2 size={11} />
                </button>
              </span>
            );
          })}
        </div>
      </Card>

      {/* ── 3. BARA DE CĂUTARE & FILTRARE STOC ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Caută preparat, ingredient, categorie..."
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1 rounded-xl self-start sm:self-auto border border-[#e1e8f0]">
          <button
            onClick={() => setStockFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              stockFilter === "all" ? "bg-white text-[#0d2c5c] shadow-sm" : "text-[#64748b] hover:text-[#0d2c5c]"
            }`}
          >
            Toate ({totalInScope})
          </button>
          <button
            onClick={() => setStockFilter("in_stock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              stockFilter === "in_stock" ? "bg-white text-emerald-700 shadow-sm" : "text-[#64748b] hover:text-emerald-700"
            }`}
          >
            În stoc ({inStockCount})
          </button>
          <button
            onClick={() => setStockFilter("out_of_stock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              stockFilter === "out_of_stock" ? "bg-white text-red-700 shadow-sm" : "text-[#64748b] hover:text-red-700"
            }`}
          >
            Epuizat ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* ── 4. TABELUL DE PRODUSE CU PAGINARE ── */}
      <Card className="overflow-hidden bg-white border border-[#e1e8f0]">
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
