import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Upload,
  Image as ImageIcon,
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
  SearchBox,
  Pagination,
  usePaged,
} from "./ui";
import {
  get,
  post,
  patch,
  del,
  upload,
  list,
  errMsg,
  API_URL,
} from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync, LiveSyncBadge } from "../../context/AdminLiveSyncContext";

interface PlaceImage {
  id: string;
  image_url?: string;
  url?: string;
}

interface PlaceItem {
  id: string | number;
  title?: string;
  name?: string;
  category?: string;
  desc?: string;
  description?: string;
  badge?: string | null;
  is_active?: boolean;
  thumb?: string;
  img?: string;
  image_url?: string;
  images?: PlaceImage[];
}

const EMPTY_FORM = {
  title: "",
  category: "atracție",
  desc: "",
  badge: "",
  is_active: true,
};

const CATEGORIES = [
  "plaja",
  "restaurant",
  "spa",
  "hotel",
  "atracție",
  "bar",
  "magazin",
];

export default function AdminPlacesTab() {
  const { isSyncing, connectionStatus } = useAdminLiveSync({
    topic: "places",
    onSync: () => void load(),
  });
  const { toast } = useToast();
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlaceItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlaceItem | null>(null);
  const [mediaPlace, setMediaPlace] = useState<PlaceItem | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return places;
    return places.filter((p) =>
      [p.title, p.name, p.category, p.badge, p.desc, p.description]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q)),
    );
  }, [places, query]);

  const paged = usePaged(filtered, 10);

  const load = useCallback(async () => {
    try {
      const data = await get<unknown>("/places");
      setPlaces(list<PlaceItem>(data));
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await get<unknown>("/places").catch(() => null);
      if (!active) return;
      if (data) {
        setPlaces(list<PlaceItem>(data));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setNewImageFile(null);
    setImagePreview(null);
    setFormErr({});
    setFormOpen(true);
  };

  const openEdit = (p: PlaceItem) => {
    setEditing(p);
    setForm({
      title: p.title || p.name || "",
      category: p.category || "atracție",
      desc: p.desc || p.description || "",
      badge: p.badge || "",
      is_active: p.is_active !== false,
    });
    setNewImageFile(null);
    setImagePreview(null);
    setFormErr({});
    setFormOpen(true);
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Numele este obligatoriu.";
    if (!form.category.trim()) errs.category = "Categoria este obligatorie.";
    if (!form.desc.trim()) errs.desc = "Descrierea este obligatorie.";
    if (!editing && !newImageFile) {
      errs.image = "Poza pentru locație este obligatorie la adăugarea unei atracții.";
    }

    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        category: form.category.trim(),
        desc: form.desc.trim(),
        badge: form.badge.trim() || null,
        is_active: form.is_active,
      };
      if (editing?.thumb && editing.thumb.length >= 5) {
        body.thumb = editing.thumb;
      }
      if (editing?.img && editing.img.length >= 5) {
        body.img = editing.img;
      }

      let targetId: string | number;

      if (editing) {
        targetId = editing.id;
        await patch(`/places/${editing.id}`, body);
        toast("Locație actualizată.", "success");
      } else {
        const created = await post<PlaceItem>("/places", body);
        targetId = created.id;
        toast("Locație adăugată cu succes.", "success");
      }

      // Dacă s-a selectat o poză nouă (obligatorie la adăugare sau opțională la editare)
      if (newImageFile) {
        const fd = new FormData();
        fd.append("file", newImageFile);
        await upload(`/places/${targetId}/images`, fd);
      }

      setFormOpen(false);
      setNewImageFile(null);
      setImagePreview(null);
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
    <div className="w-full space-y-4">
        <SectionHeader
          eyebrow="Conținut"
          title="Atracții locale"
          action={
            <Button variant="gold" size="sm" onClick={openCreate}>
              <Plus size={14} /> Adaugă locație
            </Button>
          }
        />

        <div className="mb-4">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Caută locație, categorie…"
          />
        </div>

        <Card>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nicio locație"
              hint="Adaugă atracții turistice din zonă pentru a le recomanda oaspeților."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm bg-white">
                <thead>
                  <tr className="border-b border-[#eef2f7] text-[10px] uppercase tracking-[0.18em] text-[#4f6280]">
                    <th className="px-5 py-3 font-bold">Nume & Categorie</th>
                    <th className="px-5 py-3 font-bold">Badge</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.slice.map((p) => {
                    const thumbImg =
                      p.img ||
                      p.thumb ||
                      p.image_url ||
                      p.images?.[0]?.image_url ||
                      p.images?.[0]?.url;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-[#f4f6f9] last:border-0 hover:bg-[#0d2c5c]/[0.01] transition-colors bg-white"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {thumbImg ? (
                              <img
                                src={
                                  thumbImg.startsWith("http")
                                    ? thumbImg
                                    : `${API_URL}${thumbImg}`
                                }
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover border border-[#e1e8f0]"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-[#eef2f7] flex items-center justify-center text-[#6b7c99]">
                                <ImageIcon size={18} />
                              </div>
                            )}
                            <div>
                              <span className="block font-semibold text-[#0d2c5c]">
                                {p.title || p.name}
                              </span>
                              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#4f6280]">
                                {p.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {p.badge ? (
                            <Badge tone="gold">{p.badge}</Badge>
                          ) : (
                            <span className="text-[#6b7c99]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {p.is_active === false ? (
                            <Badge tone="muted">Inactivă</Badge>
                          ) : (
                            <Badge tone="green">Activă</Badge>
                          )}
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
                    );
                  })}
                </tbody>
              </table>
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

        <Modal
          open={formOpen}
          title={editing ? "Editare locație" : "Locație nouă"}
          onClose={() => setFormOpen(false)}
          width="max-w-xl"
        >
          <div className="space-y-4 bg-white">
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
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
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
              <Field label="Status">
                <label className="flex items-center gap-2 py-2.5 text-sm text-[#0d2c5c]">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Vizibilă pe site
                </label>
              </Field>
            </div>

            {/* Secțiune Poză Locație (Obligatorie la adăugare) */}
            <Field
              label={
                editing
                  ? "Poză principală (opțional, alege pentru a schimba poza)"
                  : "Poză locație (obligatorie) *"
              }
              error={formErr.image}
            >
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-[#e1e8f0] bg-slate-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-md hover:bg-white"
                      title="Șterge selecția"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="absolute bottom-2 left-2 rounded-full bg-[#0d2c5c]/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      Poză selectată pentru încărcare
                    </span>
                  </div>
                ) : editing?.img || editing?.thumb ? (
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-[#e1e8f0] bg-slate-50 group">
                    <img
                      src={editing.img || editing.thumb}
                      alt="Imagine curentă"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#0d2c5c]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => createFileInputRef.current?.click()}
                        className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0d2c5c] shadow hover:bg-slate-100"
                      >
                        Înlocuiește poza
                      </button>
                    </div>
                    <span className="absolute bottom-2 left-2 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                      Poză principală curentă
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => createFileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e1e8f0] p-6 text-center cursor-pointer transition-all hover:border-[#0d2c5c]/40 hover:bg-[#0d2c5c]/[0.02]"
                  >
                    <Upload size={24} className="text-[#0d2c5c] mb-2" />
                    <p className="text-xs font-bold text-[#0d2c5c]">
                      Apasă aici pentru a alege poza locației {!editing && "*"}
                    </p>
                    <p className="text-[11px] text-[#6b7c99] mt-0.5">
                      JPG, PNG sau WebP (max. 5MB)
                    </p>
                  </div>
                )}

                <input
                  ref={createFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast("Fișierul depășește limita de 5MB.", "error");
                        return;
                      }
                      setNewImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                      if (formErr.image) {
                        setFormErr((prev) => {
                          const n = { ...prev };
                          delete n.image;
                          return n;
                        });
                      }
                    }
                  }}
                />
              </div>
            </Field>

          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-[#eef2f7] pt-4 bg-white">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Renunță
            </Button>
            <Button disabled={saving} onClick={() => void submit()}>
              {saving ? "Se salvează…" : "Salvează locația"}
            </Button>
          </div>
        </Modal>

        <Modal
          open={!!deleteTarget}
          title="Șterge atracție"
          onClose={() => setDeleteTarget(null)}
        >
          <p className="text-sm text-[#2a3b52]">
            Sigur vrei să ștergi{" "}
            <strong className="text-[#0d2c5c]">
              {deleteTarget?.title || deleteTarget?.name}
            </strong>
            ? Această acțiune nu poate fi anulată.
          </p>
          <div className="mt-6 flex justify-end gap-2 border-t border-[#eef2f7] pt-4 bg-white">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Anulează
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()}>
              Șterge definitiv
            </Button>
          </div>
        </Modal>

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

