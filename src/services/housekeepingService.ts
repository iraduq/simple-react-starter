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
  clean_status?: "clean" | "dirty" | "inspecting" | string;
  floor?: number;
  occupancy_state?: "occupied" | "checkout_today" | "checkin_today" | "vacant" | string;
  guest_name?: string | null;
  check_in?: string | null;
  check_out?: string | null;
  open_tickets_count?: number;
  notes?: string | null;
  last_changed?: string | null;
};

/** GET /housekeeping/units — lista tuturor camerelor pentru echipa operațională. */
export const getHousekeepingUnits = () =>
  apiFetch<HousekeepingUnit[]>("/housekeeping/units");

/** PATCH /housekeeping/units/{unit_id}/status — actualizează statusul și/sau igienizarea unității. */
export const updateUnitHousekeeping = (
  unitId: string,
  payload: { status?: "active" | "cleaning" | "maintenance"; clean_status?: "clean" | "dirty" | "inspecting" },
) =>
  apiFetch<HousekeepingUnit>(`/housekeeping/units/${unitId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

/** PATCH /housekeeping/units/{unit_id}/status — marchează unitatea ca activă/curată. */
export const activateUnit = (unitId: string) =>
  updateUnitHousekeeping(unitId, { status: "active", clean_status: "clean" });
