import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  Receipt,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";
import {
  SectionHeader,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Modal,
  Field,
  TextInput,
  Select,
  Textarea,
} from "./ui";

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  qty: number;
}

export interface RoomServiceOrderItem {
  id: string;
  order_code: string;
  location_type: "room" | string;
  location_label: string;
  booking_code?: string | null;
  guest_name: string;
  guest_phone?: string | null;
  items: OrderItem[];
  total_amount: number;
  payment_method: "room_charge" | "card" | "cash" | string;
  notes?: string | null;
  status: "new" | "preparing" | "delivering" | "delivered" | "cancelled";
  created_at?: string | null;
}

interface HotelUnitOption {
  unit_id: string;
  unit_number: string;
  room_title: string;
  location_label: string;
}

const COLUMNS: {
  key: "new" | "preparing" | "delivering" | "delivered";
  title: string;
  subtitle: string;
  badgeBg: string;
  borderAccent: string;
  icon: typeof Clock;
}[] = [
  {
    key: "new",
    title: "Comenzi Noi",
    subtitle: "Așteaptă preluarea",
    badgeBg: "bg-amber-500/15 text-amber-800 border-amber-400/40",
    borderAccent: "border-t-4 border-t-amber-500",
    icon: Sparkles,
  },
  {
    key: "preparing",
    title: "În Preparare",
    subtitle: "Bucătărie Room Service",
    badgeBg: "bg-sky-500/15 text-sky-800 border-sky-400/40",
    borderAccent: "border-t-4 border-t-sky-500",
    icon: ChefHat,
  },
  {
    key: "delivering",
    title: "În Livrare",
    subtitle: "În drum spre cameră",
    badgeBg: "bg-indigo-500/15 text-indigo-800 border-indigo-400/40",
    borderAccent: "border-t-4 border-t-indigo-500",
    icon: Bike,
  },
  {
    key: "delivered",
    title: "Livrate în Cameră",
    subtitle: "Predate oaspeților",
    badgeBg: "bg-emerald-500/15 text-emerald-800 border-emerald-400/40",
    borderAccent: "border-t-4 border-t-emerald-500",
    icon: CheckCircle2,
  },
];

