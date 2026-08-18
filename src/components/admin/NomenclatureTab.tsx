import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  TableSkeleton,
  EmptyState,
  Modal,
  Field,
  inputCls,
} from "./ui";
import { get, post, del, list, errMsg, type Nomenclature } from "../../lib/admin";
import { useToast } from "../Toast";

type Section = {
  key: string;
  label: string;
  endpoint: string;
  eyebrow: string;
};

const SECTIONS: Section[] = [
  { key: "facilities", label: "Facilități", endpoint: "/rooms/facilities", eyebrow: "Nomenclator" },
  { key: "room-types", label: "Tipuri de camere", endpoint: "/rooms/room-types", eyebrow: "Nomenclator" },
  { key: "bed-types", label: "Tipuri de paturi", endpoint: "/rooms/bed-types", eyebrow: "Nomenclator" },
];

export default function NomenclatureTab() {
  const [active, setActive] = useState<string>("facilities");
  const section = SECTIONS.find((s) => s.key === active)!;

  return (
    <div>
      <SectionHeader eyebrow={section.eyebrow} title="Nomenclatoare" />
      <div className="mb-5 inline-flex rounded-xl border border-[#e1e8f0] bg-white p-1">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`rounded-lg px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              active === s.key ? "bg-[#0d2c5c] text-white" : "text-[#4f6280] hover:text-[#0d2c5c]"
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

function NomenclatureSection({ section }: { section: Section }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Nomenclature[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Nomenclature | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>(section.endpoint);
      setItems(list<Nomenclature>(data));
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [section.endpoint]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast("Numele este obligatoriu.", "error");
      return;
    }
    setSaving(true);
    try {
      await post(section.endpoint, { name: form.name.trim(), icon: form.icon.trim() || null, description: form.description.trim() || null });
      toast("Element adăugat.", "success");
      setFormOpen(false);
      setForm({ name: "", icon: "", description: "" });
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
      <div className="mb-4 flex justify-end">
        <Button variant="gold" size="sm" onClick={() => setFormOpen(true)}>
          <Plus size={14} /> Adaugă
        </Button>
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState title="Niciun element" hint="Adaugă primul element în acest nomenclator." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f7] text-[10px] uppercase tracking-[0.18em] text-[#6b7c99]">
                  <th className="px-5 py-3 font-bold">Nume</th>
                  <th className="px-5 py-3 font-bold">Icon</th>
                  <th className="px-5 py-3 font-bold">Descriere</th>
                  <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#f4f6f9] last:border-0">
                    <td className="px-5 py-3.5 font-semibold text-[#0d2c5c]">{item.name}</td>
                    <td className="px-5 py-3.5 text-[#6b7c99]">{item.icon || "—"}</td>
                    <td className="px-5 py-3.5 text-[#6b7c99]">{item.description || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(item)}>
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

      <Modal open={formOpen} title={`Adaugă: ${section.label}`} onClose={() => setFormOpen(false)}>
        <div className="space-y-4">
          <Field label="Nume">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Wi-Fi gratuit" />
          </Field>
          <Field label="Icon (opțional)">
            <input className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="ex: wifi" />
          </Field>
          <Field label="Descriere (opțional)">
            <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setFormOpen(false)}>Renunță</Button>
          <Button disabled={saving} onClick={() => void submit()}>{saving ? "Se salvează…" : "Adaugă"}</Button>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} title="Șterge element" onClose={() => setDeleteTarget(null)}>
        <p className="text-sm text-[#4f6280]">
          Sigur vrei să ștergi <strong className="text-[#0d2c5c]">{deleteTarget?.name}</strong>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Anulează</Button>
          <Button variant="danger" onClick={() => void handleDelete()}>Șterge</Button>
        </div>
      </Modal>
    </>
  );
}
