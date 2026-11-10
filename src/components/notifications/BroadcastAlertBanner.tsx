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
      setBroadcasts((prev) => {
        const filtered = prev.filter((b) => b.id !== newItem.id);
        return [newItem, ...filtered];
      });
    } else if (lastEvent.event === "broadcast_updated" && lastEvent.data) {
      const updated = lastEvent.data as BroadcastItem;
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

  if (activeList.length === 0) return null;

  // Show the latest broadcast item
  const current = activeList[0];

  const handleDismiss = (id: number) => {
    saveDismissedId(id);
    setDismissedIds((prev) => [...prev, id]);
  };

  const getStyleForType = (type: string) => {
    switch (type) {
      case "urgent":
        return {
          cardBg: "bg-[#0b1c33]/95 border-red-500/40 shadow-[0_12px_36px_rgba(239,68,68,0.25)]",
          badgeBg: "bg-red-500/15 border-red-500/30 text-red-400",
          icon: AlertTriangle,
          iconColor: "text-red-400",
          accentColor: "from-red-500 to-rose-600",
          label: "NOTIFICARE URGENTĂ",
        };
      case "event":
        return {
          cardBg: "bg-[#071d3d]/95 border-[#00a896]/40 shadow-[0_12px_36px_rgba(0,168,150,0.22)]",
          badgeBg: "bg-[#00a896]/15 border-[#00a896]/30 text-[#00c9b7]",
          icon: Calendar,
          iconColor: "text-[#00c9b7]",
          accentColor: "from-[#00a896] to-[#0284c7]",
          label: "EVENIMENT HOTEL",
        };
      case "announcement":
        return {
          cardBg: "bg-[#0b1b36]/95 border-[#0284c7]/40 shadow-[0_12px_36px_rgba(2,132,199,0.22)]",
          badgeBg: "bg-[#0284c7]/15 border-[#0284c7]/30 text-sky-400",
          icon: Info,
          iconColor: "text-sky-400",
          accentColor: "from-[#0284c7] to-[#3b82f6]",
          label: "ANUNȚ IMPORTANT",
        };
      case "offer":
      default:
        return {
          cardBg: "bg-[#0a1d3a]/95 border-[#c69a3f]/40 shadow-[0_12px_36px_rgba(198,154,63,0.22)]",
          badgeBg: "bg-[#c69a3f]/15 border-[#c69a3f]/30 text-[#e6be65]",
          icon: Sparkles,
          iconColor: "text-[#e6be65]",
          accentColor: "from-[#c69a3f] to-[#f59e0b]",
          label: "OFERTĂ SPECIALĂ",
        };
    }
  };

  const style = getStyleForType(current.type);
  const IconComponent = style.icon;

  // Auto-dismiss countdown (8 seconds)
  const AUTO_DISMISS_MS = 8000;
  const [remainingMs, setRemainingMs] = useState(AUTO_DISMISS_MS);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
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

  // Don't cover admin panel view
  const isAdminPath = location.pathname.startsWith("/admin");
  if (isAdminPath) return null;

  return (
    <aside
      aria-label="Notificări și alerte de la hotel"
      className="fixed bottom-6 left-4 sm:left-6 md:left-8 z-[8000] max-w-sm sm:max-w-md w-[calc(100vw-32px)] sm:w-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: -40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`relative rounded-[22px] backdrop-blur-xl p-5 border text-white ${style.cardBg} overflow-hidden`}
        >
          {/* Subtle top glowing accent strip */}
          <div
            className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${style.accentColor}`}
          />

          <div className="flex items-start gap-3.5">
            {/* Type Icon with pulse circle */}
            <div className="relative shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
                <IconComponent size={19} className={style.iconColor} />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c69a3f]"></span>
              </span>
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-bold tracking-wider uppercase border ${style.badgeBg} flex items-center gap-1.5`}
                >
                  <Radio size={11} className="animate-pulse" />
                  {current.type === "urgent"
                    ? "Notificare urgentă"
                    : current.type === "event"
                      ? "Eveniment hotel"
                      : current.type === "announcement"
                        ? "Anunț important"
                        : "Ofertă specială"}
                </span>
                <span className="text-[11px] text-white/50 font-['Plus_Jakarta_Sans',sans-serif]">
                  Casa Esy Live
                </span>
              </div>

              <h4 className="font-['Outfit',sans-serif] text-[16px] font-bold text-white leading-snug">
                {current.title}
              </h4>
              <p className="mt-1 text-[13px] text-slate-200 font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed line-clamp-3">
                {current.message}
              </p>

              {/* Action Link / Button if provided */}
              {current.cta_text && (
                <div className="mt-3.5 flex items-center gap-2">
                  {current.cta_link ? (
                    <Link
                      to={current.cta_link}
                      onClick={() => handleDismiss(current.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-[12px] bg-gradient-to-r ${style.accentColor} hover:brightness-110 text-[#0d2c5c] text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-bold transition shadow-md active:scale-95`}
                    >
                      <span>{current.cta_text}</span>
                      <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <span className="text-[12px] font-bold text-amber-300">
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
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition"
            >
              <X size={15} />
            </button>
          </div>

          {/* Auto-dismiss countdown progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/10 overflow-hidden">
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
