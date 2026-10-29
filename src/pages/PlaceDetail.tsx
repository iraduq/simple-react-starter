import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import PlaceMenu from "../components/PlaceMenu";
import type { MenuCategory, Place } from "../types/places";
import { getFullMenu, getPlace, menuForPlace, placeDescription, placeImage } from "../services/placesService";

export default function PlaceDetail() {
  const { placeId } = useParams();
  const [place, setPlace] = useState<Place | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!placeId) return;
    Promise.allSettled([getPlace(placeId), getFullMenu()]).then(([p, m]) => {
      if (p.status === "fulfilled") setPlace(p.value);
      if (m.status === "fulfilled") setMenu(m.value);
      setLoading(false);
    });
  }, [placeId]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-[#c69a3f]">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!place)
    return (
      <div className="min-h-screen pt-40 text-center text-[#0d2c5c]">
        <p className="font-['Cormorant_Garamond',serif] text-3xl">Locația nu a fost găsită</p>
        <Link to="/places" className="mt-4 inline-block text-sm font-bold uppercase tracking-[0.16em]">Înapoi</Link>
      </div>
    );

  const img = placeImage(place);
  return (
    <div className="min-h-screen bg-white text-[#0d2c5c]">
      <section className="relative bg-[#0d2c5c] px-5 pb-16 pt-36">
        {img && <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="relative mx-auto max-w-5xl">
          <Link to="/places" className="mb-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
            <ArrowLeft size={14} /> Toate locațiile
          </Link>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,4rem)] text-white">{place.title}</h1>
          <p className="mt-3 max-w-2xl text-white/80">{placeDescription(place)}</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-12">
        <PlaceMenu categories={menuForPlace(menu, place)} />
      </section>
    </div>
  );
}
