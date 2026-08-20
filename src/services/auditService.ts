import { apiFetch } from "../lib/api";
import { list } from "../lib/admin";
import type { AuditLog } from "../types/users";

/** GET /admin/audit-logs/ */
export const auditLogs = async () => list<AuditLog>(await apiFetch<unknown>("/admin/audit-logs/"));

/** GET /health */
export const health = () => apiFetch<unknown>("/health");
