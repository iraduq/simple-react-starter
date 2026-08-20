import type { RoomImage } from "../lib/admin";

export type AvailableRoom = {
  id: number | string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  base_price?: number | null;
  price_per_night?: number | null;
  total_price?: number | null;
  available_units?: number | null;
  images?: RoomImage[];
};

export type AvailabilityQuery = {
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  guests: number;
};
