import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ChefHat,
  Clock,
  BedDouble,
  ArrowLeft,
  Sparkles,
  Receipt,
  CreditCard,
  Banknote,
  BellRing,
  Crown,
  XCircle,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { lei } from "../services/placesService";
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";
import { useToast } from "../components/Toast";

interface TrackedOrder {
  id: string;
  order_code: string;
  location_label: string;
  booking_code?: string | null;
  items: { id: string; title: string; price: number; qty: number }[];
  subtotal_amount?: number | null;
  discount_percent?: number;
  discount_amount?: number;
  vip_tier?: string | null;
  discount_reason?: string | null;
  total_amount: number;
  payment_method: string;
  payment_status?: string | null;
  stripe_session_id?: string | null;
  notes?: string | null;
  status: "new" | "received" | "preparing" | "delivering" | "delivered" | "cancelled";
  created_at?: string | null;
  updated_at?: string | null;
}

const STEPS = [
  {
    key: "new",
    title: "Înregistrată",
    subtitle: "Preluată în bucătărie",
    icon: Clock,
  },
  {
    key: "preparing",
    title: "În Preparare",
    subtitle: "Gătită proaspăt acum",
    icon: ChefHat,
  },
  {
    key: "delivering",
    title: "Pe Drum",
    subtitle: "Ospătarul se apropie",
    icon: BellRing,
  },
  {
    key: "delivered",
    title: "Livrată",
    subtitle: "Predată · Poftă bună",
    icon: CheckCircle2,
  },
] as const;

function parseLocationDisplay(raw: string): { primary: string; secondary: string | null } {
  const clean = (raw || "").trim();
  const parts = clean.split(/\s*[—–-]\s*/);
  if (parts.length >= 2) {
    const second = parts.slice(1).join(" — ").trim();
    const isTestNoise = /\btest\b/i.test(second);
    return {
      primary: parts[0].trim(),
      secondary: isTestNoise ? null : second,
    };
  }
  return { primary: clean || "Livrare în Cameră", secondary: null };
}

