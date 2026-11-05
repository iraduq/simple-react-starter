import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingBag,
  BedDouble,
  Trash2,
  X,
  Lock,
  CalendarX,
  ArrowRight,
  Check,
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
  const [modalOpen, setModalOpen] = useState(false);

  // Active stay rooms fetched from backend
  const [checkingRooms, setCheckingRooms] = useState(false);
  const [activeRooms, setActiveRooms] = useState<ActiveStayRoom[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [eligibilityMsg, setEligibilityMsg] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"room_charge" | "card" | "cash">("room_charge");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    if (!hasSession()) {
      setActiveRooms([]);
      setEligibilityMsg("Autentifică-te în contul tău pentru a verifica rezervarea activă de astăzi.");
      return;
    }
    setCheckingRooms(true);
    apiFetch<{
      eligible: boolean;
      active_rooms: ActiveStayRoom[];
      message?: string | null;
    }>("/orders/active-stay-rooms")
      .then((res) => {
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
  }, [modalOpen]);

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
  const totalAmount = cartLines.reduce((acc, l) => acc + l.price * l.qty, 0);

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
      setModalOpen(false);
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
      <div className="py-12 text-center border-t border-[#0d2c5c]/10">
        <UtensilsCrossed className="mx-auto mb-3 text-[#c69a3f]" size={24} strokeWidth={1.4} />
        <p className="text-[15px] font-semibold text-[#0d2c5c]">Meniul nu este disponibil încă</p>
        <p className="mt-1 text-[13px] text-[#64748b]">Revino curând pentru oferta acestei locații.</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Categorii cu linie fină subliniată (fără butoane tip card/pastilă) */}
      <div className="flex gap-7 overflow-x-auto border-b border-[#0d2c5c]/12">
        {withItems.map((c) => {
          const on = c.id === current?.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`shrink-0 pb-3.5 text-[12px] font-bold uppercase tracking-[0.18em] transition-colors relative cursor-pointer ${
                on ? "text-[#0d2c5c]" : "text-[#64748b] hover:text-[#0d2c5c]"
              }`}
            >
              {c.name}
              <span className="ml-1.5 text-[10.5px] font-normal text-[#c69a3f]">
                ({c.items?.length})
              </span>
              {on && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c69a3f]" />
              )}
            </button>
          );
        })}
      </div>

      {current?.description && (
        <p className="mt-4 font-['Cormorant_Garamond',serif] italic text-[18px] text-[#475569]">
          {current.description}
        </p>
      )}

      {/* Listă clasică de meniu Fine Dining (fără carduri, doar linii fine de separare și puncte către preț) */}
      <ul className="mt-4 divide-y divide-[#0d2c5c]/10">
        {current?.items?.map((it) => {
          const inCartQty = cart[String(it.id)]?.qty || 0;
          return (
            <li
              key={it.id}
              className={`py-5 flex items-start gap-4 transition-opacity ${
                it.is_available ? "" : "opacity-50"
              }`}
            >
              {it.image_url && (
                <img
                  src={it.image_url}
                  alt={it.title}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-full object-cover mt-0.5"
                />
              )}

              <div className="min-w-0 flex-1">
                {/* Rând Titlu + Linie punctată + Preț + Acțiune */}
                <div className="flex items-baseline gap-2">
                  <h4 className="font-['Cormorant_Garamond',serif] text-[21px] sm:text-[23px] font-semibold leading-snug text-[#0d2c5c]">
                    {it.title}
                  </h4>
                  {it.volume_or_weight && (
                    <span className="text-[11.5px] text-[#94a3b8] shrink-0">
                      · {it.volume_or_weight}
                    </span>
                  )}

                  <span
                    aria-hidden="true"
                    className="flex-1 border-b border-dotted border-[#0d2c5c]/25 mx-2 min-w-[24px]"
                  />

                  <span className="shrink-0 font-['Cormorant_Garamond',serif] text-[21px] sm:text-[23px] font-bold text-[#0d2c5c]">
                    {lei(it.price)}
                  </span>
                </div>

                {/* Descriere + Ingrediente + Control Comandă pe același flux curat */}
                <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 pr-4">
                    {it.description && (
                      <p className="text-[13.5px] leading-relaxed text-[#475569]">
                        {it.description}
                      </p>
                    )}
                    {it.ingredients && (
                      <p className="font-['Cormorant_Garamond',serif] italic text-[15px] text-[#64748b]">
                        Ingrediente: {it.ingredients}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-3 self-end sm:self-center">
                    {!it.is_available ? (
                      <span className="text-[11px] font-bold uppercase tracking-widest text-rose-700">
                        Indisponibil
                      </span>
                    ) : inCartQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => addItem(it)}
                        className="inline-flex items-center gap-1.5 border-b border-[#0d2c5c] pb-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] hover:text-[#c69a3f] hover:border-[#c69a3f] transition-colors cursor-pointer"
                      >
                        <Plus size={13} /> Comandă
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-3 border-b-2 border-[#c69a3f] pb-0.5">
                        <button
                          type="button"
                          onClick={() => decItem(it.id)}
                          className="text-[#0d2c5c] hover:text-rose-700 cursor-pointer"
                          aria-label="Scade cantitatea"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-xs font-extrabold text-[#0d2c5c] min-w-[16px] text-center">
                          {inCartQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => addItem(it)}
                          className="text-[#0d2c5c] hover:text-emerald-700 cursor-pointer"
                          aria-label="Crește cantitatea"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Bară flotantă minimalistă pentru coș */}
      {totalCount > 0 &&
        createPortal(
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[800] w-[92%] max-w-lg">
            <div className="bg-[#0d2c5c] text-white px-6 py-3.5 shadow-[0_20px_50px_rgba(7,23,46,0.35)] border-t-2 border-[#c69a3f] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-[#c69a3f]" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-[#e6b85c]">{totalCount} produse</span>
                  <span className="mx-2 text-white/30">|</span>
                  <span className="font-['Cormorant_Garamond',serif] text-xl font-bold">
                    {lei(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e6b85c] hover:text-white transition cursor-pointer"
              >
                Vezi Coșul & Trimite
                <ArrowRight size={14} />
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal Coș & Livrare în Cameră — FĂRĂ CARDURI, design editorial curat */}
      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#07203f]/65 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setModalOpen(false)} aria-hidden="true" />
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-xl max-h-[calc(100vh-3rem)] flex flex-col bg-white shadow-[0_30px_80px_rgba(7,32,63,0.35)] border-t-4 border-[#c69a3f]"
            >
              {/* Antet simplu și elegant */}
              <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-4 border-b border-[#0d2c5c]/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c69a3f] block">
                    Room Service · Vila Casa Esy
                  </span>
                  <h3 className="mt-1 font-['Cormorant_Garamond',serif] text-[28px] sm:text-[32px] font-normal leading-tight text-[#0d2c5c]">
                    Nota ta de comandă
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-[#64748b] hover:text-[#0d2c5c] transition-colors cursor-pointer"
                  aria-label="Închide"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Conținut aerisit fără cutii/carduri */}
              <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-8 text-[#0d2c5c]">
                {/* 1. Lista produselor din coș */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#0d2c5c]/15">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                      Preparate selectate ({totalCount})
                    </span>
                    {cartLines.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCart({})}
                        className="text-[11px] font-semibold text-rose-700 hover:underline cursor-pointer"
                      >
                        Golește lista
                      </button>
                    )}
                  </div>

                  {cartLines.length === 0 ? (
                    <p className="py-6 text-sm text-[#64748b]">
                      Nu ai niciun preparat în coș.
                    </p>
                  ) : (
                    <>
                      <div className="divide-y divide-[#0d2c5c]/10">
                        {cartLines.map((line) => (
                          <div
                            key={line.id}
                            className="py-3.5 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-['Cormorant_Garamond',serif] text-[19px] font-semibold text-[#0d2c5c] truncate">
                                {line.title}
                              </div>
                              <div className="text-xs text-[#64748b]">
                                {lei(line.price)} / porție
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="inline-flex items-center gap-2.5 border-b border-[#0d2c5c]/30 pb-0.5">
                                <button
                                  type="button"
                                  onClick={() => decItem(line.id)}
                                  className="text-[#0d2c5c] hover:text-rose-600 cursor-pointer"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-bold text-[#0d2c5c] min-w-[14px] text-center">
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

                              <span className="font-['Cormorant_Garamond',serif] text-[19px] font-bold text-[#0d2c5c] w-20 text-right">
                                {lei(line.price * line.qty)}
                              </span>

                              <button
                                type="button"
                                onClick={() => removeItem(line.id)}
                                className="text-[#94a3b8] hover:text-rose-600 cursor-pointer"
                                title="Elimină"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-[#0d2c5c]/20 flex items-baseline justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                          Total Comandă
                        </span>
                        <span className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#0d2c5c]">
                          {lei(totalAmount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Camera activă și detalii livrare */}
                <div>
                  <div className="pb-2 border-b border-[#0d2c5c]/15 mb-4">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#64748b]">
                      Livrare în camera ta activă
                    </span>
                  </div>

                  {!hasSession() ? (
                    <div className="py-4 space-y-3">
                      <div className="flex items-center gap-2 text-[#0d2c5c] font-semibold text-sm">
                        <Lock size={16} className="text-[#c69a3f]" />
                        Autentificare necesară pentru Room Service
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        Comenzile în cameră sunt disponibile exclusiv oaspeților cazați în prezent la Vila Casa Esy.
                      </p>
                      <Link
                        to="/login"
                        onClick={() => setModalOpen(false)}
                        className="inline-flex items-center gap-2 border-b border-[#0d2c5c] pb-0.5 text-xs font-bold uppercase tracking-widest text-[#0d2c5c] no-underline hover:text-[#c69a3f] hover:border-[#c69a3f]"
                      >
                        Autentifică-te în cont <ArrowRight size={13} />
                      </Link>
                    </div>
                  ) : checkingRooms ? (
                    <p className="py-4 text-xs text-[#64748b]">
                      Se verifică rezervarea ta activă de astăzi...
                    </p>
                  ) : activeRooms.length === 0 ? (
                    <div className="py-4 space-y-3">
                      <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                        <CalendarX size={16} />
                        Nicio cameră cu sejur activ astăzi
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">
                        {eligibilityMsg}
                      </p>
                      <Link
                        to="/rezervarile-mele"
                        onClick={() => setModalOpen(false)}
                        className="inline-flex items-center gap-2 border-b border-[#0d2c5c] pb-0.5 text-xs font-bold uppercase tracking-wider text-[#0d2c5c] no-underline"
                      >
                        Vezi Rezervările Mele <ArrowRight size={13} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Selecție cameră activă prin rânduri simple cu linie jos */}
                      <div className="divide-y divide-[#0d2c5c]/10 border-b border-[#0d2c5c]/10">
                        {activeRooms.map((r) => {
                          const isSelected = r.booking_id === (selectedRoomObj?.booking_id ?? "");
                          return (
                            <button
                              key={r.booking_id}
                              type="button"
                              onClick={() => setSelectedBookingId(r.booking_id)}
                              className="w-full py-3 text-left flex items-center justify-between gap-3 cursor-pointer group"
                            >
                              <div className="flex items-center gap-3">
                                <BedDouble
                                  size={18}
                                  className={isSelected ? "text-[#c69a3f]" : "text-[#94a3b8]"}
                                />
                                <div>
                                  <div className="font-semibold text-sm text-[#0d2c5c]">
                                    {r.location_label}
                                  </div>
                                  <div className="text-xs text-[#64748b]">
                                    Sejur activ astăzi · #{r.booking_code}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${
                                  isSelected ? "text-[#0d2c5c]" : "text-[#94a3b8]"
                                }`}
                              >
                                {isSelected && <Check size={14} className="text-[#c69a3f]" />}
                                {isSelected ? "Selectată" : "Alege"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Câmpuri cu linie simplă jos (underline inputs, fără casete) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#64748b] mb-1.5">
                            Modalitate de Plată
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="w-full border-0 border-b border-[#0d2c5c]/25 bg-transparent py-2 text-sm font-semibold text-[#0d2c5c] focus:border-[#c69a3f] outline-none"
                          >
                            <option value="room_charge">Trecut pe Contul Camerei</option>
                            <option value="card">Card la Livrare în Cameră (POS)</option>
                            <option value="cash">Numerar la Livrare în Cameră</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#64748b] mb-1.5">
                            Mențiuni pt. Bucătărie (opțional)
                          </label>
                          <input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ex: fără gheață, tacâmuri pt. 2..."
                            className="w-full border-0 border-b border-[#0d2c5c]/25 bg-transparent py-2 text-sm text-[#0d2c5c] placeholder:text-[#94a3b8] focus:border-[#c69a3f] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subsol acțiune */}
              <div className="flex items-center justify-between gap-4 border-t border-[#0d2c5c]/10 px-6 sm:px-8 py-4 bg-white">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-xs font-bold uppercase tracking-widest text-[#64748b] hover:text-[#0d2c5c] cursor-pointer"
                >
                  Înapoi la meniu
                </button>

                <button
                  type="button"
                  disabled={submitting || cartLines.length === 0 || !selectedRoomObj}
                  onClick={handlePlaceOrder}
                  className="inline-flex items-center gap-2 bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Se trimite..."
                    : `Trimite Comanda (${lei(totalAmount)})`}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
