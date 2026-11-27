export interface CheckInInfo {
  booking_id?: string;
  booking_code: string;
  guest_name: string;
  room_name: string;
  unit_number: string;
  check_in: string;
  check_out: string;
  created_at?: string | null;
  rate_plan_code?: string | null;
  total_price?: number | null;
  status: string;
  payment_status: string;
  is_checked_in: boolean;
  access_pin?: string | null;
}

export function fmtDate(d?: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ro-RO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function calculateRefundMeta(info: CheckInInfo | null): { eligible: boolean; daysLeft: number; reason: string } {
  if (!info) return { eligible: false, daysLeft: 0, reason: "" };
  if (info.status === "cancelled" || info.status === "completed" || info.is_checked_in) {
    return { eligible: false, daysLeft: 0, reason: "" };
  }
  if (info.rate_plan_code === "non_refundable") {
    return {
      eligible: false,
      daysLeft: 0,
      reason: "Această rezervare a fost efectuată cu planul Nerambursabil.",
    };
  }
  const now = new Date();
  const checkInDate = new Date(info.check_in);
  if (checkInDate < now) {
    return { eligible: false, daysLeft: 0, reason: "Data de check-in a trecut deja." };
  }
  const created = info.created_at ? new Date(info.created_at) : now;
  const daysElapsed = Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, 30 - daysElapsed);
  if (daysElapsed > 30) {
    return {
      eligible: false,
      daysLeft: 0,
      reason: `Termenul de 30 de zile de la rezervare a expirat (${daysElapsed} zile trecute).`,
    };
  }
  return { eligible: true, daysLeft, reason: "" };
}
