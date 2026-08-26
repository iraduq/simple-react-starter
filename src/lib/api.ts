import { API_URL } from "./config";
import {
  getRefreshToken,
  getUsableAccessToken,
  hasRefreshCredential,
  clearAuthTokens,
  saveTokensFrom,
} from "./token";

/* ─────────────── Silent Refresh Queue / Mutex ─────────────── */
let refreshPromise: Promise<boolean> | null = null;
let onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

/** A single shared refresh call — concurrent 401s all await the same promise. */
export function refreshSession(): Promise<boolean> {
  if (!hasRefreshCredential()) return Promise.resolve(false);
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      const r = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: refreshToken ? JSON.stringify({ refresh_token: refreshToken }) : undefined,
      });
      if (!r.ok) {
        clearAuthTokens();
        return false;
      }
      try {
        saveTokensFrom(await r.json());
      } catch {
        /* refresh doar pe cookie */
      }
      return true;
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

const AUTH_BYPASS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/register",
  "/auth/google",
  "/auth/verify-email",
  "/auth/resend-code",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  const token = getUsableAccessToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

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
    const data = (await res.json().catch(() => undefined)) as T;
    if (path.startsWith("/auth/")) saveTokensFrom(data);
    return data;
  }

  // 401 — nu încercăm refresh pe rutele de autentificare de bază
  if (AUTH_BYPASS.includes(path)) throw await extractError(res);

  if (options._retry) {
    clearAuthTokens();
    if (onSessionExpired) onSessionExpired();
    throw new ApiError("Sesiunea a expirat. Autentifică-te din nou.", 401);
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    clearAuthTokens();
    if (onSessionExpired) onSessionExpired();
    throw new ApiError("Sesiunea a expirat. Autentifică-te din nou.", 401);
  }

  return apiFetch<T>(path, { ...options, _retry: true });
}

async function extractError(res: Response): Promise<ApiError> {
  let message = `Error ${res.status}`;
  try {
    const data = await res.json();
    if (data?.detail) {
      if (typeof data.detail === "string") message = data.detail;
      else if (data.detail?.message) message = data.detail.message;
    } else if (typeof data?.message === "string") {
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
