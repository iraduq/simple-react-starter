import { apiFetch } from "../lib/api";
import { list } from "../lib/admin";
import type { Place } from "../types/places";

/** GET /places */
export const listPlaces = async () => list<Place>(await apiFetch<unknown>("/places"));

/** GET /places/{place_id} */
export const getPlace = (id: number | string) => apiFetch<Place>(`/places/${id}`);

/** POST /places */
export const createPlace = (payload: Partial<Place>) =>
  apiFetch<Place>("/places", { method: "POST", body: JSON.stringify(payload) });

/** PATCH /places/{place_id} */
export const updatePlace = (id: number | string, payload: Partial<Place>) =>
  apiFetch<Place>(`/places/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

/** DELETE /places/{place_id} */
export const deletePlace = (id: number | string) => apiFetch<unknown>(`/places/${id}`, { method: "DELETE" });
