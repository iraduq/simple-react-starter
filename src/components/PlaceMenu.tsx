import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingBag,
  BedDouble,
  Trash2,
  Lock,
  CalendarX,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Crown,
} from "lucide-react";
import type { MenuCategory } from "../types/places";
import { lei } from "../services/placesService";
import { apiFetch, hasSession } from "../lib/auth";
import { useToast } from "./Toast";

interface CartLine {
  id: string;
  title: string;
  price: number;
  image_url?: string | null;
  qty: number;
}

interface ActiveStayRoom {
  booking_id: string;
  booking_code: string;
  room_id: string;
  room_title: string;
  unit_id?: string | null;
  unit_number?: string | null;
  location_label: string;
}

export default function PlaceMenu({
  categories,
  onOrderRedirect,
}: {
  categories: MenuCategory[];
  onOrderRedirect?: () => void;
}) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const withItems = categories.filter((c) => (c.items?.length ?? 0) > 0);
  const [active, setActive] = useState<number | null>(null);
  const current = withItems.find((c) => c.id === active) ?? withItems[0];

  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [cartViewOpen, setCartViewOpen] = useState(false);

  // Active stay rooms fetched from backend
  const [checkingRooms, setCheckingRooms] = useState(false);
  const [activeRooms, setActiveRooms] = useState<ActiveStayRoom[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [eligibilityMsg, setEligibilityMsg] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"room_charge" | "card" | "cash">("room_charge");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [vipBenefit, setVipBenefit] = useState<{
    tier: string;
    discount_percent: number;
    reason?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!hasSession()) {
      setVipBenefit(null);
      return;
    }
    apiFetch<{
      tier: string;
      order_discount_percent?: number;
      order_discount_reason?: string | null;
    }>("/loyalty/my-account")
      .then((acc) => {
        const pct = Number(acc?.order_discount_percent || 0);
        if (acc?.tier && pct > 0) {
          setVipBenefit({
            tier: acc.tier,
            discount_percent: pct,
            reason:
              acc.order_discount_reason ||
              `Reducere automată ${pct}% aplicată deoarece ai statutul VIP ${acc.tier}`,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cartViewOpen) return;
    if (!hasSession()) {
      setActiveRooms([]);
      setEligibilityMsg("Autentifică-te în contul tău pentru a verifica rezervarea activă de astăzi.");
      return;
    }
    setCheckingRooms(true);
    apiFetch<{
      eligible: boolean;
      active_rooms: ActiveStayRoom[];
      vip_benefit?: { tier: string; discount_percent: number; reason?: string | null };
      message?: string | null;
    }>("/orders/active-stay-rooms")
      .then((res) => {
        if (res?.vip_benefit && Number(res.vip_benefit.discount_percent || 0) > 0) {
          setVipBenefit(res.vip_benefit);
        }
        const list = res?.active_rooms || [];
        setActiveRooms(list);
        if (list.length > 0) {
          setSelectedBookingId(list[0].booking_id);
          setEligibilityMsg(null);
        } else {
          setSelectedBookingId("");
          setEligibilityMsg(
            res?.message ||
              "Nu ai o cameră activă în ziua de astăzi. Comenzile Room Service sunt permise doar oaspeților cazați în prezent.",
          );
        }
      })
      .catch(() => {
        setActiveRooms([]);
        setEligibilityMsg("Nu am putut verifica rezervările active. Te rugăm să te autentifici din nou.");
      })
      .finally(() => setCheckingRooms(false));
  }, [cartViewOpen]);

  const addItem = (it: {
    id: number | string;
    title: string;
    price: number | string;
    image_url?: string | null;
  }) => {
    const k = String(it.id);
    setCart((prev) => {
      const existing = prev[k];
      return {
        ...prev,
        [k]: {
          id: k,
          title: it.title,
          price: Number(it.price || 0),
          image_url: it.image_url,
          qty: existing ? existing.qty + 1 : 1,
        },
      };
    });
  };

  const decItem = (id: number | string) => {
    const k = String(id);
    setCart((prev) => {
      const existing = prev[k];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      }
      return { ...prev, [k]: { ...existing, qty: existing.qty - 1 } };
    });
  };

  const removeItem = (id: number | string) => {
    const k = String(id);
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[k];
      return copy;
    });
  };

  const cartLines = Object.values(cart);
  const totalCount = cartLines.reduce((acc, l) => acc + l.qty, 0);
  const subtotalAmount = Math.round(cartLines.reduce((acc, l) => acc + l.price * l.qty, 0) * 100) / 100;
  const vipDiscountPercent = vipBenefit?.discount_percent ?? 0;
  const vipDiscountAmount =
    vipDiscountPercent > 0
      ? Math.round(subtotalAmount * (vipDiscountPercent / 100) * 100) / 100
      : 0;
  const totalAmount = Math.max(0, Math.round((subtotalAmount - vipDiscountAmount) * 100) / 100);

  const selectedRoomObj = activeRooms.find((r) => r.booking_id === selectedBookingId) || activeRooms[0];

  const handlePlaceOrder = async () => {
    if (!cartLines.length || !selectedRoomObj) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<{ order_code: string }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          booking_id: selectedRoomObj.booking_id,
          booking_code: selectedRoomObj.booking_code,
          location_label: selectedRoomObj.location_label,
          payment_method: paymentMethod,
          notes: notes.trim() || undefined,
          items: cartLines.map((l) => ({
            id: l.id,
            title: l.title,
            price: l.price,
            qty: l.qty,
          })),
        }),
      });
      setCart({});
      setNotes("");
      setCartViewOpen(false);
      if (onOrderRedirect) onOrderRedirect();
      toast(`Comanda ${res.order_code} a fost trimisă!`, "success");
      navigate(`/comanda/${res.order_code}`);
    } catch (err: any) {
      toast(err?.message || "Eroare la trimiterea comenzii.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (withItems.length === 0) {
    return (
      <div className="py-14 text-center">
        <UtensilsCrossed className="mx-auto mb-3 text-[#c69a3f]" size={26} strokeWidth={1.4} />
        <p className="text-[15px] font-semibold text-[#0d2c5c]">Meniul nu este disponibil încă</p>
        <p className="mt-1 text-[13px] text-[#4f6280]">Revino curând pentru oferta acestei locații.</p>
      </div>
    );
  }

  /* ── VEDERE COȘ & FINALIZARE COMANDĂ DIRECT ÎN MODALUL DIN DREAPTA ── */
  if (cartViewOpen) {
    return (
      <div className="flex flex-col space-y-6 text-[#0d2c5c] pb-4">
        {/* Header de întoarcere la meniu */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c69a3f]">
              <Sparkles size={12} /> Room Service · Vila Casa Esy
            </span>
            <h3 className="mt-0.5 font-['Cormorant_Garamond',serif] text-[28px] sm:text-[32px] font-semibold leading-tight text-[#0d2c5c]">
              Coșul Tău & Livrare în Cameră
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setCartViewOpen(false)}
            className="inline-flex items-center gap-2 rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0d2c5c] hover:border-[#0d2c5c] transition cursor-pointer shrink-0"
          >
            <ArrowLeft size={14} /> Înapoi la Meniu
          </button>
        </div>

        {/* 1. Produsele din Coș */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">
              1. Produsele din Coșul Tău ({totalCount})
            </span>
            {cartLines.length > 0 && (
              <button
                type="button"
                onClick={() => setCart({})}
                className="text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
              >
                Golește coșul
              </button>
            )}
          </div>

          {cartLines.length === 0 ? (
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-6 text-center text-sm text-[#475569]">
              Coșul tău este gol. Apasă pe „Înapoi la Meniu” pentru a adăuga preparate.
            </div>
          ) : (
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] divide-y divide-[#e2e8f0]">
              {cartLines.map((line) => (
                <div
                  key={line.id}
                  className="p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-[#0d2c5c] truncate">
                      {line.title}
                    </div>
                    <div className="text-xs text-[#475569]">
                      {lei(line.price)} / buc.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 border border-[#cbd5e1]">
                      <button
                        type="button"
                        onClick={() => decItem(line.id)}
                        className="text-[#0d2c5c] hover:text-rose-600 cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold text-[#0d2c5c] min-w-[16px] text-center">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => addItem(line)}
                        className="text-[#0d2c5c] hover:text-emerald-600 cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-bold text-sm text-[#0d2c5c] w-20 text-right">
                      {lei(line.price * line.qty)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(line.id)}
                      className="p-1.5 text-[#64748b] hover:text-rose-600 cursor-pointer"
                      title="Elimină produsul"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-white rounded-b-2xl space-y-2.5">
                {vipBenefit && vipDiscountAmount > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#475569]">
                      <span>Subtotal preparate</span>
                      <span>{lei(subtotalAmount)}</span>
                    </div>
                    <div className="rounded-xl border border-[#c69a3f]/40 bg-[#fdf8ec] px-3 py-2 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <Crown size={14} className="text-[#c69a3f] shrink-0 mt-0.5" />
                        <div className="text-xs leading-snug">
                          <div className="font-bold text-[#0d2c5c]">
                            Reducere automată VIP {vipBenefit.tier} (-{vipDiscountPercent}%)
                          </div>
                          <div className="text-[11px] text-[#7c5817]">
                            {vipBenefit.reason ||
                              `Aplicată automat deoarece deții statutul VIP ${vipBenefit.tier}`}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-emerald-700 shrink-0 tabular-nums">
                        -{lei(vipDiscountAmount)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#475569]">
                    Total de plată
                  </span>
                  <div className="flex items-baseline gap-2">
                    {vipDiscountAmount > 0 && (
                      <span className="text-xs font-semibold text-[#94a3b8] line-through">
                        {lei(subtotalAmount)}
                      </span>
                    )}
                    <span className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#0d2c5c]">
                      {lei(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Verificare Cameră Activă */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#c69a3f] mb-3">
            2. Camera Ta Activă (Cazare Curentă)
          </span>

          {!hasSession() ? (
            <div className="rounded-2xl border border-[#c69a3f]/40 bg-[#fdf8ec] p-5 text-center space-y-3">
              <Lock className="mx-auto text-[#c69a3f]" size={24} />
              <div className="font-['Cormorant_Garamond',serif] text-2xl font-semibold text-[#0d2c5c]">
                Autentificare necesară pentru Room Service
              </div>
              <p className="text-xs text-[#334155] max-w-md mx-auto leading-relaxed">
                Comenzile în cameră sunt disponibile exclusiv oaspeților cazați în prezent la Vila Casa Esy. Autentifică-te pentru a-ți selecta automat camera activă de astăzi.
              </p>
              <Link
                to="/login"
                onClick={() => {
                  setCartViewOpen(false);
                  if (onOrderRedirect) onOrderRedirect();
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest no-underline hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition"
              >
                Autentifică-te în cont
              </Link>
            </div>
          ) : checkingRooms ? (
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-6 text-center text-xs text-[#475569]">
              Se verifică camerele tale active pentru ziua de astăzi...
            </div>
          ) : activeRooms.length === 0 ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 text-center space-y-3">
              <CalendarX className="mx-auto text-amber-700" size={24} />
              <div className="font-['Cormorant_Garamond',serif] text-2xl font-semibold text-[#0d2c5c]">
                Nicio cameră cu sejur activ astăzi
              </div>
              <p className="text-xs text-[#334155] max-w-md mx-auto leading-relaxed">
                {eligibilityMsg}
              </p>
              <Link
                to="/rezervarile-mele"
                onClick={() => {
                  setCartViewOpen(false);
                  if (onOrderRedirect) onOrderRedirect();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#0d2c5c] text-[#0d2c5c] px-5 py-2 text-xs font-bold uppercase tracking-wider no-underline hover:bg-[#0d2c5c] hover:text-white transition"
              >
                Vezi Rezervările Mele
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2.5">
                {activeRooms.map((r) => {
                  const isSelected = r.booking_id === (selectedRoomObj?.booking_id ?? "");
                  return (
                    <button
                      key={r.booking_id}
                      type="button"
                      onClick={() => setSelectedBookingId(r.booking_id)}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "border-[#c69a3f] bg-[#fdf8ec] shadow-sm"
                          : "border-[#e2e8f0] bg-white hover:border-[#0d2c5c]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0d2c5c] text-[#e6b85c] flex items-center justify-center shrink-0">
                          <BedDouble size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#0d2c5c]">
                            {r.location_label}
                          </div>
                          <div className="text-xs text-[#475569]">
                            Sejur activ confirmat · Cod #{r.booking_code}
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider">
                        Cazat Azi
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#475569] mb-1.5">
                    Metodă de Plată
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm font-semibold text-[#0d2c5c] focus:border-[#c69a3f] focus:bg-white outline-none"
                  >
                    <option value="room_charge">Trecut pe Contul Camerei (Room Folio)</option>
                    <option value="pay_at_table">Plată direct la Masă (Card / Cash la ospătar)</option>
                    <option value="card">Card la Livrare în Cameră (POS)</option>
                    <option value="cash">Numerar la Livrare în Cameră</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#475569] mb-1.5">
                    Mențiuni pt. Bucătărie (opțional)
                  </label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: fără zahăr, tacâmuri pt. 2 persoane..."
                    className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-sm text-[#0d2c5c] focus:border-[#c69a3f] focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer sticky chiar în josul modalului din dreapta */}
        <div className="sticky bottom-0 z-20 pt-4 pb-2 bg-white border-t border-[#e2e8f0] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCartViewOpen(false)}
            className="rounded-full border border-[#cbd5e1] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0d2c5c] hover:border-[#0d2c5c] cursor-pointer"
          >
            Continuă Răsfoirea
          </button>

          <button
            type="button"
            disabled={submitting || cartLines.length === 0 || !selectedRoomObj}
            onClick={handlePlaceOrder}
            className="inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-6 py-2.5 text-xs font-extrabold uppercase tracking-[0.16em] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Se trimite comanda..."
              : `Trimite Comanda la Cameră (${lei(totalAmount)})`}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  /* ── VEDERE MENIU ÎN MODALUL DIN DREAPTA ── */
  return (
    <div className="relative pb-6">
      {vipBenefit && vipBenefit.discount_percent > 0 && (
        <div className="mb-4 rounded-2xl border border-[#c69a3f]/40 bg-[#fdf8ec] px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#e6b85c]">
              <Crown size={15} />
            </span>
            <div className="text-xs leading-snug">
              <span className="font-bold text-[#0d2c5c]">
                Statut VIP {vipBenefit.tier} activ:
              </span>{" "}
              <span className="text-[#7c5817] font-medium">
                ai automat -{vipBenefit.discount_percent}% reducere la fiecare comandă.
              </span>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#0d2c5c] text-[#e6b85c] px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider">
            -{vipBenefit.discount_percent}% VIP
          </span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
        {withItems.map((c) => {
          const on = c.id === current?.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                on
                  ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
                  : "bg-white text-[#334155] border-[#cbd5e1] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
              }`}
            >
              {c.name}
              <span className={`ml-2 ${on ? "text-[#e6b85c]" : "text-[#64748b]"}`}>
                {c.items?.length}
              </span>
            </button>
          );
        })}
      </div>

      {current?.description && (
        <p className="mt-4 text-[14.5px] leading-relaxed text-[#334155]">{current.description}</p>
      )}

      {/* Listă Fine Dining fără carduri — cu text clar și lizibil pentru ingrediente */}
      <ul className="mt-6 divide-y divide-[#0d2c5c]/12 border-t border-[#0d2c5c]/12">
        {current?.items?.map((it) => {
          const inCartQty = cart[String(it.id)]?.qty || 0;
          return (
            <li
              key={it.id}
              className={`group flex items-start gap-4 sm:gap-5 py-5 transition-opacity ${
                it.is_available ? "" : "opacity-55"
              }`}
            >
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-[20px_32px_20px_32px] bg-[#f8fafc] shadow-sm">
                {it.image_url ? (
                  <img
                    src={it.image_url}
                    alt={it.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <UtensilsCrossed className="absolute inset-0 m-auto text-[#94a3b8]" size={22} />
                )}
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h4 className="font-['Cormorant_Garamond',serif] text-[22px] sm:text-[24px] font-bold leading-snug text-[#0d2c5c]">
                      {it.title}
                    </h4>
                    <span
                      aria-hidden="true"
                      className="flex-1 border-b border-dotted border-[#c69a3f]/60 mx-2 min-w-[20px]"
                    />
                    <span className="shrink-0 font-['Cormorant_Garamond',serif] text-[22px] sm:text-[24px] font-bold text-[#0d2c5c]">
                      {lei(it.price)}
                    </span>
                  </div>
                  {it.description && (
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#334155]">
                      {it.description}
                    </p>
                  )}
                  {it.ingredients && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#1e293b]">
                      <span className="font-bold text-[#0d2c5c]">
                        Ingrediente:
                      </span>{" "}
                      <span className="font-medium text-[#334155]">
                        {it.ingredients}
                      </span>
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {it.volume_or_weight && (
                      <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-bold text-[#0d2c5c]">
                        {it.volume_or_weight}
                      </span>
                    )}
                    {it.is_available ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Disponibil
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-rose-700">
                        Indisponibil
                      </span>
                    )}
                  </div>

                  {it.is_available && (
                    <div>
                      {inCartQty === 0 ? (
                        <button
                          type="button"
                          onClick={() => addItem(it)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors cursor-pointer"
                        >
                          <Plus size={13} /> Adaugă în coș
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2.5 rounded-full bg-[#fdf8ec] px-3 py-1 border border-[#c69a3f]/60">
                          <button
                            type="button"
                            onClick={() => decItem(it.id)}
                            className="p-0.5 text-[#0d2c5c] hover:text-rose-700 cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs font-extrabold text-[#0d2c5c] min-w-[16px] text-center">
                            {inCartQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => addItem(it)}
                            className="p-0.5 text-[#0d2c5c] hover:text-emerald-700 cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Bară Coș Room Service poziționată direct în partea de jos a modalului din dreapta */}
      {totalCount > 0 && (
        <div className="sticky bottom-3 z-30 mt-6 pt-2">
          <div className="rounded-full bg-[#0d2c5c] text-white p-3 pl-5 shadow-[0_18px_40px_rgba(7,23,46,0.35)] border border-[#c69a3f]/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#c69a3f] text-[#0d2c5c]">
                <ShoppingBag size={18} />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-[#0d2c5c] text-[11px] font-extrabold flex items-center justify-center shadow">
                  {totalCount}
                </span>
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#e6b85c] flex items-center gap-1.5">
                  <span>Coș Room Service</span>
                  {vipBenefit && vipDiscountPercent > 0 && (
                    <span className="rounded-full bg-[#e6b85c]/20 px-2 py-0.5 text-[9.5px] text-[#e6b85c]">
                      VIP {vipBenefit.tier} -{vipDiscountPercent}% aplicat
                    </span>
                  )}
                </div>
                <div className="text-base font-bold leading-tight flex items-baseline gap-2">
                  <span>{lei(totalAmount)}</span>
                  {vipDiscountAmount > 0 && (
                    <span className="text-xs font-normal text-white/60 line-through">
                      {lei(subtotalAmount)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCartViewOpen(true)}
              className="rounded-full bg-[#c69a3f] hover:bg-[#e6b85c] text-[#0d2c5c] px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] transition cursor-pointer flex items-center gap-1.5"
            >
              Vezi Coșul & Comandă
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
