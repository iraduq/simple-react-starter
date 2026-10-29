export type PlaceCategory = "restaurant" | "bar" | "plaja" | "spa" | string;

export type Place = {
  id: number | string;
  title: string;
  category: PlaceCategory;
  desc?: string | null;
  desc_text?: string | null;
  badge?: string | null;
  img?: string | null;
  is_active?: boolean;
  images?: { id: string; image_url: string; alt_text?: string | null }[];
};

export type MenuItem = {
  id: string;
  category_id: number;
  title: string;
  description?: string | null;
  price: number | string;
  volume_or_weight?: string | null;
  ingredients?: string | null;
  image_url?: string | null;
  is_available: boolean;
  is_featured?: boolean;
};

export type MenuCategory = {
  id: number;
  name: string;
  description?: string | null;
  display_order: number;
  is_active: boolean;
  place_id?: number | string | null;
  items?: MenuItem[];
};
