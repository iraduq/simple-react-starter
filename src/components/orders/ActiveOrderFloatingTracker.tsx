import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Clock,
  Bike,
  CheckCircle2,
  ArrowRight,
  X,
  Minimize2,
  Maximize2,
  BedDouble,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminLiveSyncContext } from "../../context/AdminLiveSyncContext";

export interface ActiveOrderData {
  id: string;
  order_code: string;
  location_label: string;
  booking_code?: string | null;
  items: Array<{ id: string; title: string; price: number; qty: number }>;
  total_amount: number;
  payment_method: string;
  status: "new" | "preparing" | "delivering" | "delivered" | "cancelled";
  created_at?: string | null;
  updated_at?: string | null;
}

const STORAGE_ACTIVE_CODE = "casa_esy_active_order_code";
const STORAGE_DISMISSED_KEY = "casa_esy_dismissed_order_code";

const STATUS_CONFIG: Record<
  string,
  {
    stepIndex: number;
    title: string;
    subtitle: string;
    badgeCls: string;
    icon: typeof ChefHat;
    iconColor: string;
  }
> = {
  new: {
    stepIndex: 1,
    title: "Comandă Înregistrată",
    subtitle: "Așteaptă preluarea în bucătărie",
    badgeCls: "bg-[#0d2c5c]/10 text-[#0d2c5c] border-[#0d2c5c]/20",
    icon: Clock,
    iconColor: "text-[#c69a3f]",
  },
  preparing: {
    stepIndex: 2,
    title: "În Preparare în Bucătărie",
    subtitle: "Se gătește proaspăt acum de către bucătar",
    badgeCls: "bg-[#fdf8ec] text-[#8a6420] border-[#c69a3f]/35",
    icon: ChefHat,
    iconColor: "text-[#c69a3f]",
  },
  delivering: {
    stepIndex: 3,
    title: "În Drum spre Cameră",
    subtitle: "Personalul livrează comanda chiar acum",
    badgeCls: "bg-[#0d2c5c]/10 text-[#0d2c5c] border-[#0d2c5c]/20",
    icon: Bike,
    iconColor: "text-[#0d2c5c]",
  },
  delivered: {
    stepIndex: 4,
    title: "Livrată în Cameră",
    subtitle: "Predată cu succes · Poftă bună!",
    badgeCls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
  },
};

