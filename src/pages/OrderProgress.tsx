import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { apiFetch } from "../lib/api";
import { WS_URL } from "../lib/config";
import { useToast } from "../components/Toast";

import { STEPS, parseLocationDisplay, formatOrderTime, type OrderData } from "../types/orderProgress";
import OrderProgressTimeline from "../components/orders/progress/OrderProgressTimeline";
import OrderItemsCard from "../components/orders/progress/OrderItemsCard";
import OrderPaymentSummary from "../components/orders/progress/OrderPaymentSummary";

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
      const data = await apiFetch<OrderData>(`/orders/track/${encodeURIComponent(cleanCode)}`);
      setOrder(data);
      window.dispatchEvent(new CustomEvent("casa-esy-active-order-changed"));

      if (prevStatusRef.current && prevStatusRef.current !== data.status) {
        if (data.status === "preparing") toast("Bucătăria a început prepararea comenzii tale!", "info");
        else if (data.status === "ready") toast("Comanda ta este gata și este în curs de livrare către cameră!", "success");
        else if (data.status === "delivered") toast("Comanda a fost livrată! Poftă bună!", "success");
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
          if (msg.event === "REFRESH_ORDERS") fetchOrder();
        } catch {}
      };
    } catch {}
    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [fetchOrder]);

  useEffect(() => {
    const paymentState = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (paymentState === "success" && sessionId && confirmedSessionRef.current !== sessionId) {
      confirmedSessionRef.current = sessionId;
      apiFetch(`/orders/confirm-stripe-session?session_id=${encodeURIComponent(sessionId)}`, { method: "POST" })
        .then(() => {
          toast("Plata comenzii Room Service a fost confirmată cu succes prin Stripe!", "success");
          fetchOrder();
          setSearchParams({}, { replace: true });
        })
        .catch(() => { fetchOrder(); });
    } else if (paymentState === "cancelled") {
      toast("Plata cu cardul a fost anulată. Comanda rămâne activă pe cameră.", "info");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, fetchOrder, toast]);

  const handlePayWithCard = async () => {
    if (!order) return;
    setPayingWithCard(true);
    try {
      const res = await apiFetch<{ checkout_url: string }>(
        `/orders/${encodeURIComponent(order.order_code)}/create-checkout-session`,
        { method: "POST" }
      );
      if (res.checkout_url) window.location.href = res.checkout_url;
    } catch (err: any) {
      toast(err?.message || "Eroare la inițierea plății cu cardul prin Stripe.", "error");
      setPayingWithCard(false);
    }
  };

  const normalizedStatus = order?.status === "received" ? "new" : order?.status;
  const isCancelled = normalizedStatus === "cancelled";
  const currentStepIdx = order ? Math.max(0, STEPS.findIndex((s: any) => s.key === normalizedStatus)) : 0;
  const progressPct = isCancelled ? 0 : (currentStepIdx / (STEPS.length - 1)) * 100;
  const isCardPaid = Boolean(
    order?.payment_status === "paid" ||
    (order?.payment_method === "card" && order?.notes?.includes("Stripe"))
  );
  const loc = parseLocationDisplay(order?.location_label || "");
  const activeStep = STEPS[currentStepIdx] || STEPS[0];
  const orderTime = formatOrderTime(order?.created_at);

  return (
    <div className="min-h-screen bg-white text-[#0d2c5c] pt-28 sm:pt-32 pb-20 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-7 border-b border-[#e1e8f0]">
          <Link
            to="/places"
            className="inline-flex items-center gap-2 rounded-full border border-[#e1e8f0] bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] hover:border-[#0d2c5c] hover:bg-[#f8fafc] transition no-underline shadow-2xs"
          >
            <ArrowLeft size={13} className="text-[#c69a3f]" /> Înapoi la Meniu &amp; Locații
          </Link>

          <div className="mt-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#c69a3f]">
                <span className="w-2 h-2 rounded-full bg-[#c69a3f]" />
                <span>Room Service · Vila Casa Esy</span>
              </div>
              <h1 className="mt-1.5 font-['Outfit',sans-serif] text-[30px] sm:text-[38px] font-bold tracking-tight text-[#0d2c5c] leading-tight">
                Comanda <span className="text-[#0d2c5c]">#{orderCode.replace(/^#/, "").toUpperCase()}</span>
              </h1>
              <p className="mt-1 text-[14px] text-[#64748b]">
                Statusul preparării și livrării comenzii tale este sincronizat automat cu bucătăria.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {order?.booking_code && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf8ec] border border-[#c69a3f]/35 px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#9c7624]">
                  <Sparkles size={13} className="text-[#c69a3f]" /> Sejur #{order.booking_code.replace(/^#/, "")}
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

        <div className="mt-8">
          {loading ? (
            <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-12 text-center shadow-[0_10px_40px_rgba(13,44,92,0.05)]">
              <div className="h-7 w-52 mx-auto rounded-full bg-[#eef2f7] animate-pulse mb-4" />
              <div className="h-4 w-72 mx-auto rounded-full bg-[#f4f6fa] animate-pulse" />
            </div>
          ) : error || !order ? (
            <div className="rounded-[24px] border border-[#e1e8f0] bg-white p-12 text-center shadow-[0_10px_40px_rgba(13,44,92,0.05)]">
              <h2 className="font-['Outfit',sans-serif] text-2xl font-bold text-[#0d2c5c]">{error || "Comanda nu a fost găsită"}</h2>
              <p className="mt-2 text-sm text-[#64748b]">Verifică codul comenzii sau întoarce-te la meniul Room Service.</p>
              <Link to="/places" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0d2c5c] px-7 py-3 text-[11.5px] font-bold uppercase tracking-[0.16em] text-white no-underline hover:bg-[#163c78] transition">
                <ArrowLeft size={14} /> Înapoi la Meniu
              </Link>
            </div>
          ) : (
            <div className="space-y-7">
              <OrderProgressTimeline
                loc={loc} orderTime={orderTime} isCancelled={isCancelled}
                activeStep={activeStep} currentStepIdx={currentStepIdx} progressPct={progressPct}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                <OrderItemsCard order={order} />
                <OrderPaymentSummary
                  order={order} loc={loc} isCardPaid={isCardPaid} isCancelled={isCancelled}
                  payingWithCard={payingWithCard} onPayWithCard={handlePayWithCard}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
