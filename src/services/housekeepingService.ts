import { apiFetch } from "../lib/api";

export type HousekeepingUnit = {
  id?: string;
  unit_id?: string;
  room_id?: string;
  room_title?: string;
  title?: string;
  unit_number?: string;
  number?: string;
  code?: string;
  status?: "active" | "cleaning" | "maintenance" | string;
  notes?: string | null;
  last_changed?: string | null;
};

/** GET /housekeeping/units — lista tuturor camerelor pentru echipa de curățenie. */
export const getHousekeepingUnits = () =>
  apiFetch<HousekeepingUnit[]>("/housekeeping/units");

/** PATCH /housekeeping/units/{unit_id}/status — marchează unitatea ca activă/curată. */
export const activateUnit = (unitId: string) =>
  apiFetch<HousekeepingUnit>(`/housekeeping/units/${unitId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: "active" }),
  });
