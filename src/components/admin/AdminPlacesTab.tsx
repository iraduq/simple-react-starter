import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
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
  rating?: number;
  lat?: number;
  lng?: number;
  thumb?: string;
  img?: string;
  images?: PlaceImage[];
}

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
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlaceItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
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
    setLoading(true);
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
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
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
        const created = await post<PlaceItem>("/places", body);
        toast("Locație adăugată. Acum poți încărca o imagine!", "success");
        setFormOpen(false);
        await load();
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
    <div className="w-full min-h-screen bg-white text-black p-4 sm:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-10 bg-white">
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
                    <th className="px-5 py-3 font-bold">Rating</th>
                    <th className="px-5 py-3 font-bold">Coordonate</th>
                    <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.slice.map((p) => {
                    const thumbImg =
                      p.thumb ||
                      p.image_url ||
                      p.images?.[0]?.image_url ||
                      p.images?.[0]?.url;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-[#f4f6f9] last:border-0 hover:bg-black/[0.01] transition-colors bg-white"
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
                          <span className="flex items-center gap-1 font-semibold text-[#0d2c5c]">
                            <Star
                              size={13}
                              className="text-[#4f6280] fill-[#4f6280]"
                            />
                            {Number(p.rating || 0).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-[#4f6280]">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-[#4f6280]" />
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

  const refreshPlace = useCallback(async () => {
    try {
      const data = await get<unknown>(`/places`);
      const all = list<PlaceItem>(data);
      const updated = all.find((p) => String(p.id) === String(place.id));
      if (updated) {
        setCurrentPlace(updated);
        setImages(updated.images || []);
      }
    } catch {
      /* ignore */
    }
  }, [place.id]);

  useEffect(() => {
    void refreshPlace();
  }, [refreshPlace]);

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
      await refreshPlace();
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
      await refreshPlace();
      onChanged();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const setPrimaryImage = async (imgId: string) => {
    try {
      await patch(`/places/${place.id}/images/${imgId}/primary`, {});
      toast("Imaginea principală a fost actualizată.", "success");
      await refreshPlace();
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
              ? "border-black bg-black/5"
              : "border-black/10 hover:border-black/30 hover:bg-black/[0.02]"
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
            className="mx-auto text-black mb-3"
          />
          <p className="text-[14px] font-semibold text-black">
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
                        : "border-black/10"
                    } bg-black/5 h-28`}
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
                        className="absolute left-2 top-2 flex h-7 items-center justify-center rounded bg-white/90 px-2 text-[10px] font-bold text-black shadow-md transition-all hover:bg-white opacity-0 group-hover:opacity-100"
                        title="Setează ca primă poză"
                      >
                        Setează principală
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

        <div className="flex justify-end pt-4 border-t border-black/5 bg-white">
          <button
            onClick={onClose}
            className="rounded-full bg-black px-6 py-2.5 text-[11px] font-bold uppercase text-white"
          >
            Închide
          </button>
        </div>
      </div>
    </Modal>
  );
}