export default function OrderProgress() {
  const { orderCode = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingWithCard, setPayingWithCard] = useState(false);

  const loadOrder = useCallback(
    async (silent = false) => {
      if (!orderCode) return;
      if (!silent) setLoading(true);
      try {
        const res = await apiFetch<TrackedOrder>(
          `/orders/track/${encodeURIComponent(orderCode)}`,
        );
        setOrder(res);
        setError(null);
      } catch (err: any) {
        if (!silent) setError(err?.message || "Comanda nu a putut fi găsită.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderCode],
  );

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useAdminLiveSync({
    topic: "all",
    onSync: () => loadOrder(true),
  });

  useEffect(() => {
    const handleLiveOrder = (e: Event) => {
      const custom = e as CustomEvent;
      const data = custom.detail;
      if (!data) return;
      if (
        !data.order_code ||
        data.order_code.toUpperCase() === orderCode.toUpperCase()
      ) {
        void loadOrder(true);
      }
    };
    window.addEventListener("live-orders-sync", handleLiveOrder);
    return () => window.removeEventListener("live-orders-sync", handleLiveOrder);
  }, [orderCode, loadOrder]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success") {
      if (sessionId) {
        void apiFetch("/orders/confirm-payment", {
          method: "POST",
          body: JSON.stringify({ session_id: sessionId }),
        })
          .then(() => {
            toast("Plata cu cardul prin Stripe a fost confirmată cu succes!", "success");
            void loadOrder(true);
          })
          .catch(() => {
            void loadOrder(true);
          });
      } else {
        toast("Plata cu cardul prin Stripe a fost finalizată!", "success");
        void loadOrder(true);
      }
    } else if (payment === "cancelled") {
      toast("Plata cu cardul a fost anulată. Comanda rămâne activă.", "info");
    }
  }, [searchParams, loadOrder, toast]);

  const handlePayWithCard = async () => {
    if (!order) return;
    setPayingWithCard(true);
    try {
      const res = await apiFetch<{ checkout_url: string }>(
        `/orders/${encodeURIComponent(order.id || order.order_code)}/checkout-card`,
        { method: "POST" },
      );
      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      }
    } catch (err: any) {
      toast(
        err?.message || "Eroare la inițierea plății cu cardul prin Stripe.",
        "error",
      );
      setPayingWithCard(false);
    }
  };

  const normalizedStatus = order?.status === "received" ? "new" : order?.status;
  const isCancelled = normalizedStatus === "cancelled";
  const currentStepIdx = order
    ? Math.max(
        0,
        STEPS.findIndex((s) => s.key === normalizedStatus),
      )
    : 0;
  const progressPct = isCancelled ? 0 : (currentStepIdx / (STEPS.length - 1)) * 100;

  const isCardPaid =
    order?.payment_status === "paid" ||
    (order?.payment_method === "card" && order?.notes?.includes("Stripe"));

  const loc = parseLocationDisplay(order?.location_label || "");

  return (
    <div className="min-h-screen bg-[#f9f7f2] text-[#0d2c5c]">
      {/* ── EDITORIAL LUXURY HERO ── */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-32 pb-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(198,154,63,0.18),transparent_55%),linear-gradient(180deg,#081d3d_0%,#0d2c5c_65%,#11356e_100%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
          <Link
            to="/places"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e6b85c] hover:text-white transition no-underline mb-5"
          >
            <ArrowLeft size={14} /> Înapoi la Meniu &amp; Locații
          </Link>

          <p className="font-sans text-[10.5px] font-bold tracking-[0.25em] uppercase text-[#c69a3f] mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            Room Service · Vila Casa Esy
            <span className="w-8 h-px bg-[#c69a3f]/60" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,4.2rem)] font-normal leading-[1.08] text-white">
            Comanda{" "}
            <em className="italic text-[#e6b85c]">#{orderCode.toUpperCase()}</em>
          </h1>

          <div className="mt-5 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-[#c69a3f]/35 px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white/90 backdrop-blur-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e6b85c] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c69a3f]" />
              </span>
              Actualizare automată în timp real
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[44px] md:h-[68px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-[#f9f7f2]"
            />
          </svg>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-10 md:py-14">
        {loading ? (
          <div className="rounded-[28px] border border-[#0d2c5c]/10 bg-white p-12 text-center shadow-[0_20px_50px_-24px_rgba(13,44,92,0.16)]">
            <div className="h-7 w-48 mx-auto rounded-full bg-[#eef2f7] animate-pulse mb-4" />
            <div className="h-4 w-64 mx-auto rounded-full bg-[#f4f6fa] animate-pulse" />
          </div>
        ) : error || !order ? (
          <div className="rounded-[28px] border border-[#0d2c5c]/10 bg-white p-12 text-center shadow-[0_20px_50px_-24px_rgba(13,44,92,0.16)]">
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl text-[#0d2c5c]">
              {error || "Comanda nu a fost găsită"}
            </h2>
            <Link
              to="/places"
              className="mt-6 inline-block rounded-full bg-[#0d2c5c] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white no-underline hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition"
            >
              Înapoi la Meniu
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── CARD 1: EDITORIAL HORIZONTAL TIMELINE ── */}
            <div className="rounded-[28px] border border-[#0d2c5c]/10 bg-white p-7 sm:p-10 shadow-[0_24px_60px_-28px_rgba(13,44,92,0.16)]">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-7 border-b border-[#0d2c5c]/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0d2c5c] flex items-center justify-center text-[#e6b85c] shadow-[0_10px_24px_-10px_rgba(13,44,92,0.5)] shrink-0">
                    <BedDouble size={22} />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-[#c69a3f]">
                      Livrare Room Service
                    </div>
                    <div className="font-['Cormorant_Garamond',serif] text-[28px] sm:text-[34px] font-medium leading-tight text-[#0d2c5c]">
                      {loc.primary}
                      {loc.secondary && (
                        <span className="text-[#6b7c99] font-normal text-xl sm:text-2xl">
                          {" "}
                          · {loc.secondary}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {order.booking_code && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#f9f7f2] border border-[#c69a3f]/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
                    <Sparkles size={13} className="text-[#c69a3f]" />
                    Sejur #{order.booking_code.replace(/^#/, "")}
                  </span>
                )}
              </div>

              {isCancelled ? (
                <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/70 p-6 flex items-center gap-4 text-red-900">
                  <XCircle size={26} className="text-red-600 shrink-0" />
                  <div>
                    <div className="font-['Cormorant_Garamond',serif] text-2xl font-semibold">
                      Comandă Anulată
                    </div>
                    <p className="text-sm text-red-800/80 mt-0.5">
                      Această comandă a fost anulată. Punctele VIP utilizate (dacă au existat) au fost returnate automat în contul tău.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-9">
                  {/* Connecting Track (desktop) */}
                  <div className="relative">
                    <div
                      className="hidden sm:block absolute top-6 left-[12.5%] right-[12.5%] h-[2px] bg-[#e6ebf2]"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#0d2c5c] via-[#c69a3f] to-[#c69a3f] transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 sm:gap-3 relative z-10">
                      {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const done = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div
                            key={step.key}
                            className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3"
                          >
                            <div
                              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                                isCurrent
                                  ? "bg-[#0d2c5c] text-[#e6b85c] ring-4 ring-[#c69a3f]/30 shadow-[0_12px_28px_-10px_rgba(13,44,92,0.55)]"
                                  : done
                                    ? "bg-[#c69a3f] text-white shadow-sm"
                                    : "bg-[#f9f7f2] text-[#94a3b8] border border-[#dce3ee]"
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">
                                0{idx + 1}
                              </div>
                              <div
                                className={`font-['Cormorant_Garamond',serif] text-xl font-semibold leading-tight mt-0.5 ${
                                  isCurrent || done ? "text-[#0d2c5c]" : "text-[#94a3b8]"
                                }`}
                              >
                                {step.title}
                              </div>
                              <div className="text-xs text-[#64748b] mt-0.5">
                                {step.subtitle}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── CARD 2: LUXURY RECEIPT & SUMMARY ── */}
            <div className="rounded-[28px] border border-[#0d2c5c]/10 bg-white p-7 sm:p-10 shadow-[0_24px_60px_-28px_rgba(13,44,92,0.16)]">
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#0d2c5c]/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c69a3f]">
                    Sumar Comandă
                  </p>
                  <h2 className="font-['Cormorant_Garamond',serif] text-3xl font-normal text-[#0d2c5c] mt-0.5">
                    Detaliile <em className="italic text-[#c69a3f]">Comenzii Tale</em>
                  </h2>
                </div>
                <span className="text-xs font-semibold text-[#6b7c99]">
                  {order.items.reduce((acc, it) => acc + it.qty, 0)} produse
                </span>
              </div>

              <div className="divide-y divide-[#0d2c5c]/8 mt-2">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex h-8 min-w-8 px-2 items-center justify-center rounded-full bg-[#0d2c5c] text-[#e6b85c] text-xs font-bold shrink-0">
                        {item.qty}×
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-[15.5px] text-[#0d2c5c] truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-[#7a8aa3]">
                          {lei(item.price)} / buc.
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-[15.5px] text-[#0d2c5c] shrink-0">
                      {lei(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* VIP Privilege Box — structured cleanly with zero overflow */}
              {order.discount_amount && order.discount_amount > 0 ? (
                <div className="mt-6 rounded-2xl border border-[#c69a3f]/40 bg-gradient-to-r from-[#0d2c5c] via-[#12376e] to-[#0d2c5c] p-5 text-white shadow-[0_14px_34px_-16px_rgba(13,44,92,0.45)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c69a3f]/20 border border-[#c69a3f]/50 text-[#e6b85c]">
                        <Crown size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e6b85c]">
                          Privilegiu VIP {order.vip_tier || ""}
                          {order.discount_percent ? ` · -${order.discount_percent}%` : ""}
                        </div>
                        <p className="text-xs text-white/80 mt-1 leading-relaxed">
                          {order.discount_reason ||
                            `Reducere aplicată automat pentru statutul VIP ${order.vip_tier || ""}.`}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-white/15 pt-3 sm:pt-0 sm:pl-5">
                      <div className="text-[11px] text-white/65">
                        Subtotal:{" "}
                        <span className="line-through">
                          {lei(
                            order.subtotal_amount ??
                              order.total_amount + order.discount_amount,
                          )}
                        </span>
                      </div>
                      <div className="text-base font-bold text-[#e6b85c] mt-0.5 whitespace-nowrap">
                        −{lei(order.discount_amount)} economisiți
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {order.notes && (
                <div className="mt-5 rounded-2xl bg-[#f9f7f2] border border-[#c69a3f]/30 px-4 py-3.5 text-xs text-[#5d4a1e]">
                  <strong className="uppercase tracking-[0.12em] text-[#9e782b] mr-1.5">
                    Mențiuni bucătărie:
                  </strong>
                  „{order.notes}”
                </div>
              )}

              {/* Stripe Direct Pay CTA if on room charge */}
              {order.payment_method === "room_charge" && !isCardPaid && !isCancelled && (
                <div className="mt-6 rounded-2xl border border-[#c69a3f]/35 bg-[#f9f7f2] p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard size={15} className="text-[#c69a3f]" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c]">
                          Achitare Online Securitizată (Stripe)
                        </span>
                      </div>
                      <p className="text-xs text-[#5c6f8d] leading-relaxed">
                        Comanda este înregistrată pe contul camerei. O poți achita oricând online cu cardul bancar.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={payingWithCard}
                      onClick={handlePayWithCard}
                      className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0d2c5c] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-md transition-all hover:bg-[#c69a3f] hover:text-[#0d2c5c] disabled:opacity-60 cursor-pointer shrink-0"
                    >
                      <CreditCard size={14} />
                      {payingWithCard
                        ? "Se deschide Stripe..."
                        : `Plătește ${lei(order.total_amount)}`}
                    </button>
                  </div>
                </div>
              )}

              {/* Totals Footer */}
              <div className="mt-7 pt-6 border-t border-[#0d2c5c]/12 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                  {isCardPaid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Achitat Online (Stripe) · Confirmat
                    </span>
                  ) : order.payment_method === "card" ? (
                    <>
                      <CreditCard size={15} className="text-[#c69a3f]" /> Card la livrare (POS Mobil)
                    </>
                  ) : order.payment_method === "cash" ? (
                    <>
                      <Banknote size={15} className="text-[#c69a3f]" /> Numerar la livrare
                    </>
                  ) : (
                    <>
                      <Receipt size={15} className="text-[#c69a3f]" /> Înregistrat pe Contul Camerei
                    </>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#8595aa] block">
                    Total de Plată
                  </span>
                  <div className="flex items-baseline justify-end gap-2.5 mt-0.5">
                    {order.discount_amount &&
                    order.discount_amount > 0 &&
                    order.subtotal_amount ? (
                      <span className="text-sm font-medium text-[#94a3b8] line-through">
                        {lei(order.subtotal_amount)}
                      </span>
                    ) : null}
                    <span className="font-['Cormorant_Garamond',serif] text-4xl font-semibold text-[#0d2c5c]">
                      {lei(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
