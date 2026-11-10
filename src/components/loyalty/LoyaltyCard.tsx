import { useState, useEffect, useCallback } from "react";
import {
  Award,
  Sparkles,
  Gift,
  History,
  ShieldCheck,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Check,
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

const TIER_ICONS = {
  Bronze: Award,
  Silver: ShieldCheck,
  Gold: Crown,
  Platinum: Sparkles,
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
      <div className="h-44 rounded-[26px] bg-white border border-[#e1e8f0] animate-pulse" />
    );
  }

  const tier = account?.tier || "Bronze";
  const TierIcon = TIER_ICONS[tier] || Award;

  return (
    <div className="space-y-4">
      {/* Pristine Luxury White Card aligned with Website Palette */}
      <div className="rounded-[26px] bg-white p-6 sm:p-7 shadow-[0_12px_45px_rgba(13,44,92,0.06)] border border-[#e1e8f0]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#e1e8f0]">
          <div>
            <div className="flex items-center gap-2 mb-2">
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
            <p className="text-[13px] text-[#64748b] mt-1 max-w-lg leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Acumulezi puncte la fiecare sejur și consumație. Folosește-le pentru reduceri la sejururi viitoare sau facilități exclusive.
            </p>
          </div>

          {/* Points Counter in Soft Light Container */}
          <div className="flex items-center gap-4 bg-[#f8fafc] px-6 py-4 rounded-[20px] border border-[#e1e8f0]">
            <div>
              <span className="text-[10.5px] font-bold text-[#64748b] uppercase tracking-wider block">
                Sold Puncte VIP
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0d2c5c]">
                  {account?.points_balance || 0}
                </span>
                <span className="text-xs text-[#c69a3f] font-bold">puncte</span>
              </div>
            </div>
            <div className="pl-4 border-l border-[#e1e8f0] text-right hidden sm:block">
              <span className="text-[10px] text-[#64748b] block font-medium">Total Acumulat</span>
              <span className="text-sm font-bold text-[#0d2c5c]">
                {account?.total_points_earned || 0} pct
              </span>
            </div>
          </div>
        </div>

        {/* Tier Progress Bar */}
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
              style={{ width: `${account?.tier_progress_percent || 25}%` }}
            />
          </div>
        </div>

        {/* Perks & Action Buttons */}
        <div className="mt-6 pt-5 border-t border-[#e1e8f0] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 font-['Plus_Jakarta_Sans',sans-serif]">
          {/* Perks list */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#0d2c5c] mr-1 flex items-center gap-1">
              <Sparkles size={13} className="text-[#c69a3f]" /> Beneficii Active:
            </span>
            {(account?.tier_perks || [
              "100 Puncte / noapte",
              "Welcome Drink",
              "5% discount restaurant",
            ]).slice(0, 3).map((perk, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11.5px] font-semibold bg-[#f8fafc] text-[#0d2c5c] border border-[#e1e8f0]"
              >
                <Check size={12} className="text-[#c69a3f]" />
                <span>{perk}</span>
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => setRewardsModalOpen(true)}
              className="px-4 py-2.5 rounded-[14px] bg-[#0d2c5c] hover:bg-[#071d3d] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Gift size={14} className="text-[#c69a3f]" />
              <span>Catalog Recompense ({rewards.length})</span>
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3.5 py-2.5 rounded-[14px] bg-white hover:bg-[#f8fafc] text-[#0d2c5c] font-semibold text-xs flex items-center gap-1.5 border border-[#e1e8f0] transition-colors cursor-pointer"
            >
              <History size={14} className="text-[#64748b]" />
              <span>{showHistory ? "Ascunde Istoric" : "Istoric Puncte"}</span>
            </button>

            <button
              onClick={handleSimulateStayPoints}
              disabled={simulating}
              className="px-3 py-2.5 rounded-[14px] bg-amber-50 hover:bg-amber-100/70 text-[#c69a3f] font-semibold text-xs flex items-center gap-1.5 border border-[#c69a3f]/40 transition-colors disabled:opacity-50 cursor-pointer"
              title="Simulează primirea punctelor unui sejur pentru testare"
            >
              <PlusCircle size={14} />
              <span>{simulating ? "Se adaugă..." : "+250 Pct Demo"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Drawer */}
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
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`p-1.5 rounded-full ${
                          isPositive ? "bg-amber-50 text-[#c69a3f]" : "bg-slate-100 text-[#0d2c5c]"
                        }`}
                      >
                        {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      </span>
                      <div>
                        <p className="font-semibold text-[#0d2c5c]">{tx.description}</p>
                        <p className="text-[10.5px] text-[#64748b]">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold font-['Outfit',sans-serif] text-sm ${
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
