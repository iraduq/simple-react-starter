import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import PlaceMenu from "../components/PlaceMenu";
import type { MenuCategory, Place } from "../types/places";
import {
  getFullMenu,
  getPlace,
  menuForPlace,
  placeDescription,
  placeImage,
} from "../services/placesService";

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
        <p className="font-['Cormorant_Garamond',serif] text-3xl">
          Locația nu a fost găsită
        </p>
        <Link
          to="/places"
          className="mt-4 inline-block text-sm font-bold uppercase tracking-[0.16em]"
        >
          Înapoi
        </Link>
      </div>
    );

  const img = placeImage(place);
  return (
    <div className="min-h-screen bg-white text-[#0d2c5c]">
      <section className="relative bg-[#0d2c5c] overflow-hidden px-5 pb-24 pt-36">
        {img && (
          <img
            src={img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/80 via-[#0d2c5c]/60 to-[#0d2c5c]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <Link
            to="/places"
            className="mb-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e6b85c] no-underline hover:text-white"
          >
            <ArrowLeft size={14} /> Toate locațiile
          </Link>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,4.2rem)] text-white">
            {place.title}
          </h1>
          <p className="mt-3 max-w-2xl text-white/85 font-light">
            {placeDescription(place)}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[45px] md:h-[70px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12">
        <PlaceMenu categories={menuForPlace(menu, place)} />
      </section>
    </div>
  );
}
