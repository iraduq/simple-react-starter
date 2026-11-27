import { Utensils, Wine, Sparkles, LayoutGrid } from "lucide-react";

export const CATEGORIES = [
  { id: "toate", label: "Toate", icon: LayoutGrid },
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "bar", label: "Bar & Lounge", icon: Wine },
  { id: "spa", label: "SPA & Wellness", icon: Sparkles },
];

export const CAT_META: Record<
  string,
  { label: string; icon: typeof Utensils; fallback: string; tags: string[] }
> = {
  restaurant: {
    label: "Restaurant & Room Service",
    icon: Utensils,
    fallback:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80",
    tags: ["Fine Dining", "Room Service în Cameră", "Terasă Panoramică"],
  },
  bar: {
    label: "Bar & Lounge",
    icon: Wine,
    fallback:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&auto=format&fit=crop&q=80",
    tags: ["Cocktailuri de Autor", "Selecție de Vinuri", "Servire în Cameră"],
  },
  spa: {
    label: "SPA & Wellness",
    icon: Sparkles,
    fallback:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&auto=format&fit=crop&q=80",
    tags: ["Masaj Terapeutic", "Saună Finlandeză", "Relaxare Totală"],
  },
};

export const getCategoryMeta = (c?: string) =>
  CAT_META[c?.toLowerCase() ?? ""] ?? CAT_META.restaurant;
