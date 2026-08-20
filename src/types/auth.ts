export type AuthUser = {
  id?: number | string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
  created_at?: string | null;
  permissions?: string[];
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type LoginPayload = { email: string; password: string };

export type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
};

export type SessionInfo = {
  id: number | string;
  device?: string | null;
  os_family?: string | null;
  browser_family?: string | null;
  ip_address?: string | null;
  location?: string | null;
  last_seen_at?: string | null;
  created_at?: string | null;
  is_current?: boolean | null;
};