export default function OrdersKdsTab() {
  const { toast: notify } = useToast();
  const [orders, setOrders] = useState<RoomServiceOrderItem[]>([]);
  const [hotelUnits, setHotelUnits] = useState<HotelUnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Modal comandă telefonică din recepție (strict pentru camerele existente)
  const [showModal, setShowModal] = useState(false);
  const [newLocLabel, setNewLocLabel] = useState("");
  const [newBookingCode, setNewBookingCode] = useState("");
  const [newPayment, setNewPayment] = useState<"room_charge" | "card" | "cash">("room_charge");
  const [newNotes, setNewNotes] = useState("");
  const [newItemsText, setNewItemsText] = useState("2x Mic Dejun Continental - 68\n1x Platou Fructe de Mare - 115");

  const loadOrders = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      try {
        const [data, stayInfo] = await Promise.all([
          apiFetch<RoomServiceOrderItem[]>("/orders"),
          apiFetch<{ hotel_units: HotelUnitOption[] }>("/orders/active-stay-rooms").catch(() => ({
            hotel_units: [],
          })),
        ]);
        setOrders(Array.isArray(data) ? data : []);
        const units = stayInfo?.hotel_units || [];
        setHotelUnits(units);
        if (units.length > 0 && !newLocLabel) {
          setNewLocLabel(units[0].location_label);
        }
      } catch (err: any) {
        if (!opts?.silent) notify(err?.message || "Eroare la încărcarea comenzilor.", "error");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [notify, newLocLabel],
  );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useAdminLiveSync({
    topic: "all",
    onSync: () => loadOrders({ silent: true }),
  });

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setBusyId(orderId);
    try {
      const updated = await apiFetch<RoomServiceOrderItem>(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      notify(`Status actualizat pentru comanda ${updated.order_code}`, "success");
    } catch (err: any) {
      notify(err?.message || "Nu am putut actualiza statusul comenzii.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string, code: string) => {
    try {
      await apiFetch(`/orders/${orderId}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      notify(`Comanda ${code} a fost ștearsă.`, "success");
    } catch (err: any) {
      notify(err?.message || "Nu am putut șterge comanda.", "error");
    }
  };

  const handleCreateManualOrder = async () => {
    const parsedItems: OrderItem[] = newItemsText
      .split("\n")
      .map((line, idx) => {
        const clean = line.trim();
        if (!clean) return null;
        const qtyMatch = clean.match(/^(\d+)\s*[xX*]\s*(.+)$/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        const rest = qtyMatch ? qtyMatch[2] : clean;
        const parts = rest.split("-");
        const pricePart =
          parts.length > 1 ? parseFloat(parts[parts.length - 1].replace(/[^\d.]/g, "")) : 35;
        const titlePart = parts.length > 1 ? parts.slice(0, -1).join("-").trim() : rest.trim();
        return {
          id: `manual-${idx}`,
          title: titlePart || "Produs Meniu",
          price: isNaN(pricePart) ? 35 : pricePart,
          qty: isNaN(qty) || qty < 1 ? 1 : qty,
        };
      })
      .filter((x): x is OrderItem => x !== null);

    if (!parsedItems.length) {
      notify("Adaugă cel puțin un produs în comandă.", "error");
      return;
    }

    try {
      const created = await apiFetch<RoomServiceOrderItem>("/orders", {
        method: "POST",
        body: JSON.stringify({
          is_admin_manual: true,
          location_label: newLocLabel || "Camera 101",
          booking_code: newBookingCode || undefined,
          payment_method: newPayment,
          notes: newNotes || undefined,
          items: parsedItems,
        }),
      });
      setOrders((prev) => [created, ...prev]);
      setShowModal(false);
      setNewBookingCode("");
      setNewNotes("");
      notify(`Comanda ${created.order_code} a fost trimisă în KDS!`, "success");
    } catch (err: any) {
      notify(err?.message || "Eroare la crearea comenzii.", "error");
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = o.order_code.toLowerCase().includes(q);
        const matchLoc = o.location_label.toLowerCase().includes(q);
        const matchBk = (o.booking_code || "").toLowerCase().includes(q);
        const matchItem = o.items.some((i) => i.title.toLowerCase().includes(q));
        if (!matchCode && !matchLoc && !matchBk && !matchItem) return false;
      }
      return true;
    });
  }, [orders, search]);

  const renderPaymentBadge = (method: string) => {
    if (method === "card") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
          <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> POS la Cameră
        </span>
      );
    }
    if (method === "cash") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Numerar la Cameră
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-semibold">
        <Receipt className="w-3.5 h-3.5 text-amber-600" /> Pe Contul Camerei
      </span>
    );
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Kitchen Display System (KDS) · Room Service"
        title="Comenzi Room Service în Cameră"
        description="Panou sincronizat în timp real prin WebSockets cu comenzile plasate de oaspeții cazați în prezent. Orice schimbare de etapă se vede live pe pagina de progres a oaspetelui."
        actions={
          <PrimaryButton onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Comandă Telefonică la Cameră
          </PrimaryButton>
        }
      />

      {/* Search bar */}
      <div className="mb-6 max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Caută după #ORD, #BK, numărul camerei sau produs..."
        />
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-96 rounded-2xl bg-white/60 border border-[color:var(--color-border)] animate-pulse p-4"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const ColIcon = col.icon;
            const colOrders = filtered.filter((o) => o.status === col.key);
            return (
              <div
                key={col.key}
                className={`rounded-2xl bg-white/80 backdrop-blur-md border border-[color:var(--color-border)] shadow-sm ${col.borderAccent} p-4 flex flex-col gap-3 min-h-[460px]`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[color:var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <ColIcon className="w-4 h-4 text-[color:var(--color-primary)]" />
                    <div>
                      <h3 className="font-bold text-sm text-[color:var(--color-foreground)]">
                        {col.title}
                      </h3>
                      <p className="text-[11px] text-[color:var(--color-muted-foreground)]">
                        {col.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.badgeBg}`}>
                    {colOrders.length}
                  </span>
                </div>

                {colOrders.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-[color:var(--color-muted-foreground)] text-xs">
                    Nicio comandă în această etapă.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {colOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl bg-white border border-[color:var(--color-border)] p-3.5 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-[color:var(--color-primary)] bg-slate-100 px-2 py-0.5 rounded">
                            {order.order_code}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#eef2f7] text-[#0d2c5c]">
                            <BedDouble className="w-3.5 h-3.5" />
                            Room Service
                          </span>
                        </div>

                        <div className="font-['Outfit',sans-serif] font-bold text-base text-[color:var(--color-foreground)] mb-1">
                          {order.location_label}
                        </div>

                        {order.booking_code && (
                          <div className="mb-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-900 font-mono text-[10.5px] font-semibold">
                              Sejur #{order.booking_code.replace(/^#/, "")}
                            </span>
                          </div>
                        )}

                        {/* Items list */}
                        <div className="bg-[color:var(--color-muted)]/60 rounded-lg p-2.5 space-y-1.5 mb-3 border border-[color:var(--color-border)]/60">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between text-xs gap-2">
                              <span className="font-medium text-slate-800">
                                <strong className="text-[color:var(--color-primary)]">{item.qty}x</strong>{" "}
                                {item.title}
                              </span>
                              <span className="text-slate-600 font-mono shrink-0">
                                {(item.price * item.qty).toFixed(0)} RON
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="text-[11px] bg-amber-50 border border-amber-200/80 text-amber-900 rounded-lg px-2.5 py-1.5 mb-3 italic">
                            „{order.notes}”
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[color:var(--color-border)] mb-3">
                          {renderPaymentBadge(order.payment_method)}
                          <span className="font-bold text-sm text-[color:var(--color-primary)]">
                            {order.total_amount.toFixed(0)} RON
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-2">
                          {order.status === "new" && (
                            <button
                              disabled={busyId === order.id}
                              onClick={() => handleStatusChange(order.id, "preparing")}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition cursor-pointer"
                            >
                              Preia în Bucătărie →
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button
                              disabled={busyId === order.id}
                              onClick={() => handleStatusChange(order.id, "delivering")}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                            >
                              Trimite spre Cameră →
                            </button>
                          )}
                          {order.status === "delivering" && (
                            <button
                              disabled={busyId === order.id}
                              onClick={() => handleStatusChange(order.id, "delivered")}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                            >
                              ✓ Marchează Livrată
                            </button>
                          )}
                          {order.status === "delivered" && (
                            <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Livrată la cameră
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteOrder(order.id, order.order_code)}
                            title="Șterge comanda"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Comandă Telefonică la Cameră */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Adaugă Comandă Room Service la Cameră"
        subtitle="Selectează una dintre camerele disponibile din hotel și trimite comanda direct în KDS."
        footer={
          <>
            <GhostButton onClick={() => setShowModal(false)}>Anulează</GhostButton>
            <PrimaryButton onClick={handleCreateManualOrder}>Trimite în Bucătărie</PrimaryButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Selectează Camera Disponibilă">
            <Select
              value={newLocLabel}
              onChange={(e) => setNewLocLabel(e.target.value)}
            >
              {hotelUnits.map((u) => (
                <option key={u.unit_id} value={u.location_label}>
                  {u.location_label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Cod Rezervare #BK (opțional)">
            <TextInput
              value={newBookingCode}
              onChange={(e) => setNewBookingCode(e.target.value)}
              placeholder="ex: BK-88412"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Metodă de Plată">
              <Select value={newPayment} onChange={(e) => setNewPayment(e.target.value as any)}>
                <option value="room_charge">Trecut pe Contul Camerei</option>
                <option value="card">Card la Livrare în Cameră (POS)</option>
                <option value="cash">Numerar la Livrare în Cameră</option>
              </Select>
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Produse comandate (câte unul pe rând: Cantitate x Nume - Preț RON)">
              <Textarea
                rows={4}
                value={newItemsText}
                onChange={(e) => setNewItemsText(e.target.value)}
                placeholder={"2x Mic Dejun Continental - 68\n1x Platou Fructe de Mare - 115"}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Mențiuni speciale">
              <TextInput
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="ex: Fără zahăr, tacâmuri pentru 2 persoane"
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
