import { apiFetch } from "../lib/api";
import type { AvailabilityQuery, AvailableRoom } from "../types/rooms";

/** `YYYY-MM-DD` → ISO UTC string expected by the backend. */
export const toUtcIso = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toISOString();

/** POST /rooms/search/availability */
export const searchAvailability = (q: AvailabilityQuery) =>
  apiFetch<AvailableRoom[]>("/rooms/search/availability", {
    method: "POST",
    body: JSON.stringify({
      check_in: q.check_in.length === 10 ? toUtcIso(q.check_in) : q.check_in,
      check_out: q.check_out.length === 10 ? toUtcIso(q.check_out) : q.check_out,
      adults: q.adults,
      children: q.children,
      min_price: q.min_price ?? null,
      max_price: q.max_price ?? null,
      facility_ids: q.facility_ids ?? [],
      sort_by: q.sort_by ?? "price",
    }),
  });

/** GET /rooms */
export const listRooms = () => apiFetch<AvailableRoom[]>("/rooms");

/** GET /rooms/{id} */
export const getRoom = (id: string | number) =>
  apiFetch<AvailableRoom>(`/rooms/${id}`);

/** GET /rooms/{id}/calendar — zilele disponibile/blocate pentru o cameră. */
export type RoomCalendarDay = {
  date: string;
  is_available?: boolean | null;
  is_blocked?: boolean | null;
  price?: number | null;
};

export const getRoomCalendar = async (
  roomId: string | number,
  startDate: string,
  endDate: string,
) => {
  const data = await apiFetch<RoomCalendarDay[] | { entries: RoomCalendarDay[] }>(
    `/rooms/${roomId}/calendar?start_date=${startDate}&end_date=${endDate}`,
  );
  const entries = Array.isArray(data) ? data : (data?.entries ?? []);
  return entries.filter((e) => e && typeof e.date === "string");
};

/** Set de date (YYYY-MM-DD) care NU pot fi rezervate. */
export const unavailableDates = (entries: RoomCalendarDay[]) => {
  const set = new Set<string>();
  for (const e of entries) {
    const day = e.date.slice(0, 10);
    if (e.is_blocked === true || e.is_available === false) set.add(day);
  }
  return set;
};
