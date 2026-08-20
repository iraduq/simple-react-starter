import { apiFetch } from "../lib/api";
import { list } from "../lib/admin";
import type { AdminUser, UpdateMePayload } from "../types/users";
import type { AuthUser, SessionInfo } from "../types/auth";

/** GET /users/me */
export const getMe = () => apiFetch<AuthUser>("/users/me");

/** PATCH /users/me */
export const updateMe = (payload: UpdateMePayload) =>
  apiFetch<AuthUser>("/users/me", { method: "PATCH", body: JSON.stringify(payload) });

/** DELETE /users/me */
export const deleteMe = () => apiFetch<unknown>("/users/me", { method: "DELETE" });

/** GET /users/me/sessions */
export const mySessions = async () => list<SessionInfo>(await apiFetch<unknown>("/users/me/sessions"));

/** DELETE /users/me/sessions */
export const revokeAllMySessions = () => apiFetch<unknown>("/users/me/sessions", { method: "DELETE" });

/** DELETE /users/me/sessions/{session_id} */
export const revokeMySession = (id: number | string) =>
  apiFetch<unknown>(`/users/me/sessions/${id}`, { method: "DELETE" });

/* ── admin ── */

/** GET /users/admin/all */
export const adminAllUsers = async () => list<AdminUser>(await apiFetch<unknown>("/users/admin/all"));

/** GET /users/admin/{user_id} */
export const adminUser = (id: number | string) => apiFetch<AdminUser>(`/users/admin/${id}`);

/** PATCH /users/admin/{user_id} */
export const adminUpdateUser = (id: number | string, payload: Partial<AdminUser>) =>
  apiFetch<AdminUser>(`/users/admin/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

/** DELETE /users/admin/{user_id} */
export const adminDeleteUser = (id: number | string) =>
  apiFetch<unknown>(`/users/admin/${id}`, { method: "DELETE" });
