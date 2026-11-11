import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Crown,
  Award,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  History,
  ArrowUpRight,
  ArrowDownRight,
  TicketPercent,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";
import { useToast } from "../Toast";
import {
  SectionHeader,
  PrimaryButton,
  GhostButton,
  SearchInput,
  Modal,
  Field,
  inputCls,
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
  active_coupons_count?: number;
  redeemed_perks_count?: number;
  created_at: string | null;
}

interface AdminAccountDetails {
  account: AdminLoyaltyAccount & { multiplier?: number };
  transactions: Array<{
    id: number;
    points: number;
    type: string;
    description: string;
    created_at: string | null;
  }>;
  vouchers: {
    coupons: Array<{
      code: string;
      title: string;
      discount_value: number;
      status: string;
      valid_until?: string | null;
    }>;
    perks: Array<{
      id: number;
      title: string;
      booking_code?: string | null;
      points_spent: number;
      created_at?: string | null;
    }>;
  };
}

export default function LoyaltyTab() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<AdminLoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const [adjustTarget, setAdjustTarget] = useState<AdminLoyaltyAccount | null>(null);
  const [adjustPoints, setAdjustPoints] = useState<number>(150);
  const [adjustReason, setAdjustReason] = useState<string>("Bonus de Fidelitate Casa Esy");
  const [savingAdjust, setSavingAdjust] = useState(false);

  const [detailsTarget, setDetailsTarget] = useState<AdminLoyaltyAccount | null>(null);
  const [detailsData, setDetailsData] = useState<AdminAccountDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  useAdminLiveSync({
    topic: "loyalty",
    onSync: () => {
      void loadAccounts();
    },
  });

  const openMemberDetails = async (acc: AdminLoyaltyAccount) => {
    setDetailsTarget(acc);
    setDetailsData(null);
    setLoadingDetails(true);
    try {
      const data = await apiFetch<AdminAccountDetails>(
        `/loyalty/admin/accounts/${acc.user_id}/transactions`
      );
      setDetailsData(data);
    } catch (err: any) {
      toast(err?.message || "Nu s-a putut încărca istoricul membrului.", "error");
    } finally {
      setLoadingDetails(false);
    }
  };

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
    if (!Number(adjustPoints)) {
      toast("Introdu o valoare de puncte diferită de zero.", "warning");
      return;
    }
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
        description="Gestionează membrii clubului de fidelitate, nivelurile de loialitate (Bronze, Silver, Gold, Platinum), voucherele revendicate și alocarea punctelor bonus."
        action={
          <GhostButton onClick={() => void loadAccounts()}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Reîmprospătează</span>
          </GhostButton>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Membri Club</span>
          <p className="text-2xl font-bold font-['Outfit'] text-[#0d2c5c] mt-0.5">{stats.totalMembers}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Puncte Circulație</span>
          <p className="text-2xl font-bold font-['Outfit'] text-[#c69a3f] mt-0.5">{stats.totalPoints}</p>
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-5 py-3.5">Membru VIP</th>
                <th className="px-5 py-3.5">Statut / Tier</th>
                <th className="px-5 py-3.5">Sold Puncte</th>
                <th className="px-5 py-3.5">Acumulat / Cheltuit</th>
                <th className="px-5 py-3.5">Vouchere Active</th>
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
                      <span className="text-emerald-700">{acc.total_points_earned}</span>
                      {" / "}
                      <span className="text-slate-500">{acc.total_points_spent} pct</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[#0d2c5c]">
                        <TicketPercent size={12} className="text-[#c69a3f]" />
                        <span>
                          {acc.active_coupons_count || 0} cupoane · {acc.redeemed_perks_count || 0} beneficii
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => void openMemberDetails(acc)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#0d2c5c] text-[#0d2c5c] hover:bg-slate-50 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <History size={13} />
                        <span>Istoric</span>
                      </button>
                      <button
                        onClick={() => {
                          setAdjustTarget(acc);
                          setAdjustPoints(150);
                          setAdjustReason("Bonus de Fidelitate Casa Esy");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-amber-200 hover:border-[#c69a3f] text-[#0d2c5c] bg-amber-50/70 hover:bg-amber-100/70 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle size={13} className="text-[#c69a3f]" />
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
          <div className="flex flex-wrap gap-2">
            {[100, 250, 500, 1000, -100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAdjustPoints(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  adjustPoints === preset
                    ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset > 0 ? `+${preset} pct` : `${preset} pct`}
              </button>
            ))}
          </div>

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

      <Modal
        open={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        title={detailsTarget ? `Istoric VIP · ${detailsTarget.user_name}` : "Istoric VIP"}
        subtitle={detailsTarget?.user_email}
        footer={<GhostButton onClick={() => setDetailsTarget(null)}>Închide</GhostButton>}
      >
        {loadingDetails ? (
          <p className="text-sm text-slate-500 py-6 text-center">Se încarcă detaliile VIP...</p>
        ) : detailsData ? (
          <div className="space-y-5">
            {(detailsData.vouchers.coupons.length > 0 || detailsData.vouchers.perks.length > 0) && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Vouchere & Beneficii Revendicate
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detailsData.vouchers.coupons.map((c) => (
                    <div
                      key={c.code}
                      className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-[#0d2c5c]">
                        <span className="font-mono">{c.code}</span>
                        <span className="uppercase text-[10px] text-[#c69a3f]">{c.status}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 truncate">{c.title}</p>
                    </div>
                  ))}
                  {detailsData.vouchers.perks.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs"
                    >
                      <p className="font-bold text-[#0d2c5c] truncate">{p.title}</p>
                      <p className="text-slate-500 mt-0.5">
                        {p.booking_code ? `Sejur #${p.booking_code}` : "Fără rezervare asociată"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ultimele Tranzacții ({detailsData.transactions.length})
              </p>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
                {detailsData.transactions.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">Nicio tranzacție.</p>
                ) : (
                  detailsData.transactions.map((tx) => {
                    const pos = tx.points > 0;
                    return (
                      <div key={tx.id} className="px-3.5 py-2.5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`p-1 rounded-full ${
                              pos ? "bg-amber-50 text-[#c69a3f]" : "bg-slate-100 text-[#0d2c5c]"
                            }`}
                          >
                            {pos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#0d2c5c] truncate">{tx.description}</p>
                            <p className="text-[10.5px] text-slate-400">
                              {tx.created_at
                                ? new Date(tx.created_at).toLocaleDateString("ro-RO", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Recent"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold font-['Outfit'] shrink-0 ${
                            pos ? "text-[#c69a3f]" : "text-[#0d2c5c]"
                          }`}
                        >
                          {pos ? `+${tx.points}` : tx.points} pct
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
