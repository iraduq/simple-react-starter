export type RoomImage = { id: number | string; url?: string; image_url?: string };

export type RoomUnit = {
  id: number | string;
  name?: string | null;
  code?: string | null;
  status?: string | null;
  is_active?: boolean | null;
};

export type Nomenclature = {
  id: number | string;
  name: string;
  icon?: string | null;
  description?: string | null;
};

export type Room = {
  id: number | string;
  name: string;
  slug?: string | null;
  description?: string | null;
  base_price?: number | null;
  capacity?: number | null;
  max_adults?: number | null;
  max_children?: number | null;
  size_sqm?: number | null;
  room_type_id?: number | string | null;
  bed_type_id?: number | string | null;
  is_active?: boolean | null;
  images?: RoomImage[];
  units?: RoomUnit[];
  facilities?: Nomenclature[];
  amenities?: string[] | null;
  rating?: number | null;
  reviews?: number | null;
  category?: string | null;
  badge?: string | null;
  bed?: string | null;
};

export type AvailabilitySearchPayload = {
  check_in: string;
  check_out: string;
  adults?: number;
  children?: number;
  guests?: number;
};

export type AvailableRoom = Room & {
  available_units?: number | null;
  total_price?: number | null;
  price_per_night?: number | null;
};

export type CalendarDay = {
  date: string;
  price?: number | null;
  available?: boolean | null;
  blocked?: boolean | null;
};
