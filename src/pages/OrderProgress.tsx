import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Bell,
  ArrowLeft,
  CreditCard,
  Banknote,
  Receipt,
  Sparkles,
  XCircle,
  Crown,
  BedDouble,
  UtensilsCrossed,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { WS_URL } from "../lib/config";
import { useToast } from "../components/Toast";
import CasaEsyLottie from "../components/lottie/CasaEsyLottie";
import type { CasaEsyLottieId } from "../components/lottie/casaEsyLottieData";

interface OrderItem {
  id: string;
  title: string;
  qty: number;
  price: number;
}

interface OrderData {
  id: number;
  order_code: string;
  location_type: string;
  location_label: string;
  items: OrderItem[];
  subtotal_amount?: number | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  discount_reason?: string | null;
  vip_tier?: string | null;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  booking_code?: string | null;
  notes?: string;
  status: string;
  created_at: string;
}

const STEPS: Array<{
  key: string;
  title: string;
  subtitle: string;
  icon: typeof Clock;
  lottieId: CasaEsyLottieId;
}> = [
  {
    key: "new",
    title: "Înregistrată",
    subtitle: "Preluată în bucătărie",
    icon: Clock,
    lottieId: "order-registered",
  },
  {
    key: "preparing",
    title: "În Preparare",
    subtitle: "Gătită proaspăt acum",
    icon: ChefHat,
    lottieId: "order-preparing",
  },
  {
    key: "ready",
    title: "Pe Drum",
    subtitle: "Ospătarul se apropie",
    icon: Bell,
    lottieId: "order-delivering",
  },
  {
    key: "delivered",
    title: "Livrată",
    subtitle: "Predată · Poftă bună!",
    icon: CheckCircle2,
    lottieId: "order-delivered",
  },
];

const lei = (n: number) => `${Number(n || 0).toFixed(0)} Lei`;

/**
 * Curăță eticheta locației (ex: "Camera 101 · Camera Dubla Deluxe (#EC0CDF85)")
 * pentru a nu repeta codul rezervării care apare deja în badge-ul dedicat.
 */
