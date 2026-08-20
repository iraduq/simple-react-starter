import { apiFetch } from "../lib/api";
import { list } from "../lib/admin";
import type { AuthUser, LoginPayload, RegisterPayload, SessionInfo } from "../types/auth";

/** POST /auth/register */
export const register = (payload: RegisterPayload) =>
  apiFetch<unknown>("/auth/register", { method: "POST", body: JSON.stringify(payload) });

/** POST /auth/verify-email */
export const verifyEmail = (email: string, code: string) =>
  apiFetch<unknown>("/auth/verify-email", { method: "POST", body: JSON.stringify({ email, code }) });

/** POST /auth/resend-code */
export const resendCode = (email: string) =>
  apiFetch<unknown>("/auth/resend-code", { method: "POST", body: JSON.stringify({ email }) });

/** POST /auth/login */
export const login = (payload: LoginPayload) =>
  apiFetch<unknown>("/auth/login", { method: "POST", body: JSON.stringify(payload) });

/** POST /auth/google */
export const googleLogin = (credential: string) =>
  apiFetch<unknown>("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });

/** POST /auth/refresh */
export const refresh = () => apiFetch<unknown>("/auth/refresh", { method: "POST" });

/** POST /auth/logout */
export const logout = () => apiFetch<unknown>("/auth/logout", { method: "POST" });

/** POST /auth/logout-all */
export const logoutAll = () => apiFetch<unknown>("/auth/logout-all", { method: "POST" });

/** GET /auth/me */
export const me = () => apiFetch<AuthUser>("/auth/me");

/** POST /auth/forgot-password */
export const forgotPassword = (email: string) =>
  apiFetch<unknown>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

/** POST /auth/reset-password */
export const resetPassword = (token: string, password: string) =>
  apiFetch<unknown>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password, new_password: password }),
  });

/** GET /auth/sessions */
export const authSessions = async () => list<SessionInfo>(await apiFetch<unknown>("/auth/sessions"));

/** DELETE /auth/revoke-session/{session_id} */
export const revokeAuthSession = (id: number | string) =>
  apiFetch<unknown>(`/auth/revoke-session/${id}`, { method: "DELETE" });
