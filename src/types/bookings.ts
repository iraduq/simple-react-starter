export type Booking = {
  id: number | string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string;
  room_id?: number | string | null;
  room_name?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  adults?: number | null;
  children?: number | null;
  total_price?: number | null;
  rate_plan?: string | null;
  plan_code?: string | null;
  created_at?: string | null;
};

export const ratePlanLabel = (plan?: string | null) => {
  switch (plan) {
    case "breakfast":
      return "Mic dejun inclus";
    case "half_board":
      return "Demipensiune";
    case "full_board":
      return "Pensiune completă";
    case "room_only":
      return "Doar cazare";
    default:
      return plan || "Standard";
  }
};
