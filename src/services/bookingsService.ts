import { apiFetch } from "../lib/api";
import type { Booking } from "../types/bookings";

/** GET /bookings/my-bookings */
export const myBookings = () => apiFetch<Booking[]>("/bookings/my-bookings");

/** POST /bookings/{id}/cancel */
export const cancelBooking = (id: string | number) =>
  apiFetch<void>(`/bookings/${id}/cancel`, { method: "POST" });

/** POST /bookings */
export const createBooking = (payload: Record<string, unknown>) =>
  apiFetch<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
