import { useState, useEffect } from "react";
import {
  X,
  Award,
  Sparkles,
  TicketPercent,
  Clock,
  Wine,
  Coffee,
  Sun,
  UtensilsCrossed,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Calendar,
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
  Clock,
  Wine,
  Coffee,
  Sun,
  Sparkles,
  UtensilsCrossed,
  Award,
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
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [selectedBookingCode, setSelectedBookingCode] = useState<string>("");
  const [issuedCoupon, setIssuedCoupon] = useState<{ code: string; title: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const eligibleBookings = bookings.filter(
    (b) => b.booking_code && b.status !== "cancelled" && b.status !== "completed"
  );

  useEffect(() => {
    if (!isOpen) {
      setIssuedCoupon(null);
      setCopiedCode(false);
    } else if (eligibleBookings.length > 0 && !selectedBookingCode) {
      setSelectedBookingCode(eligibleBookings[0].booking_code || "");
    }
  }, [isOpen, eligibleBookings.length]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#0d2c5c] via-[#0f3469] to-[#c69a3f] text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e6b85c]">
            <Award size={14} />
            <span>Casa Esy VIP Rewards Club</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] mt-1 text-white">
            Catalog Recompense & Beneficii Exclusive
          </h2>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-white/80">
            <span>Statutul Tău: <strong className="text-[#e6b85c]">{userTier}</strong></span>
            <span>•</span>
            <span>Sold Disponibil: <strong className="text-white font-bold">{userPoints} Puncte</strong></span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {issuedCoupon && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Voucher VIP Emis & Activ (Valabil 90 zile)
                </p>
                <p className="text-sm font-bold text-[#0d2c5c] mt-0.5">{issuedCoupon.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Aplică acest cod în pagina de rezervare pentru reducerea instantă.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyCode(issuedCoupon.code)}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d2c5c] text-white text-xs font-mono font-bold hover:bg-[#071d3d] transition cursor-pointer"
              >
                <span>{issuedCoupon.code}</span>
                {copiedCode ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {eligibleBookings.length > 0 && (
            <div className="rounded-2xl bg-[#f8fafc] border border-[#e1e8f0] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0d2c5c]">
                <Calendar size={15} className="text-[#c69a3f] shrink-0" />
                <span>Asociază facilitățile de sejur (Prosecco, Late Check-out etc.) unei rezervări:</span>
              </div>
              <select
                value={selectedBookingCode}
                onChange={(e) => setSelectedBookingCode(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#e1e8f0] text-xs font-semibold text-[#0d2c5c] outline-none focus:border-[#c69a3f]"
              >
                <option value="">Fără asociere imediată (în cont)</option>
                {eligibleBookings.map((b) => (
                  <option key={b.id} value={b.booking_code}>
                    #{b.booking_code} · {b.room_title || "Sejur"} (
                    {new Date(b.check_in).toLocaleDateString("ro-RO", { day: "2-digit", month: "short" })})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((r) => {
              const Icon = ICON_MAP[r.icon] || Award;
              const isLocked = !r.user_has_tier;

              return (
                <div
                  key={r.id}
                  className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all ${
                    r.can_redeem
                      ? "bg-white border-amber-200/80 shadow-xs hover:border-[#c69a3f] hover:shadow-md"
                      : "bg-slate-50/80 border-slate-200 opacity-75"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`p-2 rounded-xl ${
                            r.can_redeem
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <Icon size={18} />
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Minim {r.min_tier}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold font-['Outfit'] text-[#0d2c5c]">
                          {r.points_cost}
                        </span>
                        <span className="text-[10.5px] text-slate-500 block">pct</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[#0d2c5c] font-['Outfit'] leading-tight mb-1">
                      {r.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {r.can_redeem ? (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Puncte suficiente
                      </span>
                    ) : isLocked ? (
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Lock size={13} /> Necesită {r.min_tier}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700">
                        Mai ai nevoie de {r.points_cost - userPoints} pct
                      </span>
                    )}

                    <button
                      disabled={!r.can_redeem || redeemingId === r.id}
                      onClick={() => handleRedeem(r)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-[#0d2c5c] to-[#c69a3f] text-white hover:brightness-110 shadow-xs cursor-pointer"
                    >
                      {redeemingId === r.id ? "Se procesează..." : "Revendică"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
