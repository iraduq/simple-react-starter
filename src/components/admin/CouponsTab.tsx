import { useCallback, useEffect, useState } from "react";
import {
  TicketPercent,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  Sparkles,
  Mail,
  Calculator,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { money } from "../../lib/admin";
import { useToast } from "../Toast";
import { useAdminLiveSync } from "../../context/AdminLiveSyncContext";
import {
  SectionHeader,
  PrimaryButton,
  GhostButton,
  Modal,
  Field,
  TextInput,
  Select,
  Badge,
} from "./ui";

export interface PromoCouponItem {
  id: string;
  code: string;
  description: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_booking_amount: number;
  max_uses: number | null;
  used_count: number;
  valid_until: string | null;
  is_active: boolean;
  created_at?: string | null;
}

export default function CouponsTab() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<PromoCouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal creare cupon nou
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("15");
  const [minAmount, setMinAmount] = useState("500");
  const [maxUses, setMaxUses] = useState("100");
  const [saving, setSaving] = useState(false);

  // Simulator rapid
  const [simCode, setSimCode] = useState("VARA2026");
  const [simSubtotal, setSimSubtotal] = useState("1400");
  const [simResult, setSimResult] = useState<{
    discount_amount: number;
    final_total: number;
    description: string;
  } | null>(null);

  const loadCoupons = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await apiFetch<PromoCouponItem[]>("/coupons");
        setCoupons(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!silent) toast(err?.message || "Eroare la încărcarea cupoanelor.", "error");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  useAdminLiveSync({
    topic: "all",
    onSync: () => loadCoupons(true),
  });

  const handleCopy = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    toast(`Codul ${c} a fost copiat! Îl poți lipi direct în Email Studio.`, "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreate = async () => {
    if (!code.trim()) {
      toast("Introdu un cod promoțional (ex: VARA2026).", "error");
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch<PromoCouponItem>("/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description: description.trim() || `Campanie Promoțională ${code.trim().toUpperCase()}`,
          discount_type: discountType,
          discount_value: parseFloat(discountValue) || 10,
          min_booking_amount: parseFloat(minAmount) || 0,
          max_uses: parseInt(maxUses, 10) > 0 ? parseInt(maxUses, 10) : null,
          is_active: true,
        }),
      });
      setCoupons((prev) => [created, ...prev]);
      setShowCreate(false);
      setCode("");
      setDescription("");
      toast(`Cuponul ${created.code} a fost creat și este activ la Checkout!`, "success");
    } catch (err: any) {
      toast(err?.message || "Eroare la salvarea cuponului.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: PromoCouponItem) => {
    try {
      const updated = await apiFetch<PromoCouponItem>(`/coupons/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      setCoupons((prev) => prev.map((c) => (c.id === item.id ? updated : c)));
      toast(
        `Cuponul ${updated.code} a fost ${updated.is_active ? "activat" : "dezactivat"}.`,
        "info",
      );
    } catch (err: any) {
      toast(err?.message || "Nu am putut modifica starea cuponului.", "error");
    }
  };

  const handleDelete = async (item: PromoCouponItem) => {
    try {
      await apiFetch(`/coupons/${item.id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c.id !== item.id));
      toast(`Cuponul ${item.code} a fost șters.`, "success");
    } catch (err: any) {
      toast(err?.message || "Nu am putut șterge cuponul.", "error");
    }
  };

  const handleSimulate = async () => {
    try {
      const res = await apiFetch<{
        valid: boolean;
        discount_amount: number;
        final_total: number;
        description: string;
      }>("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({
          code: simCode,
          subtotal: parseFloat(simSubtotal) || 0,
        }),
      });
      setSimResult(res);
      toast(`Reducere calculată: -${res.discount_amount} RON!`, "success");
    } catch (err: any) {
      setSimResult(null);
      toast(err?.message || "Codul nu este valid pentru această sumă.", "error");
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Marketing & Campanii Email Studio"
        title="Cupoane Promoționale & Reduceri Directe"
        description="Creează coduri promoționale pe care le trimiți prin Email Studio (Unlayer) și pe care oaspeții le aplică direct la pasul de rezervare a camerei."
        actions={
          <PrimaryButton onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            Creează Cupon Promoțional
          </PrimaryButton>
        }
      />

      {/* Simulator & Email Studio Bridge Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c192c] to-[#173252] text-white p-5 mb-6 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-accent-light)]">
            <Sparkles className="w-3.5 h-3.5" /> Integrat cu Email Studio & Checkout Camere
          </div>
          <h3 className="font-['Outfit',sans-serif] font-bold text-lg">
            Testează în timp real cum se aplică reducerea pentru oaspete
          </h3>
          <p className="text-xs text-white/75 leading-relaxed">
            Orice cupon activ poate fi introdus de client în pagina camerei înainte de confirmarea rezervării. Reducerea se scade automat din prețul total și contorul de utilizări crește.
          </p>
        </div>

        <div className="w-full lg:w-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3.5 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[11px] text-white/80 mb-1">Cod Cupon</label>
            <input
              value={simCode}
              onChange={(e) => setSimCode(e.target.value.toUpperCase())}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-mono font-bold text-xs w-32"
              placeholder="VARA2026"
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/80 mb-1">Valoare Sejur (RON)</label>
            <input
              type="number"
              value={simSubtotal}
              onChange={(e) => setSimSubtotal(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-semibold text-xs w-28"
            />
          </div>
          <button
            onClick={handleSimulate}
            className="px-3.5 py-1.5 rounded-lg bg-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-light)] text-[#0c192c] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5" />
            Simulează
          </button>
          {simResult && (
            <div className="text-xs bg-emerald-500/20 border border-emerald-400/40 rounded-lg px-3 py-1.5">
              Discount: <strong>-{money(simResult.discount_amount)}</strong> → Total final:{" "}
              <strong className="text-[color:var(--color-accent-light)]">
                {money(simResult.final_total)}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-white/60 border border-[color:var(--color-border)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((c) => {
            const usagePct = c.max_uses ? Math.min(100, Math.round((c.used_count / c.max_uses) * 100)) : 25;
            return (
              <div
                key={c.id}
                className={`rounded-2xl bg-white border transition-all p-5 flex flex-col justify-between shadow-xs ${
                  c.is_active
                    ? "border-[color:var(--color-border)] hover:shadow-md"
                    : "border-slate-200 opacity-65"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-accent-light)] font-mono font-bold text-sm tracking-wider">
                      <TicketPercent className="w-4 h-4" />
                      {c.code}
                    </div>
                    <Badge tone={c.is_active ? "green" : "muted"}>
                      {c.is_active ? "Activ la Checkout" : "Dezactivat"}
                    </Badge>
                  </div>

                  <div className="font-['Outfit',sans-serif] font-bold text-2xl text-[color:var(--color-primary)] mb-1">
                    {c.discount_type === "percent"
                      ? `${c.discount_value}% REDUCERE`
                      : `-${c.discount_value} RON DISCOUNT`}
                  </div>
                  <p className="text-xs text-[color:var(--color-muted-foreground)] mb-4 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="space-y-2 text-xs bg-slate-50 rounded-xl p-3 border border-[color:var(--color-border)]/70 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Prag minim rezervare:</span>
                      <span className="font-semibold text-slate-800">
                        {c.min_booking_amount > 0 ? money(c.min_booking_amount) : "Fără prag minim"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Utilizări oaspeți:</span>
                      <span className="font-semibold text-slate-800">
                        {c.used_count} {c.max_uses ? `/ ${c.max_uses} maxime` : "(nelimitat)"}
                      </span>
                    </div>
                    {c.max_uses && (
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[color:var(--color-primary)] rounded-full"
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[color:var(--color-border)]">
                  <button
                    onClick={() => handleCopy(c.code)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" /> Copiat!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiază pt. Email Studio
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleActive(c)}
                    title={c.is_active ? "Dezactivează cuponul" : "Activează cuponul"}
                    className="p-2 rounded-xl border border-[color:var(--color-border)] text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(c)}
                    title="Șterge cuponul"
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Creare Cupon */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Creează Cupon Promoțional Nou"
        subtitle="Codul va putea fi folosit imediat de oaspeți în pagina camerei și inclus în șabloanele Email Studio."
        footer={
          <>
            <GhostButton onClick={() => setShowCreate(false)}>Anulează</GhostButton>
            <PrimaryButton disabled={saving} onClick={handleCreate}>
              <Mail className="w-4 h-4" />
              {saving ? "Se salvează..." : "Activează Cuponul"}
            </PrimaryButton>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Cod Promoțional (fără spații)">
            <TextInput
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ex: VARA2026 sau RUSALII15"
            />
          </Field>

          <Field label="Tip Reducere">
            <Select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
            >
              <option value="percent">Procentuală (%)</option>
              <option value="fixed">Sumă Fixă în RON</option>
            </Select>
          </Field>

          <Field label={discountType === "percent" ? "Procent Reducere (%)" : "Sumă Reducere (RON)"}>
            <TextInput
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="ex: 15"
            />
          </Field>

          <Field label="Valoare Minimă Rezervare (RON)">
            <TextInput
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="ex: 500"
            />
          </Field>

          <Field label="Număr Maxim de Utilizări (0 = nelimitat)">
            <TextInput
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="ex: 100"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Descriere Campanie (afișată oaspetelui la aplicarea codului)">
              <TextInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: Campanie Newsletter Vara 2026 — 15% reducere la orice suită"
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
