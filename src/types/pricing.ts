export type PricingCalculateParams = {
  room_type_id: number | string;
  date: string;
  booking_date: string;
  length_of_stay: number;
  plan_code: string;
  adults: number;
  extra_guests: number;
};

/** Răspunsul backendului pentru o noapte. Toate calculele vin din backend. */
export type PricingNight = {
  date: string;
  price: number;
  currency?: string | null;
  plan_code?: string | null;
  source?: string | null;
  min_stay?: number | null;
  closed_to_arrival?: boolean | null;
  closed_to_departure?: boolean | null;
  raw?: unknown;
};

export type PricingDashboardRow = {
  room_type_id: number | string;
  room_type_name?: string | null;
  name?: string | null;
  price?: number | null;
  final_price?: number | null;
  occupancy?: number | null;
  occupancy_rate?: number | null;
  pace_index?: number | null;
  source?: string | null;
  override_price?: number | null;
  override_expires_at?: string | null;
};

export type PricingOverrideHistoryItem = {
  id?: number | string;
  room_type_id?: number | string | null;
  room_type_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  fixed_price?: number | null;
  price?: number | null;
  reason?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
  created_by?: string | null;
};

export type PricingDashboard = {
  date?: string | null;
  rows: PricingDashboardRow[];
  overrides: PricingOverrideHistoryItem[];
};

export type PricingOverridePayload = {
  room_type_id: number | string;
  start_date: string;
  end_date: string;
  fixed_price: number;
  reason: string;
  expires_at?: string | null;
};
