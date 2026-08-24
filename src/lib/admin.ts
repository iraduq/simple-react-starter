import { API_URL } from "./config";
import { apiFetch } from "./api";

export { API_URL };

/* ---------------- types ---------------- */
export type Booking = {
  id: number | string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string;
  room_id?: number | string | null;
  room_name?: string | null;
  user_id?: string | number | null;
  guest_email?: string | null;
  guest_name?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  guests?: number | null;
  total_price?: number | null;
  created_at?: string | null;
};

export type RoomImage = {
  id: number | string;
  url?: string;
  image_url?: string;
};
export type RoomUnit = {
  id: number | string;
  name?: string | null;
  code?: string | null;
  unit_number?: string | null;
  status?: string | null;
  bed_type?: { id?: number | string; name?: string | null; capacity?: number | null } | null;
  is_active?: boolean | null;
};

export type RoomBooking = {
  id: number | string;
  booking_code?: string | null;
  status?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  unit_id?: string | number | null;
  room_unit_id?: string | number | null;
  unit?: { id?: string | number; unit_number?: string | null } | null;
  guest_name?: string | null;
  guest_email?: string | null;
  user_id?: string | number | null;
  user_email?: string | null;
  user_name?: string | null;
  room_id?: string | number | null;
  created_at?: string | null;
  user?: { email?: string | null; first_name?: string | null; last_name?: string | null } | null;
  guests_adults?: number | null;
  guests_children?: number | null;
  total_price?: number | null;
};

export type Room = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  base_price?: number | null;
  capacity?: number | null;
  size_sqm?: number | null;
  room_type_id?: number | string | null;
  bed_type_id?: number | string | null;
  is_active?: boolean | null;
  images?: RoomImage[];
  units?: RoomUnit[];
};

export type Nomenclature = {
  id: number | string;
  name: string;
  icon?: string | null;
  description?: string | null;
};

export type Place = {
  id: number | string;
  name: string;
  description?: string | null;
  badge?: string | null;
  rating?: number | null;
  lat?: number | null;
  lng?: number | null;
  image_url?: string | null;
  distance_km?: number | null;
};

export type AdminUser = {
  id: number | string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  is_admin?: boolean | null;
  is_superuser?: boolean | null;
  is_staff?: boolean | null;
  user_role?: string | null;
  roles?: string[] | null;
  is_active?: boolean | null;
  provider?: string | null;
  created_at?: string | null;
};

export type AuditLog = {
  id: number | string;
  created_at?: string | null;
  timestamp?: string | null;
  user_email?: string | null;
  user_id?: number | string | null;
  action?: string | null;
  resource?: string | null;
  resource_type?: string | null;
  resource_id?: string | number | null;
  ip_address?: string | null;
  ip?: string | null;
};

export type SessionInfo = {
  id: number | string;
  device_type?: string | null;
  os_family?: string | null;
  browser_family?: string | null;
  ip_address?: string | null;
  location?: string | null;
  last_seen_at?: string | null;
  created_at?: string | null;
  is_current?: boolean | null;
};

/* ---------------- helpers ---------------- */
export const list = <T>(v: unknown): T[] => {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const key of ["items", "results", "data", "rows"]) {
      if (Array.isArray(o[key])) return o[key] as T[];
    }
  }
  return [];
};

export const json = (body: unknown) => JSON.stringify(body);

export const get = <T>(path: string) => apiFetch<T>(path);
export const post = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, {
    method: "POST",
    body: body === undefined ? null : json(body),
  });
export const patch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: json(body) });
export const put = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PUT", body: json(body) });
export const del = <T>(path: string) => apiFetch<T>(path, { method: "DELETE" });

/** multipart upload (nu setăm Content-Type, îl pune browserul) */
export async function upload<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const d = await res.json();
      if (typeof d?.detail === "string") msg = d.detail;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const imageUrl = (img: RoomImage) => img.url || img.image_url || "";

export const money = (v?: number | null) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

export const dateFmt = (v?: string | null) =>
  v
    ? new Date(v).toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const dateTimeFmt = (v?: string | null) =>
  v
    ? new Date(v).toLocaleString("ro-RO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const nights = (a?: string | null, b?: string | null) => {
  if (!a || !b) return 0;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return d > 0 ? Math.round(d) : 0;
};

export const errMsg = (e: unknown) =>
  e instanceof Error ? e.message : "A apărut o eroare";
