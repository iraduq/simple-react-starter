export type AdminUser = {
  id: number | string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  is_active?: boolean | null;
  provider?: string | null;
  created_at?: string | null;
};

export type UpdateMePayload = {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
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
