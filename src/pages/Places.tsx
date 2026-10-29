import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, X, ArrowUpRight, Utensils, Wine, Waves, Sparkles } from "lucide-react";
import { useToast } from "../components/Toast";
import PlaceMenu from "../components/PlaceMenu";
import type { MenuCategory, Place } from "../types/places";
import {
  getFullMenu,
  listPlaces,
  menuForPlace,
  placeDescription,
  placeImage,
} from "../services/placesService";

const CATEGORIES = [
  { id: "toate", label: "Toate" },
  { id: "restaurant", label: "Restaurant" },
  { id: "bar", label: "Bar" },
  { id: "plaja", label: "Plajă" },
  { id: "spa", label: "SPA" },
];

const CAT_META: Record<string, { label: string; icon: typeof Utensils; fallback: string }> = {
  restaurant: { label: "Restaurant", icon: Utensils, fallback: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=60" },
  bar: { label: "Bar", icon: Wine, fallback: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&auto=format&fit=crop&q=60" },
  plaja: { label: "Plajă", icon: Waves, fallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=60" },
  spa: { label: "SPA & Wellness", icon: Sparkles, fallback: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&auto=format&fit=crop&q=60" },
};
const meta = (c?: string) => CAT_META[c?.toLowerCase() ?? ""] ?? CAT_META.restaurant;

export default function Places() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("toate");
  const [open, setOpen] = useState<Place | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([listPlaces(), getFullMenu()]).then(([p, m]) => {
      if (!alive) return;
      if (p.status === "fulfilled") setPlaces(p.value);
      else toast("Nu am putut încărca locațiile.", "error");
      if (m.status === "fulfilled") setMenu(m.value);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(
    () => (category === "toate" ? places : places.filter((p) => p.category?.toLowerCase() === category)),
    [places, category],
  );

  return (
    <div className="min-h-screen bg-white text-[#0d2c5c]">
      <section className="relative overflow-hidden bg-[#0d2c5c] px-5 pb-24 pt-36 text-center sm:pt-44">
        <p className="mb-4 flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[#c69a3f]">
          <span className="h-px w-8 bg-[#c69a3f]/60" /> Facilități Casa Esy <span className="h-px w-8 bg-[#c69a3f]/60" />
        </p>
        <h1 className="mx-auto max-w-3xl font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[1.06] text-white">
          Restaurant, bar, plajă & <em className="italic text-[#c69a3f]">SPA</em>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[15px] font-light leading-[1.8] text-white/80">
          Descoperă locațiile din resort și răsfoiește meniul digital al fiecăreia — cu prețuri, gramaje și disponibilitate în timp real.
        </p>
      </section>

      <nav className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2 px-5 pt-12">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
              category === c.id ? "bg-[#0d2c5c] text-white" : "border border-[#e1e8f0] text-[#0d2c5c] hover:border-[#0d2c5c]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        {loading ? (
          <div className="flex flex-col items-center py-24 text-[#c69a3f]">
            <Loader2 size={28} className="mb-3 animate-spin" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0d2c5c]">Se încarcă locațiile…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <MapPin className="mx-auto mb-3 text-[#c69a3f]" size={26} strokeWidth={1.4} />
            <p className="font-['Cormorant_Garamond',serif] text-[26px]">Nicio locație în această categorie</p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const m = meta(p.category);
              const Icon = m.icon;
              const count = menuForPlace(menu, p).reduce((s, c) => s + (c.items?.length ?? 0), 0);
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setOpen(p)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#e1e8f0] bg-white text-left shadow-[0_12px_32px_rgba(13,44,92,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(13,44,92,0.12)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#eef2f7]">
                    <img src={placeImage(p) || m.fallback} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                    {p.badge && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d2c5c]">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-2 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">
                      <Icon size={14} /> {m.label}
                    </span>
                    <h3 className="font-['Cormorant_Garamond',serif] text-[26px] leading-tight">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-[14px] leading-relaxed text-[#4f6280]">{placeDescription(p)}</p>
                    <span className="mt-5 flex items-center justify-between border-t border-[#eef2f7] pt-4 text-[11px] font-bold uppercase tracking-[0.16em]">
                      {count > 0 ? `Vezi meniul · ${count} produse` : "Vezi detalii"}
                      <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[600] flex justify-end bg-[#07203f]/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-3xl overflow-y-auto bg-white"
            >
              <div className="relative h-56 bg-[#0d2c5c] sm:h-64">
                <img src={placeImage(open) || meta(open.category).fallback} alt="" className="h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c] to-transparent" />
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Închide"
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0d2c5c]"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-5 left-6 right-6">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#c69a3f]">{meta(open.category).label}</span>
                  <h2 className="font-['Cormorant_Garamond',serif] text-[34px] leading-tight text-white">{open.title}</h2>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <p className="mb-8 text-[15px] leading-relaxed text-[#4f6280]">{placeDescription(open)}</p>
                <PlaceMenu categories={menuForPlace(menu, open)} />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
