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
  User,
  MessageSquareQuote,
  ArrowRight,
  UtensilsCrossed,
  Wallet,
  Crown,
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
  subtotal_amount?: number | null;
  discount_percent?: number;
  discount_amount?: number;
  vip_tier?: string | null;
  discount_reason?: string | null;
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
  emptyTitle: string;
  emptyHint: string;
  iconBg: string;
  countBadge: string;
  accentBar: string;
  icon: typeof Clock;
}[] = [
  {
    key: "new",
    title: "Comenzi noi",
    subtitle: "Așteaptă preluarea",
    emptyTitle: "Nicio comandă în așteptare",
    emptyHint: "Comenzile noi ale oaspeților apar instant aici.",
    iconBg: "bg-amber-50 text-[#c69a3f] border-amber-200/80",
    countBadge: "bg-amber-50 text-[#946c1d] border-[#c69a3f]/35",
    accentBar: "from-[#c69a3f] to-[#e6b85c]",
    icon: Sparkles,
  },
  {
    key: "preparing",
    title: "În preparare",
    subtitle: "Bucătărie room service",
    emptyTitle: "Bucătăria este liberă",
    emptyHint: "Preia o comandă nouă pentru a începe prepararea.",
    iconBg: "bg-[#0d2c5c]/8 text-[#0d2c5c] border-[#0d2c5c]/15",
    countBadge: "bg-[#f0f4fa] text-[#0d2c5c] border-[#0d2c5c]/20",
    accentBar: "from-[#0d2c5c] to-[#1e4b8f]",
    icon: ChefHat,
  },
  {
    key: "delivering",
    title: "În livrare",
    subtitle: "În drum spre cameră",
    emptyTitle: "Nicio livrare activă",
    emptyHint: "Comenzile gata de servire vor apărea aici.",
    iconBg: "bg-sky-50 text-sky-700 border-sky-200",
    countBadge: "bg-sky-50 text-sky-800 border-sky-200",
    accentBar: "from-sky-600 to-[#0d2c5c]",
    icon: Bike,
  },
  {
    key: "delivered",
    title: "Livrate în cameră",
    subtitle: "Predate oaspeților",
    emptyTitle: "Încă fără livrări",
    emptyHint: "Comenzile finalizate astăzi vor fi arhivate aici.",
    iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    countBadge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    accentBar: "from-emerald-500 to-teal-600",
    icon: CheckCircle2,
  },
];

function formatElapsed(iso?: string | null): string {
  if (!iso) return "Astăzi";
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "Recent";
  const diffMin = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 60000));
  if (diffMin < 1) return "Chiar acum";
  if (diffMin < 60) return `Acum ${diffMin} min`;
  const hrs = Math.floor(diffMin / 60);
  if (hrs < 24) return `Acum ${hrs}h`;
  return dt.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
}

function splitLocation(label: string): { main: string; detail: string | null } {
  const dashSplit = label.split(/\s*[—–-]\s*/);
  if (dashSplit.length > 1) {
    return { main: dashSplit[0].trim(), detail: dashSplit.slice(1).join(" — ").trim() };
  }
  const parenMatch = label.match(/^(.+?)\s*\((.+)\)$/);
  if (parenMatch) {
    return { main: parenMatch[1].trim(), detail: parenMatch[2].trim() };
  }
  return { main: label, detail: null };
}

