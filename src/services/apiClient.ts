import { apiFetch, ApiError } from "../lib/api";

export { apiFetch, ApiError };

/** Uniform, user-facing message for any thrown error (401/422/500/network). */
export function httpErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Trebuie să fii autentificat.";
    if (err.status === 403) return "Nu ai permisiunea necesară.";
    if (err.status === 404) return "Resursa nu a fost găsită.";
    if (err.status === 422) return err.message || "Datele trimise nu sunt valide.";
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export const json = (body: unknown) => JSON.stringify(body);
