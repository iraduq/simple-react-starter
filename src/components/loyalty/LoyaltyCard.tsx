import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Sparkles,
  Gift,
  History,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Check,
  TicketPercent,
  Copy,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";
import { useToast } from "../Toast";
import LoyaltyRewardsModal, {
  type LoyaltyBookingOption,
  type LoyaltyRewardItem,
} from "./LoyaltyRewardsModal";

export interface LoyaltyCouponItem {
  code: string;
  title: string;
  discount_type: string;
  discount_value: number;
  status: "available" | "used" | "expired";
  valid_until?: string | null;
  created_at?: string | null;
}

export interface LoyaltyRedeemedPerkItem {
  id: number;
  title: string;
  booking_code?: string | null;
  points_spent: number;
  created_at?: string | null;
}

export interface LoyaltyAccountData {
  id: string;
  user_id: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points_balance: number;
  total_points_earned: number;
  total_points_spent: number;
  next_tier: string | null;
  points_to_next_tier: number;
  tier_progress_percent: number;
  tier_perks: string[];
  multiplier: number;
  order_discount_percent?: number;
  stay_discount_percent?: number;
  order_discount_reason?: string | null;
  stay_discount_reason?: string | null;
  coupons?: LoyaltyCouponItem[];
  redeemed_perks?: LoyaltyRedeemedPerkItem[];
}

interface LoyaltyTx {
  id: number;
  points: number;
  type: string;
  description: string;
  booking_id?: number | null;
  created_at: string;
}

interface LoyaltyCardProps {
  bookings?: LoyaltyBookingOption[];
  onAccountChange?: (acc: LoyaltyAccountData | null) => void;
}

const TIER_ICONS = {
  Bronze: Award,
  Silver: ShieldCheck,
  Gold: Crown,
  Platinum: Sparkles,
};

