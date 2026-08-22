import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  MapPin,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
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
import {
  get,
  post,
  patch,
  del,
  upload,
  list,
  errMsg,
  type Place,
} from "../../lib/admin";
import { useToast } from "../Toast";

// Structura FĂRĂ imagini în formular, dar cu denumirile cerute de FastAPI
const EMPTY_FORM = {
  title: "",
  category: "atracție",
  desc: "",
  badge: "",
  rating: 0,
  lat: 0,
  lng: 0,
};

const CATEGORIES = [
  "plaja",
  "restaurant",
  "hotel",
  "atracție",
  "bar",
  "magazin",
];

export default function AdminPlacesTab() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [mediaPlace, setMediaPlace] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>("/places");
      setPlaces(list<any>(data));
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

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      title: p.title || "",
      category: p.category || "atracție",
      desc: p.desc || p.description || "",
      badge: p.badge || "",
      rating: Number(p.rating || 0),
      lat: Number(p.lat || 0),
      lng: Number(p.lng || 0),
    });
    setFormErr({});
    setFormOpen(true);
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Numele este obligatoriu.";
    if (!form.category.trim()) errs.category = "Categoria este obligatorie.";
    if (!form.desc.trim()) errs.desc = "Descrierea este obligatorie.";
    if (form.rating < 0 || form.rating > 5)
      errs.rating = "Rating între 0 și 5.";

    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      // Backend-ul are min_length=5 pe thumb/img — un string gol ("") pică
      // validarea Pydantic. Trimitem câmpul DOAR dacă există deja o valoare
      // validă (upload anterior); altfel îl omitem complet din body ca
      // backend-ul să folosească default-ul lui (None / coloană goală).
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        category: form.category.trim(),
        desc: form.desc.trim(),
        badge: form.badge.trim() || null,
        rating: Number(form.rating),
        lat: Number(form.lat),
        lng: Number(form.lng),
      };
      if (editing?.thumb && editing.thumb.length >= 5) {
        body.thumb = editing.thumb;
      }
      if (editing?.img && editing.img.length >= 5) {
        body.img = editing.img;
      }

      if (editing) {
        await patch(`/places/${editing.id}`, body);
        toast("Locație actualizată.", "success");
      } else {
        const created = await post<any>("/places", body);
        toast("Locație adăugată. Acum poți încărca o imagine!", "success");
        setFormOpen(false);
        await load();
        // Deschidem direct managerul de imagine pentru locația nou creată,
        // ca fluxul de upload din Supabase bucket să continue imediat.
        if (created?.id) {
          setMediaPlace(created);
        }
        return;
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
      toast("Locație ștearsă.", "success");
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
            <Plus size={14} /> Adaugă locație
          </Button>
        }
      />

      <Card>
        {loading ? (
          <TableSkeleton rows={5} />
        ) : places.length === 0 ? (
          <EmptyState
            title="Nicio locație"
            hint="Adaugă atracții turistice din zonă pentru a le recomanda oaspeților."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f7] text-[10px] uppercase tracking-[0.18em] text-[#6b7c99]">
                  <th className="px-5 py-3 font-bold">Nume & Categorie</th>
                  <th className="px-5 py-3 font-bold">Badge</th>
                  <th className="px-5 py-3 font-bold">Rating</th>
                  <th className="px-5 py-3 font-bold">Coordonate</th>
                  <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {places.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#f4f6f9] last:border-0 hover:bg-[#f9fafc] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.thumb || p.image_url ? (
                          <img
                            src={p.thumb || p.image_url}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border border-[#e1e8f0]"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-[#8595aa]">
                            <ImageIcon size={18} />
                          </div>
                        )}
                        <div>
                          <span className="block font-semibold text-[#0d2c5c]">
                            {p.title || p.name}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#c69a3f]">
                            {p.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.badge ? (
                        <Badge tone="gold">{p.badge}</Badge>
                      ) : (
                        <span className="text-[#8595aa]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 font-semibold text-[#0d2c5c]">
                        <Star
                          size={13}
                          className="text-[#c69a3f] fill-[#c69a3f]"
                        />
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil size={12} /> Editează
                        </Button>
                        {/* Butonul de Upload Imagine */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMediaPlace(p)}
                        >
                          <Upload size={12} /> Imagine
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(p)}
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
        )}
      </Card>

      {/* ── FORMULAR CREATE/EDIT (Fără poze!) ── */}
      <Modal
        open={formOpen}
        title={editing ? "Editare locație" : "Locație nouă"}
        onClose={() => setFormOpen(false)}
        width="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nume locație" error={formErr.title}>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="ex: Plaja Mamaia Nord"
              />
            </Field>
            <Field label="Categorie" error={formErr.category}>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Selectează...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Descriere" error={formErr.desc}>
            <textarea
              className={`${inputCls} min-h-[90px] resize-y`}
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Descriere scurtă a atracției..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Badge (etichetă)">
              <input
                className={inputCls}
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Recomandat / Nou"
              />
            </Field>
            <Field label="Rating (0-5)" error={formErr.rating}>
              <input
                type="number"
                step="0.1"
                min={0}
                max={5}
                className={inputCls}
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitudine">
              <input
                type="number"
                step="any"
                className={inputCls}
                value={form.lat}
                onChange={(e) =>
                  setForm({ ...form, lat: Number(e.target.value) })
                }
                placeholder="44.2488"
              />
            </Field>
            <Field label="Longitudine">
              <input
                type="number"
                step="any"
                className={inputCls}
                value={form.lng}
                onChange={(e) =>
                  setForm({ ...form, lng: Number(e.target.value) })
                }
                placeholder="28.6653"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
          <Button variant="ghost" onClick={() => setFormOpen(false)}>
            Renunță
          </Button>
          <Button disabled={saving} onClick={() => void submit()}>
            {saving ? "Se salvează…" : "Salvează locația"}
          </Button>
        </div>
      </Modal>

      {/* ── MODAL STERGERE ── */}
      <Modal
        open={!!deleteTarget}
        title="Șterge atracție"
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-sm text-[#4f6280]">
          Sigur vrei să ștergi{" "}
          <strong className="text-[#0d2c5c]">
            {deleteTarget?.title || deleteTarget?.name}
          </strong>
          ? Această acțiune nu poate fi anulată.
        </p>
        <div className="mt-6 flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Anulează
          </Button>
          <Button variant="danger" onClick={() => void handleDelete()}>
            Șterge definitiv
          </Button>
        </div>
      </Modal>

      {/* ── MEDIA MANAGER (Aici se uploadeaza poza) ── */}
      {mediaPlace && (
        <PlaceMediaManager
          place={mediaPlace}
          onClose={() => setMediaPlace(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

/* ─────────────── PLACE MEDIA MANAGER (Drag & Drop) ─────────────── */
function PlaceMediaManager({
  place,
  onClose,
  onChanged,
}: {
  place: any;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast("Fișierul trebuie să fie sub 5MB.", "error");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      // Endpoint-ul de pe backend încarcă fișierul în bucket-ul Supabase
      // și întoarce locația cu img/thumb populate cu URL-ul public.
      await upload(`/places/${place.id}/image`, fd);

      toast("Imaginea a fost încărcată cu succes.", "success");
      onChanged();
      onClose();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    try {
      // La ștergere trimitem explicit null, nu string gol — respectă
      // min_length=5 de pe backend (câmpul devine opțional/nul).
      await patch(`/places/${place.id}`, { img: null, thumb: null });
      toast("Imaginea a fost ștearsă.", "success");
      onChanged();
      onClose();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  return (
    <Modal
      open
      title={`Imagine locație: ${place.title || place.name}`}
      onClose={onClose}
      width="max-w-md"
    >
      <div className="space-y-5">
        {place.img || place.thumb ? (
          <div className="relative overflow-hidden rounded-xl border border-[#e1e8f0]">
            <img
              src={place.img || place.thumb}
              alt={place.title}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => void deleteImage()}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition-all hover:bg-white hover:scale-110"
              title="Șterge imaginea"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                void handleFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${
              dragOver
                ? "border-[#c69a3f] bg-[#f4e5c8]/30 scale-[1.02]"
                : "border-[#e1e8f0] bg-[#f9fafc] hover:border-[#c69a3f] hover:bg-white"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  void handleFile(e.target.files[0]);
                }
              }}
            />
            <Upload size={28} className="text-[#c69a3f] mb-3" />
            <p className="text-[14px] font-semibold text-[#0d2c5c]">
              {uploading ? "Se încarcă…" : "Click sau trage imaginea aici"}
            </p>
            <p className="mt-1 text-[12px] text-[#8595aa]">
              JPG / PNG (max 5MB)
            </p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end pt-4 border-t border-[#eef2f7]">
        <Button variant="ghost" onClick={onClose}>
          Închide
        </Button>
      </div>
    </Modal>
  );
}
