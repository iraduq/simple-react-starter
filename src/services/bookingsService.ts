import { apiFetch } from "../lib/api";
import { list } from "../lib/admin";
import type { Booking, CreateBookingPayload } from "../types/bookings";

/** POST /bookings */
export const createBooking = (payload: CreateBookingPayload) =>
  apiFetch<Booking>("/bookings", { method: "POST", body: JSON.stringify(payload) });

/** GET /bookings (admin) */
export const listBookings = async () => list<Booking>(await apiFetch<unknown>("/bookings"));

/** GET /bookings/my-bookings */
export const myBookings = async () => list<Booking>(await apiFetch<unknown>("/bookings/my-bookings"));

/** GET /bookings/{booking_id} */
export const getBooking = (id: number | string) => apiFetch<Booking>(`/bookings/${id}`);

/** PATCH /bookings/{booking_id} */
export const updateBooking = (id: number | string, payload: Partial<Booking>) =>
  apiFetch<Booking>(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

/** POST /bookings/{booking_id}/confirm */
export const confirmBooking = (id: number | string) =>
  apiFetch<Booking>(`/bookings/${id}/confirm`, { method: "POST" });

/** POST /bookings/{booking_id}/complete */
export const completeBooking = (id: number | string) =>
  apiFetch<Booking>(`/bookings/${id}/complete`, { method: "POST" });

/** POST /bookings/{booking_id}/cancel */
export const cancelBooking = (id: number | string, reason?: string) =>
  apiFetch<Booking>(`/bookings/${id}/cancel`, {
    method: "POST",
    body: reason ? JSON.stringify({ reason }) : null,
  });
