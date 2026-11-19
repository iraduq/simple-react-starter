import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "../lib/api";
import { fetchSession, onSessionChange } from "../lib/auth";
import { useAdminLiveSyncContext } from "../context/AdminLiveSyncContext";

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
const STORAGE_ACTIVE_OWNER = "casa_esy_active_order_owner";

function clearStoredOrder() {
  try {
    localStorage.removeItem(STORAGE_ACTIVE_CODE);
    localStorage.removeItem(STORAGE_ACTIVE_OWNER);
  } catch {
    // ignore
  }
}

export function useActiveRoomServiceOrder() {
  const [activeOrder, setActiveOrder] = useState<ActiveOrderData | null>(null);
  const [loading] = useState(false);
  const liveSync = useAdminLiveSyncContext();
  const lastEvent = liveSync?.lastEvent;
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchActiveOrder = useCallback(async () => {
    try {
      const sessionUser = await fetchSession();
      const currentOwner = sessionUser?.email ? sessionUser.email.toLowerCase() : null;

      // 1. Utilizator autentificat -> ne bazăm EXCLUSIV pe comanda activă din contul lui (/orders/my-active)
      if (currentOwner) {
        const userActive = await apiFetch<ActiveOrderData | null>("/orders/my-active").catch(() => null);
        if (userActive && userActive.order_code && userActive.status !== "cancelled") {
          setActiveOrder(userActive);
          try {
            localStorage.setItem(STORAGE_ACTIVE_CODE, userActive.order_code);
            localStorage.setItem(STORAGE_ACTIVE_OWNER, currentOwner);
          } catch {
            // ignore
          }
          return;
        }

        // Contul curent NU are comandă activă -> curățăm orice cod vechi rămas de la alt cont
        const storedOwner = (() => {
          try {
            return localStorage.getItem(STORAGE_ACTIVE_OWNER);
          } catch {
            return null;
          }
        })();
        if (storedOwner !== currentOwner) {
          clearStoredOrder();
        }
        setActiveOrder(null);
        return;
      }

      // 2. Vizitator neautentificat -> folosim localStorage DOAR dacă a fost salvat ca "guest"
      let localCode: string | null = null;
      let storedOwner: string | null = null;
      try {
        localCode = localStorage.getItem(STORAGE_ACTIVE_CODE);
        storedOwner = localStorage.getItem(STORAGE_ACTIVE_OWNER);
      } catch {
        // ignore
      }

      if (localCode && storedOwner === "guest") {
        const tracked = await apiFetch<ActiveOrderData>(
          `/orders/track/${encodeURIComponent(localCode)}`
        ).catch(() => null);
        if (tracked && tracked.order_code && tracked.status !== "cancelled") {
          setActiveOrder(tracked);
          return;
        }
      } else if (localCode && storedOwner !== "guest") {
        clearStoredOrder();
      }

      setActiveOrder(null);
    } catch {
      setActiveOrder(null);
    }
  }, []);

  useEffect(() => {
    void fetchActiveOrder();
  }, [fetchActiveOrder]);

  // Reîmprospătare instantă la schimbare de cont / logout / comandă nouă
  useEffect(() => {
    const handleSync = () => {
      void fetchActiveOrder();
    };
    const unsubscribeSession = onSessionChange(() => {
      setActiveOrder(null);
      void fetchActiveOrder();
    });
    window.addEventListener("casa-esy-active-order-changed", handleSync);
    window.addEventListener("live-orders-sync", handleSync);
    return () => {
      unsubscribeSession();
      window.removeEventListener("casa-esy-active-order-changed", handleSync);
      window.removeEventListener("live-orders-sync", handleSync);
    };
  }, [fetchActiveOrder]);

  // Actualizare live instantă prin WebSockets
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.event === "orders_updated" || lastEvent.event === "new_room_service_order") {
      if (
        activeOrder &&
        lastEvent.order_code &&
        lastEvent.order_code.toUpperCase() === activeOrder.order_code.toUpperCase()
      ) {
        if (lastEvent.status) {
          setActiveOrder((prev) => (prev ? { ...prev, status: lastEvent.status } : null));
        } else {
          void fetchActiveOrder();
        }
      } else {
        void fetchActiveOrder();
      }
    }
  }, [lastEvent, activeOrder, fetchActiveOrder]);

  // Polling de siguranță rar (la fiecare 45 secunde) dacă WebSocket este offline
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(() => {
      void fetchActiveOrder();
    }, 45000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchActiveOrder]);

  return { activeOrder, loading, refresh: fetchActiveOrder };
}
