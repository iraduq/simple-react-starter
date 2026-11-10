import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Crown,
  Award,
  Sparkles,
  TrendingUp,
  Search,
  PlusCircle,
  ShieldCheck,
  Gift,
  Coins,
  Users,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useToast } from "../Toast";
import {
  SectionHeader,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Modal,
  Field,
  inputCls,
  Badge,
} from "./ui";

interface AdminLoyaltyAccount {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points_balance: number;
  total_points_earned: number;
  total_points_spent: number;
  created_at: string | null;
}

export default function LoyaltyTab() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<AdminLoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  // Adjust Modal
  const [adjustTarget, setAdjustTarget] = useState<AdminLoyaltyAccount | null>(null);
  const [adjustPoints, setAdjustPoints] = useState<number>(100);
  const [adjustReason, setAdjustReason] = useState<string>("Bonus Fidelitate Casa Esy VIP");
  const [savingAdjust, setSavingAdjust] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<AdminLoyaltyAccount[]>("/loyalty/admin/accounts");
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast(err?.message || "Eroare la încărcarea membrilor VIP.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const stats = useMemo(() => {
    const totalMembers = accounts.length;
    const totalPoints = accounts.reduce((acc, a) => acc + (a.points_balance || 0), 0);
    const platinumCount = accounts.filter((a) => a.tier === "Platinum").length;
    const goldCount = accounts.filter((a) => a.tier === "Gold").length;
    const silverCount = accounts.filter((a) => a.tier === "Silver").length;
    const bronzeCount = accounts.filter((a) => a.tier === "Bronze").length;
    return { totalMembers, totalPoints, platinumCount, goldCount, silverCount, bronzeCount };
  }, [accounts]);

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (tierFilter !== "all" && a.tier !== tierFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.user_name.toLowerCase().includes(q) ||
          a.user_email.toLowerCase().includes(q) ||
          a.tier.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [accounts, tierFilter, search]);

  const handleAdjustPoints = async () => {
    if (!adjustTarget) return;
    setSavingAdjust(true);
    try {
      await apiFetch("/loyalty/admin/adjust-points", {
        method: "POST",
        body: JSON.stringify({
          user_id: adjustTarget.user_id,
          points: Number(adjustPoints),
          reason: adjustReason.trim() || "Ajustare manuală administrator",
        }),
      });
      toast(`Punctele pentru ${adjustTarget.user_name} au fost actualizate!`, "success");
      setAdjustTarget(null);
      void loadAccounts();
    } catch (err: any) {
      toast(err?.message || "Nu s-au putut ajusta punctele.", "error");
    } finally {
      setSavingAdjust(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Fidelizare și oaspeți VIP"
        title="Clubul de privilegii Casa Esy și statutul VIP"
        description="Gestionează membrii clubului de fidelitate, nivelurile de loialitate (Bronze, Silver, Gold, Platinum) și alocă puncte bonus."
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Membri Club</span>
          <p className="text-2xl font-bold font-['Outfit'] text-[#0d2c5c] mt-0.5">{stats.totalMembers}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Puncte Circulație</span>
          <p className="text-2xl font-bold font-['Outfit'] text-[#e6b85c] mt-0.5">{stats.totalPoints}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200">
          <span className="text-[11px] font-bold text-teal-800 uppercase flex items-center gap-1">
            <Sparkles size={12} /> Platinum
          </span>
          <p className="text-2xl font-bold font-['Outfit'] text-teal-900 mt-0.5">{stats.platinumCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200">
          <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
            <Crown size={12} /> Gold
          </span>
          <p className="text-2xl font-bold font-['Outfit'] text-amber-900 mt-0.5">{stats.goldCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
          <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
            <ShieldCheck size={12} /> Silver
          </span>
          <p className="text-2xl font-bold font-['Outfit'] text-slate-800 mt-0.5">{stats.silverCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100/40 border border-orange-200">
          <span className="text-[11px] font-bold text-amber-900 uppercase flex items-center gap-1">
            <Award size={12} /> Bronze
          </span>
          <p className="text-2xl font-bold font-['Outfit'] text-amber-900 mt-0.5">{stats.bronzeCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "Bronze", "Silver", "Gold", "Platinum"].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                tierFilter === t
                  ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t === "all" ? `Toți Membrii (${accounts.length})` : t}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Caută după nume sau email..."
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Membru VIP</th>
                <th className="px-5 py-3.5">Statut / Tier</th>
                <th className="px-5 py-3.5">Sold Puncte</th>
                <th className="px-5 py-3.5">Total Acumulat</th>
                <th className="px-5 py-3.5">Total Cheltuit</th>
                <th className="px-5 py-3.5 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Se încarcă membrii VIP...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Niciun membru găsit pentru criteriile selectate.
                  </td>
                </tr>
              ) : (
                filtered.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#0d2c5c]">{acc.user_name}</p>
                      <p className="text-xs text-slate-400">{acc.user_email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          acc.tier === "Platinum"
                            ? "bg-teal-100 text-teal-800 border border-teal-200"
                            : acc.tier === "Gold"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : acc.tier === "Silver"
                            ? "bg-slate-100 text-slate-800 border border-slate-300"
                            : "bg-orange-100 text-amber-950 border border-orange-200"
                        }`}
                      >
                        {acc.tier === "Platinum" && <Sparkles size={12} />}
                        {acc.tier === "Gold" && <Crown size={12} />}
                        {acc.tier === "Silver" && <ShieldCheck size={12} />}
                        {acc.tier === "Bronze" && <Award size={12} />}
                        <span>{acc.tier}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-extrabold font-['Outfit'] text-base text-[#0d2c5c]">
                        {acc.points_balance}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">pct</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      {acc.total_points_earned} pct
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      {acc.total_points_spent} pct
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustTarget(acc);
                          setAdjustPoints(150);
                          setAdjustReason("Bonus de Fidelitate Casa Esy");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-teal-200 hover:border-[#00a896] text-[#00a896] hover:bg-teal-50 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle size={13} />
                        <span>Ajustează Puncte</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajustare Manuală Puncte */}
      <Modal
        open={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        title="Alocare / Ajustare Puncte VIP"
        subtitle={
          adjustTarget
            ? `Modifici punctele pentru ${adjustTarget.user_name} (Sold curent: ${adjustTarget.points_balance} pct)`
            : ""
        }
        footer={
          <>
            <GhostButton onClick={() => setAdjustTarget(null)}>Anulează</GhostButton>
            <PrimaryButton disabled={savingAdjust} onClick={handleAdjustPoints}>
              {savingAdjust ? "Se salvează..." : "Confirmă Tranzacția"}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Valoare Puncte (pozitiv pentru acordare, negativ pentru deducere)">
            <input
              type="number"
              className={inputCls}
              value={adjustPoints}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustPoints(Number(e.target.value))}
              placeholder="Ex: 150 sau -50"
            />
          </Field>
          <Field label="Motivul / Descrierea Tranzacției">
            <input
              type="text"
              className={inputCls}
              value={adjustReason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustReason(e.target.value)}
              placeholder="Ex: Sejur aniversar, Recompensă specială..."
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