export default function ActiveOrderFloatingTracker() {
  const [order, setOrder] = useState<ActiveOrderData | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [dismissedCode, setDismissedCode] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_DISMISSED_KEY);
    } catch {
      return null;
    }
  });

  const location = useLocation();
  const liveSync = useAdminLiveSyncContext();
  const lastEvent = liveSync?.lastEvent;
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Verifică comanda activă fie din endpoint-ul autentificat, fie din codul salvat local
  const checkActiveOrder = useCallback(async () => {
    try {
      // 1. Încercăm din API pentru utilizatorul curent
      const userActive = await apiFetch<ActiveOrderData | null>("/orders/my-active").catch(() => null);
      if (userActive && userActive.order_code) {
        if (userActive.status === "cancelled") {
          setOrder(null);
          return;
        }
        setOrder(userActive);
        try {
          localStorage.setItem(STORAGE_ACTIVE_CODE, userActive.order_code);
        } catch {}
        return;
      }

      // 2. Fallback: codul salvat în localStorage când a trimis comanda
      let localCode: string | null = null;
      try {
        localCode = localStorage.getItem(STORAGE_ACTIVE_CODE);
      } catch {}

      if (localCode) {
        const tracked = await apiFetch<ActiveOrderData>(`/orders/track/${encodeURIComponent(localCode)}`).catch(
          () => null
        );
        if (tracked && tracked.order_code && tracked.status !== "cancelled") {
          setOrder(tracked);
          return;
        }
      }

      setOrder(null);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void checkActiveOrder();
  }, [checkActiveOrder]);

  // Ascultăm evenimente de comandă din același tab (PlaceMenu)
  useEffect(() => {
    const handleActiveOrderChanged = () => {
      setDismissedCode(null);
      void checkActiveOrder();
    };
    window.addEventListener("casa-esy-active-order-changed", handleActiveOrderChanged);
    window.addEventListener("live-orders-sync", handleActiveOrderChanged);
    return () => {
      window.removeEventListener("casa-esy-active-order-changed", handleActiveOrderChanged);
      window.removeEventListener("live-orders-sync", handleActiveOrderChanged);
    };
  }, [checkActiveOrder]);

  // Actualizare live instantă prin WebSockets
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.event === "orders_updated" || lastEvent.event === "new_room_service_order") {
      // Dacă evenimentul conține detalii directe despre comanda curentă
      if (order && lastEvent.order_code && lastEvent.order_code.toUpperCase() === order.order_code.toUpperCase()) {
        if (lastEvent.status) {
          setOrder((prev) => (prev ? { ...prev, status: lastEvent.status } : null));
        } else {
          void checkActiveOrder();
        }
      } else {
        void checkActiveOrder();
      }
    }
  }, [lastEvent, order, checkActiveOrder]);

  // Polling de siguranță rar (la fiecare 45 secunde) dacă WebSocket-ul ar fi deconectat
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      void checkActiveOrder();
    }, 45000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [checkActiveOrder]);

  // Dacă utilizatorul se află deja pe pagina completă de tracking /comanda/:orderCode, ascundem widgetul
  if (location.pathname.startsWith("/comanda/")) {
    return null;
  }

  // Nu afișăm dacă nu există comandă activă sau a fost închisă manual
  if (!order) return null;
  if (dismissedCode === order.order_code) return null;

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
  const Icon = config.icon;

  const handleDismiss = () => {
    setDismissedCode(order.order_code);
    try {
      sessionStorage.setItem(STORAGE_DISMISSED_KEY, order.order_code);
    } catch {}
  };

  return (
    <aside aria-label="Stadiu comandă room service">
      <AnimatePresence>
        {minimized ? (
          // Mod comprimat: Pastilă discretă plutitoare
          <motion.div
            key="minimized-pill"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-4 sm:right-6 md:right-8 z-[8500]"
          >
            <div className="flex items-center gap-2 bg-[#0d2c5c] text-white rounded-full px-4 py-2.5 shadow-[0_12px_36px_rgba(13,44,92,0.28)] border border-[#c69a3f]/40">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>

              <Icon size={16} className="text-[#e6b85c]" />

              <span className="text-xs font-bold font-['Outfit',sans-serif]">
                Room Service #{order.order_code}:
              </span>

              <span className="text-xs text-white/90 font-medium">
                {config.title}
              </span>

              <button
                type="button"
                onClick={() => setMinimized(false)}
                className="ml-1 p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
                title="Extinde detaliile"
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </motion.div>
        ) : (
          // Mod complet: Card plutitor elegant cu brand palette (Navy & Gold)
          <motion.div
            key="expanded-card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-4 sm:right-6 md:right-8 z-[8500] w-[calc(100vw-32px)] sm:w-[380px] max-w-[390px]"
          >
            <div className="rounded-2xl bg-white border border-[#e1e8f0] shadow-[0_18px_50px_rgba(13,44,92,0.18)] overflow-hidden">
              {/* Top Accent Strip */}
              <div
                className={`h-1.5 w-full ${
                  order.status === "delivered"
                    ? "bg-emerald-600"
                    : order.status === "preparing"
                      ? "bg-[#c69a3f]"
                      : "bg-[#0d2c5c]"
                }`}
              />

              <div className="p-4 sm:p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#8a6420]">
                      Room Service Live
                    </span>
                    <span className="text-[10px] text-[#64748b]">· WebSockets</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMinimized(true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-[#0d2c5c] hover:bg-slate-100 transition cursor-pointer"
                      title="Minimizează"
                    >
                      <Minimize2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                      title="Închide alerta"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      order.status === "delivered"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : order.status === "preparing"
                          ? "bg-[#fdf8ec] text-[#8a6420] border-[#c69a3f]/35"
                          : "bg-[#0d2c5c]/5 text-[#0d2c5c] border-[#0d2c5c]/10"
                    }`}
                  >
                    <Icon size={20} className={config.iconColor} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-['Outfit',sans-serif] text-xs font-extrabold text-[#0d2c5c] bg-[#0d2c5c]/8 px-2 py-0.5 rounded border border-[#0d2c5c]/15">
                        #{order.order_code}
                      </span>
                      <span className="text-[11px] text-[#64748b] font-medium truncate">
                        {order.location_label}
                      </span>
                    </div>

                    <h4 className="font-['Outfit',sans-serif] font-bold text-[15px] text-[#0d2c5c] mt-1 leading-snug">
                      {config.title}
                    </h4>
                    <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">
                      {config.subtitle}
                    </p>
                  </div>
                </div>

                {/* 4-Step Mini Progress Indicator */}
                <div className="space-y-1.5 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[10.5px] font-semibold text-[#64748b]">
                    <span>Progres: Pasul {config.stepIndex} din 4</span>
                    <span className="text-[#0d2c5c] font-bold">
                      {order.status === "delivered"
                        ? "100%"
                        : order.status === "delivering"
                          ? "75%"
                          : order.status === "preparing"
                            ? "50%"
                            : "25%"}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => {
                      const isActive = step <= config.stepIndex;
                      const isCurrent = step === config.stepIndex;
                      return (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isCurrent
                              ? order.status === "delivered"
                                ? "bg-emerald-600 ring-2 ring-emerald-200"
                                : "bg-[#c69a3f] ring-2 ring-[#c69a3f]/25"
                              : isActive
                                ? "bg-[#0d2c5c]"
                                : "bg-slate-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Footer Action */}
                <Link
                  to={`/comanda/${order.order_code}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0d2c5c] hover:bg-[#07203f] text-white text-xs font-bold transition-all no-underline flex items-center justify-center gap-2 shadow-xs group"
                >
                  <span>Vezi stadiul și detaliile comenzii</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1 text-[#e6b85c]" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
