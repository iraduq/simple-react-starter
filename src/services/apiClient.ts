/**
 * Clientul HTTP unic al aplicației.
 * Toate requesturile merg prin apiFetch (credentials: "include", refresh
 * automat pe 401) și prin API_URL centralizat în src/lib/api.ts.
 */
export { apiFetch, ApiError, API_URL, setSessionExpiredHandler } from "../lib/api";
export { get, post, patch, put, del, upload, list, json, money, dateFmt, dateTimeFmt, nights, errMsg } from "../lib/admin";

import { ApiError } from "../lib/api";

/** Mesaj uniform pentru statusurile uzuale. */
export function httpErrorMessage(e: unknown, fallback = "A apărut o eroare."): string {
  if (e instanceof ApiError) {
    switch (e.status) {
      case 401:
        return "Sesiunea a expirat. Autentifică-te din nou.";
      case 403:
        return "Nu ai permisiunile necesare pentru această acțiune.";
      case 404:
        return "Resursa nu a fost găsită.";
      case 422:
        return e.message || "Date invalide. Verifică câmpurile completate.";
      default:
        return e.message || fallback;
    }
  }
  if (e instanceof TypeError) return "Nu am putut contacta serverul. Verifică conexiunea.";
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

export const isStatus = (e: unknown, status: number) =>
  e instanceof ApiError && e.status === status;

export const qs = (params: Record<string, string | number | boolean | undefined | null>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};
