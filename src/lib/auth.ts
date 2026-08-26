import { apiFetch, ApiError } from "./api";
import { clearAuthTokens, hasStoredAuth } from "./token";

export { apiFetch, ApiError };
export { setSessionExpiredHandler } from "./api";

const SESSION_CHANGED_EVENT = "auth-session-changed";

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
  if (!hasStoredAuth()) {
    cachedUser = null;
    hasFetched = true;
    return null;
  }
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
  const hadStoredAuth = hasStoredAuth();
  clearAuthTokens();
  cachedUser = null;
  hasFetched = true;

  try {
    if (hadStoredAuth) await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignorăm eroarea de rețea, tot ștergem starea locală
  }
  notifySessionChange();
};

export const onSessionChange = (callback: () => void) => {
  window.addEventListener(SESSION_CHANGED_EVENT, callback);
  return () => window.removeEventListener(SESSION_CHANGED_EVENT, callback);
};
