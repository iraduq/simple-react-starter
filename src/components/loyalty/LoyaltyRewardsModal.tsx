import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Sparkles,
  TicketPercent,
  UtensilsCrossed,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Calendar,
  Crown,
  Wine,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";

export interface LoyaltyRewardItem {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  min_tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  reward_type: string;
  discount_percent?: number | null;
  icon: string;
  can_redeem: boolean;
  user_has_tier: boolean;
}

export interface LoyaltyPlaceMenuItem {
  id: string;
  title: string;
  description: string;
  price_ron: number;
  points_cost: number;
  volume_or_weight?: string | null;
  image_url?: string | null;
  category_name: string;
  place_id: number;
  place_title: string;
  place_category: string;
  can_order: boolean;
}

export interface LoyaltyBookingOption {
  id: string;
  booking_code?: string;
  check_in: string;
  check_out: string;
  status: string;
  room_title?: string;
}

interface LoyaltyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: string;
  userPoints: number;
  rewards: LoyaltyRewardItem[];
  bookings?: LoyaltyBookingOption[];
  onRedeemed: () => void;
}

const ICON_MAP: Record<string, any> = {
  TicketPercent,
  Sparkles,
  UtensilsCrossed,
  Award,
  Crown,
};

export default function LoyaltyRewardsModal({
  isOpen,
  onClose,
  userTier,
  userPoints,
  rewards,
  bookings = [],
  onRedeemed,
}: LoyaltyRewardsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"places" | "vouchers">("places");
  const [placeCategory, setPlaceCategory] = useState<string>("toate");
  const [placeItems, setPlaceItems] = useState<LoyaltyPlaceMenuItem[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [selectedBookingCode, setSelectedBookingCode] = useState<string>("");
  const [issuedCoupon, setIssuedCoupon] = useState<{ code: string; title: string } | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{
    order_code: string;
    item_title: string;
    location_label: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const eligibleBookings = bookings.filter(
    (b) => b.booking_code && b.status !== "cancelled" && b.status !== "completed"
  );

  useEffect(() => {
    if (!isOpen) {
      setIssuedCoupon(null);
      setPlacedOrder(null);
      setCopiedCode(false);
      return;
    }
    if (eligibleBookings.length > 0 && !selectedBookingCode) {
      setSelectedBookingCode(eligibleBookings[0].booking_code || "");
    }
    let active = true;
    setLoadingPlaces(true);
    apiFetch<LoyaltyPlaceMenuItem[]>("/loyalty/place-items")
      .then((items) => {
        if (active && Array.isArray(items)) setPlaceItems(items);
      })
      .catch(() => {
        if (active) setPlaceItems([]);
      })
      .finally(() => {
        if (active) setLoadingPlaces(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, eligibleBookings.length]);

  const filteredPlaceItems = useMemo(() => {
    if (placeCategory === "toate") return placeItems;
    return placeItems.filter((it) => it.place_category.toLowerCase() === placeCategory);
  }, [placeItems, placeCategory]);

  if (!isOpen) return null;

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      toast(`Codul ${code} a fost copiat!`, "success");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast(`Cod voucher: ${code}`, "info");
    }
  };

  const handleRedeem = async (reward: LoyaltyRewardItem) => {
    if (!reward.can_redeem) {
      if (!reward.user_has_tier) {
        toast(`Acest beneficiu necesită statutul ${reward.min_tier}.`, "warning");
      } else {
        toast(`Puncte insuficiente. Aveți ${userPoints} pct, sunt necesare ${reward.points_cost} pct.`, "warning");
      }
      return;
    }

    setRedeemingId(reward.id);
    try {
      const payload: { reward_id: string; booking_code?: string } = { reward_id: reward.id };
      if (reward.reward_type !== "discount" && selectedBookingCode) {
        payload.booking_code = selectedBookingCode;
      }

      const res = await apiFetch<any>("/loyalty/redeem", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res?.coupon_code) {
        setIssuedCoupon({ code: res.coupon_code, title: reward.title });
      }
      toast(res?.message || "Recompensă revendicată cu succes!", "success");
      onRedeemed();
    } catch (err: any) {
      toast(err?.message || "Nu s-a putut revendica recompensa.", "error");
    } finally {
      setRedeemingId(null);
    }
  };

  const handleOrderPlaceItem = async (item: LoyaltyPlaceMenuItem) => {
    if (userPoints < item.points_cost) {
      toast(`Puncte insuficiente. Aveți ${userPoints} pct, sunt necesare ${item.points_cost} pct.`, "warning");
      return;
    }

    setOrderingId(item.id);
    try {
      const res = await apiFetch<any>("/loyalty/order-place-item", {
        method: "POST",
        body: JSON.stringify({
          menu_item_id: item.id,
          booking_code: selectedBookingCode || undefined,
        }),
      });
      setPlacedOrder({
        order_code: res.order_code,
        item_title: res.item_title || item.title,
        location_label: res.location_label || "Camera ta",
      });
      toast(res?.message || "Comanda gratuită a fost trimisă în cameră!", "success");
      onRedeemed();
    } catch (err: any) {
      toast(err?.message || "Comanda nu a putut fi plasată.", "error");
    } finally {
      setOrderingId(null);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#07203f]/55 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-3xl max-h-[calc(100vh-3rem)] flex flex-col rounded-[28px] bg-white shadow-[0_30px_80px_rgba(7,32,63,0.35)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header stil Casa Esy cu val organic & cercuri decorative */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0d2c5c] via-[#123a72] to-[#07203f] px-6 sm:px-7 pt-5 pb-9">
          <svg
            viewBox="0 0 120 120"
            fill="none"
            className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 text-white/10"
          >
            <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 5" />
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="0.6" />
          </svg>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e6b85c]">
                Vila Casa Esy · VIP Privilege Club
              </span>
              <h2
                className="mt-1 text-[22px] sm:text-[26px] font-bold leading-tight !text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Catalog Recompense & Comenzi în Cameră
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
              aria-label="Închide"
            >
              ✕
            </button>
          </div>
          <svg
            viewBox="0 0 400 24"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 h-6 w-full text-white"
          >
            <path d="M0 24 V12 Q50 0 100 12 T200 12 T300 12 T400 12 V24 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Status bar sub val */}
        <div className="px-6 sm:px-7 pt-1.5 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f7] shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#6b7c99] font-medium">
            <span>
              Statut: <strong className="text-[#0d2c5c]">{userTier}</strong>
            </span>
            <span>•</span>
            <span>
              Sold disponibil: <strong className="text-[#9c7624] font-bold">{userPoints} Puncte</strong>
            </span>
          </div>

          <div className="flex p-1 bg-[#f8fafd] border border-[#dce4ef] rounded-full text-[11.5px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("places")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "places"
                  ? "bg-[#0d2c5c] text-white shadow-xs"
                  : "text-[#6b7c99] hover:text-[#0d2c5c]"
              }`}
            >
              <ShoppingBag size={12} />
              <span>Comandă în cameră (/places)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("vouchers")}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "vouchers"
                  ? "bg-[#0d2c5c] text-white shadow-xs"
                  : "text-[#6b7c99] hover:text-[#0d2c5c]"
              }`}
            >
              <TicketPercent size={12} />
              <span>Vouchere reducere</span>
            </button>
          </div>
        </div>

        {/* Conținut scrollabil */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-5 space-y-4">
          {placedOrder && (
            <div className="rounded-2xl border border-[#c69a3f]/40 bg-[#fdf8ec] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#9c7624]">
                  Comandă gratuită trimisă în cameră
                </p>
                <p className="text-sm font-bold text-[#0d2c5c] mt-0.5">
                  {placedOrder.item_title} → {placedOrder.location_label}
                </p>
                <p className="text-xs text-[#6b7c99] mt-0.5">
                  Cod comandă: <span className="font-mono font-bold text-[#0d2c5c]">#{placedOrder.order_code}</span> · 0 RON (achitat cu puncte)
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 size={14} /> Trimis la preparare
              </span>
            </div>
          )}

          {issuedCoupon && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Voucher VIP activ (valabil 90 zile)
                </p>
                <p className="text-sm font-bold text-[#0d2c5c] mt-0.5">{issuedCoupon.title}</p>
                <p className="text-xs text-[#6b7c99] mt-0.5">
                  Aplică acest cod la rezervare sau la restaurant pentru reducere.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyCode(issuedCoupon.code)}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d2c5c] text-white text-xs font-mono font-bold hover:bg-[#133b7a] transition cursor-pointer"
              >
                <span>{issuedCoupon.code}</span>
                {copiedCode ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {activeTab === "places" ? (
            <>
              {/* Selector cameră / rezervare + filtru categorie */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#f8fafd] border border-[#dce4ef] p-3.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "toate", label: "Toate", icon: Sparkles },
                    { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
                    { id: "bar", label: "Bar & Lounge", icon: Wine },
                    { id: "spa", label: "SPA", icon: Award },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPlaceCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          placeCategory === cat.id
                            ? "bg-[#0d2c5c] text-white"
                            : "bg-white border border-[#dce4ef] text-[#6b7c99] hover:text-[#0d2c5c]"
                        }`}
                      >
                        <Icon size={12} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {eligibleBookings.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#c69a3f] shrink-0" />
                    <select
                      value={selectedBookingCode}
                      onChange={(e) => setSelectedBookingCode(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#dce4ef] text-xs font-semibold text-[#0d2c5c] outline-none focus:border-[#0d2c5c]"
                    >
                      {eligibleBookings.map((b) => (
                        <option key={b.id} value={b.booking_code}>
                          #{b.booking_code} · {b.room_title || "Cameră"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {loadingPlaces ? (
                <div className="py-12 text-center text-xs font-semibold text-[#6b7c99] flex items-center justify-center gap-2">
                  <RefreshCw size={15} className="animate-spin text-[#c69a3f]" />
                  <span>Se încarcă produsele disponibile din Restaurant, Bar & SPA...</span>
                </div>
              ) : filteredPlaceItems.length === 0 ? (
                <div className="py-10 text-center rounded-2xl border border-dashed border-[#dce4ef] bg-[#f8fafd] text-xs text-[#6b7c99]">
                  Nu există produse disponibile momentan în această categorie.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredPlaceItems.map((item) => {
                    const affordable = userPoints >= item.points_cost;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                          affordable
                            ? "bg-white border-[#dce4ef] hover:border-[#c69a3f] shadow-xs"
                            : "bg-[#f8fafd] border-[#dce4ef] opacity-75"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fdf8ec] text-[#9c7624] border border-[#c69a3f]/35">
                              {item.place_title}
                            </span>
                            <div className="text-right">
                              <span className="text-base font-extrabold text-[#0d2c5c]">
                                {item.points_cost}
                              </span>
                              <span className="text-[10px] text-[#6b7c99] block -mt-1">pct (0 RON)</span>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-[#0d2c5c] leading-snug">
                            {item.title}
                          </h4>
                          {item.volume_or_weight ? (
                            <p className="text-[11px] font-semibold text-[#9c7624] mt-0.5">
                              {item.volume_or_weight} · Valoare {item.price_ron} RON
                            </p>
                          ) : (
                            <p className="text-[11px] font-semibold text-[#9c7624] mt-0.5">
                              Valoare {item.price_ron} RON · Gratuit în cameră
                            </p>
                          )}
                          {item.description ? (
                            <p className="text-xs text-[#6b7c99] mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#eef2f7] flex items-center justify-between gap-2">
                          {affordable ? (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 size={13} /> Disponibil cu puncte
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#6b7c99] flex items-center gap-1">
                              <Lock size={12} /> Lipsesc {item.points_cost - userPoints} pct
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={!affordable || orderingId === item.id}
                            onClick={() => void handleOrderPlaceItem(item)}
                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              affordable
                                ? "bg-[#0d2c5c] hover:bg-[#133b7a] text-white shadow-xs"
                                : "bg-slate-200 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            {orderingId === item.id ? "Se trimite..." : "Comandă în cameră"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((r) => {
                const Icon = ICON_MAP[r.icon] || Award;
                const isLocked = !r.user_has_tier;

                return (
                  <div
                    key={r.id}
                    className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all ${
                      r.can_redeem
                        ? "bg-white border-[#c69a3f]/50 shadow-xs hover:border-[#c69a3f] hover:shadow-md"
                        : "bg-[#f8fafd] border-[#dce4ef] opacity-75"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`p-2 rounded-xl ${
                              r.can_redeem
                                ? "bg-[#0d2c5c] text-[#e6b85c]"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            <Icon size={18} />
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fdf8ec] text-[#9c7624] border border-[#c69a3f]/35">
                            Minim {r.min_tier}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-extrabold text-[#0d2c5c]">
                            {r.points_cost}
                          </span>
                          <span className="text-[10.5px] text-[#6b7c99] block">pct</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#0d2c5c] leading-tight mb-1">
                        {r.title}
                      </h4>
                      <p className="text-xs text-[#6b7c99] leading-relaxed">{r.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#eef2f7] flex items-center justify-between">
                      {r.can_redeem ? (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Puncte suficiente
                        </span>
                      ) : isLocked ? (
                        <span className="text-[11px] font-semibold text-[#6b7c99] flex items-center gap-1">
                          <Lock size={12} /> Necesită {r.min_tier}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#9c7624]">
                          Lipsesc {r.points_cost - userPoints} pct
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={!r.can_redeem || redeemingId === r.id}
                        onClick={() => void handleRedeem(r)}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          r.can_redeem
                            ? "bg-[#0d2c5c] hover:bg-[#133b7a] text-white shadow-xs"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {redeemingId === r.id ? "Se procesează..." : "Revendică"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer în stilul Casa Esy */}
        <div className="flex items-center justify-between gap-2.5 border-t border-[#eef2f7] bg-[#f8fafd] px-6 sm:px-7 py-3.5 shrink-0">
          <span className="text-[11.5px] text-[#6b7c99] font-medium">
            10 Puncte = 1 RON din meniul Restaurant, Bar & SPA
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#dce4ef] bg-white px-5 py-2 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
          >
            Închide
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
