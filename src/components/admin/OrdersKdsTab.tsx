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
    title: "Comenzi noi",
    subtitle: "Așteaptă preluarea",
    badgeBg: "bg-[#fdf8ec] text-[#8a6420] border-[#c69a3f]/30",
    borderAccent: "border-t-4 border-t-[#c69a3f]",
    icon: Sparkles,
  },
  {
    key: "preparing",
    title: "În preparare",
    subtitle: "Bucătărie room service",
    badgeBg: "bg-[#f0f4fa] text-[#0d2c5c] border-[#0d2c5c]/20",
    borderAccent: "border-t-4 border-t-[#0d2c5c]",
    icon: ChefHat,
  },
  {
    key: "delivering",
    title: "În livrare",
    subtitle: "În drum spre cameră",
    badgeBg: "bg-[#0d2c5c]/10 text-[#0d2c5c] border-[#0d2c5c]/25",
    borderAccent: "border-t-4 border-t-[#0d2c5c]",
    icon: Bike,
  },
  {
    key: "delivered",
    title: "Livrate în cameră",
    subtitle: "Predate oaspeților",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-300",
    borderAccent: "border-t-4 border-t-emerald-600",
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
        eyebrow="Sistem bucătărie (KDS) și room service"
        title="Comenzi de room service în cameră"
        description="Panou sincronizat în timp real prin WebSockets cu comenzile plasate de oaspeții cazați în prezent. Orice schimbare de etapă se vede live pe pagina de progres a oaspetelui."
        actions={
          <PrimaryButton onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Comandă telefonică la cameră
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
                <div className="flex items-center justify-between pb-2 border-b border-[#e1e8f0]">
                  <div className="flex items-center gap-2">
                    <ColIcon className="w-4 h-4 text-[#0d2c5c]" />
                    <div>
                      <h3 className="font-['Outfit',sans-serif] font-bold text-sm text-[#0d2c5c]">
                        {col.title}
                      </h3>
                      <p className="text-[11px] text-[#6b7c99] font-['Plus_Jakarta_Sans',sans-serif]">
                        {col.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border font-['Outfit',sans-serif] ${col.badgeBg}`}>
                    {colOrders.length}
                  </span>
                </div>

                {colOrders.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-[#6b7c99] font-['Plus_Jakarta_Sans',sans-serif] text-xs">
                    Nicio comandă în această etapă.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 font-['Plus_Jakarta_Sans',sans-serif]">
                    {colOrders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl bg-white border border-[#e1e8f0] p-3.5 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-['Outfit',sans-serif] text-xs font-bold text-[#0d2c5c] bg-[#0d2c5c]/10 px-2 py-0.5 rounded border border-[#0d2c5c]/15">
                            {order.order_code}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#f0f4fa] text-[#0d2c5c] border border-[#0d2c5c]/15">
                            <BedDouble className="w-3.5 h-3.5 text-[#c69a3f]" />
                            Room Service
                          </span>
                        </div>

                        <div className="font-['Outfit',sans-serif] font-bold text-[17px] text-[#0d2c5c] mb-1">
                          {order.location_label}
                        </div>

                        {order.booking_code && (
                          <div className="mb-3">
                            <span className="px-2 py-0.5 rounded bg-[#fdf8ec] text-[#8a6420] border border-[#c69a3f]/30 font-['Plus_Jakarta_Sans',sans-serif] text-[10.5px] font-bold">
                              Sejur #{order.booking_code.replace(/^#/, "")}
                            </span>
                          </div>
                        )}

                        {/* Items list */}
                        <div className="bg-[#f8fafc] rounded-lg p-2.5 space-y-1.5 mb-3 border border-[#e1e8f0]">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between text-xs gap-2">
                              <span className="font-medium text-[#1e293b]">
                                <strong className="text-[#0d2c5c] font-bold">{item.qty}x</strong>{" "}
                                {item.title}
                              </span>
                              <span className="text-[#64748b] font-semibold shrink-0">
                                {(item.price * item.qty).toFixed(0)} RON
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="text-[11.5px] bg-[#fdf8ec] border border-[#c69a3f]/30 text-[#8a6420] rounded-lg px-2.5 py-1.5 mb-3 font-medium not-italic">
                            „{order.notes}”
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#e1e8f0] mb-3">
                          {renderPaymentBadge(order.payment_method)}
                          <span className="font-['Outfit',sans-serif] font-bold text-base text-[#0d2c5c]">
                            {order.total_amount.toFixed(0)} RON
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-2">
                          {order.status === "new" && (
                            <button
                              disabled={busyId === order.id}
                              onClick={() => handleStatusChange(order.id, "preparing")}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-[#0d2c5c] hover:bg-[#07203f] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                            >
                              Preia în Bucătărie →
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button
                              disabled={busyId === order.id}
                              onClick={() => handleStatusChange(order.id, "delivering")}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-[#0d2c5c] hover:bg-[#07203f] border border-[#c69a3f]/40 text-[#f6d892] text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                            >
                              Trimite spre Cameră →
                            </button>
                          )}
                          {order.status === "delivering" && (
                            <button
                              disabled={busyId === order.id}
                              onClick={() => handleStatusChange(order.id, "delivered")}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
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
        title="Adaugă o comandă de room service"
        subtitle="Selectează una dintre camerele disponibile din hotel și trimite comanda direct în bucătărie."
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
