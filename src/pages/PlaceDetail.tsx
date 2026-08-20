import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Star, Loader as Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getPlace } from "../services/placesService";
import { httpErrorMessage } from "../services/apiClient";
import type { Place } from "../types/places";

/** GET /places/{place_id} */
export default function PlaceDetail({ placeId }: { placeId: string | number }) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    setLoading(true);
    setError(null);
    getPlace(placeId)
      .then((p) => on && setPlace(p))
      .catch((e) => on && setError(httpErrorMessage(e, "Locația nu a putut fi încărcată.")))
      .finally(() => on && setLoading(false));
    return () => {
      on = false;
    };
  }, [placeId]);

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-[#8595aa]">
        <Loader2 size={16} className="animate-spin" /> Se încarcă…
      </div>
    );

  if (error || !place)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="text-[15px] text-red-600">{error ?? "Locația nu a fost găsită."}</p>
        <Link to="/places" className="mt-4 inline-block text-[13px] font-semibold text-[#0d2c5c] underline">
          Înapoi la atracții
        </Link>
      </div>
    );

  const img = place.image_url || place.thumb_url;

  return (
    <article className="mx-auto max-w-[900px] px-4 py-10 lg:py-14">
      <Link
        to="/places"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6b7c99] hover:text-[#0d2c5c]"
      >
        <ArrowLeft size={14} /> Toate atracțiile
      </Link>

      {img && (
        <img
          src={img}
          alt={place.title}
          className="mt-6 h-[260px] w-full rounded-2xl object-cover sm:h-[380px]"
          loading="lazy"
        />
      )}

      <h1
        className="mt-7 text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-[#0d2c5c]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {place.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-[#3d4f6b]">
        {place.category && <span className="rounded-full bg-[#f4e5c8] px-3 py-1 text-[11.5px] font-semibold text-[#8a6413]">{place.category}</span>}
        {place.rating != null && (
          <span className="inline-flex items-center gap-1.5">
            <Star size={14} className="text-[#c69a3f]" /> {Number(place.rating).toFixed(1)}
          </span>
        )}
        {place.lat != null && place.lng != null && (
          <a
            className="inline-flex items-center gap-1.5 underline"
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={14} className="text-[#c69a3f]" /> Vezi pe hartă
          </a>
        )}
      </div>

      {place.description && (
        <p className="mt-6 text-[14.5px] leading-relaxed text-[#3d4f6b]">{place.description}</p>
      )}
    </article>
  );
}
