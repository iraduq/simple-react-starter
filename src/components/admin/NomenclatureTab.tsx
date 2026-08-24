import { useEffect, useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Check,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  SearchBox,
  Pagination,
  usePaged,
  Button,
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
  list,
  errMsg,

} from "../../lib/admin";
import { useToast } from "../Toast";

/* ─────────────── ICON LIBRARY (lucide-react) ─────────────── */
const LEGACY_ALIASES: Record<string, string> = {
  wifi: "Wifi",
  air: "Wind",
  bath: "Bath",
  tv: "Tv",
  drink: "Wine",
  safe: "ShieldCheck",
  phone: "Phone",
  hairdryer: "Sparkles",
  soap: "Sparkles",
  garden: "Trees",
  coffee: "Coffee",
  parking: "Car",
  kitchen: "Utensils",
  fireplace: "Flame",
};

const ICON_LIBRARY: { name: string; icon: LucideIcon }[] = Object.entries(
  LucideIcons as unknown as Record<string, unknown>,
)
  .filter(
    ([k, v]) =>
      /^[A-Z][A-Za-z0-9]*$/.test(k) &&
      !k.endsWith("Icon") &&
      !["Icon", "LucideIcon", "createLucideIcon"].includes(k) &&
      (typeof v === "function" ||
        (typeof v === "object" && v !== null && "render" in (v as object))),
  )
  .map(([k, v]) => ({ name: k, icon: v as LucideIcon }));

const ICON_BY_NAME = new Map(
  ICON_LIBRARY.map((i) => [i.name.toLowerCase(), i]),
);

function resolveIcon(name?: string | null) {
  if (!name) return null;
  const raw = name.trim();
  const alias = LEGACY_ALIASES[raw.toLowerCase()];
  return (
    ICON_BY_NAME.get((alias ?? raw).toLowerCase()) ??
    ICON_BY_NAME.get(raw.replace(/[\s_-]+/g, "").toLowerCase()) ??
    null
  );
}

function DynamicIcon({ name }: { name?: string | null }) {
  if (!name) return <span className="text-[#8a8a8a]">—</span>;
  const entry = resolveIcon(name);
  if (!entry)
    return <span className="font-mono text-xs text-[#8a8a8a]">{name}</span>;
  const IconComp = entry.icon;
  return (
    <div className="flex items-center gap-1.5 text-[#111111]">
      <IconComp size={16} className="text-[#737373]" />
      <span className="text-xs text-[#525252]">{entry.name}</span>
    </div>
  );
}

/* ─────────────── PRESETURI NOMENCLATOR ─────────────── */
const PRESETS: Record<string, string[]> = {
  "room-types": [
    "Cameră Single",
    "Cameră Dublă",
    "Cameră Twin",
    "Cameră Triplă",
    "Apartament",
    "Suită",
    "Suită Deluxe",
    "Garsonieră",
    "Cameră Familie",
  ],
  "bed-types": [
    "Pat single",
    "Pat dublu (matrimonial)",
    "Pat Queen",
    "Pat King",
    "Două paturi single",
    "Canapea extensibilă",
    "Pat suprapus",
    "Pătuț pentru copii",
  ],
};

