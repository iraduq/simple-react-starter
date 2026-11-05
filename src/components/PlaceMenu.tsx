import { useState } from "react";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingBag,
  BedDouble,
  Umbrella,
  Wine,
  CheckCircle2,
  X,
} from "lucide-react";
import type { MenuCategory } from "../types/places";
import { lei } from "../services/placesService";
import { apiFetch, getCachedUser } from "../lib/auth";
import { useToast } from "./Toast";

interface CartLine {
  id: string;
  title: string;
  price: number;
  qty: number;
}

export default function PlaceMenu({ categories }: { categories: MenuCategory[] }) {
  const { toast } = useToast();
  const user = getCachedUser();
  const defaultName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "";

  const withItems = categories.filter((c) => (c.items?.length ?? 0) > 0);
  const [active, setActive] = useState<number | null>(null);
  const current = withItems.find((c) => c.id === active) ?? withItems[0];

  // Coș Comenzi Room Service & Șezlong
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locType, setLocType] = useState<"room" | "beach" | "restaurant">("room");
  const [locLabel, setLocLabel] = useState("Camera 102");
  const [guestName, setGuestName] = useState(defaultName);
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [bookingCode, setBookingCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"room_charge" | "card" | "cash">("room_charge");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);

  const addItem = (it: { id: number | string; title: string; price: number | string }) => {
    const k = String(it.id);
    setCart((prev) => {
      const existing = prev[k];
      return {
        ...prev,
        [k]: {
          id: k,
          title: it.title,
          price: Number(it.price || 0),
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

  const cartLines = Object.values(cart);
  const totalCount = cartLines.reduce((acc, l) => acc + l.qty, 0);
  const totalAmount = cartLines.reduce((acc, l) => acc + l.price * l.qty, 0);

  const handlePlaceOrder = async () => {
    if (!cartLines.length) return;
    if (!locLabel.trim()) {
      toast("Indică numărul camerei sau al șezlongului.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch<{ order_code: string }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          location_type: locType,
          location_label: locLabel.trim(),
          booking_code: bookingCode.trim() || undefined,
          guest_name: guestName.trim() || "Oaspete Casa Esy",
          guest_phone: guestPhone.trim() || undefined,
          payment_method: paymentMethod,
          notes: notes.trim() || undefined,
          items: cartLines,
        }),
      });
      setLastOrderCode(res.order_code);
      setCart({});
      setNotes("");
      toast(`Comanda ${res.order_code} a fost trimisă în Bucătărie / Beach Bar!`, "success");
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

  return (
    <div className="pb-20">
      {/* Banner Room Service & Comenzi pe Șezlong */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#0d2c5c] to-[#173e7a] p-4 text-white shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-[#e6b85c]">
            <Umbrella size={20} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#e6b85c]">
              Room Service & Beach Bar Live
            </div>
            <div className="text-sm font-medium text-white/90">
              Comandă direct în cameră sau la șezlongul tău de pe plajă și plătește pe contul camerei!
            </div>
          </div>
        </div>
        {lastOrderCode && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 border border-emerald-300/40 px-3 py-1 text-xs font-bold text-emerald-100">
            <CheckCircle2 size={14} /> Ultima comandă în preparare: {lastOrderCode}
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {withItems.map((c) => {
          const on = c.id === current?.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                on ? "bg-[#0d2c5c] text-white" : "bg-[#eef2f7] text-[#0d2c5c] hover:bg-[#e1e8f0]"
              }`}
            >
              {c.name}
              <span className={`ml-2 ${on ? "text-white/60" : "text-[#6b7c99]"}`}>{c.items?.length}</span>
            </button>
          );
        })}
      </div>

      {current?.description && (
        <p className="mt-4 text-[14px] leading-relaxed text-[#4f6280]">{current.description}</p>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {current?.items?.map((it) => {
          const inCartQty = cart[String(it.id)]?.qty || 0;
          return (
            <li
              key={it.id}
              className={`flex gap-4 rounded-2xl border border-[#e1e8f0] bg-white p-3.5 shadow-2xs transition hover:shadow-md ${
                it.is_available ? "" : "opacity-60"
              }`}
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#eef2f7]">
                {it.image_url ? (
                  <img src={it.image_url} alt={it.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <UtensilsCrossed className="absolute inset-0 m-auto text-[#9aa8bd]" size={22} />
                )}
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[15px] font-semibold leading-snug text-[#0d2c5c]">{it.title}</h4>
                    <span className="shrink-0 text-[15px] font-bold text-[#0d2c5c]">{lei(it.price)}</span>
                  </div>
                  {it.description && (
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[#4f6280]">{it.description}</p>
                  )}
                  {it.ingredients && (
                    <p className="mt-1 text-[11.5px] text-[#6b7c99]">
                      <span className="font-semibold">Ingrediente:</span> {it.ingredients}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {it.volume_or_weight && (
                      <span className="rounded-full bg-[#eef2f7] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0d2c5c]">
                        {it.volume_or_weight}
                      </span>
                    )}
                    {it.is_available ? (
                      <span className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#1f6b45]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1f6b45]" /> În stoc
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#8c2f39] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                        Epuizat
                      </span>
                    )}
                  </div>

                  {it.is_available && (
                    <div>
                      {inCartQty === 0 ? (
                        <button
                          type="button"
                          onClick={() => addItem(it)}
                          className="inline-flex items-center gap-1 rounded-full bg-[#0d2c5c] hover:bg-[#173e7a] px-3 py-1 text-[11px] font-bold text-white transition cursor-pointer"
                        >
                          <Plus size={13} /> Comandă
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2f7] px-2 py-0.5 border border-[#0d2c5c]/20">
                          <button
                            type="button"
                            onClick={() => decItem(it.id)}
                            className="p-1 text-[#0d2c5c] hover:text-rose-700 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-[#0d2c5c]">{inCartQty}</span>
                          <button
                            type="button"
                            onClick={() => addItem(it)}
                            className="p-1 text-[#0d2c5c] hover:text-emerald-700 cursor-pointer"
                          >
                            <Plus size={12} />
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

      {/* Floating Bottom Cart Bar */}
      {totalCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl">
          <div className="rounded-2xl bg-[#0d2c5c] text-white p-4 shadow-2xl border border-white/15 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#c69a3f] text-[#0d2c5c] font-bold">
                <ShoppingBag size={20} />
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-[#0d2c5c] text-[11px] font-extrabold flex items-center justify-center shadow">
                  {totalCount}
                </span>
              </div>
              <div>
                <div className="text-xs text-white/75">Coș Room Service / Șezlong</div>
                <div className="text-base font-bold">{lei(totalAmount)}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-xl bg-[#c69a3f] hover:bg-[#d8ad52] text-[#0d2c5c] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
            >
              Trimite la Cameră / Șezlong →
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white text-[#0d2c5c] shadow-2xl overflow-hidden border border-[#e1e8f0]">
            <div className="bg-[#0d2c5c] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#e6b85c]">
                  Livrare Rapidă Vila Casa Esy
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold">
                  Unde îți aducem comanda?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Location type selector */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "room" as const, label: "În Cameră", def: "Camera 102", icon: BedDouble },
                  { id: "beach" as const, label: "La Șezlong", def: "Șezlong #14", icon: Umbrella },
                  { id: "restaurant" as const, label: "La Masă", def: "Masa #5 Terasă", icon: Wine },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const on = locType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setLocType(opt.id);
                        setLocLabel(opt.def);
                      }}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition cursor-pointer ${
                        on
                          ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow"
                          : "bg-[#f8fafc] text-[#0d2c5c] border-[#e1e8f0] hover:bg-[#eef2f7]"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-xs font-bold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0d2c5c] mb-1">
                    {locType === "room"
                      ? "Numărul Camerei *"
                      : locType === "beach"
                        ? "Număr Șezlong / Baldachin *"
                        : "Număr Masă *"}
                  </label>
                  <input
                    value={locLabel}
                    onChange={(e) => setLocLabel(e.target.value)}
                    className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-sm font-semibold"
                    placeholder="ex: Camera 102 sau Șezlong #14"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d2c5c] mb-1">
                    Cod Rezervare #BK (opțional)
                  </label>
                  <input
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-sm font-mono"
                    placeholder="ex: BK-88412"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Numele Tău</label>
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-sm"
                    placeholder="ex: Alexandru Ionescu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d2c5c] mb-1">Metodă de Plată</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-[#cbd5e1] px-3 py-2 text-sm font-semibold bg-white"
                  >
                    <option value="room_charge">Trecut pe Contul Camerei</option>
                    <option value="card">Card la Livrare (POS Mobil)</option>
                    <option value="cash">Numerar la Livrare</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d2c5c] mb-1">
                  Preferințe speciale (gheață, fără zahăr, oră livrare)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-sm"
                  placeholder="ex: Gheață separată, lapte de ovăz..."
                />
              </div>

              {/* Order summary */}
              <div className="rounded-2xl bg-[#f8fafc] border border-[#e1e8f0] p-3.5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#6b7c99]">
                  Produse în Comandă
                </div>
                {cartLines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0d2c5c]">
                      {l.qty}x {l.title}
                    </span>
                    <span className="font-bold">{lei(l.price * l.qty)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#e1e8f0] flex items-center justify-between text-sm font-extrabold text-[#0d2c5c]">
                  <span>Total de plată</span>
                  <span>{lei(totalAmount)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handlePlaceOrder}
                className="w-full rounded-xl bg-[#0d2c5c] hover:bg-[#173e7a] text-white py-3 text-xs font-extrabold uppercase tracking-widest transition cursor-pointer"
              >
                {submitting ? "Se trimite în Bucătărie / Bar..." : `Confirmă Comanda (${lei(totalAmount)})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
