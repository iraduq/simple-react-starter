import { useEffect, useMemo, useState } from "react";
import {
  Card,
  SectionHeader,
  Button,
  Badge,
  statusTone,
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
  list,
  money,
  dateFmt,
  nights,
  errMsg,
  type Booking,
  type Room,
} from "../../lib/admin";
import { useToast } from "../Toast";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

export default function BookingsTab() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("all");
  const [roomId, setRoomId] = useState<string>("all");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [editTarget, setEditTarget] = useState<Booking | null>(null);
  const [form, setForm] = useState({ check_in: "", check_out: "", guests: 1 });
  const [formErr, setFormErr] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [b, r] = await Promise.all([get<unknown>("/bookings"), get<unknown>("/rooms")]);
      setBookings(list<Booking>(b));
      setRooms(list<Room>(r));
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (status === "all" || b.status === status) &&
          (roomId === "all" || String(b.room_id) === roomId) &&
          (!email.trim() ||
            (b.guest_email || "").toLowerCase().includes(email.trim().toLowerCase())),
      ),
    [bookings, status, roomId, email],
  );

  const runAction = async (b: Booking, kind: "confirm" | "complete") => {
    setBusy(`${b.id}-${kind}`);
    try {
      await post(`/bookings/${b.id}/${kind}`);
      toast(kind === "confirm" ? "Rezervare confirmată." : "Rezervare finalizată.", "success");
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(null);
    }
  };

  const submitCancel = async () => {
    if (!cancelTarget) return;
    setBusy(`${cancelTarget.id}-cancel`);
    try {
      await post(`/bookings/${cancelTarget.id}/cancel`, {
        reason: cancelReason.trim() || null,
      });
      toast("Rezervare anulată.", "success");
      setCancelTarget(null);
      setCancelReason("");
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(null);
    }
  };

  const openEdit = (b: Booking) => {
    setEditTarget(b);
    setFormErr({});
    setForm({
      check_in: (b.check_in || "").slice(0, 10),
      check_out: (b.check_out || "").slice(0, 10),
      guests: Number(b.guests || 1),
    });
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    const errs: Record<string, string> = {};
    if (!form.check_in) errs.check_in = "Selectează data de check-in.";
    if (!form.check_out) errs.check_out = "Selectează data de check-out.";
    if (form.check_in && form.check_out && form.check_in >= form.check_out)
      errs.check_out = "Check-out trebuie să fie după check-in.";
    if (!form.guests || form.guests < 1) errs.guests = "Minim 1 oaspete.";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setBusy(`${editTarget.id}-edit`);
    try {
      await patch(`/bookings/${editTarget.id}`, {
        check_in: form.check_in,
        check_out: form.check_out,
        guests: Number(form.guests),
      });
      toast("Rezervare actualizată.", "success");
      setEditTarget(null);
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Operațiuni"
        title="Gestionare rezervări"
        action={
          <Button variant="ghost" size="sm" onClick={() => void load()}>
            Reîmprospătează
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Status">
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "Toate" : s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cameră">
            <select className={inputCls} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              <option value="all">Toate camerele</option>
              {rooms.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Email client">
            <input
              className={inputCls}
              placeholder="client@email.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card>
        {loading ? (
          <TableSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nicio rezervare găsită" hint="Ajustează filtrele de mai sus." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f7] text-[10px] uppercase tracking-[0.18em] text-[#6b7c99]">
                  <th className="px-5 py-3 font-bold">#</th>
                  <th className="px-5 py-3 font-bold">Client</th>
                  <th className="px-5 py-3 font-bold">Cameră</th>
                  <th className="px-5 py-3 font-bold">Sejur</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Total</th>
                  <th className="px-5 py-3 text-right font-bold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-[#f4f6f9] last:border-0">
                    <td className="px-5 py-3.5 text-[#6b7c99]">{b.id}</td>
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold text-[#0d2c5c]">
                        {b.guest_name || "—"}
                      </span>
                      <span className="text-[12px] text-[#6b7c99]">{b.guest_email || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#2a3b52]">
                      {b.room_name || `#${b.room_id ?? "—"}`}
                    </td>
                    <td className="px-5 py-3.5 text-[#2a3b52]">
                      {dateFmt(b.check_in)} → {dateFmt(b.check_out)}
                      <span className="ml-2 text-[12px] text-[#8595aa]">
                        {nights(b.check_in, b.check_out)} nopți · {b.guests ?? 1} oaspeți
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#0d2c5c]">
                      {money(b.total_price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap justify-end gap-2">
                        {b.status === "pending" && (
                          <Button
                            size="sm"
                            variant="gold"
                            disabled={busy === `${b.id}-confirm`}
                            onClick={() => void runAction(b, "confirm")}
                          >
                            Confirmă
                          </Button>
                        )}
                        {b.status === "confirmed" && (
                          <Button
                            size="sm"
                            disabled={busy === `${b.id}-complete`}
                            onClick={() => void runAction(b, "complete")}
                          >
                            Finalizează
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEdit(b)}>
                          Editează
                        </Button>
                        {b.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setCancelTarget(b);
                              setCancelReason("");
                            }}
                          >
                            Anulează
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!cancelTarget}
        title={`Anulare rezervare #${cancelTarget?.id ?? ""}`}
        onClose={() => setCancelTarget(null)}
      >
        <Field label="Motiv anulare (opțional)">
          <textarea
            className={`${inputCls} min-h-[110px] resize-y`}
            value={cancelReason}
            maxLength={500}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="ex: solicitare client"
          />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCancelTarget(null)}>
            Renunță
          </Button>
          <Button
            variant="danger"
            disabled={busy === `${cancelTarget?.id}-cancel`}
            onClick={() => void submitCancel()}
          >
            Confirmă anularea
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!editTarget}
        title={`Editare rezervare #${editTarget?.id ?? ""}`}
        onClose={() => setEditTarget(null)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Check-in" error={formErr.check_in}>
            <input
              type="date"
              className={inputCls}
              value={form.check_in}
              onChange={(e) => setForm({ ...form, check_in: e.target.value })}
            />
          </Field>
          <Field label="Check-out" error={formErr.check_out}>
            <input
              type="date"
              className={inputCls}
              value={form.check_out}
              onChange={(e) => setForm({ ...form, check_out: e.target.value })}
            />
          </Field>
          <Field label="Oaspeți" error={formErr.guests}>
            <input
              type="number"
              min={1}
              className={inputCls}
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditTarget(null)}>
            Renunță
          </Button>
          <Button disabled={busy === `${editTarget?.id}-edit`} onClick={() => void submitEdit()}>
            Salvează
          </Button>
        </div>
      </Modal>
    </div>
  );
}