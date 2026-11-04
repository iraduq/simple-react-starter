import {
  getCachedUser,
  fetchSession,
  invalidateSession,
  notifySessionChange,
  clearSession,
} from "../lib/auth";
import { useToast } from "../components/Toast";
import { useAdminLiveSync, type WebSocketEvent } from "./AdminLiveSyncContext";

/**
 * GlobalLiveSync:
 * Asigură sincronizarea automată a sesiunii de utilizator și dispecerizarea
 * evenimentelor live globale către ferestre/pagini legacy.
 * Utilizează conexiunea unică de WebSocket gestionată de AdminLiveSyncProvider.
 */
export default function GlobalLiveSync() {
  const { toast } = useToast();

  useAdminLiveSync({
    topic: "all",
    onSync: async (payload?: WebSocketEvent) => {
      if (!payload) return;
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
    },
  });

  return null;
}
