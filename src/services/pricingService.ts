import { apiFetch } from "../lib/api";
import { toUtcIso } from "./roomsService";
import type { BookingPriceCalculation, RatePlanCode } from "../types/rooms";

/** GET /rooms/{id}/pricing — dynamic price (seasons, orphan nights, rules). */
export const getRoomPricing = (
  roomId: string | number,
  checkIn: string,
  checkOut: string,
) =>
  apiFetch<BookingPriceCalculation>(
    `/rooms/${roomId}/pricing?check_in=${encodeURIComponent(
      checkIn.length === 10 ? toUtcIso(checkIn) : checkIn,
    )}&check_out=${encodeURIComponent(
      checkOut.length === 10 ? toUtcIso(checkOut) : checkOut,
    )}`,
  );

/** GET /api/pricing/calculate — engine price for a single date + rate plan. */
export const calculatePrice = (params: {
  room_type_id: number | string;
  date: string;
  length_of_stay?: number;
  plan_code?: RatePlanCode | string;
  adults?: number;
  extra_guests?: number;
}) => {
  const q = new URLSearchParams({
    room_type_id: String(params.room_type_id),
    date: params.date,
    length_of_stay: String(params.length_of_stay ?? 1),
    plan_code: String(params.plan_code ?? "flexible"),
    adults: String(params.adults ?? 2),
    extra_guests: String(params.extra_guests ?? 0),
  });
  return apiFetch<{ room_type_id: number; date: string; price: number }>(
    `/api/pricing/calculate?${q.toString()}`,
  );
};

/**
 * Rate-plan factor relative to the default `flexible` plan, computed by the
 * backend engine (so plan modifiers stay server-side).
 */
export const ratePlanFactor = async (
  roomTypeId: number | string,
  date: string,
  nights: number,
  planCode: string,
  adults: number,
) => {
  if (planCode === "flexible") return 1;
  const [base, plan] = await Promise.all([
    calculatePrice({ room_type_id: roomTypeId, date, length_of_stay: nights, plan_code: "flexible", adults }),
    calculatePrice({ room_type_id: roomTypeId, date, length_of_stay: nights, plan_code: planCode, adults }),
  ]);
  if (!base.price) return 1;
  return plan.price / base.price;
};
