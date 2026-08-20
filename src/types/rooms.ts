import type { RoomImage, Nomenclature } from "../lib/admin";

export type AvailableRoom = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  capacity?: number | null;
  max_guests?: number | null;
  base_price?: number | null;
  price_per_night?: number | null;
  total_price?: number | null;
  available_units?: number | null;
  room_type?: { id?: number | string; name?: string | null } | string | null;
  facilities?: Nomenclature[];
  images?: RoomImage[];
};

export type AvailabilityQuery = {
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  min_price?: number | null;
  max_price?: number | null;
  facility_ids?: (number | string)[];
  sort_by?: "price" | "capacity" | string;
};
