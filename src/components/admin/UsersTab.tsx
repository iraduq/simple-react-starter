import { useEffect, useState } from "react";
import { Pencil, Trash2, Shield, ShieldCheck, ShieldX } from "lucide-react";
import {
  Card,
  SectionHeader,
  Button,
  Badge,
  TableSkeleton,
  EmptyState,
  Modal,
  Field,
} from "./ui";
import { get, patch, del, list, dateFmt, errMsg, type AdminUser } from "../../lib/admin";
import { useToast } from "../Toast";

const ROLES = ["user", "manager", "admin"];

export default function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ role: "user", is_active: true });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await get<unknown>("/users/admin/all");
      setUsers(list<AdminUser>(data));
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setForm({ role: u.role || "user", is_active: u.is_active ?? true });
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await patch(`/users/admin/${editTarget.id}`, {
        role: form.role,
        is_active: form.is_active,
      });
      toast("Utilizator actualizat.", "success");
      setEditTarget(null);
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
      await del(`/users/admin/${deleteTarget.id}`);
      toast("Utilizator șters.", "success");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    }
  };

  const roleTone = (role?: string | null) =>
    role === "admin" ? "gold" : role === "manager" ? "navy" : ("muted" as const);

  return (
    <div>
      <SectionHeader
        eyebrow="Securitate"
        title="Utilizatori"
        action={
          <Button variant="ghost" size="sm" onClick={() => void load()}>Reîmprospătează</Button>
        }
      />

      <Card>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : users.length === 0 ? (
          <EmptyState title="Niciun utilizator" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#ededed] text-[10px] uppercase tracking-[0.18em] text-[#6b6b6b]">
                  <th className="px-5 py-3 font-bold">Utilizator</th>
                  <th className="px-5 py-3 font-bold">Rol</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Înregistrat</th>
                  <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#f5f5f5] last:border-0">
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold text-[#111111]">
                        {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email}
                      </span>
                      <span className="text-[12px] text-[#6b6b6b]">{u.email}</span>
                      {u.provider && <span className="ml-2 text-[10px] uppercase text-[#8a8a8a]">via {u.provider}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={roleTone(u.role)}>{u.role || "user"}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.is_active === false ? (
                        <Badge tone="red">Inactiv</Badge>
                      ) : (
                        <Badge tone="green">Activ</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#6b6b6b]">{dateFmt(u.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(u)}><Pencil size={12} /></Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteTarget(u)}><Trash2 size={12} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!editTarget} title={`Editare: ${editTarget?.email ?? ""}`} onClose={() => setEditTarget(null)} width="max-w-md">
        <div className="space-y-4">
          <Field label="Rol">
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[12px] font-semibold capitalize transition-colors ${
                    form.role === r
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#e5e5e5] text-[#525252] hover:border-[#111111]"
                  }`}
                >
                  {r === "admin" ? <ShieldCheck size={13} /> : r === "manager" ? <Shield size={13} /> : <ShieldX size={13} />}
                  {r}
                </button>
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-[#111111]" />
            <span className="text-sm text-[#111111]">Cont activ</span>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditTarget(null)}>Renunță</Button>
          <Button disabled={saving} onClick={() => void submitEdit()}>{saving ? "Se salvează…" : "Salvează"}</Button>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} title="Șterge utilizator" onClose={() => setDeleteTarget(null)}>
        <p className="text-sm text-[#525252]">
          Sigur vrei să ștergi contul <strong className="text-[#111111]">{deleteTarget?.email}</strong>? Toate datele asociate vor fi șterse.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Anulează</Button>
          <Button variant="danger" onClick={() => void handleDelete()}>Șterge definitiv</Button>
        </div>
      </Modal>
    </div>
  );
}
