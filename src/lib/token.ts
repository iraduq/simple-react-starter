/**
 * Token store — backend-ul trimite `access_token` în corpul răspunsului la login.
 * În preview / cross-site, cookie-urile third-party sunt blocate de browser,
 * așa că păstrăm tokenul și îl trimitem ca `Authorization: Bearer`.
 */
const ACCESS_KEY = "casaesy_access_token";

let accessToken: string | null = null;

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

export const setAccessToken = (token?: string | null) => {
  accessToken = token || null;
  try {
    if (token) localStorage.setItem(ACCESS_KEY, token);
    else localStorage.removeItem(ACCESS_KEY);
  } catch {
    /* ignore */
  }
};

export const clearAccessToken = () => setAccessToken(null);

/** Extrage și salvează tokenul din orice răspuns de autentificare. */
export const saveTokensFrom = (data: unknown) => {
  if (!data || typeof data !== "object") return;
  const o = data as Record<string, unknown>;
  const token =
    (typeof o.access_token === "string" && o.access_token) ||
    (typeof o.accessToken === "string" && o.accessToken) ||
    (typeof o.token === "string" && o.token) ||
    null;
  if (token) setAccessToken(token);
};
