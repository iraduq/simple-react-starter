import React, { useEffect, useState, useTransition } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Calendar,
  Info,
  AlertTriangle,
  X,
  ArrowRight,
  Radio,
  Volume2,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useAdminLiveSyncContext } from "../../context/AdminLiveSyncContext";

export interface BroadcastItem {
  id: number;
  title: string;
  message: string;
  type: "offer" | "event" | "announcement" | "urgent" | string;
  target_audience: string;
  cta_text?: string | null;
  cta_link?: string | null;
  priority: string;
  is_active: boolean;
  expires_at?: string | null;
  created_at?: string | null;
}

const STORAGE_KEY = "casaesy_dismissed_broadcasts";

function getDismissedIds(): number[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDismissedId(id: number) {
  try {
    const list = getDismissedIds();
    if (!list.includes(id)) {
      list.push(id);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore storage exceptions
  }
}

export default function BroadcastAlertBanner() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>(getDismissedIds);
  const liveSync = useAdminLiveSyncContext();
  const lastEvent = liveSync?.lastEvent;
  const location = useLocation();

  // Auto-dismiss countdown (8 seconds)
  const AUTO_DISMISS_MS = 8000;
  const [remainingMs, setRemainingMs] = useState(AUTO_DISMISS_MS);
  const [isPaused, setIsPaused] = useState(false);

  // Load active notifications
  useEffect(() => {
    let mounted = true;
    apiFetch<BroadcastItem[]>("/notifications/active")
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setBroadcasts(data);
        }
      })
      .catch(() => {
        // quiet fallback
      });
    return () => {
      mounted = false;
    };
  }, []);

  // React in real-time to WebSocket broadcast events
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.event === "new_broadcast_alert" && lastEvent.data) {
      const newItem = lastEvent.data as BroadcastItem;
      if ((newItem.target_audience || "all") !== "all") {
        apiFetch<BroadcastItem[]>("/notifications/active")
          .then((data) => {
            if (Array.isArray(data)) setBroadcasts(data);
          })
          .catch(() => {});
        return;
      }
      setBroadcasts((prev) => {
        const filtered = prev.filter((b) => b.id !== newItem.id);
        return [newItem, ...filtered];
      });
    } else if (lastEvent.event === "broadcast_updated" && lastEvent.data) {
      const updated = lastEvent.data as BroadcastItem;
      if ((updated.target_audience || "all") !== "all") {
        apiFetch<BroadcastItem[]>("/notifications/active")
          .then((data) => {
            if (Array.isArray(data)) setBroadcasts(data);
          })
          .catch(() => {});
        return;
      }
      setBroadcasts((prev) =>
        prev
          .map((b) => (b.id === updated.id ? updated : b))
          .filter((b) => b.is_active)
      );
    } else if (lastEvent.event === "broadcast_deleted" && lastEvent.id) {
      setBroadcasts((prev) => prev.filter((b) => b.id !== lastEvent.id));
    }
  }, [lastEvent]);

  // Filter out dismissed items
  const activeList = broadcasts.filter(
    (b) => b.is_active && !dismissedIds.includes(b.id)
  );

  const current = activeList.length > 0 ? activeList[0] : null;

  useEffect(() => {
    if (!current) return;
    setRemainingMs(AUTO_DISMISS_MS);
  }, [current?.id]);

  useEffect(() => {
    if (!current || isPaused) return;
    const interval = 100;
    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= interval) {
          clearInterval(timer);
          handleDismiss(current.id);
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [current?.id, isPaused]);

  const handleDismiss = (id: number) => {
    saveDismissedId(id);
    setDismissedIds((prev) => [...prev, id]);
  };

  const getStyleForType = (type: string) => {
    switch (type) {
      case "urgent":
        return {
          cardBorder: "border-rose-200",
          badgeBg: "bg-rose-50 border-rose-200 text-rose-700",
          iconBg: "bg-rose-50 border-rose-200 text-rose-600",
          icon: AlertTriangle,
          accentColor: "from-rose-500 to-red-600",
          ctaBg: "bg-rose-600 hover:bg-rose-700 text-white",
          label: "Notificare urgentă",
        };
      case "event":
        return {
          cardBorder: "border-[#0d2c5c]/15",
          badgeBg: "bg-[#f0f4fa] border-[#0d2c5c]/15 text-[#0d2c5c]",
          iconBg: "bg-[#f0f4fa] border-[#0d2c5c]/15 text-[#0d2c5c]",
          icon: Calendar,
          accentColor: "from-[#0d2c5c] to-[#1d4ed8]",
          ctaBg: "bg-[#0d2c5c] hover:bg-[#163d7a] text-white",
          label: "Eveniment resort",
        };
      case "announcement":
        return {
          cardBorder: "border-sky-200",
          badgeBg: "bg-sky-50 border-sky-200 text-sky-700",
          iconBg: "bg-sky-50 border-sky-200 text-sky-600",
          icon: Info,
          accentColor: "from-[#0284c7] to-[#38bdf8]",
          ctaBg: "bg-[#0284c7] hover:bg-[#0369a1] text-white",
          label: "Anunț important",
        };
      case "offer":
      default:
        return {
          cardBorder: "border-[#c69a3f]/35",
          badgeBg: "bg-[#fdf8ed] border-[#c69a3f]/35 text-[#9a7020]",
          iconBg: "bg-[#fdf8ed] border-[#c69a3f]/35 text-[#c69a3f]",
          icon: Sparkles,
          accentColor: "from-[#c69a3f] to-[#e5b95c]",
          ctaBg: "bg-[#0d2c5c] hover:bg-[#163d7a] text-white",
          label: "Ofertă specială",
        };
    }
  };

  const isAdminPath = location.pathname.startsWith("/admin");
  if (isAdminPath || !current) return null;

  const style = getStyleForType(current.type);
  const IconComponent = style.icon;

  return (
    <aside
      aria-label="Notificări și alerte de la hotel"
      className="fixed bottom-6 left-4 sm:left-6 md:left-8 z-[8000] max-w-sm sm:max-w-[400px] w-[calc(100vw-32px)] sm:w-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`relative rounded-[22px] bg-white/95 backdrop-blur-xl p-5 border ${style.cardBorder} shadow-[0_20px_50px_rgba(13,44,92,0.16)] overflow-hidden`}
        >
          {/* Subtle top accent strip */}
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${style.accentColor}`}
          />

          <div className="flex items-start gap-3.5">
            {/* Type Icon */}
            <div className="relative shrink-0 mt-0.5">
              <div className={`w-10 h-10 rounded-[14px] border flex items-center justify-center ${style.iconBg}`}>
                <IconComponent size={18} />
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0 pr-5">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-bold tracking-[0.12em] uppercase border ${style.badgeBg}`}
                >
                  {style.label}
                </span>
                <span className="text-[10.5px] font-semibold tracking-wide uppercase text-[#94a3b8] font-['Plus_Jakarta_Sans',sans-serif]">
                  Casa Esy
                </span>
              </div>

              <h4 className="font-['Outfit',sans-serif] text-[16px] font-bold !text-[#0d2c5c] leading-snug">
                {current.title}
              </h4>
              <p className="mt-1 text-[13px] !text-[#5b6e8d] font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed line-clamp-3">
                {current.message}
              </p>

              {/* Action Link / Button if provided */}
              {current.cta_text && (
                <div className="mt-3.5 flex items-center gap-2">
                  {current.cta_link ? (
                    <Link
                      to={current.cta_link}
                      onClick={() => handleDismiss(current.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-[10px] ${style.ctaBg} text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-bold transition shadow-sm active:scale-[0.98]`}
                    >
                      <span>{current.cta_text}</span>
                      <ArrowRight size={13} className="text-[#c69a3f]" />
                    </Link>
                  ) : (
                    <span className="text-[12px] font-bold text-[#c69a3f]">
                      {current.cta_text}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => handleDismiss(current.id)}
              title="Închide notificarea"
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0d2c5c] flex items-center justify-center transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Auto-dismiss countdown progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#f1f5f9] overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${style.accentColor} transition-all duration-100 ease-linear`}
              style={{ width: `${(remainingMs / AUTO_DISMISS_MS) * 100}%` }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