function parseLocationDisplay(rawLabel?: string): {
  primary: string;
  secondary: string | null;
} {
  if (!rawLabel) return { primary: "Camera ta", secondary: null };
  const cleaned = rawLabel.replace(/\s*\(#[A-Za-z0-9-]+\)\s*$/, "").trim();
  const parts = cleaned
    .split("·")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { primary: parts[0], secondary: parts.slice(1).join(" · ") };
  }
  return { primary: cleaned, secondary: null };
}

function formatOrderTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderProgress() {
  const { orderCode = "" } = useParams<{ orderCode: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingWithCard, setPayingWithCard] = useState(false);
  const prevStatusRef = useRef<string | null>(null);
  const confirmedSessionRef = useRef<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderCode) return;
    try {
      const cleanCode = orderCode.replace(/^#/, "").trim();
      const data = await apiFetch<OrderData>(
        `/orders/track/${encodeURIComponent(cleanCode)}`,
      );
      setOrder(data);
      window.dispatchEvent(new CustomEvent("casa-esy-active-order-changed"));

      if (prevStatusRef.current && prevStatusRef.current !== data.status) {
        if (data.status === "preparing") {
          toast("Bucătăria a început prepararea comenzii tale!", "info");
        } else if (data.status === "ready") {
          toast(
            "Comanda ta este gata și este în curs de livrare către cameră!",
            "success",
          );
        } else if (data.status === "delivered") {
          toast("Comanda a fost livrată! Poftă bună!", "success");
        }
      }
      prevStatusRef.current = data.status;
      setError("");
    } catch (err: any) {
      setError(err?.message || "Nu am putut găsi comanda.");
    } finally {
      setLoading(false);
    }
  }, [orderCode, toast]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 6000);

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === "REFRESH_ORDERS") {
            fetchOrder();
          }
        } catch {
          // ignore non-json frames
        }
      };
    } catch {
      // fallback on 6s polling
    }

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [fetchOrder]);

  useEffect(() => {
    const paymentState = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (
      paymentState === "success" &&
      sessionId &&
      confirmedSessionRef.current !== sessionId
    ) {
      confirmedSessionRef.current = sessionId;
      apiFetch(
        `/orders/confirm-stripe-session?session_id=${encodeURIComponent(sessionId)}`,
        {
          method: "POST",
        },
      )
        .then(() => {
          toast(
            "Plata comenzii Room Service a fost confirmată cu succes prin Stripe!",
            "success",
          );
          fetchOrder();
          setSearchParams({}, { replace: true });
        })
        .catch(() => {
          fetchOrder();
        });
    } else if (paymentState === "cancelled") {
      toast(
        "Plata cu cardul a fost anulată. Comanda rămâne activă pe cameră.",
        "info",
      );
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, fetchOrder, toast]);

  const handlePayWithCard = async () => {
    if (!order) return;
    setPayingWithCard(true);
    try {
      const res = await apiFetch<{ checkout_url: string }>(
        `/orders/${encodeURIComponent(order.order_code)}/create-checkout-session`,
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

  const normalizedStatus =
    order?.status === "received" ? "new" : order?.status;
  const isCancelled = normalizedStatus === "cancelled";
  const currentStepIdx = order
    ? Math.max(
        0,
        STEPS.findIndex((s) => s.key === normalizedStatus),
      )
    : 0;
  const progressPct = isCancelled
    ? 0
    : (currentStepIdx / (STEPS.length - 1)) * 100;

  const isCardPaid =
    order?.payment_status === "paid" ||
    (order?.payment_method === "card" && order?.notes?.includes("Stripe"));

  const loc = parseLocationDisplay(order?.location_label || "");
  const activeStep = STEPS[currentStepIdx] || STEPS[0];
  const orderTime = formatOrderTime(order?.created_at);

  return (
    <div className="min-h-screen bg-white text-[#0d2c5c] pt-28 sm:pt-32 pb-20 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── TOP NAVIGATION & HEADER PE FUNDAL ALB PUR ── */}
        <div className="pb-7 border-b border-[#e1e8f0]">
          <Link
            to="/places"
            className="inline-flex items-center gap-2 rounded-full border border-[#e1e8f0] bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] hover:border-[#0d2c5c] hover:bg-[#f8fafc] transition no-underline shadow-2xs"
          >
            <ArrowLeft size={13} className="text-[#c69a3f]" />
            Înapoi la Meniu &amp; Locații
          </Link>

          <div className="mt-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                <span className="w-2 h-2 rounded-full bg-[#c69a3f]" />
                <span>Room Service · Vila Casa Esy</span>
              </div>
              <h1 className="mt-1.5 font-['Outfit',sans-serif] text-[30px] sm:text-[38px] font-bold tracking-tight text-[#0d2c5c] leading-tight">
                Comanda{" "}
                <span className="text-[#0d2c5c]">
                  #{orderCode.replace(/^#/, "").toUpperCase()}
                </span>
              </h1>
              <p className="mt-1 text-[14px] text-[#64748b]">
                Statusul preparării și livrării comenzii tale este sincronizat automat cu bucătăria.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {order?.booking_code && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf8ec] border border-[#c69a3f]/35 px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#9c7624]">
                  <Sparkles size={13} className="text-[#c69a3f]" />
                  Sejur #{order.booking_code.replace(/^#/, "")}
                </span>
              )}

              <span className="inline-flex items-center gap-2 rounded-full bg-[#f8fafc] border border-[#e1e8f0] px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Sincronizare Live
              </span>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-12 text-center shadow-[0_10px_40px_rgba(13,44,92,0.05)]">
              <div className="h-7 w-52 mx-auto rounded-full bg-[#eef2f7] animate-pulse mb-4" />
              <div className="h-4 w-72 mx-auto rounded-full bg-[#f4f6fa] animate-pulse" />
            </div>
          ) : error || !order ? (
            <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-12 text-center shadow-[0_10px_40px_rgba(13,44,92,0.05)]">
              <h2 className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2c5c]">
                {error || "Comanda nu a fost găsită"}
              </h2>
              <p className="mt-2 text-sm text-[#64748b]">
                Verifică codul comenzii sau întoarce-te la meniul Room Service.
              </p>
              <Link
                to="/places"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-7 py-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-white no-underline hover:bg-[#163c78] transition"
              >
                <ArrowLeft size={14} />
                Înapoi la Meniu
              </Link>
            </div>
          ) : (
            <div className="space-y-7">
              {/* ── CARD 1: PROGRESUL COMENZII (4 PAȘI PE FUNDAL ALB) ── */}
              <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e1e8f0]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0d2c5c] flex items-center justify-center text-[#c69a3f] shadow-sm shrink-0">
                      <BedDouble size={22} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
                        Destinație Livrare Room Service
                      </div>
                      <div className="font-['Outfit',sans-serif] text-[22px] sm:text-[26px] font-bold leading-tight text-[#0d2c5c]">
                        {loc.primary}
                        {loc.secondary && (
                          <span className="text-[#64748b] font-medium text-base sm:text-lg">
                            {" "}
                            · {loc.secondary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {orderTime && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fafc] border border-[#e1e8f0] px-3.5 py-1.5 text-xs font-semibold text-[#475569]">
                        <Clock size={13} className="text-[#c69a3f]" />
                        Plasată la {orderTime}
                      </span>
                    )}
                    {!isCancelled && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d2c5c] px-4 py-1.5 text-xs font-bold text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c69a3f]" />
                        {activeStep.title}
                      </span>
                    )}
                  </div>
                </div>

                {isCancelled ? (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-5 flex items-center gap-4 text-red-900">
                    <XCircle size={24} className="text-red-600 shrink-0" />
                    <div>
                      <div className="font-['Outfit',sans-serif] text-lg font-bold">
                        Comandă Anulată
                      </div>
                      <p className="text-sm text-red-800/80 mt-0.5">
                        Această comandă a fost anulată. Punctele VIP utilizate (dacă au existat) au fost returnate automat în contul tău.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="relative">
                      {/* Linia de conectare (desktop) */}
                      <div
                        className="hidden sm:block absolute top-9 left-[12.5%] right-[12.5%] h-[3px] rounded-full bg-[#eef2f7]"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-[#0d2c5c] transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-3 relative z-10">
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
                                className={`relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${
                                  isCurrent
                                    ? "bg-white ring-4 ring-[#c69a3f]/35 shadow-[0_12px_28px_-10px_rgba(13,44,92,0.4)]"
                                    : done
                                      ? "bg-white ring-2 ring-emerald-500/30 shadow-xs"
                                      : "bg-[#f8fafc] text-[#94a3b8] border border-[#dce4f0]"
                                }`}
                              >
                                {isCurrent || done ? (
                                  <CasaEsyLottie
                                    id={step.lottieId}
                                    size={64}
                                    loop={isCurrent}
                                    autoplay
                                  />
                                ) : (
                                  <Icon size={22} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div
                                  className={`text-[10.5px] font-bold uppercase tracking-[0.18em] ${
                                    isCurrent
                                      ? "text-[#c69a3f]"
                                      : done
                                        ? "text-emerald-600"
                                        : "text-[#94a3b8]"
                                  }`}
                                >
                                  Pasul 0{idx + 1}
                                </div>
                                <div
                                  className={`font-['Outfit',sans-serif] text-[17px] font-bold leading-tight mt-0.5 ${
                                    isCurrent || done
                                      ? "text-[#0d2c5c]"
                                      : "text-[#94a3b8]"
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

              {/* ── GRID 2 COLOANE: PRODUSE COMANDATE (STÂNGA) & PLATĂ / SUMAR (DREAPTA) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                {/* COLOANA STÂNGA: LISTA DE PRODUSE */}
                <div className="lg:col-span-7 rounded-[24px] border border-[#e1e8f0] bg-white p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)]">
                  <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#e1e8f0]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f8fafc] border border-[#e1e8f0] flex items-center justify-center text-[#0d2c5c]">
                        <UtensilsCrossed size={18} className="text-[#c69a3f]" />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
                          Coș Room Service
                        </p>
                        <h2 className="font-['Outfit',sans-serif] text-xl font-bold text-[#0d2c5c]">
                          Produse Comandate
                        </h2>
                      </div>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-[#f8fafc] border border-[#e1e8f0] px-3.5 py-1 text-xs font-bold text-[#0d2c5c]">
                      {order.items.reduce((acc, it) => acc + it.qty, 0)} produse
                    </span>
                  </div>

                  <div className="divide-y divide-[#e1e8f0] mt-2">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="py-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="flex h-9 min-w-9 px-2.5 items-center justify-center rounded-xl bg-[#f8fafc] border border-[#e1e8f0] text-[#0d2c5c] text-xs font-bold shrink-0">
                            {item.qty}×
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-[15px] text-[#0d2c5c] truncate">
                              {item.title}
                            </div>
                            <div className="text-xs text-[#64748b] mt-0.5">
                              Preț unitar: {lei(item.price)}
                            </div>
                          </div>
                        </div>
                        <span className="font-['Outfit',sans-serif] font-bold text-[16px] text-[#0d2c5c] shrink-0">
                          {lei(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mt-5 rounded-2xl bg-[#f8fafc] border border-[#e1e8f0] px-4 py-3.5 text-xs text-[#334155]">
                      <strong className="uppercase tracking-[0.12em] text-[#0d2c5c] mr-1.5">
                        Mențiuni bucătărie:
                      </strong>
                      „{order.notes}”
                    </div>
                  )}

                  {/* Privilegiu VIP */}
                  {order.discount_amount && order.discount_amount > 0 ? (
                    <div className="mt-5 rounded-2xl border border-[#c69a3f]/35 bg-[#fdf8ec] p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0d2c5c] text-[#c69a3f]">
                            <Crown size={17} />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c]">
                              Privilegiu VIP {order.vip_tier || ""}
                              {order.discount_percent
                                ? ` · -${order.discount_percent}%`
                                : ""}
                            </div>
                            <p className="text-xs text-[#576985] mt-0.5">
                              {order.discount_reason ||
                                `Reducere aplicată automat pentru statutul VIP ${order.vip_tier || ""}.`}
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <span className="inline-block rounded-full bg-white border border-[#c69a3f]/40 px-3 py-1 text-xs font-bold text-[#9c7624]">
                            −{lei(order.discount_amount)} economisiți
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* COLOANA DREAPTA: SUMAR DE PLATĂ & STRIPE */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-6 sm:p-8 shadow-[0_10px_40px_rgba(13,44,92,0.06)]">
                    <div className="pb-5 border-b border-[#e1e8f0]">
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
                        Detalii Financiare
                      </p>
                      <h2 className="font-['Outfit',sans-serif] text-xl font-bold text-[#0d2c5c] mt-0.5">
                        Sumar &amp; Metodă de Plată
                      </h2>
                    </div>

                    <div className="mt-5 space-y-3.5 text-sm">
                      <div className="flex items-center justify-between text-[#64748b]">
                        <span>Locație livrare</span>
                        <span className="font-bold text-[#0d2c5c]">
                          {loc.primary}
                        </span>
                      </div>

                      {order.booking_code && (
                        <div className="flex items-center justify-between text-[#64748b]">
                          <span>Cod sejur asociat</span>
                          <span className="font-bold text-[#0d2c5c]">
                            #{order.booking_code.replace(/^#/, "")}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[#64748b]">
                        <span>Metodă de plată</span>
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#0d2c5c]">
                          {isCardPaid ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                              <CheckCircle2
                                size={13}
                                className="text-emerald-600"
                              />
                              Achitat Online (Stripe)
                            </span>
                          ) : order.payment_method === "card" ? (
                            <>
                              <CreditCard
                                size={14}
                                className="text-[#c69a3f]"
                              />{" "}
                              Card la livrare (POS)
                            </>
                          ) : order.payment_method === "cash" ? (
                            <>
                              <Banknote size={14} className="text-[#c69a3f]" />{" "}
                              Numerar la livrare
                            </>
                          ) : (
                            <>
                              <Receipt size={14} className="text-[#c69a3f]" />{" "}
                              Pe Contul Camerei
                            </>
                          )}
                        </span>
                      </div>

                      {order.discount_amount &&
                      order.discount_amount > 0 &&
                      order.subtotal_amount ? (
                        <>
                          <div className="flex items-center justify-between text-[#64748b] pt-2 border-t border-[#e1e8f0]">
                            <span>Subtotal produse</span>
                            <span className="line-through">
                              {lei(order.subtotal_amount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-700 font-semibold">
                            <span>Reducere VIP</span>
                            <span>−{lei(order.discount_amount)}</span>
                          </div>
                        </>
                      ) : null}

                      <div className="pt-4 border-t border-[#e1e8f0] flex items-baseline justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748b]">
                          Total Comandă
                        </span>
                        <span className="font-['Outfit',sans-serif] text-3xl font-bold text-[#0d2c5c]">
                          {lei(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Buton Plată Online Stripe dacă e pe contul camerei */}
                    {order.payment_method === "room_charge" &&
                      !isCardPaid &&
                      !isCancelled && (
                        <div className="mt-6 pt-6 border-t border-[#e1e8f0]">
                          <div className="flex items-start gap-2.5 mb-4">
                            <ShieldCheck
                              size={16}
                              className="text-[#c69a3f] shrink-0 mt-0.5"
                            />
                            <p className="text-xs text-[#64748b] leading-relaxed">
                              Comanda este trecută pe nota camerei. Dacă dorești, o poți achita chiar acum online cu cardul prin Stripe.
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={payingWithCard}
                            onClick={handlePayWithCard}
                            className="w-full h-12 rounded-xl bg-[#0d2c5c] hover:bg-[#163c78] text-white text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 shadow-[0_6px_20px_rgba(13,44,92,0.18)] transition-all disabled:opacity-60 cursor-pointer"
                          >
                            <CreditCard size={15} className="text-[#c69a3f]" />
                            {payingWithCard
                              ? "Se deschide Stripe..."
                              : `Plătește Online · ${lei(order.total_amount)}`}
                          </button>
                        </div>
                      )}
                  </div>

                  {/* Card Asistență Recepție & Room Service */}
                  <div className="rounded-[20px] border border-[#e1e8f0] bg-white p-5 flex items-center justify-between gap-4 shadow-[0_6px_24px_rgba(13,44,92,0.04)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f8fafc] border border-[#e1e8f0] flex items-center justify-center text-[#0d2c5c] shrink-0">
                        <PhoneCall size={17} className="text-[#c69a3f]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0d2c5c]">
                          Dorești să modifici comanda?
                        </div>
                        <div className="text-[11.5px] text-[#64748b]">
                          Recepția și bucătăria îți stau la dispoziție.
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/contact"
                      className="rounded-xl border border-[#e1e8f0] bg-[#f8fafc] hover:border-[#0d2c5c] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0d2c5c] no-underline transition shrink-0"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
