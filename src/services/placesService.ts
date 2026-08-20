import { apiFetch } from "../lib/api";
import type { Place } from "../types/places";

/** GET /places */
export const listPlaces = () => apiFetch<Place[]>("/places");

/** GET /places/{place_id} */
export const getPlace = (id: string | number) =>
  apiFetch<Place>(`/places/${id}`);
