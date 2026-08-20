export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | (string & {});

export type RatePlanCode = "flexible" | "non_refundable" | "breakfast";

export const RATE_PLANS: { code: RatePlanCode; label: string; hint: string }[] = [
  { code: "flexible", label: "Flexible", hint: "Anulare gratuită conform politicii" },
  { code: "non_refundable", label: "Non refundable", hint: "Tarif redus, fără rambursare" },
  { code: "breakfast", label: "Breakfast included", hint: "Mic dejun inclus" },
];

export const ratePlanLabel = (code?: string | null) =>
  RATE_PLANS.find((p) => p.code === code)?.label ?? code ?? "—";

export type Booking = {
  id: number | string;
  status: BookingStatus;
  room_id?: number | string | null;
  room_name?: string | null;
  guest_email?: string | null;
  guest_name?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  guests?: number | null;
  adults?: number | null;
  children?: number | null;
  plan_code?: string | null;
  total_price?: number | null;
  created_at?: string | null;
  can_cancel?: boolean | null;
};

export type CreateBookingPayload = {
  room_id: number | string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  plan_code: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  notes?: string;
};