/* ─────────────── ICON PICKER COMPONENT ─────────────── */
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return Object.entries(ICON_MAP).filter(
      ([k, v]) => k.includes(q) || v.label.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputCls} flex cursor-pointer items-center justify-between`}
      >
        {value && ICON_MAP[value] ? (
          <div className="flex items-center gap-2">
            {(() => {
              const Comp = ICON_MAP[value].icon;
              return <Comp size={16} className="text-[#737373]" />;
            })()}
            <span className="text-sm text-[#111111]">
              {ICON_MAP[value].label}
            </span>
            <span className="font-mono text-[11px] text-[#8a8a8a]">
              ({value})
            </span>
          </div>
        ) : (
          <span className="text-sm text-[#8a8a8a]">Alege o iconiță...</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-xl">
          <div className="border-b border-[#e5e5e5] p-2">
            <div className="flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-2 py-1">
              <Search size={14} className="text-[#8a8a8a]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută iconiță..."
                className="w-full bg-transparent text-xs outline-none text-[#111111]"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1.5 grid grid-cols-2 gap-1">
            {filtered.map(([k, item]) => {
              const IconComp = item.icon;
              const isSelected = value === k;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => {
                    onChange(k);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-[#111111] text-white"
                      : "hover:bg-[#f5f5f5] text-[#111111]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComp
                      size={15}
                      className={
                        isSelected ? "text-[#737373]" : "text-[#525252]"
                      }
                    />
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check size={13} className="text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── SECTIONS CONFIG ─────────────── */
type Section = {
  key: string;
  label: string;
  endpoint: string;
  eyebrow: string;
};

const SECTIONS: Section[] = [
  {
    key: "facilities",
    label: "Facilități",
    endpoint: "/rooms/facilities",
    eyebrow: "Nomenclator",
  },
  {
    key: "room-types",
    label: "Tipuri de camere",
    endpoint: "/rooms/room-types",
    eyebrow: "Nomenclator",
  },
  {
    key: "bed-types",
    label: "Tipuri de paturi",
    endpoint: "/rooms/bed-types",
    eyebrow: "Nomenclator",
  },
];

export default function NomenclatureTab() {
  const [active, setActive] = useState<string>("facilities");
  const section = SECTIONS.find((s) => s.key === active)!;

  return (
    <div>
      <div className="mb-5 flex w-full gap-1 overflow-x-auto rounded-xl border border-[#e5e5e5] bg-white p-1 sm:w-auto sm:inline-flex">

        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors sm:px-4 sm:text-[12px] ${
              active === s.key
                ? "bg-[#111111] text-white"
                : "text-[#525252] hover:text-[#111111]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <NomenclatureSection key={section.key} section={section} />
    </div>
  );
}

/* ─────────────── SECTION CONTENT ─────────────── */
function NomenclatureSection({ section }: { section: Section }) {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<{
    name: string;
    icon: string;
    description: string;
    base_price: number;
    capacity: number;
  }>({
    name: "",
    icon: "",
    description: "",
    base_price: 0,
    capacity: 1,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter((it) =>
      [it.name, it.description, it.icon]
        .filter(Boolean)
        .some((f: string) => String(f).toLowerCase().includes(q)),
    );
  }, [items, query]);

  const paged = usePaged(filtered, 10);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>(section.endpoint);
      setItems(list<any>(data));
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [section.endpoint]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({
      name: "",
      icon: "",
      description: "",
      base_price: 0,
      capacity: 1,
    });
    setFormOpen(true);
  };

  const openEdit = (item: any) => {
    setEditTarget(item);
    setForm({
      name: item.name || "",
      icon: item.icon || "",
      description: item.description || "",
      base_price: Number(item.base_price || 0),
      capacity: Number(item.capacity || 1),
    });
    setFormOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast("Numele este obligatoriu.", "error");
      return;
    }
    setSaving(true);
    try {
      // Pregătim payload-ul în funcție de nomenclator
      const payload: Record<string, any> = { name: form.name.trim() };

      if (section.key === "facilities") {
        payload.icon = form.icon.trim() || null;
        payload.description = form.description.trim() || null;
      } else if (section.key === "room-types") {
        payload.description = form.description.trim() || null;
        payload.base_price = Number(form.base_price);
      } else if (section.key === "bed-types") {
        payload.capacity = Number(form.capacity);
      }

      if (editTarget) {
        // Dacă backend-ul suportă update/patch
        await patch(`${section.endpoint}/${editTarget.id}`, payload);
        toast("Element actualizat.", "success");
      } else {
        await post(section.endpoint, payload);
        toast("Element adăugat.", "success");
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
      await del(`${section.endpoint}/${deleteTarget.id}`);
      toast("Element șters.", "success");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox value={query} onChange={setQuery} placeholder="Caută în nomenclator…" />
        <Button variant="gold" size="sm" onClick={openCreate}>
          <Plus size={14} /> Adaugă
        </Button>
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Niciun element"
            hint="Adaugă primul element în acest nomenclator."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#ededed] text-[10px] uppercase tracking-[0.18em] text-[#6b6b6b]">
                  <th className="px-5 py-3 font-bold">Nume</th>
                  {section.key === "facilities" && (
                    <th className="px-5 py-3 font-bold">Icon</th>
                  )}
                  {section.key === "room-types" && (
                    <th className="px-5 py-3 font-bold">Preț de bază</th>
                  )}
                  {section.key === "bed-types" && (
                    <th className="px-5 py-3 font-bold">Capacitate</th>
                  )}
                  {section.key !== "bed-types" && (
                    <th className="px-5 py-3 font-bold">Descriere</th>
                  )}
                  <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {paged.slice.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa]"
                  >
                    <td className="px-5 py-3.5 font-semibold text-[#111111]">
                      {item.name}
                    </td>

                    {section.key === "facilities" && (
                      <td className="px-5 py-3.5">
                        <DynamicIcon name={item.icon} />
                      </td>
                    )}

                    {section.key === "room-types" && (
                      <td className="px-5 py-3.5 font-medium text-[#111111]">
                        {item.base_price} RON
                      </td>
                    )}

                    {section.key === "bed-types" && (
                      <td className="px-5 py-3.5 text-[#525252]">
                        {item.capacity} pers.
                      </td>
                    )}

                    {section.key !== "bed-types" && (
                      <td className="px-5 py-3.5 text-[#6b6b6b]">
                        {item.description || "—"}
                      </td>
                    )}

                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Modal Creare / Editare */}
      <Modal
        open={formOpen}
        title={
          editTarget
            ? `Editare: ${editTarget.name}`
            : `Adaugă: ${section.label}`
        }
        onClose={() => setFormOpen(false)}
      >
        <div className="space-y-4">
          {section.key !== "facilities" && PRESETS[section.key] ? (

            <Field label="Alege dintr-o listă predefinită">
              <select
                className={inputCls}
                value=""
                onChange={(e) => {
                  if (e.target.value)
                    setForm({ ...form, name: e.target.value });
                }}
              >
                <option value="">— Selectează —</option>
                {PRESETS[section.key].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <Field label="Nume">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ex: Wi-Fi gratuit, Suită, Pat Matrimonial"
            />
          </Field>

          {section.key === "facilities" && (
            <Field label="Iconiță vizuală">
              <IconPicker
                value={form.icon}
                onChange={(val) => setForm({ ...form, icon: val })}
              />
            </Field>
          )}

          {section.key === "room-types" && (
            <Field label="Preț de bază (RON)">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.base_price}
                onChange={(e) =>
                  setForm({ ...form, base_price: Number(e.target.value) })
                }
              />
            </Field>
          )}

          {section.key === "bed-types" && (
            <Field label="Capacitate persoane">
              <input
                type="number"
                min={1}
                className={inputCls}
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: Number(e.target.value) })
                }
              />
            </Field>
          )}

          {section.key !== "bed-types" && (
            <Field label="Descriere (opțional)">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Field>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setFormOpen(false)}>
            Renunță
          </Button>
          <Button disabled={saving} onClick={() => void submit()}>
            {saving ? "Se salvează…" : editTarget ? "Actualizează" : "Adaugă"}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTarget}
        title="Șterge element"
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-sm text-[#525252]">
          Sigur vrei să ștergi{" "}
          <strong className="text-[#111111]">{deleteTarget?.name}</strong>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Anulează
          </Button>
          <Button variant="danger" onClick={() => void handleDelete()}>
            Șterge definitiv
          </Button>
        </div>
      </Modal>
    </>
  );
}
