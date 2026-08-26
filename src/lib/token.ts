/**
 * Token store — backend-ul trimite `access_token` în corpul răspunsului la login.
 * În preview / cross-site, cookie-urile third-party sunt blocate de browser,
 * așa că păstrăm tokenul și îl trimitem ca `Authorization: Bearer`.
 */
const ACCESS_KEY = "casaesy_access_token";
const REFRESH_KEY = "casaesy_refresh_token";
const AUTH_SESSION_KEY = "casaesy_auth_session";

let accessToken: string | null = null;
let refreshToken: string | null = null;

const safeGet = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  accessToken = safeGet(ACCESS_KEY);
  return accessToken;
};

export const getRefreshToken = (): string | null => {
  if (refreshToken) return refreshToken;
  refreshToken = safeGet(REFRESH_KEY);
  return refreshToken;
};

const safeSet = (key: string, value?: string | null) => {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const setAccessToken = (token?: string | null) => {
  accessToken = token || null;
  safeSet(ACCESS_KEY, token);
};

export const setRefreshToken = (token?: string | null) => {
  refreshToken = token || null;
  safeSet(REFRESH_KEY, token);
};

export const markAuthSession = () => safeSet(AUTH_SESSION_KEY, "1");

export const hasAuthSessionMarker = () => safeGet(AUTH_SESSION_KEY) === "1";

export const hasRefreshCredential = () =>
  Boolean(getRefreshToken() || hasAuthSessionMarker());

export const clearAccessToken = () => setAccessToken(null);

export const clearAuthTokens = () => {
  setAccessToken(null);
  setRefreshToken(null);
  safeSet(AUTH_SESSION_KEY, null);
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const isAccessTokenExpired = (token = getAccessToken(), skewSeconds = 30) => {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;
  return payload.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
};

export const getUsableAccessToken = (): string | null => {
  const token = getAccessToken();
  if (!token || isAccessTokenExpired(token)) return null;
  return token;
};

export const hasStoredAuth = () =>
  Boolean(getAccessToken() || getRefreshToken() || hasAuthSessionMarker());

/** Extrage și salvează tokenul din orice răspuns de autentificare. */
export const saveTokensFrom = (data: unknown) => {
  if (!data || typeof data !== "object") return;
  const o = data as Record<string, unknown>;
  const token =
    (typeof o.access_token === "string" && o.access_token) ||
    (typeof o.accessToken === "string" && o.accessToken) ||
    (typeof o.token === "string" && o.token) ||
    null;
  const refresh =
    (typeof o.refresh_token === "string" && o.refresh_token) ||
    (typeof o.refreshToken === "string" && o.refreshToken) ||
    null;
  if (token) setAccessToken(token);
  if (refresh) setRefreshToken(refresh);
  if (token || refresh) markAuthSession();
};
