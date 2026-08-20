import { apiFetch } from "../lib/api";

/** POST /auth/forgot-password */
export const forgotPassword = (email: string) =>
  apiFetch<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

/** POST /auth/reset-password */
export const resetPassword = (token: string, password: string) =>
  apiFetch<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
