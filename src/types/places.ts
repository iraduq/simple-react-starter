export type Place = {
  id: number | string;
  title: string;
  description?: string | null;
  category?: string | null;
  rating?: number | string | null;
  image_url?: string | null;
  thumb_url?: string | null;
  lat?: number | null;
  lng?: number | null;
};
