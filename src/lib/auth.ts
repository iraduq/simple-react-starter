const SESSION_CHANGED_EVENT = "auth-session-changed";

/**
 * Sesiunea utilizatorului. Clientul HTTP unic trăiește în ./api (apiFetch),
 * aici păstrăm doar starea sesiunii. Re-exportăm pentru compatibilitate.
 */
import { apiFetch, ApiError, API_URL, setSessionExpiredHandler } from "./api";

export { apiFetch, ApiError, API_URL, setSessionExpiredHandler };

/* ─────────────── Session Manager ─────────────── */
export type SessionUser = {
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
  created_at?: string | null;
  permissions?: string[];
} | null;

let cachedUser: SessionUser = null;
let hasFetched = false;
let fetchPromise: Promise<SessionUser> | null = null;

export const fetchSession = async (force = false): Promise<SessionUser> => {
  if (!force && hasFetched) return cachedUser;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      // MODIFICARE AICI: Folosim apiFetch în loc de fetch simplu
      const data = await apiFetch<SessionUser>("/auth/me");
      cachedUser = data;
      hasFetched = true;
      return data;
    } catch {
      cachedUser = null;
      hasFetched = true;
      return null;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

export const getCachedUser = () => cachedUser;

export const hasSession = () => Boolean(cachedUser);

export const notifySessionChange = () => {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
};

export const clearSession = async () => {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignorăm eroarea de rețea, tot ștergem starea locală
  }
  cachedUser = null;
  hasFetched = true;
  notifySessionChange();
};

export const onSessionChange = (callback: () => void) => {
  window.addEventListener(SESSION_CHANGED_EVENT, callback);
  return () => window.removeEventListener(SESSION_CHANGED_EVENT, callback);
};
