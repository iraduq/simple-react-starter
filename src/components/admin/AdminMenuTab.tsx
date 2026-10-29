import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import { useToast } from "../Toast";
import { get, post, patch, del, upload, list, errMsg } from "../../lib/admin";
import { Badge, Button, Card, EmptyState, Field, Modal, SectionHeader, TableSkeleton, inputCls } from "./ui";
import type { MenuCategory, MenuItem, Place } from "../../types/places";
import { lei } from "../../services/placesService";

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
const EMPTY_CAT = { name: "", description: "", display_order: 0, is_active: true, place_id: "" };

export default function AdminMenuTab() {
  const { toast } = useToast();
  const [cats, setCats] = useState<MenuCategory[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<number | "all">("all");
  const [itemForm, setItemForm] = useState<typeof EMPTY_ITEM | null>(null);
  const [itemEditing, setItemEditing] = useState<MenuItem | null>(null);
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [catForm, setCatForm] = useState<typeof EMPTY_CAT | null>(null);
  const [catEditing, setCatEditing] = useState<MenuCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([get<unknown>("/menu/full"), get<unknown>("/places")]);
      setCats(list<MenuCategory>(m).map((c) => ({ ...c, items: Array.isArray(c.items) ? c.items : [] })));
      setPlaces(list<Place>(p));
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo(
    () => cats.filter((c) => catFilter === "all" || c.id === catFilter).flatMap((c) => (c.items ?? []).map((i) => ({ ...i, _cat: c.name }))),
    [cats, catFilter],
  );
  const placeName = (id?: number | string | null) => places.find((p) => String(p.id) === String(id))?.title;

  const toggleStock = async (it: MenuItem) => {
    try {
      await patch(`/menu/items/${it.id}`, { is_available: !it.is_available });
      setCats((cs) => cs.map((c) => ({ ...c, items: c.items?.map((i) => (i.id === it.id ? { ...i, is_available: !i.is_available } : i)) })));
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
      await load();
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
      await load();
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
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="F&B"
        title="Meniu & Bar"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setCatEditing(null); setCatForm({ ...EMPTY_CAT }); }}>
              <Plus size={13} /> Categorie
            </Button>
            <Button onClick={() => { setItemEditing(null); setItemFile(null); setItemForm({ ...EMPTY_ITEM, category_id: cats[0]?.id ?? 0 }); }}>
              <Plus size={13} /> Produs
            </Button>
          </div>
        }
      />

      <Card className="p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2a3b52]">Categorii</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCatFilter("all")} className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold ${catFilter === "all" ? "bg-[#0d2c5c] text-white" : "bg-[#eef2f7] text-[#0d2c5c]"}`}>
            Toate
          </button>
          {cats.map((c) => (
            <span key={c.id} className={`flex items-center gap-1 rounded-full pl-3.5 pr-1.5 py-1 text-[11px] font-bold ${catFilter === c.id ? "bg-[#0d2c5c] text-white" : "bg-[#eef2f7] text-[#0d2c5c]"}`}>
              <button onClick={() => setCatFilter(c.id)}>
                {c.name}
                {placeName(c.place_id) && <span className="opacity-60"> · {placeName(c.place_id)}</span>}
              </button>
              <button aria-label="Editează categoria" className="p-1 opacity-70 hover:opacity-100" onClick={() => {
                setCatEditing(c);
                setCatForm({ name: c.name, description: c.description ?? "", display_order: c.display_order ?? 0, is_active: c.is_active, place_id: c.place_id ? String(c.place_id) : "" });
              }}>
                <Pencil size={11} />
              </button>
              <button aria-label="Șterge categoria" className="p-1 opacity-70 hover:opacity-100" onClick={() => void remove(`/menu/categories/${c.id}`)}>
                <Trash2 size={11} />
              </button>
            </span>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-5"><TableSkeleton /></div>
        ) : items.length === 0 ? (
          <EmptyState title="Niciun produs" hint="Adaugă primul produs din meniu." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f9fc] text-[10px] uppercase tracking-[0.14em] text-[#4f6280]">
                <tr>
                  <th className="px-5 py-3">Produs</th>
                  <th className="px-5 py-3">Categorie</th>
                  <th className="px-5 py-3">Gramaj</th>
                  <th className="px-5 py-3">Preț</th>
                  <th className="px-5 py-3">Stoc</th>
                  <th className="px-5 py-3 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-[#eef2f7]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {it.image_url ? <img src={it.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-[#eef2f7]" />}
                        <span className="font-semibold text-[#0d2c5c]">{it.title}</span>
                        {it.is_featured && <Badge tone="gold">Top</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#4f6280]">{it._cat}</td>
                    <td className="px-5 py-3 text-[#4f6280]">{it.volume_or_weight || "—"}</td>
                    <td className="px-5 py-3 font-semibold text-[#0d2c5c]">{lei(it.price)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => void toggleStock(it)} title="Comută stocul">
                        {it.is_available ? <Badge tone="green">În stoc</Badge> : <Badge tone="red">Epuizat</Badge>}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => {
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
                        }}>
                          <Pencil size={12} /> Editează
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => void remove(`/menu/items/${it.id}`)}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!itemForm} title={itemEditing ? "Editează produs" : "Produs nou"} onClose={() => setItemForm(null)} width="max-w-xl">
        {itemForm && (
          <div className="space-y-4">
            <Field label="Titlu">
              <input className={inputCls} value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categorie">
                <select className={inputCls} value={itemForm.category_id} onChange={(e) => setItemForm({ ...itemForm, category_id: Number(e.target.value) })}>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Preț (lei)">
                <input className={inputCls} inputMode="decimal" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="34.00" />
              </Field>
            </div>
            <Field label="Gramaj / volum">
              <input className={inputCls} value={itemForm.volume_or_weight} onChange={(e) => setItemForm({ ...itemForm, volume_or_weight: e.target.value })} placeholder="400g / 350ml" />
            </Field>
            <Field label="Descriere">
              <textarea rows={2} className={inputCls} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
            </Field>
            <Field label="Ingrediente / alergeni">
              <textarea rows={2} className={inputCls} value={itemForm.ingredients} onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })} />
            </Field>
            <Field label="Imagine (convertită automat în WebP)">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#e1e8f0] px-3.5 py-2.5 text-sm text-[#4f6280]">
                <ImagePlus size={16} /> {itemFile ? itemFile.name : "Alege o imagine"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setItemFile(e.target.files?.[0] ?? null)} />
              </label>
            </Field>
            <div className="flex gap-6 text-sm text-[#0d2c5c]">
              <label className="flex items-center gap-2"><input type="checkbox" checked={itemForm.is_available} onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })} /> În stoc</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={itemForm.is_featured} onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })} /> Recomandat</label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
              <Button variant="ghost" onClick={() => setItemForm(null)}>Renunță</Button>
              <Button disabled={saving} onClick={() => void saveItem()}>{saving ? "Se salvează…" : "Salvează"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!catForm} title={catEditing ? "Editează categoria" : "Categorie nouă"} onClose={() => setCatForm(null)}>
        {catForm && (
          <div className="space-y-4">
            <Field label="Nume">
              <input className={inputCls} value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
            </Field>
            <Field label="Locație">
              <select className={inputCls} value={catForm.place_id} onChange={(e) => setCatForm({ ...catForm, place_id: e.target.value })}>
                <option value="">— Fără locație —</option>
                {places.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </Field>
            <Field label="Descriere">
              <textarea rows={2} className={inputCls} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ordine afișare">
                <input type="number" className={inputCls} value={catForm.display_order} onChange={(e) => setCatForm({ ...catForm, display_order: Number(e.target.value) })} />
              </Field>
              <Field label="Status">
                <label className="flex items-center gap-2 py-2.5 text-sm text-[#0d2c5c]"><input type="checkbox" checked={catForm.is_active} onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })} /> Activă</label>
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
              <Button variant="ghost" onClick={() => setCatForm(null)}>Renunță</Button>
              <Button disabled={saving} onClick={() => void saveCat()}>Salvează</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
