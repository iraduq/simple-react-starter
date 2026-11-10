export type Booking = {
  id: number | string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "checked_in" | string;
  payment_status?: "unpaid" | "paid" | "refunded" | "refund_pending" | string | null;
  rate_plan_code?: string | null;
  plan_code?: string | null;
  booking_code?: string | null;
  access_pin?: string | null;
  self_checkin_completed_at?: string | null;
  unit_number?: string | null;
  room_id?: number | string | null;
  room_name?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  adults?: number | null;
  children?: number | null;
  total_price?: number | null;
  rate_plan?: string | null;
  created_at?: string | null;
};

export const ratePlanLabel = (plan?: string | null) => {
  switch (plan) {
    case "flexible":
      return "Flexibil";
    case "non_refundable":
      return "Nerambursabil";
    case "breakfast":
      return "Mic dejun inclus";
    case "half_board":
      return "Demipensiune";
    case "full_board":
      return "Pensiune completă";
    case "room_only":
      return "Doar cazare";
    default:
      return plan || "Flexibil";
  }
};
