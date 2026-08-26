import { API_URL } from "./config";
import {
  getAccessToken,
  getRefreshToken,
  getUsableAccessToken,
  hasRefreshCredential,
  isAccessTokenExpired,
  clearAuthTokens,
  saveTokensFrom,
} from "./token";

/* ─────────────── Silent Refresh Queue / Mutex ─────────────── */
type QueuedRefresh = {
  resolve: (value: boolean) => void;
  reject: (reason?: unknown) => void;
};

let refreshPromise: Promise<boolean> | null = null;
let refreshQueue: QueuedRefresh[] = [];
let onSessionExpired: (() => void) | null = null;
let sessionExpiredNotified = false;
const inflightGetRequests = new Map<string, Promise<unknown>>();

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

const flushRefreshQueue = (ok: boolean, error?: unknown) => {
  const queue = refreshQueue;
  refreshQueue = [];
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(ok);
  });
};

const expireActiveSession = () => {
  clearAuthTokens();
  if (!sessionExpiredNotified) {
    sessionExpiredNotified = true;
    if (onSessionExpired) onSessionExpired();
  }
};

const waitForActiveRefresh = async () => {
  if (!refreshPromise) return true;
  return refreshPromise;
};

/** A single shared refresh call — concurrent 401s are queued behind this lock. */
export function refreshSession(): Promise<boolean> {
  if (!hasRefreshCredential()) return Promise.resolve(false);
  if (refreshPromise) {
    return new Promise<boolean>((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

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
        sessionExpiredNotified = false;
      } catch {
        /* refresh doar pe cookie */
      }
      return true;
    } catch {
      return false;
    }
  })()
    .then((ok) => {
      refreshPromise = null;
      flushRefreshQueue(ok);
      return ok;
    })
    .catch((error) => {
      refreshPromise = null;
      flushRefreshQueue(false, error);
      return false;
    });

  return refreshPromise;
}

/* ─────────────── Fetch wrapper with auto-retry on 401 ─────────────── */
type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
  _retry?: boolean;
  _coalesced?: boolean;
};

const shouldCoalesceRequest = (options: RequestOptions) => {
  const method = (options.method || "GET").toUpperCase();
  return method === "GET" && !options.signal && !options._retry && !options._coalesced;
};

const makeRequestKey = (path: string, options: RequestOptions) => {
  const headers = options.headers ? JSON.stringify(options.headers) : "";
  return `${path}|${headers}`;
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
  "/auth/logout",
];

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (shouldCoalesceRequest(options)) {
    const key = makeRequestKey(path, options);
    const existing = inflightGetRequests.get(key);
    if (existing) return existing as Promise<T>;

    const request = apiFetch<T>(path, { ...options, _coalesced: true }).finally(
      () => {
        inflightGetRequests.delete(key);
      },
    );
    inflightGetRequests.set(key, request as Promise<unknown>);
    return request;
  }

  const isAuthBypass = AUTH_BYPASS.includes(path);

  if (!isAuthBypass) {
    const activeRefreshSucceeded = await waitForActiveRefresh();
    if (!activeRefreshSucceeded) {
      expireActiveSession();
      throw new ApiError("Sesiunea a expirat. Autentifică-te din nou.", 401);
    }
  }

  const currentAccessToken = getAccessToken();
  if (
    !isAuthBypass &&
    !refreshPromise &&
    currentAccessToken &&
    isAccessTokenExpired(currentAccessToken, 0) &&
    hasRefreshCredential()
  ) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      expireActiveSession();
      throw new ApiError("Sesiunea a expirat. Autentifică-te din nou.", 401);
    }
  }

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
    if (path.startsWith("/auth/")) {
      saveTokensFrom(data);
      sessionExpiredNotified = false;
    }
    return data;
  }

  // 401 — nu încercăm refresh pe rutele de autentificare de bază
  if (isAuthBypass) throw await extractError(res);

  if (options._retry) {
    expireActiveSession();
    throw new ApiError("Sesiunea a expirat. Autentifică-te din nou.", 401);
  }

  const refreshed = refreshPromise ? await waitForActiveRefresh() : await refreshSession();
  if (!refreshed) {
    expireActiveSession();
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
