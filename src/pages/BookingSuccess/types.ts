export interface BookingConfirmationDetails {
  status?: string;
  booking_id: string;
  booking_code: string;
  room_title?: string | null;
  room_image?: string | null;
  room_size_sqm?: number | null;
  unit_number?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  guests_adults?: number;
  guests_children?: number;
  rate_plan_code?: string | null;
  total_price?: number | null;
  guest_name?: string | null;
  guest_email?: string | null;
  special_requests?: string | null;
  access_pin?: string | null;
  qr_data_url?: string | null;
}

export const RATE_PLAN_LABELS: Record<string, string> = {
  flexible: "Tarif Flexibil (Anulare gratuită)",
  non_refundable: "Tarif Nerambursabil",
  breakfast_included: "Mic dejun inclus",
  half_board: "Demipensiune inclusă",
};

export function formatRoDate(iso?: string | null): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function calcNights(checkIn?: string | null, checkOut?: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}
