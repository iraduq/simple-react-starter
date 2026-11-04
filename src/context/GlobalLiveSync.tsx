import { useEffect, useRef } from "react";
import { WS_URL } from "../lib/config";
import {
  getCachedUser,
  fetchSession,
  invalidateSession,
  notifySessionChange,
  clearSession,
} from "../lib/auth";
import { useToast } from "../components/Toast";

/**
 * GlobalLiveSync:
 * Asigură sincronizarea automată bidirecțională prin WebSocket pentru toți utilizatorii
 * (clienți, oaspeți, administratori).
 *
 * Când un administrator schimbă numele unui utilizator, rolul, statusul contului,
 * un preț sau o rezervare, acest modul recepționează evenimentul și actualizează
 * instantaneu starea clientului fără ca acesta să dea refresh la pagină.
 */
export default function GlobalLiveSync() {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let raw = (WS_URL || "wss://backend-licenta-i0lr.onrender.com").trim();
    if (!raw.startsWith("ws://") && !raw.startsWith("wss://")) {
      raw = raw.replace(/^https?:\/\//, (m: string) =>
        m.startsWith("https") ? "wss://" : "ws://"
      );
    }
    const endpoint = `${raw.replace(/\/$/, "")}/ws/live`;

    function connect() {
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      try {
        const ws = new WebSocket(endpoint);
        wsRef.current = ws;

        ws.onopen = () => {
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send("ping");
            }
          }, 25000);
        };

        ws.onmessage = async (event) => {
          if (event.data === "pong") return;
          try {
            const payload = JSON.parse(event.data);
            const ev = payload.event;
            if (!ev) return;

            // 1. Sincronizare utilizator curent (Dacă un admin modifică numele sau datele acestui om)
            if (ev === "user_updated") {
              const current = getCachedUser();
              const isMe =
                current &&
                (current.email === payload.email ||
                  (payload.user_id && String(payload.user_id) === String((current as any).id)));

              if (isMe) {
                // Dacă adminul i-a dezactivat contul
                if (payload.is_active === false) {
                  await clearSession();
                  toast("Contul tău a fost dezactivat de un administrator.", "error");
                  return;
                }

                // Actualizăm sesiunea curentă în cache și notificăm Navbar / Profile
                invalidateSession();
                const fresh = await fetchSession(true);
                if (fresh) {
                  notifySessionChange();
                  const newName = [fresh.first_name, fresh.last_name].filter(Boolean).join(" ");
                  toast(
                    newName
                      ? `Datele tale de profil au fost actualizate live: ${newName}`
                      : "Datele contului tău au fost actualizate în timp real.",
                    "info"
                  );
                }
              }
            }

            // 2. Dacă adminul a șters contul utilizatorului curent
            if (ev === "user_deleted") {
              const current = getCachedUser();
              if (current && current.email === payload.email) {
                await clearSession();
                toast("Contul tău a fost închis de către un administrator.", "warning");
              }
            }

            // 3. Notificăm paginile interesate prin evenimente Window personalizate
            if (ev === "menu_updated" || ev === "places_updated") {
              window.dispatchEvent(new CustomEvent("live-places-sync", { detail: payload }));
            }

            if (
              ev === "rooms_updated" ||
              ev === "pricing_updated" ||
              ev === "facilities_updated" ||
              ev === "pricing_rule_applied"
            ) {
              window.dispatchEvent(new CustomEvent("live-rooms-sync", { detail: payload }));
            }

            if (
              ev === "booking_updated" ||
              ev === "bookings_updated" ||
              ev === "new_booking_confirmed" ||
              ev === "room_booked" ||
              ev === "room_released" ||
              ev === "payment_confirmed"
            ) {
              window.dispatchEvent(new CustomEvent("live-bookings-sync", { detail: payload }));
            }
          } catch {
            // ignoră mesajele non-json
          }
        };

        ws.onclose = () => {
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connect, 4000);
        };

        ws.onerror = () => {
          try {
            ws.close();
          } catch {
            // ignore
          }
        };
      } catch {
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    }

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
  }, [toast]);

  return null;
}
