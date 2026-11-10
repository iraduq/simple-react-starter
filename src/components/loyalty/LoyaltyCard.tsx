import { useState, useEffect, useCallback } from "react";
import {
  Award,
  Sparkles,
  TrendingUp,
  Gift,
  History,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Crown,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";
import LoyaltyRewardsModal, { type LoyaltyRewardItem } from "./LoyaltyRewardsModal";

interface LoyaltyAccountData {
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
}

interface LoyaltyTx {
  id: number;
  points: number;
  type: string;
  description: string;
  booking_id?: number | null;
  created_at: string;
}

const TIER_THEMES = {
  Bronze: {
    bg: "from-[#2c1d11] via-[#4a2e1b] to-[#1a120b]",
    badgeBg: "bg-amber-900/40 border-amber-600/50 text-amber-200",
    goldAccent: "text-[#d49a6a]",
    icon: Award,
  },
  Silver: {
    bg: "from-[#1e293b] via-[#334155] to-[#0f172a]",
    badgeBg: "bg-slate-200/20 border-slate-300/40 text-slate-100",
    goldAccent: "text-slate-200",
    icon: ShieldCheck,
  },
  Gold: {
    bg: "from-[#0d2c5c] via-[#1a3a6b] to-[#c69a3f]/70",
    badgeBg: "bg-amber-400/20 border-amber-400/50 text-[#fde047]",
    goldAccent: "text-[#e6b85c]",
    icon: Crown,
  },
  Platinum: {
    bg: "from-[#091b36] via-[#004e54] to-[#00a896]/60",
    badgeBg: "bg-teal-400/20 border-teal-300/50 text-teal-200",
    goldAccent: "text-teal-300",
    icon: Sparkles,
  },
};

export default function LoyaltyCard() {
  const { toast } = useToast();
  const [account, setAccount] = useState<LoyaltyAccountData | null>(null);
  const [rewards, setRewards] = useState<LoyaltyRewardItem[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTx[]>([]);
  const [loading, setLoading] = useState(true);

  const [rewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const loadLoyaltyData = useCallback(async () => {
    try {
      const [accData, rewardsData, txData] = await Promise.all([
        apiFetch<LoyaltyAccountData>("/loyalty/my-account"),
        apiFetch<LoyaltyRewardItem[]>("/loyalty/rewards").catch(() => []),
        apiFetch<LoyaltyTx[]>("/loyalty/my-transactions").catch(() => []),
      ]);
      if (accData) setAccount(accData);
      if (Array.isArray(rewardsData)) setRewards(rewardsData);
      if (Array.isArray(txData)) setTransactions(txData);
    } catch {
      // Silent fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLoyaltyData();
  }, [loadLoyaltyData]);

  const handleSimulateStayPoints = async () => {
    setSimulating(true);
    try {
      const q = new URLSearchParams({ points: "250", reason: "Sejur Finalizat la Vila Casa Esy" });
      const res = await apiFetch<LoyaltyAccountData>(`/loyalty/simulate-earn?${q.toString()}`, {
        method: "POST",
      });
      if (res) setAccount(res);
      toast("Felicitări! Ai primit +250 Puncte Sejur în contul VIP!", "success");
      void loadLoyaltyData();
    } catch (err: any) {
      toast(err?.message || "Nu s-au putut simula punctele.", "error");
    } finally {
      setSimulating(false);
    }
  };

  if (loading && !account) {
    return (
      <div className="h-48 rounded-3xl bg-slate-100 border border-slate-200 animate-pulse" />
    );
  }

  const tier = account?.tier || "Bronze";
  const theme = TIER_THEMES[tier] || TIER_THEMES.Bronze;
  const TierIcon = theme.icon;

  return (
    <div className="space-y-4">
      {/* Luxury Metallic VIP Pass Card */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.bg} p-6 sm:p-7 text-white shadow-2xl border border-white/15`}
      >
        {/* Background Decorative Rings */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-[#c69a3f]/10 blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border ${theme.badgeBg}`}>
                <TierIcon size={14} />
                <span>Statut VIP: {tier}</span>
              </span>
              <span className="text-xs text-white/70">
                • Multiplicator Puncte: {account?.multiplier || 1.0}x
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-['Outfit'] mt-2 text-white">
              Casa Esy Privilege Club
            </h3>
            <p className="text-xs text-white/75 mt-1 max-w-md">
              Acumulezi puncte la fiecare sejur și comandă la restaurant. Folosește-le pentru reduceri, late check-out sau răsfăț exclusivist.
            </p>
          </div>

          {/* Points Balance Counter */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/15">
            <div>
              <span className="text-[11px] font-semibold text-white/75 uppercase tracking-wider block">
                Sold Puncte VIP
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] text-[#e6b85c]">
                  {account?.points_balance || 0}
                </span>
                <span className="text-xs text-white/80 font-bold">puncte</span>
              </div>
            </div>
            <div className="pl-4 border-l border-white/15 text-right hidden sm:block">
              <span className="text-[10px] text-white/60 block">Total Acumulat</span>
              <span className="text-sm font-bold text-white/90">
                {account?.total_points_earned || 0} pct
              </span>
            </div>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="relative z-10 pt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/80 font-medium">
              {account?.next_tier ? (
                <>
                  Progres către nivelul <strong>{account.next_tier}</strong>
                </>
              ) : (
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <Crown size={14} /> Statut Maxim Platinum Atins!
                </span>
              )}
            </span>
            {account?.next_tier && (
              <span className="font-bold text-[#e6b85c]">
                Mai ai nevoie de {account.points_to_next_tier} puncte
              </span>
            )}
          </div>

          <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#c69a3f] to-amber-300 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${account?.tier_progress_percent || 25}%` }}
            />
          </div>
        </div>

        {/* Perks & Action Buttons */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Perks list */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-white/90 mr-1 flex items-center gap-1">
              <Sparkles size={13} className="text-[#e6b85c]" /> Beneficiile Tale Active:
            </span>
            {(account?.tier_perks || [
              "100 Puncte / noapte",
              "Welcome Drink",
              "5% discount restaurant",
            ]).slice(0, 3).map((perk, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white/90 border border-white/10"
              >
                ✓ {perk}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setRewardsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c69a3f] to-amber-500 hover:brightness-110 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Gift size={14} />
              <span>Catalog Recompense ({rewards.length})</span>
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
            >
              <History size={14} />
              <span>{showHistory ? "Ascunde Istoric" : "Istoric Puncte"}</span>
            </button>

            <button
              onClick={handleSimulateStayPoints}
              disabled={simulating}
              className="px-3 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 border border-emerald-400/30 transition-colors disabled:opacity-50 cursor-pointer"
              title="Simulează primirea punctelor unui sejur pentru testare"
            >
              <PlusCircle size={14} />
              <span>{simulating ? "Se adaugă..." : "+250 Pct Demo"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Drawer (Expandable) */}
      {showHistory && (
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-[#00a896]">
                <History size={16} />
              </span>
              <h4 className="text-sm font-bold text-[#0d2c5c] font-['Outfit']">
                Jurnal Tranzacții & Recompense Puncte
              </h4>
            </div>
            <span className="text-xs text-slate-500">{transactions.length} înregistrări</span>
          </div>

          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">Nicio tranzacție înregistrată încă.</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {transactions.map((tx) => {
                const isPositive = tx.points > 0;
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`p-1.5 rounded-full ${
                          isPositive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{tx.description}</p>
                        <p className="text-[10.5px] text-slate-400">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold font-['Outfit'] text-sm ${
                        isPositive ? "text-emerald-700" : "text-amber-700"
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

      {/* Rewards Catalog Modal */}
      <LoyaltyRewardsModal
        isOpen={rewardsModalOpen}
        onClose={() => setRewardsModalOpen(false)}
        userTier={tier}
        userPoints={account?.points_balance || 0}
        rewards={rewards}
        onRedeemed={() => {
          void loadLoyaltyData();
        }}
      />
    </div>
  );
}
