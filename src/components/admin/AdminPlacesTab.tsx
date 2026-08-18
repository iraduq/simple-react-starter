import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, MapPin } from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  Badge,
  TableSkeleton,
  EmptyState,
  Modal,
  Field,
  inputCls,
} from "./ui";
import { get, post, patch, del, list, errMsg, type Place } from "../../lib/admin";
import { useToast } from "../Toast";

const EMPTY_FORM = {
  name: "",
  description: "",
  badge: "",
  rating: 0,
  lat: 0,
  lng: 0,
  image_url: "",
};

export default function AdminPlacesTab() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Place | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>("/places");
      setPlaces(list<Place>(data));
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setFormOpen(true);
  };

  const openEdit = (p: Place) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      badge: p.badge || "",
      rating: Number(p.rating || 0),
      lat: Number(p.lat || 0),
      lng: Number(p.lng || 0),
      image_url: p.image_url || "",
    });
    setFormErr({});
    setFormOpen(true);
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Numele este obligatoriu.";
    if (form.rating < 0 || form.rating > 5) errs.rating = "Rating între 0 și 5.";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        badge: form.badge.trim() || null,
        rating: Number(form.rating),
        lat: Number(form.lat),
        lng: Number(form.lng),
        image_url: form.image_url.trim() || null,
      };
      if (editing) {
        await patch(`/places/${editing.id}`, body);
        toast("Atracție actualizată.", "success");
      } else {
        await post("/places", body);
        toast("Atracție adăugată.", "success");
      }
      setFormOpen(false);
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del(`/places/${deleteTarget.id}`);
      toast("Atracție ștearsă.", "success");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Conținut"
        title="Atracții locale"
        action={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus size={14} /> Adaugă
          </Button>
        }
      />

      <Card>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : places.length === 0 ? (
          <EmptyState title="Nicio atracție" hint="Adaugă atracții turistice din zonă." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f7] text-[10px] uppercase tracking-[0.18em] text-[#6b7c99]">
                  <th className="px-5 py-3 font-bold">Nume</th>
                  <th className="px-5 py-3 font-bold">Badge</th>
                  <th className="px-5 py-3 font-bold">Rating</th>
                  <th className="px-5 py-3 font-bold">Coordonate</th>
                  <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {places.map((p) => (
                  <tr key={p.id} className="border-b border-[#f4f6f9] last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                        <div>
                          <span className="block font-semibold text-[#0d2c5c]">{p.name}</span>
                          <span className="text-[12px] text-[#6b7c99] line-clamp-1">{p.description || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.badge ? <Badge tone="gold">{p.badge}</Badge> : <span className="text-[#8595aa]">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 font-semibold text-[#0d2c5c]">
                        <Star size={13} className="text-[#c69a3f] fill-[#c69a3f]" />
                        {Number(p.rating || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#6b7c99]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#c69a3f]" />
                        {p.lat != null ? `${p.lat}, ${p.lng}` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil size={12} /></Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(p)}><Trash2 size={12} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={formOpen} title={editing ? "Editare atracție" : "Atracție nouă"} onClose={() => setFormOpen(false)} width="max-w-lg">
        <div className="space-y-4">
          <Field label="Nume" error={formErr.name}>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Plaja Mamaia Nord" />
          </Field>
          <Field label="Descriere">
            <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Badge">
              <input className={inputCls} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Recomandat / Nou" />
            </Field>
            <Field label="Rating (0-5)" error={formErr.rating}>
              <input type="number" step="0.1" min={0} max={5} className={inputCls} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitudine">
              <input type="number" step="any" className={inputCls} value={form.lat} onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })} />
            </Field>
            <Field label="Longitudine">
              <input type="number" step="any" className={inputCls} value={form.lng} onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="URL Imagine">
            <input type="url" className={inputCls} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setFormOpen(false)}>Renunță</Button>
          <Button disabled={saving} onClick={() => void submit()}>{saving ? "Se salvează…" : "Salvează"}</Button>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} title="Șterge atracție" onClose={() => setDeleteTarget(null)}>
        <p className="text-sm text-[#4f6280]">
          Sigur vrei să ștergi <strong className="text-[#0d2c5c]">{deleteTarget?.name}</strong>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Anulează</Button>
          <Button variant="danger" onClick={() => void handleDelete()}>Șterge</Button>
        </div>
      </Modal>
    </div>
  );
}
