const SESSION_CHANGED_EVENT = "auth-session-changed";
const API_URL = "http://localhost:8000";

export type SessionUser = {
  email: string;
  role: string;
} | null;

let cachedUser: SessionUser = null;

export const fetchSession = async (): Promise<SessionUser> => {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      cachedUser = null;
      return null;
    }

    const data = (await res.json()) as SessionUser;
    cachedUser = data;
    return data;
  } catch {
    cachedUser = null;
    return null;
  }
};

export const getCachedUser = () => cachedUser;

export const hasSession = () => Boolean(cachedUser);

export const notifySessionChange = () => {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
};

export const clearSession = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignorăm eroarea de rețea, tot ștergem starea locală
  }
  cachedUser = null;
  notifySessionChange();
};

export const onSessionChange = (callback: () => void) => {
  window.addEventListener(SESSION_CHANGED_EVENT, callback);
  return () => window.removeEventListener(SESSION_CHANGED_EVENT, callback);
};
