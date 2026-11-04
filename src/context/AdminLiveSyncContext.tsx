import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { RefreshCw } from "lucide-react";
import { WS_URL } from "../lib/config";
import {
  subscribeToBroadcastSync,
  emitSyncMutation,
  type SyncTopic,
  type SyncMessage,
} from "../lib/broadcastSync";

export type WebSocketEvent = {
  event: string;
  [key: string]: any;
};

export type { SyncTopic };

type ConnectionStatus = "connected" | "connecting" | "disconnected";

interface AdminLiveSyncContextType {
  status: ConnectionStatus;
  lastEvent: WebSocketEvent | null;
  subscribe: (
    topic: SyncTopic,
    callback: (event: WebSocketEvent) => void
  ) => () => void;
  sendPing: () => void;
  notifyMutation: (topic: SyncTopic | SyncTopic[], meta?: { path?: string; action?: string }) => void;
}

const AdminLiveSyncContext = createContext<AdminLiveSyncContextType | null>(null);

const TOPIC_EVENT_MAP: Record<SyncTopic, string[]> = {
  bookings: [
    "new_booking_confirmed",
    "room_booked",
    "room_released",
    "payment_confirmed",
    "booking_updated",
    "bookings_updated",
    "rooms_updated",
  ],
  units: [
    "rooms_updated",
    "units_updated",
    "unit_assigned",
    "guest_checked_in",
    "door_unlocked",
    "room_booked",
    "room_released",
    "payment_confirmed",
    "booking_updated",
  ],
  rooms: [
    "rooms_updated",
    "room_booked",
    "room_released",
    "pricing_updated",
    "facilities_updated",
  ],
  smartlocks: [
    "door_unlocked",
    "guest_checked_in",
    "pin_created",
    "smartlock_event",
    "lock_access_granted",
    "lock_access_denied",
    "payment_confirmed",
    "room_booked",
    "units_updated",
  ],
  pricing: [
    "pricing_updated",
    "rooms_updated",
    "pricing_rule_applied",
    "pricing_rule_removed",
  ],
  facilities: [
    "facilities_updated",
    "rooms_updated",
  ],
  nomenclature: [
    "facilities_updated",
    "rooms_updated",
  ],
  places: [
    "places_updated",
    "menu_updated",
  ],
  menu: [
    "menu_updated",
    "places_updated",
  ],
  users: [
    "users_updated",
    "user_updated",
    "user_deleted",
  ],
  audit: [
    "booking_updated",
    "door_unlocked",
    "guest_checked_in",
    "new_booking_confirmed",
    "room_booked",
    "room_released",
    "users_updated",
    "audit_log_created",
    "rooms_updated",
    "units_updated",
  ],
  lost_found: [
    "lost_found_updated",
    "lost_found_item_claimed",
    "lost_found_item_shipped",
  ],
  analytics: [
    "new_booking_confirmed",
    "payment_confirmed",
    "booking_updated",
    "pricing_updated",
  ],
  all: [],
};

export function AdminLiveSyncProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backoffRef = useRef(1000);
  const subscribersRef = useRef<Map<SyncTopic, Set<(ev: WebSocketEvent) => void>>>(
    new Map()
  );

  // Distribuie evenimente către toți abonații pe topicuri
  const notifySubscribers = useCallback(
    (ev: WebSocketEvent, targetTopics?: SyncTopic[]) => {
      const eventName = ev.event;
      if (!eventName && !targetTopics) return;

      subscribersRef.current.forEach((callbacks, topic) => {
        let isMatch = false;

        // 1. Potrivire directă prin topicuri specificate (ex: din BroadcastChannel)
        if (targetTopics && (targetTopics.includes(topic) || targetTopics.includes("all") || topic === "all")) {
          isMatch = true;
        }

        // 2. Potrivire pe baza TOPIC_EVENT_MAP (ex: din WebSockets)
        if (!isMatch) {
          if (topic === "all") {
            isMatch = true;
          } else {
            const allowed = TOPIC_EVENT_MAP[topic] || [];
            isMatch = allowed.includes(eventName);
          }
        }

        if (isMatch) {
          callbacks.forEach((cb) => {
            try {
              cb(ev);
            } catch (err) {
              console.error(`[LiveSync] Error executing callback for topic '${topic}':`, err);
            }
          });
        }
      });
    },
    []
  );

  // 1. ASCULTĂTOR NATIV BROWSER: BroadcastChannel (comunicare inter-taburi fără server)
  useEffect(() => {
    const unsubscribeBroadcast = subscribeToBroadcastSync((msg: SyncMessage) => {
      // Un alt tab sau fereastră din acest browser a făcut o mutație (POST/PATCH/DELETE)
      notifySubscribers(
        {
          event: "broadcast_sync",
          source: "BroadcastChannel",
          ...msg,
        },
        msg.topics
      );
    });

    return () => {
      unsubscribeBroadcast();
    };
  }, [notifySubscribers]);

  // 2. ASCULTĂTOR RECONECTARE ȘI WEBSOCKETS (sincronizare între computere / server)
  const connect = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    let raw = (WS_URL || "wss://backend-licenta-i0lr.onrender.com").trim();
    if (!raw.startsWith("ws://") && !raw.startsWith("wss://")) {
      raw = raw.replace(/^https?:\/\//, (m: string) =>
        m.startsWith("https") ? "wss://" : "ws://"
      );
    }
    const endpoint = `${raw.replace(/\/$/, "")}/ws/live`;

    setStatus("connecting");

    try {
      const ws = new WebSocket(endpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        backoffRef.current = 1000;

        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const parsed: WebSocketEvent = JSON.parse(event.data);
          console.log("[WebSocket LiveSync] Event received:", parsed);
          setLastEvent(parsed);
          notifySubscribers(parsed);
        } catch {
          // Ignore non-json
        }
      };

      ws.onclose = () => {
        setStatus("disconnected");
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        const delay = Math.min(backoffRef.current, 15000);
        backoffRef.current = Math.min(backoffRef.current * 1.5, 15000);

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          // ignore
        }
      };
    } catch {
      setStatus("disconnected");
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [notifySubscribers]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // ignore
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("ping");
    }
  }, []);

  const notifyMutation = useCallback(
    (topic: SyncTopic | SyncTopic[], meta?: { path?: string; action?: string }) => {
      emitSyncMutation(topic, meta);
    },
    []
  );

  const subscribe = useCallback(
    (topic: SyncTopic, callback: (event: WebSocketEvent) => void) => {
      if (!subscribersRef.current.has(topic)) {
        subscribersRef.current.set(topic, new Set());
      }
      const set = subscribersRef.current.get(topic)!;
      set.add(callback);

      return () => {
        set.delete(callback);
      };
    },
    []
  );

  return (
    <AdminLiveSyncContext.Provider
      value={{
        status,
        lastEvent,
        subscribe,
        sendPing,
        notifyMutation,
      }}
    >
      {children}
    </AdminLiveSyncContext.Provider>
  );
}