function PlaceMediaManager({
  place,
  onClose,
  onChanged,
}: {
  place: PlaceItem;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [currentPlace, setCurrentPlace] = useState<PlaceItem>(place);
  const [images, setImages] = useState<PlaceImage[]>(place.images || []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await get<unknown>(`/places`).catch(() => null);
      if (!active) return;
      if (data) {
        const all = list<PlaceItem>(data);
        const updated = all.find((p) => String(p.id) === String(place.id));
        if (updated) {
          setCurrentPlace(updated);
          setImages(updated.images || []);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [place.id]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((f) => {
        const fd = new FormData();
        fd.append("file", f);
        return upload(`/places/${place.id}/images`, fd);
      });

      await Promise.all(uploadPromises);
      toast("Imagini încărcate cu succes.", "success");

      const data = await get<unknown>(`/places`);
      const all = list<PlaceItem>(data);
      const updated = all.find((p) => String(p.id) === String(place.id));
      if (updated) {
        setCurrentPlace(updated);
        setImages(updated.images || []);
      }

      onChanged();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imgId: string) => {
    try {
      await del(`/places/${place.id}/images/${imgId}`);
      toast("Imagine ștearsă din baza de date și bucket.", "success");

      const data = await get<unknown>(`/places`);
      const all = list<PlaceItem>(data);
      const updated = all.find((p) => String(p.id) === String(place.id));
      if (updated) {
        setCurrentPlace(updated);
        setImages(updated.images || []);
      }

      onChanged();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const setPrimaryImage = async (imgId: string) => {
    try {
      await patch(`/places/${place.id}/images/${imgId}/primary`, {});
      toast("Imaginea principală a fost actualizată.", "success");

      const data = await get<unknown>(`/places`);
      const all = list<PlaceItem>(data);
      const updated = all.find((p) => String(p.id) === String(place.id));
      if (updated) {
        setCurrentPlace(updated);
        setImages(updated.images || []);
      }

      onChanged();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  return (
    <Modal
      open
      title={`Galerie foto: ${currentPlace.title || currentPlace.name}`}
      onClose={onClose}
      width="max-w-2xl"
    >
      <div className="p-6 space-y-6 bg-white">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            dragOver
              ? "border-[#0d2c5c] bg-[#0d2c5c]/5"
              : "border-[#e1e8f0] hover:border-[#0d2c5c]/30 hover:bg-[#0d2c5c]/[0.02]"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <Upload
            size={28}
            strokeWidth={1.5}
            className="mx-auto text-[#0d2c5c] mb-3"
          />
          <p className="text-[14px] font-semibold text-[#0d2c5c]">
            {uploading
              ? "Se încarcă…"
              : "Trage imagini aici sau click pentru a selecta (multiple)"}
          </p>
          <p className="mt-1 text-[12px] text-[#6b7c99]">
            JPG / PNG, maxim 5MB per fișier
          </p>
        </div>

        {images.length > 0 ? (
          <div>
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#6b7c99] block mb-3">
              Imagini salvate ({images.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => {
                const imgUrl = img.image_url || img.url || "";
                const isPrimary =
                  currentPlace.thumb === imgUrl || currentPlace.img === imgUrl;

                return (
                  <div
                    key={img.id}
                    className={`group relative overflow-hidden rounded-xl border ${
                      isPrimary
                        ? "border-amber-500 ring-2 ring-amber-400"
                        : "border-[#e1e8f0]"
                    } bg-[#0d2c5c]/5 h-28`}
                  >
                    <img
                      src={
                        imgUrl.startsWith("http")
                          ? imgUrl
                          : `${API_URL}${imgUrl}`
                      }
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {isPrimary && (
                      <span className="absolute left-2 top-2 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white shadow">
                        Principală
                      </span>
                    )}

                    {!isPrimary && (
                      <button
                        onClick={() => void setPrimaryImage(img.id)}
                        className="absolute left-2 top-2 flex h-7 items-center justify-center rounded bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#0d2c5c] shadow-md transition-all hover:bg-[#0d2c5c] hover:text-white opacity-90 group-hover:opacity-100"
                        title="Setează această imagine ca principală pe tot site-ul"
                      >
                        Alege ca principală
                      </button>
                    )}

                    <button
                      onClick={() => void deleteImage(img.id)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600 shadow-md transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                      title="Șterge imaginea"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-[#6b7c99] py-4">
            Nicio imagine încărcată încă.
          </p>
        )}

        <div className="flex justify-end pt-4 border-t border-[#0d2c5c]/5 bg-white">
          <button
            onClick={onClose}
            className="rounded-full bg-[#0d2c5c] px-6 py-2.5 text-[11px] font-bold uppercase text-white"
          >
            Închide
          </button>
        </div>
      </div>
    </Modal>
  );
}
