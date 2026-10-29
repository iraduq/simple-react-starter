import { apiFetch } from "../lib/api";
import type { MenuCategory, MenuItem, Place } from "../types/places";

const asList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  const d = data as { items?: T[]; data?: T[]; places?: T[] } | null;
  const l = d?.items ?? d?.data ?? d?.places;
  return Array.isArray(l) ? l : [];
};

/** GET /places — doar locațiile active. */
export const listPlaces = async () =>
  asList<Place>(await apiFetch<unknown>("/places")).filter(
    (p) => p && p.is_active !== false,
  );

/** GET /places/{place_id} */
export const getPlace = (id: string | number) =>
  apiFetch<Place>(`/places/${id}`);

export const placeDescription = (p: Place) => p.desc_text ?? p.desc ?? "";
export const placeImage = (p: Place) => p.img || p.images?.[0]?.image_url || "";

/** GET /menu/full — categorii cu produse. */
export const getFullMenu = async () =>
  asList<MenuCategory>(await apiFetch<unknown>("/menu/full"))
    .filter((c) => c && c.is_active !== false)
    .map((c) => ({ ...c, items: Array.isArray(c.items) ? c.items : [] }))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

/**
 * Categoriile care aparțin unei locații. Dacă serverul încă nu trimite
 * `place_id`, afișăm tot meniul pentru locațiile cu servire (restaurant/bar/plajă).
 */
export const menuForPlace = (menu: MenuCategory[], place: Place) => {
  const linked = menu.some((c) => c.place_id != null);
  if (linked) return menu.filter((c) => String(c.place_id) === String(place.id));
  return ["restaurant", "bar", "plaja"].includes(place.category?.toLowerCase())
    ? menu
    : [];
};

/** Preț în lei, mereu cu 2 zecimale: 34 → „34,00 lei”. */
export const lei = (v: number | string | null | undefined) => {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lei`;
};

export type { MenuItem };
