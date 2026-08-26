import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  BedDouble,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { Badge, EmptyState, Modal } from "./ui";
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
} from "../../lib/admin";
import { useToast } from "../Toast";

const fieldInput =
  "w-full py-3 px-4 bg-black/[0.02] border border-black/10 rounded-xl text-[14px] text-black outline-none transition-all focus:bg-white focus:border-black/30 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.05)] placeholder:text-[#6b7c99]";

export default function RoomsTab() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Room | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    base_price: 0,
    floor_price: 0,
    ceiling_price: 0,
    max_guests_adults: 2,
    max_guests_children: 0,
    size_sqm: 0,
    facility_ids: [] as number[],
  });

  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [mediaRoom, setMediaRoom] = useState<Room | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [roomsRes, facRes] = await Promise.allSettled([
        get<unknown>("/rooms"),
        get<unknown>("/rooms/facilities"),
      ]);

      if (roomsRes.status === "fulfilled") setRooms(list<Room>(roomsRes.value));
      if (facRes.status === "fulfilled") setFacilities(list<any>(facRes.value));
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
    setForm({
      title: "",
      description: "",
      base_price: 0,
      floor_price: 0,
      ceiling_price: 0,
      max_guests_adults: 2,
      max_guests_children: 0,
      size_sqm: 0,
      facility_ids: [],
    });
    setFormErr({});
    setFormOpen(true);
  };

  const openEdit = (r: any) => {
    setEditTarget(r);
    setForm({
      title: r.title || r.name || "",
      description: r.description || "",
      base_price: Number(r.base_price || 0),
      floor_price: Number(r.floor_price || 0),
      ceiling_price: Number(r.ceiling_price || 0),
      max_guests_adults: Number(r.max_guests_adults || r.capacity || 2),
      max_guests_children: Number(r.max_guests_children || 0),
      size_sqm: Number(r.size_sqm || 0),
      facility_ids: r.facilities ? r.facilities.map((f: any) => f.id) : [],
    });
    setFormErr({});
    setFormOpen(true);
  };

  const toggleFacility = (id: number) => {
    setForm((prev) => {
      const exists = prev.facility_ids.includes(id);
      if (exists) {
        return {
          ...prev,
          facility_ids: prev.facility_ids.filter((fid) => fid !== id),
        };
      } else {
        return { ...prev, facility_ids: [...prev.facility_ids, id] };
      }
    });
  };

  const submitForm = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Numele camerei este obligatoriu.";
    if (form.base_price < 0) errs.base_price = "Prețul nu poate fi negativ.";
    if (form.max_guests_adults < 1) errs.max_guests_adults = "Minim 1 adult.";
    if (
      form.floor_price > 0 &&
      form.ceiling_price > 0 &&
      form.floor_price > form.ceiling_price
    ) {
      errs.floor_price =
        "Prețul minim nu poate fi mai mare decât prețul maxim.";
    }

    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const body: Record<string, any> = {
        title: form.title.trim(),
        description: form.description.trim(),
        base_price: Number(form.base_price),
        max_guests_adults: Number(form.max_guests_adults),
        max_guests_children: Number(form.max_guests_children),
        size_sqm: Number(form.size_sqm) || null,
        facility_ids: form.facility_ids,
      };

      if (form.floor_price > 0) body.floor_price = Number(form.floor_price);
      if (form.ceiling_price > 0)
        body.ceiling_price = Number(form.ceiling_price);

      if (editTarget) {
        await patch(`/rooms/${editTarget.id}`, body);
        toast("Cameră actualizată.", "success");
      } else {
        await post("/rooms", body);
        toast("Cameră creată.", "success");
      }
      setFormOpen(false);
      await load();
    } catch (e: any) {
      // 🌟 Afișează erorile de validare direct prin Toast
      const errDetails = e?.response?.data?.details;

      if (errDetails && Array.isArray(errDetails)) {
        // Dacă sunt mai multe erori, le afișăm pe rând sau le combinăm
        errDetails.forEach((err: any) => {
          const fieldName = err.field ? `[${err.field}]: ` : "";
          toast(`${fieldName}${err.message}`, "error");
        });
      } else {
        // Dacă e o eroare generală, folosim mesajul standard
        toast(errMsg(e), "error");
      }
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
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-px bg-black/40" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b7c99]">
              Inventar
            </span>
          </div>
          <h2 className="font-['Cormorant_Garamond',serif] text-[32px] md:text-[36px] text-black leading-none">
            Camere
          </h2>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:bg-neutral-800"
        >
          <Plus size={14} /> Adaugă cameră
        </button>
      </motion.div>

      {/* ── CONȚINUT ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
      >
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              >
                <div className="h-32 w-full animate-pulse rounded-xl bg-black/5" />
                <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-black/5" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-black/5" />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-[24px] border border-black/5 bg-white p-16 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <EmptyState
              title="Nicio cameră definită"
              hint="Adaugă prima cameră pentru a începe."
            />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
      </motion.div>

      {/* ── MODALS ── */}
      <Modal
        open={formOpen}
        title={
          editTarget
            ? `Editare: ${(editTarget as any).title || editTarget.name}`
            : "Cameră nouă"
        }
        onClose={() => setFormOpen(false)}
        width="max-w-2xl"
      >
        <div className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField label="Nume cameră">
                <input
                  className={`${fieldInput} mt-2`}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex: Suită Deluxe"
                />
                {formErr.title && (
                  <span className="text-[11px] text-[#0d2c5c] mt-1">
                    {formErr.title}
                  </span>
                )}
              </FormField>
            </div>

            <FormField label="Preț de bază (RON)">
              <input
                type="number"
                min={0}
                className={`${fieldInput} mt-2`}
                value={form.base_price}
                onChange={(e) =>
                  setForm({ ...form, base_price: Number(e.target.value) })
                }
              />
              {formErr.base_price && (
                <span className="text-[11px] text-[#0d2c5c] mt-1">
                  {formErr.base_price}
                </span>
              )}
            </FormField>

            <FormField label="Suprafață (mp) - Opțional">
              <input
                type="number"
                min={0}
                className={`${fieldInput} mt-2`}
                value={form.size_sqm}
                onChange={(e) =>
                  setForm({ ...form, size_sqm: Number(e.target.value) })
                }
              />
            </FormField>

            <FormField label="Preț minim (Floor) - Opțional">
              <input
                type="number"
                min={0}
                className={`${fieldInput} mt-2`}
                value={form.floor_price || ""}
                placeholder="ex: 150"
                onChange={(e) =>
                  setForm({ ...form, floor_price: Number(e.target.value) })
                }
              />
              {formErr.floor_price && (
                <span className="text-[11px] text-[#0d2c5c] mt-1">
                  {formErr.floor_price}
                </span>
              )}
            </FormField>

            <FormField label="Preț maxim (Ceiling) - Opțional">
              <input
                type="number"
                min={0}
                className={`${fieldInput} mt-2`}
                value={form.ceiling_price || ""}
                placeholder="ex: 800"
                onChange={(e) =>
                  setForm({ ...form, ceiling_price: Number(e.target.value) })
                }
              />
            </FormField>

            <FormField label="Max Adulți">
              <input
                type="number"
                min={1}
                className={`${fieldInput} mt-2`}
                value={form.max_guests_adults}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_guests_adults: Number(e.target.value),
                  })
                }
              />
              {formErr.max_guests_adults && (
                <span className="text-[11px] text-[#0d2c5c] mt-1">
                  {formErr.max_guests_adults}
                </span>
              )}
            </FormField>

            <FormField label="Max Copii">
              <input
                type="number"
                min={0}
                className={`${fieldInput} mt-2`}
                value={form.max_guests_children}
                onChange={(e) =>
                  setForm({
                    ...form,
                    max_guests_children: Number(e.target.value),
                  })
                }
              />
            </FormField>

            {/* GRILA DE FACILITĂȚI */}
            <div className="sm:col-span-2">
              <FormField label="Facilități Cameră">
                {facilities.length === 0 ? (
                  <p className="text-[12px] text-[#6b7c99] mt-2">
                    Nu există facilități definite în sistem. Adaugă din meniul
                    principal.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {facilities.map((fac) => {
                      const isSelected = form.facility_ids.includes(fac.id);
                      return (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() => toggleFacility(fac.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all ${
                            isSelected
                              ? "bg-black text-white border-black shadow-md"
                              : "bg-black/[0.02] text-[#2a3b52] border-black/10 hover:border-black/30 hover:bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                          {fac.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Descriere">
                <textarea
                  className={`${fieldInput} mt-2 min-h-[90px] resize-y`}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Descrie facilitățile camerei..."
                />
              </FormField>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-black/5 pt-5">
            <button
              onClick={() => setFormOpen(false)}
              className="rounded-full border border-black/10 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:bg-black/5"
            >
              Renunță
            </button>
            <button
              disabled={saving}
              onClick={() => void submitForm()}
              className="rounded-full bg-black px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-neutral-800 disabled:opacity-60"
            >
              {saving ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Șterge cameră"
        onClose={() => setDeleteTarget(null)}
      >
        <div className="p-6">
          <p className="text-[14px] text-[#666]">
            Sigur vrei să ștergi camera{" "}
            <strong className="text-black">
              {(deleteTarget as any)?.title || deleteTarget?.name}
            </strong>
            ? Acțiunea este ireversibilă și va șterge toate datele asociate.
          </p>
          <div className="mt-8 flex justify-end gap-3 border-t border-black/5 pt-5">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-full border border-black/10 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:bg-black/5"
            >
              Anulează
            </button>
            <button
              onClick={() => void handleDelete()}
              className="rounded-full bg-[#0d2c5c] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-[#07203f]"
            >
              Șterge definitiv
            </button>
          </div>
        </div>
      </Modal>

      {mediaRoom && (
        <MediaManager
          room={mediaRoom}
          onClose={() => setMediaRoom(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

/* ─────────────── ROOM CARD MINIMALIST ─────────────── */
function RoomCard({
  room,
  onEdit,
  onDelete,
  onMedia,
}: {
  room: any;
  onEdit: () => void;
  onDelete: () => void;
  onMedia: () => void;
}) {
  const thumb = room.images?.[0];
  const displayTitle = room.title || room.name || "Cameră fără nume";

  return (
    <div className="rounded-[24px] border border-black/5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="relative h-44 bg-black/[0.02]">
        {thumb ? (
          <img
            src={imageUrl(thumb)}
            alt={displayTitle}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#6b7c99]">
            <ImageIcon size={28} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <Badge tone={room.is_active === false ? "red" : "green"}>
            {room.is_active === false ? "Inactivă" : "Activă"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <BedDouble size={16} className="text-black" />
          <h3 className="text-[16px] font-bold text-black leading-tight">
            {displayTitle}
          </h3>
        </div>

        <p className="mt-2 line-clamp-2 text-[13px] text-[#6b7c99] leading-relaxed">
          {room.description || "Nicio descriere setată."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-semibold text-[#6b7c99]">
          <span className="text-black rounded-lg bg-black/5 px-2 py-1">
            {money(room.base_price)} / noapte
          </span>
          <span>{room.max_guests_adults || room.capacity || 0} Adulți</span>
          {room.max_guests_children > 0 && (
            <span>{room.max_guests_children} Copii</span>
          )}
          {room.size_sqm ? <span>{room.size_sqm} mp</span> : null}
        </div>

        {/* Afișează facilitățile pe card */}
        {room.facilities && room.facilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {room.facilities.slice(0, 4).map((f: any) => (
              <span
                key={f.id}
                className="text-[9px] uppercase tracking-wider font-bold text-[#6b7c99] bg-black/5 px-2 py-1 rounded-md"
              >
                {f.name}
              </span>
            ))}
            {room.facilities.length > 4 && (
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#6b7c99] bg-black/5 px-2 py-1 rounded-md">
                +{room.facilities.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-6 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:border-black/30 hover:bg-black/5"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={onMedia}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:border-black/30 hover:bg-black/5"
          >
            <Upload size={12} /> Foto
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-full border border-[#e1e8f0] bg-white px-3 py-2 text-[#0d2c5c] transition-all hover:bg-[#f4f6f9]"
            title="Șterge"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── MEDIA MANAGER MINIMALIST ─────────────── */
function MediaManager({
  room,
  onClose,
  onChanged,
}: {
  room: any;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [images, setImages] = useState<RoomImage[]>(room.images || []);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshRoom = async () => {
    try {
      const data = await get<unknown>(`/rooms`);
      const all = list<Room>(data);
      const updated = all.find((r) => String(r.id) === String(room.id));
      if (updated) {
        setImages(updated.images || []);
      }
    } catch {
      /* ignore */
    }
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
      const uploadPromises = Array.from(files).map((f) => {
        const fd = new FormData();
        fd.append("file", f);
        return upload(`/rooms/${room.id}/images`, fd);
      });

      await Promise.all(uploadPromises);
      toast("Imagini încărcate cu succes.", "success");
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

  const displayTitle = room.title || room.name || "Cameră";

  return (
    <Modal open title={`Galerie foto: ${displayTitle}`} onClose={onClose}>
      <div className="p-6">
        {/* Upload zone */}
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
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
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
              : "Trage imagini aici sau click pentru a selecta"}
          </p>
          <p className="mt-1 text-[12px] text-[#6b7c99]">
            JPG / PNG, maxim 5MB per fișier
          </p>
        </div>

        {/* Gallery */}
        {images.length > 0 ? (
          <div className="mt-8">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#6b7c99] block mb-3">
              Galerie foto ({images.length})
            </span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative overflow-hidden rounded-xl border border-black/10 bg-black/5"
                >
                  <img
                    src={imageUrl(img)}
                    alt=""
                    className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  <button
                    onClick={() => void deleteImage(img)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0d2c5c] shadow-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                  <a
                    href={imageUrl(img)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 left-2 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-black shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
                  >
                    VEZI
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-black/10 bg-black/[0.01] py-8 text-center">
            <p className="text-[13px] text-[#6b7c99]">
              Nicio imagine încărcată pentru această cameră
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-end border-t border-black/5 pt-5">
          <button
            onClick={onClose}
            className="rounded-full bg-black px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-neutral-800"
          >
            Închide
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────── COMPONENTĂ LOCALĂ FORM FIELD ─────────────── */
function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col">
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#6b7c99] ml-1">
        {label}
      </span>
      {children}
    </label>
  );
}
