export type Place = {
  id: number | string;
  title: string;
  name?: string | null;
  category?: string | null;
  description?: string | null;
  badge?: string | null;
  rating?: number | null;
  lat?: number | null;
  lng?: number | null;
  thumb_url?: string | null;
  image_url?: string | null;
  distance_km?: number | null;
};