export default function LoyaltyCard({ bookings = [], onAccountChange }: LoyaltyCardProps) {
  const { toast } = useToast();
  const [account, setAccount] = useState<LoyaltyAccountData | null>(null);
  const [rewards, setRewards] = useState<LoyaltyRewardItem[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [rewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadLoyaltyData = useCallback(async () => {
    try {
      setError(false);
      const [accData, rewardsData, txData] = await Promise.all([
        apiFetch<LoyaltyAccountData>("/loyalty/my-account"),
        apiFetch<LoyaltyRewardItem[]>("/loyalty/rewards").catch(() => []),
        apiFetch<LoyaltyTx[]>("/loyalty/my-transactions").catch(() => []),
      ]);
      if (accData) {
        setAccount(accData);
        onAccountChange?.(accData);
      }
      if (Array.isArray(rewardsData)) setRewards(rewardsData);
      if (Array.isArray(txData)) setTransactions(txData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [onAccountChange]);

  useEffect(() => {
    void loadLoyaltyData();
  }, [loadLoyaltyData]);

  useAdminLiveSync({
    topic: "loyalty",
    onSync: () => {
      void loadLoyaltyData();
    },
  });

  const handleCopyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast(`Codul voucher ${code} a fost copiat!`, "success");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast(`Cod voucher: ${code}`, "info");
    }
  };

  if (loading && !account) {
    return (
      <div className="h-44 rounded-[26px] bg-white border border-[#e1e8f0] animate-pulse" />
    );
  }

  if (error && !account) {
    return (
      <div className="rounded-[26px] bg-white p-6 border border-[#e1e8f0] flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#0d2c5c]">Casa Esy Privilege Club</p>
          <p className="text-xs text-[#64748b] mt-0.5">
            Nu am putut încărca datele VIP momentan.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            void loadLoyaltyData();
          }}
          className="px-4 py-2 rounded-xl bg-[#0d2c5c] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Reîncearcă</span>
        </button>
      </div>
    );
  }

  const tier = account?.tier || "Bronze";
  const TierIcon = TIER_ICONS[tier] || Award;
  const coupons = account?.coupons || [];
  const redeemedPerks = account?.redeemed_perks || [];
  const availableCoupons = coupons.filter((c) => c.status === "available");

  return (
    <div className="space-y-4">
      <div className="rounded-[26px] bg-white p-6 sm:p-7 shadow-[0_12px_45px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#e1e8f0]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-[#c69a3f] border border-[#c69a3f]/30">
                <TierIcon size={13} />
                <span>Statut VIP: {tier}</span>
              </span>
              <span className="text-xs text-[#64748b]">
                • Multiplicator Puncte: {account?.multiplier || 1.0}x
              </span>
            </div>

            <h3 className="font-['Outfit',sans-serif] text-[26px] sm:text-[30px] font-bold text-[#0d2c5c] leading-tight">
              Casa Esy Privilege Club
            </h3>
            <p className="text-[13px] text-[#64748b] mt-1 max-w-xl leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Primești automat <strong>100 pct / noapte</strong> la sejururi și{" "}
              <strong>1 pct / 10 RON</strong> la comenzi Room Service, înmulțite cu multiplicatorul statutului tău.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#f8fafc] px-6 py-4 rounded-[20px] border border-[#e1e8f0]">
            <div>
              <span className="text-[10.5px] font-bold text-[#64748b] uppercase tracking-wider block">
                Sold Puncte VIP
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0d2c5c]">
                  {account?.points_balance ?? 0}
                </span>
                <span className="text-xs text-[#c69a3f] font-bold">puncte</span>
              </div>
            </div>
            <div className="pl-4 border-l border-[#e1e8f0] text-right hidden sm:block">
              <span className="text-[10px] text-[#64748b] block font-medium">Total Acumulat</span>
              <span className="text-sm font-bold text-[#0d2c5c]">
                {account?.total_points_earned ?? 0} pct
              </span>
            </div>
          </div>
        </div>

        <div className="pt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-['Plus_Jakarta_Sans',sans-serif]">
            <span className="text-[#64748b] font-medium">
              {account?.next_tier ? (
                <>
                  Progres către nivelul <strong className="text-[#0d2c5c]">{account.next_tier}</strong>
                </>
              ) : (
                <span className="text-[#c69a3f] font-bold flex items-center gap-1">
                  <Crown size={14} /> Statut Maxim Platinum Atins!
                </span>
              )}
            </span>
            {account?.next_tier && (
              <span className="font-bold text-[#c69a3f]">
                Mai ai nevoie de {account.points_to_next_tier} puncte
              </span>
            )}
          </div>

          <div className="h-2.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden p-0.5 border border-[#e1e8f0]">
            <div
              className="h-full bg-gradient-to-r from-[#0d2c5c] via-[#c69a3f] to-[#e6b85c] rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${Math.max(4, account?.tier_progress_percent || 0)}%` }}
            />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#e1e8f0] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#0d2c5c] mr-1 flex items-center gap-1">
              <Sparkles size={13} className="text-[#c69a3f]" /> Privilegii {tier}:
            </span>
            {(account?.tier_perks || []).map((perk, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11.5px] font-semibold bg-[#f8fafc] text-[#0d2c5c] border border-[#e1e8f0]"
              >
                <Check size={12} className="text-[#c69a3f]" />
                <span>{perk}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <Link
              to="/places"
              className="px-4 py-2.5 rounded-[14px] bg-[#0d2c5c] hover:bg-[#133b7a] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Gift size={14} className="text-[#c69a3f]" />
              <span>Comandă cu puncte în /places</span>
              <ArrowUpRight size={13} className="text-[#c69a3f]" />
            </Link>

            <button
              onClick={() => setRewardsModalOpen(true)}
              className="px-3.5 py-2.5 rounded-[14px] bg-[#fdf8ec] hover:bg-[#faefd6] text-[#0d2c5c] font-bold text-xs flex items-center gap-1.5 border border-[#c69a3f]/40 transition-colors cursor-pointer"
            >
              <TicketPercent size={14} className="text-[#9c7624]" />
              <span>Vouchere ({rewards.length})</span>
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3.5 py-2.5 rounded-[14px] bg-white hover:bg-[#f8fafc] text-[#0d2c5c] font-semibold text-xs flex items-center gap-1.5 border border-[#e1e8f0] transition-colors cursor-pointer"
            >
              <History size={14} className="text-[#64748b]" />
              <span>{showHistory ? "Ascunde Istoric" : "Istoric Puncte"}</span>
            </button>
          </div>
        </div>

        <p className="mt-3 text-[12px] text-[#6b7c99] font-['Plus_Jakarta_Sans',sans-serif]">
          Pentru a comanda gratuit sau cu reducere folosind punctele tale VIP, intră pe pagina{" "}
          <Link to="/places" className="font-bold text-[#0d2c5c] underline decoration-[#c69a3f]">
            /places (Restaurant, Bar & SPA)
          </Link>{" "}
          și activează opțiunea „Folosește punctele VIP” direct în coș.
        </p>

        {(coupons.length > 0 || redeemedPerks.length > 0) && (
          <div className="mt-5 pt-5 border-t border-[#e1e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0d2c5c] flex items-center gap-1.5">
                <TicketPercent size={14} className="text-[#c69a3f]" />
                <span>Vouchere & Beneficii Revendicate ({availableCoupons.length} active)</span>
              </p>
              {availableCoupons.length > 0 && (
                <Link
                  to="/camere"
                  className="text-xs font-bold text-[#c69a3f] hover:underline"
                >
                  Folosește la o rezervare →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {coupons.map((cp) => {
                const isActive = cp.status === "available";
                return (
                  <div
                    key={cp.code}
                    className={`rounded-2xl border p-3.5 flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-amber-50/50 border-[#c69a3f]/40"
                        : "bg-slate-50 border-slate-200 opacity-70"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#0d2c5c]">
                          {cp.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : cp.status === "used"
                              ? "bg-slate-200 text-slate-600"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {isActive ? "Activ" : cp.status === "used" ? "Utilizat" : "Expirat"}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#64748b] truncate mt-0.5">
                        Reducere {cp.discount_value}% ·{" "}
                        {cp.valid_until
                          ? `Valabil până la ${new Date(cp.valid_until).toLocaleDateString("ro-RO")}`
                          : "Sejur viitor"}
                      </p>
                    </div>

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => void handleCopyCoupon(cp.code)}
                        className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[#e1e8f0] hover:border-[#c69a3f] text-xs font-bold text-[#0d2c5c] inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode === cp.code ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} className="text-[#c69a3f]" />
                        )}
                        <span>{copiedCode === cp.code ? "Copiat" : "Copiază"}</span>
                      </button>
                    )}
                  </div>
                );
              })}

              {redeemedPerks.slice(0, 4).map((pk) => (
                <div
                  key={pk.id}
                  className="rounded-2xl border border-[#e1e8f0] bg-[#f8fafc] p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0d2c5c] truncate">{pk.title}</p>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      {pk.booking_code
                        ? `Asociat sejurului #${pk.booking_code}`
                        : "Activ în cont · Prezintă la recepție"}
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-[#e1e8f0] text-[10.5px] font-bold text-[#c69a3f]">
                    Activ
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <div className="rounded-[26px] bg-white border border-[#e1e8f0] p-5 shadow-[0_12px_45px_rgba(13,44,92,0.06)] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#e1e8f0]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-[#c69a3f]">
                <History size={16} />
              </span>
              <h4 className="text-sm font-bold text-[#0d2c5c] font-['Outfit',sans-serif]">
                Jurnal Tranzacții & Recompense Puncte
              </h4>
            </div>
            <span className="text-xs text-[#64748b]">{transactions.length} înregistrări</span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-xs text-[#64748b] py-3 text-center">Nicio tranzacție înregistrată încă.</p>
          ) : (
            <div className="divide-y divide-[#e1e8f0] max-h-60 overflow-y-auto">
              {transactions.map((tx) => {
                const isPositive = tx.points > 0;
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`p-1.5 rounded-full shrink-0 ${
                          isPositive ? "bg-amber-50 text-[#c69a3f]" : "bg-slate-100 text-[#0d2c5c]"
                        }`}
                      >
                        {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0d2c5c] truncate">{tx.description}</p>
                        <p className="text-[10.5px] text-[#64748b]">
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleDateString("ro-RO", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Recent"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold font-['Outfit',sans-serif] text-sm shrink-0 ${
                        isPositive ? "text-[#c69a3f]" : "text-[#0d2c5c]"
                      }`}
                    >
                      {isPositive ? `+${tx.points}` : tx.points} pct
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <LoyaltyRewardsModal
        isOpen={rewardsModalOpen}
        onClose={() => setRewardsModalOpen(false)}
        userTier={tier}
        userPoints={account?.points_balance || 0}
        rewards={rewards}
        bookings={bookings}
        onRedeemed={() => {
          void loadLoyaltyData();
        }}
      />
    </div>
  );
}
