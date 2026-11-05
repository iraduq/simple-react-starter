import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChefHat,
  Clock,
  BedDouble,
  ArrowLeft,
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
      {/* Hero section */}
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

      {/* Conținut deschis, fără carduri */}
      <section className="max-w-3xl mx-auto px-5 py-14">
        {loading ? (
          <div className="py-16 text-center">
            <div className="h-6 w-48 mx-auto bg-[#f1f5f9] animate-pulse mb-3" />
            <div className="h-4 w-64 mx-auto bg-[#f8fafc] animate-pulse" />
          </div>
        ) : error || !order ? (
          <div className="py-16 text-center border-t border-b border-[#0d2c5c]/10">
            <h2 className="font-['Cormorant_Garamond',serif] text-3xl text-[#0d2c5c]">
              {error || "Comanda nu a fost găsită"}
            </h2>
            <Link
              to="/places"
              className="mt-6 inline-block border-b-2 border-[#0d2c5c] pb-1 text-xs font-bold uppercase tracking-widest text-[#0d2c5c] no-underline hover:text-[#c69a3f] hover:border-[#c69a3f] transition"
            >
              Înapoi la Meniu
            </Link>
          </div>
        ) : (
          <div className="space-y-14">
            {/* Antet Livrare în Cameră */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 pb-6 border-b border-[#0d2c5c]/15">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c69a3f] block mb-1">
                  Destinație Room Service
                </span>
                <div className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-normal text-[#0d2c5c] flex items-center gap-2.5">
                  <BedDouble size={24} className="text-[#c69a3f]" />
                  {order.location_label}
                </div>
              </div>

              {order.booking_code && (
                <div className="text-right">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#94a3b8] block">
                    Rezervare Activă
                  </span>
                  <span className="font-['Cormorant_Garamond',serif] text-2xl font-semibold text-[#0d2c5c]">
                    #{order.booking_code.replace(/^#/, "")}
                  </span>
                </div>
              )}
            </div>

            {/* Linie de progres conectată (fără carduri!) */}
            <div className="py-2">
              <div className="relative">
                {/* Linia orizontală de legătură pe desktop */}
                <div className="hidden sm:block absolute top-5 left-[12%] right-[12%] h-[2px] bg-[#0d2c5c]/12" />
                <div
                  className="hidden sm:block absolute top-5 left-[12%] h-[2px] bg-[#c69a3f] transition-all duration-500"
                  style={{
                    width: `${(currentStepIdx / (STEPS.length - 1)) * 76}%`,
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 relative z-10">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const done = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div
                        key={step.key}
                        className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            isCurrent
                              ? "bg-[#0d2c5c] text-[#e6b85c] ring-4 ring-[#c69a3f]/25"
                              : done
                                ? "bg-[#c69a3f] text-[#0d2c5c]"
                                : "bg-white text-[#94a3b8] border border-[#0d2c5c]/20"
                          }`}
                        >
                          <Icon size={17} />
                        </div>
                        <div>
                          <div
                            className={`text-xs font-bold uppercase tracking-[0.14em] ${
                              done ? "text-[#0d2c5c]" : "text-[#94a3b8]"
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

            {/* Nota de Comandă (fără carduri, cu linii punctate ca într-un meniu de restaurant) */}
            <div className="pt-8 border-t border-[#0d2c5c]/15">
              <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-normal text-[#0d2c5c] mb-6">
                Preparatele Comandate
              </h2>

              <div className="divide-y divide-[#0d2c5c]/10">
                {order.items.map((item, i) => (
                  <div key={i} className="py-3.5 flex items-baseline gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#c69a3f] shrink-0">
                      {item.qty} ×
                    </span>
                    <span className="font-['Cormorant_Garamond',serif] text-[21px] font-semibold text-[#0d2c5c]">
                      {item.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex-1 border-b border-dotted border-[#0d2c5c]/25 mx-2"
                    />
                    <span className="font-['Cormorant_Garamond',serif] text-[21px] font-bold text-[#0d2c5c] shrink-0">
                      {lei(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="mt-5 font-['Cormorant_Garamond',serif] italic text-[18px] text-[#64748b]">
                  Mențiuni pentru bucătărie: „{order.notes}”
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-[#0d2c5c]/20 flex flex-wrap items-baseline justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#475569]">
                  {order.payment_method === "card" ? (
                    <>
                      <CreditCard size={15} className="text-[#c69a3f]" /> Plată cu Cardul la livrare (POS)
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

                <div className="flex items-baseline gap-4">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">
                    Total
                  </span>
                  <span className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#0d2c5c]">
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