export default function OrdersKdsTab() {
  const { toast: notify } = useToast();
  const [orders, setOrders] = useState<RoomServiceOrderItem[]>([]);
  const [hotelUnits, setHotelUnits] = useState<HotelUnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "room_charge" | "direct">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newLocLabel, setNewLocLabel] = useState("");
  const [newBookingCode, setNewBookingCode] = useState("");
  const [newPayment, setNewPayment] = useState<"room_charge" | "card" | "cash">("room_charge");
  const [newNotes, setNewNotes] = useState("");
  const [newItemsText, setNewItemsText] = useState(
    "2x Mic dejun continental - 68\n1x Platou fructe de mare - 115"
  );

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
    [notify, newLocLabel]
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
      if (paymentFilter === "room_charge" && o.payment_method !== "room_charge") return false;
      if (paymentFilter === "direct" && o.payment_method === "room_charge") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = o.order_code.toLowerCase().includes(q);
        const matchLoc = o.location_label.toLowerCase().includes(q);
        const matchGuest = (o.guest_name || "").toLowerCase().includes(q);
        const matchBk = (o.booking_code || "").toLowerCase().includes(q);
        const matchItem = o.items.some((i) => i.title.toLowerCase().includes(q));
        if (!matchCode && !matchLoc && !matchGuest && !matchBk && !matchItem) return false;
      }
      return true;
    });
  }, [orders, search, paymentFilter]);

  const kpi = useMemo(() => {
    const activeOrders = orders.filter((o) =>
      ["new", "preparing", "delivering"].includes(o.status)
    );
    const kitchenCount = orders.filter((o) => o.status === "preparing").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    return {
      active: activeOrders.length,
      kitchen: kitchenCount,
      delivered: deliveredCount,
      revenue: totalRevenue,
    };
  }, [orders]);

  const renderPaymentBadge = (method: string) => {
    if (method === "card") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/70 text-[11px] font-semibold">
          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
          POS la cameră
        </span>
      );
    }
    if (method === "cash") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-semibold">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          Numerar
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fdf8ec] text-[#8a6420] border border-[#c69a3f]/30 text-[11px] font-semibold">
        <Receipt className="w-3.5 h-3.5 text-[#c69a3f]" />
        Pe contul camerei
      </span>
    );
  };

  return (
    <div className="space-y-6">
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

      {/* KDS Summary Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl bg-white border border-[#e1e8f0] p-4 shadow-[0_6px_24px_rgba(13,44,92,0.04)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Comenzi în curs
            </p>
            <p className="font-['Outfit',sans-serif] text-2xl font-extrabold text-[#0d2c5c] mt-0.5">
              {kpi.active}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 text-[#c69a3f] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#e1e8f0] p-4 shadow-[0_6px_24px_rgba(13,44,92,0.04)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              În bucătărie acum
            </p>
            <p className="font-['Outfit',sans-serif] text-2xl font-extrabold text-[#0d2c5c] mt-0.5">
              {kpi.kitchen}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0f4fa] border border-[#0d2c5c]/15 text-[#0d2c5c] flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#e1e8f0] p-4 shadow-[0_6px_24px_rgba(13,44,92,0.04)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Livrate în cameră
            </p>
            <p className="font-['Outfit',sans-serif] text-2xl font-extrabold text-emerald-700 mt-0.5">
              {kpi.delivered}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#0d2c5c] to-[#133b7a] border border-[#0d2c5c] p-4 shadow-[0_10px_28px_rgba(13,44,92,0.16)] flex items-center justify-between text-white">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#e6b85c]">
              Volum Room Service
            </p>
            <p className="font-['Outfit',sans-serif] text-2xl font-extrabold mt-0.5">
              {kpi.revenue.toLocaleString("ro-RO")} <span className="text-xs font-bold text-[#e6b85c]">RON</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-[#e6b85c] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Caută după #ORD, #BK, oaspete, cameră sau produs..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "Toate plățile" },
            { key: "room_charge", label: "Pe contul camerei" },
            { key: "direct", label: "Card / Numerar" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setPaymentFilter(f.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                paymentFilter === f.key
                  ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-xs"
                  : "bg-white text-[#0d2c5c] border-[#e1e8f0] hover:bg-[#f8fafc]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-[520px] rounded-[24px] bg-white/70 border border-[#e1e8f0] animate-pulse p-4"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
          {COLUMNS.map((col) => {
            const ColIcon = col.icon;
            const colOrders = filtered.filter((o) => o.status === col.key);
            const colTotal = colOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

            return (
              <div
                key={col.key}
                className="rounded-[24px] bg-[#f8fafc]/90 border border-[#e1e8f0] shadow-[0_10px_34px_rgba(13,44,92,0.05)] overflow-hidden flex flex-col min-h-[540px]"
              >
                {/* Clean Top Gradient Accent Strip */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${col.accentBar}`} />

                {/* Column Header */}
                <div className="bg-white px-4 py-3.5 border-b border-[#e1e8f0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${col.iconBg}`}
                    >
                      <ColIcon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-['Outfit',sans-serif] font-bold text-[15px] text-[#0d2c5c] leading-tight truncate">
                        {col.title}
                      </h3>
                      <p className="text-[11px] text-[#64748b] font-['Plus_Jakarta_Sans',sans-serif] truncate">
                        {col.subtitle}
                        {colOrders.length > 0 ? ` · ${colTotal.toFixed(0)} RON` : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border font-['Outfit',sans-serif] shrink-0 ${col.countBadge}`}
                  >
                    {colOrders.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className="p-3.5 flex-1 flex flex-col gap-3">
                  {colOrders.length === 0 ? (
                    <div className="flex-1 rounded-2xl border border-dashed border-[#cbd5e1] bg-white/55 flex flex-col items-center justify-center text-center px-5 py-10">
                      <span
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-3 opacity-80 ${col.iconBg}`}
                      >
                        <ColIcon className="w-5 h-5" />
                      </span>
                      <p className="font-['Outfit',sans-serif] text-sm font-bold text-[#0d2c5c]">
                        {col.emptyTitle}
                      </p>
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[11.5px] text-[#64748b] mt-1 max-w-[200px] leading-relaxed">
                        {col.emptyHint}
                      </p>
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const loc = splitLocation(order.location_label);
                      return (
                        <div
                          key={order.id}
                          className="group rounded-2xl bg-white border border-[#e1e8f0] p-4 shadow-[0_4px_16px_rgba(13,44,92,0.04)] hover:shadow-[0_12px_28px_rgba(13,44,92,0.1)] hover:border-[#c69a3f]/50 transition-all duration-200 flex flex-col gap-3"
                        >
                          {/* Top Meta Row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-['Outfit',sans-serif] text-[11.5px] font-extrabold tracking-wide text-[#0d2c5c] bg-[#0d2c5c]/8 px-2.5 py-0.5 rounded-lg border border-[#0d2c5c]/15">
                                {order.order_code}
                              </span>
                              <span className="text-[11px] font-medium text-[#64748b] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#c69a3f]" />
                                {formatElapsed(order.created_at)}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteOrder(order.id, order.order_code)}
                              title="Șterge comanda"
                              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Location + Guest + Booking */}
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <BedDouble className="w-4 h-4 text-[#c69a3f] shrink-0" />
                                  <h4 className="font-['Outfit',sans-serif] font-bold text-[17px] text-[#0d2c5c] leading-tight truncate">
                                    {loc.main}
                                  </h4>
                                </div>
                                {loc.detail && (
                                  <p className="text-[11.5px] text-[#64748b] font-medium mt-0.5 truncate pl-5.5">
                                    {loc.detail}
                                  </p>
                                )}
                              </div>

                              {order.booking_code && (
                                <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#fdf8ec] text-[#8a6420] border border-[#c69a3f]/35 text-[10.5px] font-bold font-mono">
                                  #{order.booking_code.replace(/^#/, "")}
                                </span>
                              )}
                            </div>

                            {order.guest_name && (
                              <div className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#334155]">
                                <User className="w-3.5 h-3.5 text-[#64748b]" />
                                <span>{order.guest_name}</span>
                              </div>
                            )}
                          </div>

                          {/* Ordered Items Box */}
                          <div className="rounded-xl bg-[#f8fafc] border border-[#e1e8f0]/90 px-3 py-2.5 space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-baseline justify-between gap-2 text-xs">
                                <div className="flex items-baseline gap-1.5 min-w-0">
                                  <span className="inline-flex items-center justify-center min-w-[24px] px-1 py-0.5 rounded-md bg-white border border-[#e1e8f0] font-['Outfit',sans-serif] text-[11px] font-extrabold text-[#0d2c5c] shrink-0">
                                    {item.qty}×
                                  </span>
                                  <span className="font-semibold text-[#1e293b] leading-snug">
                                    {item.title}
                                  </span>
                                </div>
                                <span className="font-['Outfit',sans-serif] font-bold text-[#475569] tabular-nums shrink-0">
                                  {(item.price * item.qty).toFixed(0)} lei
                                </span>
                              </div>
                            ))}
                            {order.discount_amount && order.discount_amount > 0 ? (
                              <div
                                title={order.discount_reason || undefined}
                                className="pt-1.5 mt-1 border-t border-[#e1e8f0] flex items-center justify-between gap-2 text-[11px]"
                              >
                                <span className="inline-flex items-center gap-1 font-bold text-[#8a6420]">
                                  <Crown className="w-3 h-3 text-[#c69a3f]" />
                                  VIP {order.vip_tier || ""} (-{order.discount_percent || 0}%)
                                </span>
                                <span className="font-['Outfit',sans-serif] font-bold text-emerald-700 tabular-nums">
                                  -{Number(order.discount_amount).toFixed(2)} lei
                                </span>
                              </div>
                            ) : null}
                          </div>

                          {/* Guest Notes */}
                          {order.notes && (
                            <div className="flex items-start gap-2 text-[11.5px] bg-[#fdf8ec] border border-[#c69a3f]/35 text-[#7c5817] rounded-xl px-3 py-2 font-medium leading-snug">
                              <MessageSquareQuote className="w-3.5 h-3.5 text-[#c69a3f] shrink-0 mt-0.5" />
                              <span>„{order.notes}”</span>
                            </div>
                          )}

                          {/* Payment & Total Row */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-[#eef2f8]">
                            {renderPaymentBadge(order.payment_method)}
                            <div className="text-right">
                              {order.discount_amount && order.discount_amount > 0 && order.subtotal_amount ? (
                                <span className="text-[11px] text-[#94a3b8] line-through mr-1.5 tabular-nums">
                                  {Number(order.subtotal_amount).toFixed(0)}
                                </span>
                              ) : null}
                              <span className="font-['Outfit',sans-serif] font-extrabold text-[17px] text-[#0d2c5c] tabular-nums">
                                {order.total_amount.toFixed(0)}
                              </span>
                              <span className="text-[11px] font-bold text-[#c69a3f] ml-1">RON</span>
                            </div>
                          </div>

                          {/* Action Footer */}
                          <div>
                            {order.status === "new" && (
                              <button
                                disabled={busyId === order.id}
                                onClick={() => handleStatusChange(order.id, "preparing")}
                                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#0d2c5c] to-[#153e7e] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer shadow-[0_6px_16px_rgba(13,44,92,0.18)] flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <ChefHat className="w-3.5 h-3.5 text-[#e6b85c]" />
                                <span>Preia în bucătărie</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {order.status === "preparing" && (
                              <button
                                disabled={busyId === order.id}
                                onClick={() => handleStatusChange(order.id, "delivering")}
                                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#0d2c5c] via-[#133b7a] to-[#9b7626] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer shadow-[0_6px_16px_rgba(13,44,92,0.18)] flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <Bike className="w-3.5 h-3.5 text-[#f6d892]" />
                                <span>Trimite spre cameră</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {order.status === "delivering" && (
                              <button
                                disabled={busyId === order.id}
                                onClick={() => handleStatusChange(order.id, "delivered")}
                                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer shadow-[0_6px_16px_rgba(5,150,105,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Marchează livrată în cameră</span>
                              </button>
                            )}
                            {order.status === "delivered" && (
                              <div className="w-full py-2 px-3 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-[11.5px] font-bold flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Predată cu succes oaspetelui</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
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
            <PrimaryButton onClick={handleCreateManualOrder}>Trimite în bucătărie</PrimaryButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Selectează camera disponibilă">
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

          <Field label="Cod rezervare #BK (opțional)">
            <TextInput
              value={newBookingCode}
              onChange={(e) => setNewBookingCode(e.target.value)}
              placeholder="ex: BK-88412"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Metodă de plată">
              <Select value={newPayment} onChange={(e) => setNewPayment(e.target.value as any)}>
                <option value="room_charge">Trecut pe contul camerei</option>
                <option value="card">Card la livrare în cameră (POS)</option>
                <option value="cash">Numerar la livrare în cameră</option>
              </Select>
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Produse comandate (câte unul pe rând: cantitate x nume - preț RON)">
              <Textarea
                rows={4}
                value={newItemsText}
                onChange={(e) => setNewItemsText(e.target.value)}
                placeholder={"2x Mic dejun continental - 68\n1x Platou fructe de mare - 115"}
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
