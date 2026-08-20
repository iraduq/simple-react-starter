import { apiFetch } from "../lib/api";
import type { AvailabilityQuery, AvailableRoom } from "../types/rooms";

/** POST /rooms/search/availability */
export const searchAvailability = (q: AvailabilityQuery) =>
  apiFetch<AvailableRoom[]>("/rooms/search/availability", {
    method: "POST",
    body: JSON.stringify(q),
  });

/** GET /rooms */
export const listRooms = () => apiFetch<AvailableRoom[]>("/rooms");

/** GET /rooms/{id} */
export const getRoom = (id: string | number) =>
  apiFetch<AvailableRoom>(`/rooms/${id}`);
