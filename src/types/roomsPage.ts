import { Waves, Wifi, Bath, Coffee } from "lucide-react";

export type RoomImage = { id?: number | string; url?: string; image_url?: string };

export type ApiRoom = {
  id: number | string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  base_price?: number | null;
  price_per_night?: number | null;
  total_price?: number | null;
  capacity?: number | null;
  max_guests?: number | null;
  size_sqm?: number | null;
  is_active?: boolean | null;
  images?: RoomImage[];
  facilities?: { id: number | string; name: string }[] | null;
  category?: string | null;
  room_type?: { name?: string | null } | string | null;
  badge?: string | null;
  amenities?: string[] | null;
  max_guests_adults?: number;
  max_guests_children?: number;
};

export type DisplayRoom = {
  id: number | string;
  category: string;
  title: string;
  price: number;
  total: number | null;
  guests: number;
  size: string;
  badge?: string;
  description: string;
  amenities: string[];
  images: string[];
};

export const FALLBACK_IMG =
  "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop";

export const imageUrl = (img: RoomImage) => img.url || img.image_url || "";

export function mapRoom(r: ApiRoom): DisplayRoom {
  const imgs = (r.images || []).map(imageUrl).filter(Boolean);
  const guests =
    r.max_guests ??
    r.capacity ??
    (r.max_guests_adults || 2) + (r.max_guests_children || 0);
  const amenities =
    r.facilities && r.facilities.length
      ? r.facilities.map((f) => f.name)
      : r.amenities && r.amenities.length
        ? r.amenities
        : ["WiFi", "Aer condiționat", "Baie privată"];
  const type =
    typeof r.room_type === "string" ? r.room_type : r.room_type?.name;
  return {
    id: r.id,
    category: r.category || type || "Cameră",
    title: r.name || r.title || "Cameră",
    price: Number(r.price_per_night ?? r.base_price ?? 0),
    total: r.total_price != null ? Number(r.total_price) : null,
    guests,
    size: r.size_sqm ? `${r.size_sqm} m²` : "30 m²",
    badge: r.badge || undefined,
    description: r.description || "",
    amenities,
    images: imgs.length ? imgs : [FALLBACK_IMG],
  };
}

export const amenityIcon = (label: string) => {
  const l = label.toLowerCase();
  if (/(mare|grădin|teras|piscin)/.test(l)) return Waves;
  if (/(wi-?fi|internet)/.test(l)) return Wifi;
  if (/(baie|duș|jacuzzi|băi|toalet)/.test(l)) return Bath;
  return Coffee;
};

export const REVEAL_DELAY = 1200;

export const float = (duration: number, amp = 25, rot = 6, delay = 0) => ({
  animate: { y: [0, -amp, 0], rotate: [0, rot, 0] },
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay,
  },
});
