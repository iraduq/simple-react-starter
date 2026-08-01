const API_URL = "http://localhost:8000";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
let onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
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

  // 401: attempt refresh
  if (!isRefreshing) {
    isRefreshing = true;
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
        isRefreshing = false;
      }
    })();
  }

  const refreshed = await refreshPromise!;
  if (!refreshed) {
    if (onSessionExpired) onSessionExpired();
    throw new ApiError("Session expired", 401);
  }

  // Retry original request
  const retryRes = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", ...options.headers },
    body: options.body,
    credentials: "include",
    signal: options.signal,
  });

  if (!retryRes.ok) {
    throw await extractError(retryRes);
  }
  if (retryRes.status === 204) return undefined as T;
  return (await retryRes.json()) as T;
}

async function extractError(res: Response): Promise<ApiError> {
  let message = `Error ${res.status}`;
  try {
    const data = await res.json();
    if (data && typeof data.detail === "string") message = data.detail;
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
