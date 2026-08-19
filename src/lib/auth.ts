const SESSION_CHANGED_EVENT = "auth-session-changed";
const API_URL = "http://localhost:8000";

/* ─────────────── Silent Refresh Queue / Mutex ─────────────── */
let refreshPromise: Promise<boolean> | null = null;
let onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

/** A single shared refresh call — concurrent 401s all await the same promise. */
function doRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const r = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return r.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/* ─────────────── Fetch wrapper with auto-retry on 401 ─────────────── */
type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
  _retry?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const defaultHeaders: Record<string, string> = isFormData
    ? {}
    : { "Content-Type": "application/json" };
  const headers = { ...defaultHeaders, ...options.headers };

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
    credentials: "include",
    signal: options.signal,
  });

  if (res.status !== 401) {
    if (!res.ok) throw await extractError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  // Nu facem refresh dacă 401 a venit din rutele de bază de autentificare
  const isAuthBypass =
    path === "/auth/login" ||
    path === "/auth/refresh" ||
    path === "/auth/register";
  if (isAuthBypass) {
    throw await extractError(res);
  }

  // Dacă request-ul a mai fost reîncercat o dată și tot 401 a dat -> sesiune complet expirată
  if (options._retry) {
    if (onSessionExpired) onSessionExpired();
    throw new ApiError("Session expired", 401);
  }

  // Încercăm reîmprospătarea token-ului
  const refreshed = await doRefresh();
  if (!refreshed) {
    if (onSessionExpired) onSessionExpired();
    throw new ApiError("Session expired", 401);
  }

  // Reîncercăm cererea inițială
  return apiFetch<T>(path, { ...options, _retry: true });
}

async function extractError(res: Response): Promise<ApiError> {
  let message = `Error ${res.status}`;
  try {
    const data = await res.json();
    if (data?.detail) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (data.detail?.message) {
        message = data.detail.message;
      }
    } else if (data?.message) {
      message = data.message;
    }
  } catch {
    // ignore
  }
  return new ApiError(message, res.status);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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
