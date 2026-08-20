import { apiFetch } from "../lib/api";
import { list } from "../lib/admin";
import type {
  AvailabilitySearchPayload,
  AvailableRoom,
  CalendarDay,
  Nomenclature,
  Room,
} from "../types/rooms";
import type { Booking } from "../types/bookings";
import { qs } from "./apiClient";

/** GET /rooms */
export const listRooms = async () => list<Room>(await apiFetch<unknown>("/rooms"));

/** GET /rooms/{room_id} */
export const getRoom = (id: number | string) => apiFetch<Room>(`/rooms/${id}`);

/** POST /rooms */
export const createRoom = (payload: Partial<Room>) =>
  apiFetch<Room>("/rooms", { method: "POST", body: JSON.stringify(payload) });

/** PUT /rooms/{room_id} */
export const updateRoom = (id: number | string, payload: Partial<Room>) =>
  apiFetch<Room>(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(payload) });

/** DELETE /rooms/{room_id} */
export const deleteRoom = (id: number | string) => apiFetch<unknown>(`/rooms/${id}`, { method: "DELETE" });

/** POST /rooms/search/availability */
export const searchAvailability = async (payload: AvailabilitySearchPayload) =>
  list<AvailableRoom>(
    await apiFetch<unknown>("/rooms/search/availability", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );

/* ── nomenclatoare ── */
const nomen = (path: string) => ({
  all: async () => list<Nomenclature>(await apiFetch<unknown>(path)),
  create: (payload: Partial<Nomenclature>) =>
    apiFetch<Nomenclature>(path, { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number | string, payload: Partial<Nomenclature>) =>
    apiFetch<Nomenclature>(`${path}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (id: number | string) => apiFetch<unknown>(`${path}/${id}`, { method: "DELETE" }),
});

/** /rooms/facilities */
export const facilities = nomen("/rooms/facilities");
/** /rooms/room-types */
export const roomTypes = nomen("/rooms/room-types");
/** /rooms/bed-types */
export const bedTypes = nomen("/rooms/bed-types");

/** POST /rooms/{room_id}/images (multipart) */
export const addRoomImage = async (roomId: number | string, form: FormData) =>
  apiFetch<unknown>(`/rooms/${roomId}/images`, { method: "POST", body: form });

/** DELETE /rooms/{room_id}/images/{image_id} */
export const deleteRoomImage = (roomId: number | string, imageId: number | string) =>
  apiFetch<unknown>(`/rooms/${roomId}/images/${imageId}`, { method: "DELETE" });

/** POST /rooms/{room_id}/units */
export const addRoomUnit = (roomId: number | string, payload: unknown) =>
  apiFetch<unknown>(`/rooms/${roomId}/units`, { method: "POST", body: JSON.stringify(payload) });

/** PATCH /rooms/{room_id}/units/{unit_id} */
export const updateRoomUnit = (roomId: number | string, unitId: number | string, payload: unknown) =>
  apiFetch<unknown>(`/rooms/${roomId}/units/${unitId}`, { method: "PATCH", body: JSON.stringify(payload) });

/** DELETE /rooms/{room_id}/units/{unit_id} */
export const deleteRoomUnit = (roomId: number | string, unitId: number | string) =>
  apiFetch<unknown>(`/rooms/${roomId}/units/${unitId}`, { method: "DELETE" });

/** GET /rooms/{room_id}/pricing */
export const roomPricing = (roomId: number | string) => apiFetch<unknown>(`/rooms/${roomId}/pricing`);

/** GET /rooms/{room_id}/calendar */
export const roomCalendar = async (roomId: number | string, start?: string, end?: string) =>
  list<CalendarDay>(await apiFetch<unknown>(`/rooms/${roomId}/calendar${qs({ start, end })}`));

/** POST /rooms/{room_id}/pricing-rules */
export const createPricingRule = (roomId: number | string, payload: unknown) =>
  apiFetch<unknown>(`/rooms/${roomId}/pricing-rules`, { method: "POST", body: JSON.stringify(payload) });

/** GET /rooms/{room_id}/bookings */
export const roomBookings = async (roomId: number | string) =>
  list<Booking>(await apiFetch<unknown>(`/rooms/${roomId}/bookings`));
