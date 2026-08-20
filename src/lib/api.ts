/** URL-ul backendului — centralizat aici pentru toată aplicația. */
export const API_URL =
  (import.meta.env["VITE_API_URL"] as string | undefined) ??
  "https://backend-licenta-i0lr.onrender.com";

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
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", ...options.headers },
    body: options.body,
    credentials: "include",
    signal: options.signal,
  });

  if (res.status !== 401) {
    if (!res.ok) throw await extractError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  // 401 received
  if (options._retry) {
    // Already retried — refresh token is also invalid
    if (onSessionExpired) onSessionExpired();
    throw new ApiError("Session expired", 401);
  }

  // Attempt silent refresh (all concurrent 401s share the same promise)
  const refreshed = await doRefresh();
  if (!refreshed) {
    if (onSessionExpired) onSessionExpired();
    throw new ApiError("Session expired", 401);
  }

  // Retry original request with _retry flag
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
