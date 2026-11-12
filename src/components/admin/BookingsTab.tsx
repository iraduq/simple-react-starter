import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  Check,
  Search,
  CheckCircle2,
  Copy,
  MoreHorizontal, FileText, RotateCcw, AlertTriangle,
} from "lucide-react";
import { Badge, statusTone, TableSkeleton, EmptyState, Modal, SectionHeader } from "./ui";
import {
  get,
  post,
  patch,
  list,
  money,
  dateFmt,
  nights,
  errMsg, downloadBookingInvoicePdf,
  type Room,
  type AdminUser,
} from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync, LiveSyncBadge } from "../../context/AdminLiveSyncContext";

const STATUSES = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;

const PAGE_SIZE = 10;

interface BookingItem {
  id: string | number;
  status?: string;
  payment_status?: string;
  room_id?: string | number;
  room_unit_id?: string | null;
  room_name?: string;
  user_id?: string | number;
  user_email?: string;
  guest_email?: string;
  user_name?: string;
  guest_name?: string;
  booking_code?: string;
  check_in?: string;
  check_out?: string;
  total_price?: number;
  guests_adults?: number;
  guests_children?: number;
  guests?: number;
}

export default function BookingsTab() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<string>("all");
  const [roomId, setRoomId] = useState<string>("all");
  const [email, setEmail] = useState("");

  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [busy, setBusy] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [editTarget, setEditTarget] = useState<BookingItem | null>(null);
  const [form, setForm] = useState({
    check_in: "",
    check_out: "",
    guests: 1,
    room_id: "",
    room_unit_id: "",
  });
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [availLoading, setAvailLoading] = useState(false);
  const [availData, setAvailData] = useState<{
    can_save: boolean;
    capacity_ok: boolean;
    max_capacity: number;
    free_count: number;
    chosen_unit_conflict: boolean;
    available_units: Array<{ id: string; unit_number: string; floor?: string | number | null; is_free: boolean }>;
    rooms: Array<{ id: string; title: string; capacity: number; free_units: number }>;
    new_total_price: number;
    price_diff: number;
    nights: number;
    message: string;
  } | null>(null);
  const [editRefundOpen, setEditRefundOpen] = useState(false);
  const [editRefundReason, setEditRefundReason] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [b, r, u] = await Promise.all([
        get<unknown>("/bookings"),
        get<unknown>("/rooms"),
        get<unknown>("/users/admin/all"),
      ]);
      setBookings(list<BookingItem>(b));
      setRooms(list<Room>(r));
      setUsers(list<AdminUser>(u));
    } catch (e) {
      if (!silent) toast(errMsg(e), "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  const { isSyncing, connectionStatus } = useAdminLiveSync({
    topic: "bookings",
    onSync: () => load(true),
  });

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [status, roomId, email]);

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        const userObj = users.find((u) => String(u.id) === String(b.user_id));
        const searchEmail =
          b.user_email || b.guest_email || userObj?.email || "";

        return (
          (status === "all" || b.status === status) &&
          (roomId === "all" || String(b.room_id) === roomId) &&
          (!email.trim() ||
            searchEmail.toLowerCase().includes(email.trim().toLowerCase()))
        );
      }),
    [bookings, status, roomId, email, users],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedBookings = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const runAction = async (b: BookingItem, kind: "confirm" | "complete") => {
    setBusy(`${b.id}-${kind}`);
    try {
      await post(`/bookings/${b.id}/${kind}`);
      toast(
        kind === "confirm" ? "Rezervare confirmată." : "Rezervare finalizată.",
        "success",
      );
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
        cancellation_reason: cancelReason.trim() || "Anulat de administrator",
      });
      toast(
        cancelTarget.payment_status === "paid"
          ? "Rezervare anulată și rambursare Stripe procesată."
          : "Rezervare anulată.",
        "success",
      );
      setCancelTarget(null);
      setCancelReason("");
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(null);
    }
  };

  const openEdit = (b: BookingItem) => {
    setEditTarget(b);
    setFormErr({});
    setAvailData(null);
    setEditRefundOpen(false);
    setEditRefundReason("");

    const totalGuests =
      (b.guests_adults || 0) + (b.guests_children || 0) || b.guests || 1;

    setForm({
      check_in: (b.check_in || "").slice(0, 10),
      check_out: (b.check_out || "").slice(0, 10),
      guests: Number(totalGuests),
      room_id: String(b.room_id || ""),
      room_unit_id: String((b as any).room_unit_id || ""),
    });
  };

  useEffect(() => {
    if (!editTarget || !form.check_in || !form.check_out || form.check_out <= form.check_in) {
      setAvailData(null);
      return;
    }
    let cancelled = false;
    setAvailLoading(true);
    const qs = new URLSearchParams({
      check_in: `${form.check_in}T15:00:00Z`,
      check_out: `${form.check_out}T11:00:00Z`,
      guests_total: String(Math.max(1, Number(form.guests) || 1)),
    });
    if (form.room_id) qs.set("room_id", form.room_id);
    if (form.room_unit_id) qs.set("room_unit_id", form.room_unit_id);

    get<typeof availData>(`/bookings/${editTarget.id}/edit-availability?${qs.toString()}`)
      .then((res) => {
        if (!cancelled) setAvailData(res);
      })
      .catch(() => {
        if (!cancelled) setAvailData(null);
      })
      .finally(() => {
        if (!cancelled) setAvailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editTarget, form.check_in, form.check_out, form.room_id, form.room_unit_id, form.guests]);

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
        guests_adults: Number(form.guests),
        room_id: form.room_id || undefined,
        room_unit_id: form.room_unit_id || undefined,
      });
      toast("Rezervare actualizată cu succes.", "success");
      setEditTarget(null);
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(null);
    }
  };

  const submitEditRefund = async () => {
    if (!editTarget) return;
    setBusy(`${editTarget.id}-refund`);
    try {
      await post(`/bookings/${editTarget.id}/cancel`, {
        cancellation_reason:
          editRefundReason.trim() ||
          "Mutarea nu a fost posibilă — anulată și rambursată de administrator",
      });
      toast(
        editTarget.payment_status === "paid"
          ? "Rezervare anulată și refund Stripe emis cu succes!"
          : "Rezervare anulată cu succes.",
        "success",
      );
      setEditTarget(null);
      setEditRefundOpen(false);
      setEditRefundReason("");
      await load();
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast(`${label} copiat în clipboard!`, "success");
  };

  const fieldInput =
    "w-full py-2.5 px-4 bg-[#f8fafd] border border-[#e1e8f0] rounded-xl text-[13.5px] font-medium text-[#0d2c5c] outline-none transition-all focus:bg-white focus:border-[#c69a3f] focus:ring-2 focus:ring-[#c69a3f]/15 placeholder:text-[#94a3b8]";

  return (
    <div className="w-full space-y-4">
        <SectionHeader
          eyebrow="Operațiuni"
          title="Gestionare rezervări"
          action={<LiveSyncBadge isSyncing={isSyncing} status={connectionStatus} />}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="rounded-2xl border border-[#e1e8f0] bg-white shadow-sm p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-end"
        >
          <FormField label="Status">
            <select
              className={fieldInput}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all"
                    ? "Toate statusurile"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Cameră">
            <select
              className={fieldInput}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="all">Toate camerele</option>
              {rooms.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {(r.name as string) || (r as any).title || `Camera #${r.id}`}
                </option>
              ))}
            </select>
          </FormField>
          <div className="flex-1 w-full">
            <FormField label="Căutare email client">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7c99]"
                />
                <input
                  className={`${fieldInput} pl-11`}
                  placeholder="client@email.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </FormField>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="rounded-2xl border border-[#e1e8f0] bg-white shadow-sm overflow-hidden flex flex-col"
        >
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <EmptyState
                title="Nicio rezervare găsită"
                hint="Ajustează filtrele de mai sus pentru a vedea rezultate."
              />
            </div>
          ) : (
            <>
              <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-none overflow-x-auto pb-10">
                <table className="w-full min-w-[900px] text-left text-sm bg-white">
                  <thead>
                    <tr className="border-b border-[#eef2f7] bg-[#0d2c5c]/[0.02] text-[10px] uppercase tracking-[0.18em] text-[#6b7c99]">
                      <th className="px-6 py-4 font-bold"># ID</th>
                      <th className="px-6 py-4 font-bold">Client</th>
                      <th className="px-6 py-4 font-bold">Cameră</th>
                      <th className="px-6 py-4 font-bold">Sejur</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Total</th>
                      <th className="px-6 py-4 text-right font-bold w-20">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((b) => {
                      const roomObj = rooms.find(
                        (r) => String(r.id) === String(b.room_id),
                      );
                      const displayRoomName =
                        b.room_name ||
                        (roomObj as any)?.title ||
                        roomObj?.name ||
                        `#${b.room_id ?? "—"}`;

                      const userObj = users.find(
                        (u) => String(u.id) === String(b.user_id),
                      );

                      const shortBookingId = b.booking_code || (
                        String(b.id).length > 8
                          ? String(b.id).substring(0, 8) + "..."
                          : String(b.id));

                      const rawEmail =
                        b.user_email || b.guest_email || userObj?.email || "";
                      const displayEmail = rawEmail || "—";

                      let displayName = b.guest_name || b.user_name || "";
                      if (!displayName && userObj) {
                        displayName =
                          `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim();
                      }

                      if (!displayName && rawEmail) {
                        displayName = rawEmail.split("@")[0];
                        displayName =
                          displayName.charAt(0).toUpperCase() +
                          displayName.slice(1);
                      } else if (!displayName) {
                        displayName = "Client Necunoscut";
                      }

                      const totalGuests =
                        (b.guests_adults || 0) + (b.guests_children || 0) ||
                        b.guests ||
                        1;

                      return (
                        <tr
                          key={b.id}
                          className="border-b border-[#eef2f7] last:border-0 hover:bg-[#f8fafd] transition-colors bg-white"
                        >
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                copyToClipboard(String(b.id), "ID Rezervare")
                              }
                              className="group flex items-center gap-1.5 text-left transition-all hover:opacity-70"
                              title="Click pentru a copia ID-ul rezervării"
                            >
                              <span className="text-[13px] font-medium text-[#6b7c99]">
                                {shortBookingId}
                              </span>
                              <Copy
                                size={12}
                                className="text-[#6b7c99] opacity-0 transition-opacity group-hover:opacity-100"
                              />
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start gap-1">
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    String(b.user_id || ""),
                                    "ID Client",
                                  )
                                }
                                className="group flex items-center gap-1.5 text-left transition-all hover:opacity-70"
                                title="Click pentru a copia ID-ul clientului"
                              >
                                <span className="block text-[14px] font-semibold text-[#0d2c5c]">
                                  {displayName}
                                </span>
                                {b.user_id && (
                                  <Copy
                                    size={12}
                                    className="text-[#6b7c99] opacity-0 transition-opacity group-hover:opacity-100"
                                  />
                                )}
                              </button>

                              <span className="text-[13px] text-[#6b7c99] block">
                                {displayEmail}
                              </span>

                              {b.booking_code && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      String(b.booking_code),
                                      "Cod rezervare",
                                    )
                                  }
                                  title="Click pentru a copia codul"
                                  className="mt-0.5 rounded-md bg-[#f0f4f9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6b7c99] transition-colors hover:bg-[#0d2c5c]/10 hover:text-[#0d2c5c] cursor-pointer"
                                >
                                  COD: {b.booking_code}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[14px] font-medium text-[#0d2c5c]">
                            {displayRoomName}
                          </td>
                          <td className="px-6 py-4 text-[13px] text-[#666]">
                            <span className="font-semibold text-[#0d2c5c]">
                              {dateFmt(b.check_in)}
                            </span>
                            <span className="mx-2 text-[#ccc]">→</span>
                            <span className="font-semibold text-[#0d2c5c]">
                              {dateFmt(b.check_out)}
                            </span>
                            <span className="ml-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b7c99]">
                              {nights(b.check_in, b.check_out)} nopți ·{" "}
                              {totalGuests} oaspeți
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge tone={statusTone(b.status)}>
                              {b.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#f0f4f9] font-semibold text-[#0d2c5c] text-[13px]">
                              {money(b.total_price)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button
                              onClick={() =>
                                setActiveMenu(
                                  activeMenu === String(b.id)
                                    ? null
                                    : String(b.id),
                                )
                              }
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-transparent hover:border-[#0d2c5c]/10 hover:bg-[#f0f4f9] transition-all text-[#6b7c99] hover:text-[#0d2c5c]"
                              title="Acțiuni"
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {activeMenu === String(b.id) && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveMenu(null)}
                                />

                                <div className="absolute right-6 top-10 z-50 mt-1 w-44 origin-top-right rounded-xl bg-white shadow-[0_4px_20px_rgba(13,44,92,0.08)] border border-[#eef2f7] py-1.5 focus:outline-none flex flex-col items-start overflow-hidden">
                                  {b.status === "pending" && (
                                    <button
                                      onClick={() => {
                                        void runAction(b, "confirm");
                                        setActiveMenu(null);
                                      }}
                                      className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[#0d2c5c] hover:bg-[#f0f4f9] transition-colors"
                                    >
                                      <Check
                                        size={14}
                                        className="text-[#6b7c99]"
                                      />{" "}
                                      Confirmă
                                    </button>
                                  )}
                                  {b.status === "confirmed" && (
                                    <button
                                      onClick={() => {
                                        void runAction(b, "complete");
                                        setActiveMenu(null);
                                      }}
                                      className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[#0d2c5c] hover:bg-[#f0f4f9] transition-colors"
                                    >
                                      <CheckCircle2
                                        size={14}
                                        className="text-[#6b7c99]"
                                      />{" "}
                                      Finalizează
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      openEdit(b);
                                      setActiveMenu(null);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[#0d2c5c] hover:bg-[#f0f4f9] transition-colors"
                                  >
                                    <Pencil
                                      size={14}
                                      className="text-[#6b7c99]"
                                    />{" "}
                                    Editează
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveMenu(null);
                                      void downloadBookingInvoicePdf(String(b.booking_code || b.id), b.booking_code || String(b.id)).catch((err) => toast(errMsg(err), "error"));
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-[#0d2c5c] hover:bg-[#f0f4f9] transition-colors"
                                  >
                                    <FileText size={14} className="text-[#c69a3f]" /> Factură PDF
                                  </button>
                                  {b.status !== "cancelled" && (
                                    <button
                                      onClick={() => {
                                        setCancelTarget(b);
                                        setCancelReason("");
                                        setActiveMenu(null);
                                      }}
                                      className="flex w-full items-center gap-2.5 px-4 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-[#eef2f7] pt-2"
                                    >
                                      <Trash2 size={14} /> Anulează
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#eef2f7] bg-white px-6 py-4">
                  <span className="text-[12px] font-medium text-[#6b7c99]">
                    Pagina <strong className="text-[#0d2c5c]">{page}</strong> din{" "}
                    <strong className="text-[#0d2c5c]">{totalPages}</strong>
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-full border border-[#0d2c5c]/10 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] shadow-sm transition-all hover:bg-[#f0f4f9] hover:border-[#0d2c5c] hover:shadow-md disabled:opacity-40 disabled:shadow-none disabled:hover:bg-white"
                    >
                      Înapoi
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-full border border-[#0d2c5c]/10 bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] shadow-sm transition-all hover:bg-[#f0f4f9] hover:border-[#0d2c5c] hover:shadow-md disabled:opacity-40 disabled:shadow-none disabled:hover:bg-white"
                    >
                      Înainte
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        <Modal
          open={!!cancelTarget}
          title={`Anulare rezervare #${
            cancelTarget?.id ? String(cancelTarget.id).substring(0, 8) : ""
          }`}
          onClose={() => setCancelTarget(null)}
        >
          <div>
            <FormField label="Motiv anulare (opțional)">
              <textarea
                className={`${fieldInput} min-h-[110px] resize-y mt-2`}
                value={cancelReason}
                maxLength={500}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="ex: solicitare client..."
              />
            </FormField>
            <div className="mt-8 flex justify-end gap-3 border-t border-[#eef2f7] pt-5">
              <button
                onClick={() => setCancelTarget(null)}
                className="rounded-full border border-[#0d2c5c]/10 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0d2c5c] transition-all hover:bg-[#f0f4f9]"
              >
                Renunță
              </button>
              <button
                disabled={busy === `${cancelTarget?.id}-cancel`}
                onClick={() => void submitCancel()}
                className="inline-flex items-center gap-2 rounded-full bg-[#8c2f39] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-[#6f232c] disabled:opacity-60"
              >
                Confirmă anularea
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          open={!!editTarget}
          title={`Editare rezervare #${
            editTarget?.id ? String(editTarget.id).substring(0, 8) : ""
          }`}
          onClose={() => setEditTarget(null)}
        >
          <div>
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#e1e8f0] bg-[#f8fafd] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c] text-[15px] font-bold text-[#e6b85c]">
                {(editTarget?.guest_name || "O").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[#0d2c5c]">
                  {editTarget?.guest_name || "Oaspete"}
                </p>
                <p className="truncate text-[12px] text-[#4f6280]">
                  {editTarget?.room_name || "Cameră"}
                  {editTarget?.total_price != null && ` · ${editTarget.total_price} RON`}
                </p>
              </div>
            </div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b7c99]">Perioada, camera & oaspeți</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Check-in">
                <input
                  type="date"
                  className={`${fieldInput} mt-2`}
                  value={form.check_in}
                  onChange={(e) =>
                    setForm({ ...form, check_in: e.target.value })
                  }
                />
                {formErr.check_in && (
                  <span className="text-[11px] text-red-600 mt-1">
                    {formErr.check_in}
                  </span>
                )}
              </FormField>
              <FormField label="Check-out">
                <input
                  type="date"
                  className={`${fieldInput} mt-2`}
                  value={form.check_out}
                  onChange={(e) =>
                    setForm({ ...form, check_out: e.target.value })
                  }
                />
                {formErr.check_out && (
                  <span className="text-[11px] text-red-600 mt-1">
                    {formErr.check_out}
                  </span>
                )}
              </FormField>
              <FormField label="Tip cameră">
                <select
                  className={`${fieldInput} mt-2`}
                  value={form.room_id}
                  onChange={(e) =>
                    setForm({ ...form, room_id: e.target.value, room_unit_id: "" })
                  }
                >
                  {(availData?.rooms || rooms.map((r) => ({ id: String(r.id), title: r.title, capacity: r.capacity || 2, free_units: -1 }))).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} (max {r.capacity} pers.{r.free_units >= 0 ? ` · ${r.free_units} libere` : ""})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Unitate fizică">
                <select
                  className={`${fieldInput} mt-2`}
                  value={form.room_unit_id}
                  onChange={(e) =>
                    setForm({ ...form, room_unit_id: e.target.value })
                  }
                >
                  <option value="">Alocare automată (prima unitate liberă)</option>
                  {(availData?.available_units || []).map((u) => (
                    <option key={u.id} value={u.id} disabled={!u.is_free}>
                      Cam {u.unit_number} {u.is_free ? "— Liberă" : "— Ocupată"}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Oaspeți">
                <input
                  type="number"
                  min={1}
                  className={`${fieldInput} mt-2`}
                  value={form.guests}
                  onChange={(e) =>
                    setForm({ ...form, guests: Number(e.target.value) })
                  }
                />
                {formErr.guests && (
                  <span className="text-[11px] text-red-600 mt-1">
                    {formErr.guests}
                  </span>
                )}
              </FormField>
              {availData && (
                <div className="flex flex-col justify-end pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6b7c99]">
                    Preț recalculat ({availData.nights} {availData.nights === 1 ? "noapte" : "nopți"})
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#0d2c5c]">
                      {availData.new_total_price} RON
                    </span>
                    {availData.price_diff !== 0 && (
                      <span className={`text-xs font-semibold ${availData.price_diff > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                        ({availData.price_diff > 0 ? "+" : ""}{availData.price_diff} RON)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {availLoading ? (
              <div className="mt-4 rounded-2xl border border-[#e1e8f0] bg-[#f8fafd] px-4 py-3 text-xs text-[#4f6280]">
                Se verifică disponibilitatea în timp real...
              </div>
            ) : availData ? (
              <div
                className={`mt-4 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-xs font-medium ${
                  availData.can_save
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {availData.can_save ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-700" />
                ) : (
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-700" />
                )}
                <span>{availData.message}</span>
              </div>
            ) : null}

            {editRefundOpen && editTarget && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 space-y-3">
                <p className="text-xs font-bold text-rose-900">
                  {editTarget.payment_status === "paid"
                    ? `Anulare și rambursare integrală Stripe (${editTarget.total_price ?? 0} RON)`
                    : "Confirmare anulare rezervare"}
                </p>
                <input
                  type="text"
                  placeholder="Motiv anulare / refund (opțional)..."
                  value={editRefundReason}
                  onChange={(e) => setEditRefundReason(e.target.value)}
                  className={fieldInput}
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRefundOpen(false)}
                    className="rounded-full border border-[#cbd5e1] bg-white px-4 py-1.5 text-[11px] font-bold text-[#334155] cursor-pointer"
                  >
                    Înapoi
                  </button>
                  <button
                    type="button"
                    disabled={busy === `${editTarget.id}-refund`}
                    onClick={() => void submitEditRefund()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-rose-700 hover:bg-rose-800 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw size={12} />
                    {busy === `${editTarget.id}-refund`
                      ? "Se procesează..."
                      : editTarget.payment_status === "paid"
                        ? "Confirmă Anulare & Refund"
                        : "Confirmă Anularea"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#eef2f7] pt-5">
              <div>
                {editTarget && !["cancelled", "completed"].includes(String(editTarget.status || "")) && !editRefundOpen && (
                  <button
                    type="button"
                    onClick={() => setEditRefundOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    {editTarget.payment_status === "paid" ? "Anulează & Refund" : "Anulează rezervarea"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditTarget(null)}
                  className="rounded-full border border-[#e1e8f0] bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2a3b52] transition-all hover:border-[#0d2c5c] cursor-pointer"
                >
                  Renunță
                </button>
                <button
                  disabled={busy === `${editTarget?.id}-edit` || (availData !== null && !availData.can_save)}
                  onClick={() => void submitEdit()}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0d2c5c] to-[#1a3a6e] px-7 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-md transition-all hover:shadow-lg hover:from-[#07203f] hover:to-[#0d2c5c] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvează
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
  );
}

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
