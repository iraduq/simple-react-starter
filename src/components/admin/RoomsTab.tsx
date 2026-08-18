import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Upload, X, BedDouble, Image as ImageIcon } from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  Badge,
  EmptyState,
  Modal,
  Field,
  inputCls,
  Skeleton,
} from "./ui";
import {
  get,
  post,
  patch,
  del,
  upload,
  list,
  money,
  errMsg,
  imageUrl,
  type Room,
  type RoomImage,
  type RoomUnit,
} from "../../lib/admin";
import { useToast } from "../Toast";

export default function RoomsTab() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Room | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    base_price: 0,
    capacity: 2,
    size_sqm: 0,
    is_active: true,
  });
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [mediaRoom, setMediaRoom] = useState<Room | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>("/rooms");
      setRooms(list<Room>(data));
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
    setEditTarget(null);
    setForm({ name: "", description: "", base_price: 0, capacity: 2, size_sqm: 0, is_active: true });
    setFormErr({});
    setFormOpen(true);
  };

  const openEdit = (r: Room) => {
    setEditTarget(r);
    setForm({
      name: r.name || "",
      description: r.description || "",
      base_price: Number(r.base_price || 0),
      capacity: Number(r.capacity || 2),
      size_sqm: Number(r.size_sqm || 0),
      is_active: r.is_active ?? true,
    });
    setFormErr({});
    setFormOpen(true);
  };

  const submitForm = async () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Numele este obligatoriu.";
    if (form.base_price < 0) errs.base_price = "Prețul nu poate fi negativ.";
    if (form.capacity < 1) errs.capacity = "Minim 1 oaspete.";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const body = { ...form, base_price: Number(form.base_price), capacity: Number(form.capacity), size_sqm: Number(form.size_sqm) };
      if (editTarget) {
        await patch(`/rooms/${editTarget.id}`, body);
        toast("Cameră actualizată.", "success");
      } else {
        await post("/rooms", body);
        toast("Cameră creată.", "success");
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
      await del(`/rooms/${deleteTarget.id}`);
      toast("Cameră ștearsă.", "success");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Inventar"
        title="Camere & unități"
        action={
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus size={14} /> Adaugă cameră
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="mt-3 h-5 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <EmptyState title="Nicio cameră definită" hint="Adaugă prima cameră pentru a începe." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <RoomCard
              key={r.id}
              room={r}
              onEdit={() => openEdit(r)}
              onDelete={() => setDeleteTarget(r)}
              onMedia={() => setMediaRoom(r)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={formOpen}
        title={editTarget ? `Editare: ${editTarget.name}` : "Cameră nouă"}
        onClose={() => setFormOpen(false)}
        width="max-w-xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nume cameră" error={formErr.name}>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Suită Deluxe" />
          </Field>
          <Field label="Preț de bază (RON / noapte)" error={formErr.base_price}>
            <input type="number" min={0} className={inputCls} value={form.base_price} onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} />
          </Field>
          <Field label="Capacitate (oaspeți)" error={formErr.capacity}>
            <input type="number" min={1} className={inputCls} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </Field>
          <Field label="Suprafață (mp)">
            <input type="number" min={0} className={inputCls} value={form.size_sqm} onChange={(e) => setForm({ ...form, size_sqm: Number(e.target.value) })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descriere">
              <textarea className={`${inputCls} min-h-[90px] resize-y`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-[#0d2c5c]" />
            <span className="text-sm text-[#0d2c5c]">Cameră activă (vizibilă pentru rezervare)</span>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setFormOpen(false)}>Renunță</Button>
          <Button disabled={saving} onClick={() => void submitForm()}>{saving ? "Se salvează…" : "Salvează"}</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} title="Șterge cameră" onClose={() => setDeleteTarget(null)}>
        <p className="text-sm text-[#4f6280]">
          Sigur vrei să ștergi <strong className="text-[#0d2c5c]">{deleteTarget?.name}</strong>? Acțiunea este ireversibilă.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Anulează</Button>
          <Button variant="danger" onClick={() => void handleDelete()}>Șterge definitiv</Button>
        </div>
      </Modal>

      {/* Media Manager */}
      {mediaRoom && (
        <MediaManager room={mediaRoom} onClose={() => setMediaRoom(null)} onChanged={load} />
      )}
    </div>
  );
}

/* ─────────────── ROOM CARD ─────────────── */
function RoomCard({
  room,
  onEdit,
  onDelete,
  onMedia,
}: {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
  onMedia: () => void;
}) {
  const thumb = room.images?.[0];
  return (
    <Card className="overflow-hidden">
      <div className="relative h-36 bg-[#f4f7fb]">
        {thumb ? (
          <img src={imageUrl(thumb)} alt={room.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#8595aa]">
            <ImageIcon size={28} />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <Badge tone={room.is_active === false ? "red" : "green"}>
            {room.is_active === false ? "Inactive" : "Activă"}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <BedDouble size={15} className="text-[#c69a3f]" />
          <h3 className="text-[15px] font-semibold text-[#0d2c5c]">{room.name}</h3>
        </div>
        <p className="mt-1 line-clamp-2 text-[12.5px] text-[#6b7c99]">{room.description || "—"}</p>
        <div className="mt-3 flex items-center gap-4 text-[12px] text-[#4f6280]">
          <span>{money(room.base_price)} / noapte</span>
          <span>{room.capacity || 0} oaspeți</span>
          {room.size_sqm ? <span>{room.size_sqm} mp</span> : null}
          {room.units && room.units.length > 0 && <span>{room.units.length} unități</span>}
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="ghost" onClick={onEdit}><Pencil size={12} /> Editează</Button>
          <Button size="sm" variant="ghost" onClick={onMedia}><Upload size={12} /> Imagini</Button>
          <Button size="sm" variant="danger" onClick={onDelete}><Trash2 size={12} /></Button>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────── MEDIA MANAGER ─────────────── */
function MediaManager({ room, onClose, onChanged }: { room: Room; onClose: () => void; onChanged: () => void }) {
  const { toast } = useToast();
  const [images, setImages] = useState<RoomImage[]>(room.images || []);
  const [units, setUnits] = useState<RoomUnit[]>(room.units || []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [addingUnit, setAddingUnit] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshRoom = async () => {
    try {
      const data = await get<unknown>(`/rooms`);
      const all = list<Room>(data);
      const updated = all.find((r) => String(r.id) === String(room.id));
      if (updated) {
        setImages(updated.images || []);
        setUnits(updated.units || []);
      }
    } catch { /* ignore */ }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const oversized = Array.from(files).filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast("Fișierele trebuie să fie sub 5MB.", "error");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append("files", f);
      await upload(`/rooms/${room.id}/images`, fd);
      toast("Imagini încărcate.", "success");
      await refreshRoom();
      onChanged();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (img: RoomImage) => {
    try {
      await del(`/rooms/${room.id}/images/${img.id}`);
      toast("Imagine ștearsă.", "success");
      await refreshRoom();
      onChanged();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const addUnit = async () => {
    if (!unitName.trim()) return;
    setAddingUnit(true);
    try {
      await post(`/rooms/${room.id}/units`, { name: unitName.trim() });
      toast("Unitate adăugată.", "success");
      setUnitName("");
      await refreshRoom();
      onChanged();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setAddingUnit(false);
    }
  };

  const toggleUnit = async (u: RoomUnit) => {
    const newActive = !u.is_active;
    try {
      await patch(`/rooms/${room.id}/units/${u.id}`, { is_active: newActive });
      toast(newActive ? "Unitate activată." : "Unitate pusă în mentenanță.", "success");
      await refreshRoom();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  return (
    <Modal open title={`Media & unități: ${room.name}`} onClose={onClose} width="max-w-2xl">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); void handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-[#c69a3f] bg-[#f4e5c8]/30" : "border-[#e1e8f0] hover:border-[#c69a3f]"
        }`}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
        <Upload size={24} className="mx-auto text-[#c69a3f]" />
        <p className="mt-2 text-sm font-semibold text-[#0d2c5c]">
          {uploading ? "Se încarcă…" : "Trage imagini aici sau click pentru a selecta"}
        </p>
        <p className="mt-1 text-[11px] text-[#8595aa]">JPG / PNG, maxim 5MB per fișier</p>
      </div>

      {/* Gallery */}
      {images.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4f6280]">Galerie foto ({images.length})</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img) => (
              <div key={img.id} className="group relative overflow-hidden rounded-xl border border-[#e1e8f0]">
                <img src={imageUrl(img)} alt="" className="h-28 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <button
                  onClick={() => void deleteImage(img)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition-all hover:bg-white hover:scale-110"
                >
                  <X size={14} />
                </button>
                <a
                  href={imageUrl(img)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#0d2c5c] opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Vezi
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-[#e1e8f0] py-8 text-center">
          <p className="text-[13px] text-[#8595aa]">Nicio imagine încărcată pentru această cameră</p>
        </div>
      )}

      {/* Units */}
      <div className="mt-6 border-t border-[#eef2f7] pt-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4f6280]">Unități ({units.length})</p>
        <div className="flex gap-2">
          <input className={inputCls} placeholder="ex: Cabana A — Etaj 1" value={unitName} onChange={(e) => setUnitName(e.target.value)} />
          <Button variant="gold" disabled={addingUnit || !unitName.trim()} onClick={() => void addUnit()}>
            <Plus size={14} /> Adaugă
          </Button>
        </div>
        {units.length > 0 && (
          <div className="mt-3 space-y-2">
            {units.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-[#e1e8f0] px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[#0d2c5c]">{u.name || u.code || `Unitate #${u.id}`}</p>
                  <p className="text-[11px] text-[#6b7c99]">{u.is_active === false ? "Mentenanță" : "Activă"}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => void toggleUnit(u)}>
                  {u.is_active === false ? "Activează" : "Dezactivează"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
