import type { RoomImage, Nomenclature } from "../lib/admin";

export type AvailableRoom = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  capacity?: number | null;
  max_guests?: number | null;
  base_price?: number | null;
  price_per_night?: number | null;
  total_price?: number | null;
  available_units?: number | null;
  room_type?: { id?: number | string; name?: string | null } | string | null;
  facilities?: Nomenclature[];
  images?: RoomImage[];
};

export type AvailabilityQuery = {
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  min_price?: number | null;
  max_price?: number | null;
  facility_ids?: (number | string)[];
  sort_by?: "price" | "capacity" | string;
};

export type PricingBreakdown = {
  date: string;
  nights: number;
  price_per_night: number;
  subtotal: number;
};

export type BookingPriceCalculation = {
  room_id: string;
  check_in: string;
  check_out: string;
  nights: number;
  nightly_breakdown: PricingBreakdown[];
  subtotal: number;
  taxes: number;
  total_price: number;
};

export type RatePlanCode = "flexible" | "non_refundable" | "breakfast";

export const RATE_PLANS: { code: RatePlanCode; label: string; hint: string }[] = [
  { code: "flexible", label: "Flexibil", hint: "Anulare gratuită, plata la sosire" },
  { code: "non_refundable", label: "Nerambursabil", hint: "Cel mai bun preț, fără anulare" },
  { code: "breakfast", label: "Mic dejun inclus", hint: "Mic dejun bufet pentru toți oaspeții" },
];

export type RoomDetail = {
  id: string;
  title: string;
  description: string;
  room_type: { id: number | string; name: string; base_price?: number | null };
  max_guests_adults: number;
  max_guests_children: number;
  size_sqm?: number | null;
  base_price: number;
  is_active: boolean;
  facilities?: { id: number | string; name: string; description?: string | null; icon?: string | null }[];
  images?: { id: string; image_url: string; alt_text?: string | null; display_order?: number }[];
  units?: { id: string; unit_number: string; bed_type?: { id: number; name: string; capacity: number } | null; status?: string }[];
};