/**
 * Hook universal de sincronizare live pentru orice componentă / tab din Admin:
 * 1. Ascultă mutațiile emise de alte taburi prin BroadcastChannel nativ (0ms).
 * 2. Ascultă evenimentele sosite prin WebSockets de pe server.
 * 3. Re-sincronizează datele când utilizatorul dă click pe tab (window.onfocus / visibilitychange).
 */
export function useAdminLiveSync({
  topic,
  onSync,
  enabled = true,
  debounceMs = 50,
  refetchOnFocus = true,
}: {
  topic: SyncTopic;
  onSync: (event?: WebSocketEvent) => void | Promise<void>;
  enabled?: boolean;
  debounceMs?: number;
  refetchOnFocus?: boolean;
}) {
  const context = useContext(AdminLiveSyncContext);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestEventRef = useRef<WebSocketEvent | undefined>(undefined);

  const executeSync = useCallback(async (ev?: WebSocketEvent) => {
    setIsSyncing(true);
    try {
      await Promise.resolve(onSyncRef.current(ev));
      setLastSyncTime(new Date());
    } catch (err) {
      console.error(`[LiveSync] Sync handler failed for topic '${topic}':`, err);
    } finally {
      setIsSyncing(false);
    }
  }, [topic]);

  const triggerDebouncedSync = useCallback(
    (ev?: WebSocketEvent) => {
      latestEventRef.current = ev;
      setIsSyncing(true);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void executeSync(latestEventRef.current);
      }, debounceMs);
    },
    [debounceMs, executeSync]
  );

  // 1. Ascultă evenimentele de pe busul centralizat (WebSockets + BroadcastChannel)
  useEffect(() => {
    if (!enabled) return;

    if (context) {
      const unsubscribe = context.subscribe(topic, (ev) => {
        triggerDebouncedSync(ev);
      });

      return () => {
        unsubscribe();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    } else {
      // Fallback direct pe BroadcastChannel dacă nu este în Provider
      const unsubscribe = subscribeToBroadcastSync((msg) => {
        if (topic === "all" || msg.topics.includes(topic) || msg.topics.includes("all")) {
          triggerDebouncedSync({
            event: "broadcast_sync",
            source: "BroadcastChannel",
            ...msg,
          });
        }
      });

      return () => {
        unsubscribe();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
  }, [context, topic, enabled, triggerDebouncedSync]);

  // 2. Ascultă focalizarea ferestrei (window focus & tab switch visibilitychange)
  useEffect(() => {
    if (!enabled || !refetchOnFocus) return;

    const handleFocus = () => {
      triggerDebouncedSync({ event: "window_focus", topic });
    };

    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        triggerDebouncedSync({ event: "tab_visible", topic });
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, refetchOnFocus, topic, triggerDebouncedSync]);

  return {
    isConnected: context?.status === "connected",
    connectionStatus: context?.status || "disconnected",
    isSyncing,
    lastSyncTime,
    lastEvent: context?.lastEvent || null,
    triggerSync: () => triggerDebouncedSync({ event: "manual_trigger", topic }),
  };
}

export function LiveSyncBadge({
  isSyncing = false,
  status = "connected",
}: {
  isSyncing?: boolean;
  status?: ConnectionStatus;
}) {
  if (isSyncing) {
    return (
      <div
        title="Datele se actualizează automat prin BroadcastChannel & WebSocket"
        className="inline-flex items-center gap-1.5 rounded-full border border-[#c69a3f]/30 bg-[#fdf8ec] px-3 py-1 text-[11px] font-semibold text-[#8c6b23] shadow-sm transition-all"
      >
        <RefreshCw size={11} className="animate-spin text-[#c69a3f]" />
        <span>Sincronizare live…</span>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div
        title="Se restabilește conexiunea WebSocket…"
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-50/80 px-3 py-1 text-[11px] font-semibold text-amber-800 shadow-sm transition-all"
      >
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Reconectare…</span>
      </div>
    );
  }

  if (status === "disconnected") {
    return (
      <div
        title="BroadcastChannel activ (sincronizare locală între taburi garantată)."
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/70 px-3 py-1 text-[11px] font-semibold text-emerald-800 shadow-sm transition-all"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span>Live Tab Sync</span>
      </div>
    );
  }

  return (
    <div
      title="Sincronizare instantanee activă prin BroadcastChannel nativ și WebSockets."
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/70 px-3 py-1 text-[11px] font-semibold text-emerald-800 shadow-sm transition-all"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>Live Sync</span>
    </div>
  );
}
