import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { lei } from "../services/placesService";
import { useAdminLiveSync } from "../context/AdminLiveSyncContext";

interface TrackedOrder {
  id: string;
  order_code: string;
  location_label: string;
  booking_code?: string | null;
  items: { id: string; title: string; price: number; qty: number }[];
  total_amount: number;
  payment_method: string;
  notes?: string | null;
  status: "new" | "preparing" | "delivering" | "delivered" | "cancelled";
  created_at?: string | null;
  updated_at?: string | null;
}

const STEPS = [
  {
    key: "new",
    title: "Comandă Înregistrată",
    subtitle: "Recepționată în bucătărie",
    icon: Clock,
  },
  {
    key: "preparing",
    title: "În Preparare",
    subtitle: "Se gătește proaspăt acum",
    icon: ChefHat,
  },
  {
    key: "delivering",
    title: "În Drum spre Cameră",
    subtitle: "Room Service în curs de livrare",
    icon: BellRing,
  },
  {
    key: "delivered",
    title: "Livrată la Cameră",
    subtitle: "Predată cu succes · Poftă bună!",
    icon: CheckCircle2,
  },
] as const;

export default function OrderProgress() {
  const { orderCode = "" } = useParams();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(
    async (silent = false) => {
      if (!orderCode) return;
      if (!silent) setLoading(true);
      try {
        const res = await apiFetch<TrackedOrder>(`/orders/track/${encodeURIComponent(orderCode)}`);
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

  const currentStepIdx = order
    ? Math.max(
        0,
        STEPS.findIndex((s) => s.key === order.status),
      )
    : 0;

  return (
    <div className="min-h-screen bg-white text-[#0d2c5c]">
      {/* Hero section matching Rooms.tsx / Home.tsx */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-32 pb-24 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-[#071a36]/90 via-[#0d2c5c]/85 to-[#0d2c5c]" />
        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
          <Link
            to="/places"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e6b85c] hover:text-white transition no-underline mb-4"
          >
            <ArrowLeft size={14} /> Înapoi la Locații & Meniu
          </Link>

          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            Room Service Live · Vila Casa Esy
            <span className="w-8 h-px bg-[#c69a3f]/60" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,5vw,4rem)] font-normal leading-tight text-white">
            Progresul Comenzii{" "}
            <em className="italic text-[#c69a3f]">#{orderCode.toUpperCase()}</em>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-xl mx-auto font-light">
            Statusul comenzii tale se actualizează automat în timp real pe măsură ce bucătăria pregătește și trimite preparatele spre camera ta.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[45px] md:h-[70px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-12">
        {loading ? (
          <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-12 text-center shadow-sm">
            <div className="h-8 w-48 mx-auto rounded-full bg-[#f1f5f9] animate-pulse mb-4" />
            <div className="h-4 w-64 mx-auto rounded-full bg-[#f8fafc] animate-pulse" />
          </div>
        ) : error || !order ? (
          <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-12 text-center shadow-sm">
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl text-[#0d2c5c]">
              {error || "Comanda nu a fost găsită"}
            </h2>
            <Link
              to="/places"
              className="mt-6 inline-block rounded-full bg-[#0d2c5c] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white no-underline hover:bg-[#c69a3f] hover:text-[#0d2c5c] transition"
            >
              Înapoi la Meniu
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Step-by-step Live Progress Card */}
            <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-6 sm:p-10 shadow-[0_15px_40px_-15px_rgba(13,44,92,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/35 flex items-center justify-center text-[#c69a3f]">
                    <BedDouble size={22} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">
                      Livrare Room Service în Cameră
                    </div>
                    <div className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-semibold text-[#0d2c5c]">
                      {order.location_label}
                    </div>
                  </div>
                </div>

                {order.booking_code && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8fafc] border border-[#e2e8f0] px-4 py-1.5 text-xs font-bold text-[#0d2c5c]">
                    <Sparkles size={13} className="text-[#c69a3f]" />
                    Sejur Activ #{order.booking_code.replace(/^#/, "")}
                  </span>
                )}
              </div>

              {/* 4 Steps Timeline */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={step.key}
                      className={`rounded-2xl border p-4 transition-all ${
                        isCurrent
                          ? "border-[#c69a3f] bg-[#fdf8ec]/70 shadow-md ring-2 ring-[#c69a3f]/20"
                          : done
                            ? "border-emerald-200 bg-emerald-50/40"
                            : "border-[#e2e8f0] bg-[#f8fafc] opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isCurrent
                              ? "bg-[#0d2c5c] text-[#e6b85c]"
                              : done
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-[#94a3b8] border border-[#e2e8f0]"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                          Pasul {idx + 1}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-[#0d2c5c]">{step.title}</div>
                      <div className="text-xs text-[#64748b] mt-0.5">{step.subtitle}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items & Summary Card */}
            <div className="rounded-[32px] border border-[#e2e8f0] bg-white p-6 sm:p-10 shadow-[0_15px_40px_-15px_rgba(13,44,92,0.08)]">
              <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-semibold text-[#0d2c5c] mb-5">
                Detaliile Comenzii Tale
              </h2>

              <div className="divide-y divide-[#f1f5f9]">
                {order.items.map((item, i) => (
                  <div key={i} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d2c5c] text-white text-xs font-bold">
                        {item.qty}x
                      </span>
                      <span className="font-semibold text-[15px] text-[#0d2c5c]">{item.title}</span>
                    </div>
                    <span className="font-bold text-[15px] text-[#0d2c5c]">
                      {lei(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mt-4 rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/30 p-3.5 text-xs text-[#8a6420]">
                  <strong>Preferințe transmise bucătăriei:</strong> „{order.notes}”
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
                  {order.payment_method === "card" ? (
                    <>
                      <CreditCard size={15} className="text-[#c69a3f]" /> Plată cu Cardul la livrare (POS Mobil)
                    </>
                  ) : order.payment_method === "cash" ? (
                    <>
                      <Banknote size={15} className="text-[#c69a3f]" /> Plată Numerar la livrare
                    </>
                  ) : (
                    <>
                      <Receipt size={15} className="text-[#c69a3f]" /> Trecut pe Contul Camerei
                    </>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-[#94a3b8] block">
                    Total Comandă
                  </span>
                  <span className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#0d2c5c]">
                    {lei(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
