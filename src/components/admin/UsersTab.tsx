import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldX,
  Copy,
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
  SearchBox,
  Pagination,
  usePaged,
} from "./ui";
import {
  get,
  patch,
  del,
  list,
  dateFmt,
  dateTimeFmt,
  money,
  nights,
  errMsg,
  type AdminUser,
  type RoomBooking,
} from "../../lib/admin";
import { useToast } from "../Toast";

const ROLES = ["user", "manager", "admin"];

/** Rolul real al utilizatorului, citit dinamic din backend. */
export const resolveRole = (u: any): string => {
  // 1. Dacă backend-ul ne trimite numele din baza de date (cum am setat adineauri)
  if (u.role_name) {
    return String(u.role_name).toLowerCase().trim();
  }

  // 2. Fallback dacă avem doar role_id
  if (u.role_id === 1) return "admin";
  if (u.role_id === 2) return "manager";
  if (u.role_id === 3) return "user";

  return "user";
};

export default function UsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ role: "user", is_active: true });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<AdminUser | null>(null);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) =>
      [u.email, u.first_name, u.last_name, resolveRole(u), u.provider]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q)),
    );
  }, [users, query]);

  const paged = usePaged(filtered, 10);

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

  const openDetail = async (u: AdminUser) => {
    setDetail(u);
    setBookingsLoading(true);
    try {
      const data = await get<unknown>("/bookings");
      setBookings(
        list<RoomBooking>(data).filter(
          (b) =>
            String((b as any).user_id ?? "") === String(u.id) ||
            (b.guest_email || b.user_email || "").toLowerCase() ===
              (u.email || "").toLowerCase(),
        ),
      );
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBookingsLoading(false);
    }
  };

  const copy = (v: string | number | null | undefined, label: string) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    toast(`${label} copiat în clipboard!`, "success");
  };

  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setForm({ role: resolveRole(u), is_active: u.is_active ?? true });
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      // Transformăm textul înapoi în număr (role_id) pentru baza de date
      let newRoleId = 3; // user
      if (form.role === "admin") newRoleId = 1;
      else if (form.role === "manager") newRoleId = 2;

      await patch(`/users/admin/${editTarget.id}`, {
        role_id: newRoleId, // Trimitem role_id către backend!
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
    role === "admin"
      ? "gold"
      : role === "manager"
        ? "navy"
        : ("muted" as const);

  return (
    <div>
      <SectionHeader
        eyebrow="Securitate"
        title="Utilizatori"
        action={
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            Reîmprospătează
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Caută utilizator, email, rol…"
        />
      </div>

      <Card>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="Niciun utilizator" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f7] text-[10px] uppercase tracking-[0.18em] text-[#4f6280]">
                  <th className="px-5 py-3 font-bold">Utilizator</th>
                  <th className="px-5 py-3 font-bold">Rol</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Înregistrat</th>
                  <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {paged.slice.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => void openDetail(u)}
                    className="cursor-pointer border-b border-[#f4f6f9] last:border-0 transition-colors hover:bg-[#f9f7f2]"
                  >
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold text-[#0d2c5c]">
                        {[u.first_name, u.last_name]
                          .filter(Boolean)
                          .join(" ") || u.email}
                      </span>
                      <span className="text-[12px] text-[#4f6280]">
                        {u.email}
                      </span>
                      {u.provider && (
                        <span className="ml-2 text-[10px] uppercase text-[#6b7c99]">
                          via {u.provider}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={roleTone(resolveRole(u))}>
                        {resolveRole(u)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.is_active === false ? (
                        <Badge tone="red">Inactiv</Badge>
                      ) : (
                        <Badge tone="green">Activ</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#4f6280]">
                      {dateFmt(u.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(u)}
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

      <Modal
        open={!!detail}
        title={
          detail
            ? [detail.first_name, detail.last_name].filter(Boolean).join(" ") ||
              detail.email
            : ""
        }
        onClose={() => setDetail(null)}
        width="max-w-2xl"
      >
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#e1e8f0] bg-[#f9f7f2] p-4 sm:grid-cols-3">
              {[
                { l: "Email", v: detail.email },
                { l: "Rol", v: resolveRole(detail) },
                {
                  l: "Status",
                  v: detail.is_active === false ? "Inactiv" : "Activ",
                },
                { l: "Autentificare", v: detail.provider || "email" },
                { l: "Înregistrat", v: dateFmt(detail.created_at) },
                { l: "Rezervări", v: String(bookings.length) },
              ].map((f) => (
                <div key={f.l}>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#6b7c99]">
                    {f.l}
                  </p>
                  <p className="mt-0.5 break-words text-[13px] font-medium text-[#0d2c5c]">
                    {f.v}
                  </p>
                </div>
              ))}
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#6b7c99]">
                  ID Client
                </p>
                <button
                  onClick={() => copy(detail.id, "ID Client")}
                  className="group mt-0.5 inline-flex items-center gap-1.5 hover:opacity-70"
                  title="Copiază ID-ul"
                >
                  <span className="text-[13px] font-medium text-[#0d2c5c]">
                    {String(detail.id).slice(0, 8)}…
                  </span>
                  <Copy size={11} className="text-[#6b7c99]" />
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6b7c99]">
                Rezervările clientului
              </p>
              {bookingsLoading ? (
                <TableSkeleton rows={3} />
              ) : bookings.length === 0 ? (
                <p className="text-[13px] text-[#4f6280]">
                  Acest client nu are rezervări.
                </p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col gap-1 rounded-lg border border-[#e1e8f0] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <button
                          onClick={() => copy(b.id, "ID Rezervare")}
                          className="group inline-flex items-center gap-1.5 hover:opacity-70"
                          title="Copiază ID-ul rezervării"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7c99]">
                            #{String(b.id).slice(0, 8)}
                          </span>
                          <Copy size={9} className="text-[#6b7c99]" />
                        </button>
                        <p className="text-[13px] font-semibold text-[#0d2c5c]">
                          {dateFmt(b.check_in)} → {dateFmt(b.check_out)}{" "}
                          <span className="text-[11px] font-normal text-[#4f6280]">
                            ({nights(b.check_in, b.check_out)} nopți)
                          </span>
                        </p>
                        <p className="text-[11px] text-[#6b7c99]">
                          Creată: {dateTimeFmt((b as any).created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone="muted">{b.status || "—"}</Badge>
                        <span className="text-[13px] font-semibold text-[#0d2c5c]">
                          {money(b.total_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#eef2f7] pt-4">
              <Button variant="ghost" onClick={() => setDetail(null)}>
                Închide
              </Button>
              <Button
                onClick={() => {
                  openEdit(detail);
                  setDetail(null);
                }}
              >
                Modifică rol / status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editTarget}
        title={`Editare: ${editTarget?.email ?? ""}`}
        onClose={() => setEditTarget(null)}
        width="max-w-md"
      >
        <div className="space-y-4">
          <Field label="Rol">
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[12px] font-semibold capitalize transition-colors ${
                    form.role === r
                      ? "border-[#0d2c5c] bg-[#0d2c5c] text-white"
                      : "border-[#e1e8f0] text-[#2a3b52] hover:border-[#0d2c5c]"
                  }`}
                >
                  {r === "admin" ? (
                    <ShieldCheck size={13} />
                  ) : r === "manager" ? (
                    <Shield size={13} />
                  ) : (
                    <ShieldX size={13} />
                  )}
                  {r}
                </button>
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="h-4 w-4 accent-[#0d2c5c]"
            />
            <span className="text-sm text-[#0d2c5c]">Cont activ</span>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditTarget(null)}>
            Renunță
          </Button>
          <Button disabled={saving} onClick={() => void submitEdit()}>
            {saving ? "Se salvează…" : "Salvează"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Șterge utilizator"
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-sm text-[#2a3b52]">
          Sigur vrei să ștergi contul{" "}
          <strong className="text-[#0d2c5c]">{deleteTarget?.email}</strong>?
          Toate datele asociate vor fi șterse.
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
    </div>
  );
}
