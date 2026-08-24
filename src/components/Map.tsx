import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { Marker as LeafletMarker, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// Forțează Leaflet să recalculeze dimensiunea hărții după montare
function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Închide popup-ul activ dacă utilizatorul dă click pe o zonă goală a hărții
function ClickAwayHandler({ onClickAway }: { onClickAway: () => void }) {
  useMapEvents({
    click: () => onClickAway(),
  });
  return null;
}

type PlaceCategory = "pensiune" | "plaja" | "restaurant" | "atractie" | "util";

interface Place {
  id: number;
  title: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  thumb: string; // poză mică rotundă pe pin
  img: string; // poză mare în popup
  desc: string;
  badge?: string;
  rating?: number;
}

const CATEGORY_STYLE: Record<PlaceCategory, { color: string; ring: string }> = {
  pensiune: { color: "#c69a3f", ring: "rgba(198,154,63,0.35)" },
  plaja: { color: "#2f8fb0", ring: "rgba(47,143,176,0.35)" },
  restaurant: { color: "#b0532f", ring: "rgba(176,83,47,0.35)" },
  atractie: { color: "#3f7a4f", ring: "rgba(63,122,79,0.35)" },
  util: { color: "#0d2c5c", ring: "rgba(13,44,92,0.35)" },
};

// Pin custom: poză mini rotundă + inel colorat pe categorie + puls la selectare
const createPhotoIcon = (place: Place, active: boolean) => {
  const style = CATEGORY_STYLE[place.category];
  const size = place.category === "pensiune" ? 56 : 46;
  return L.divIcon({
    className: "custom-photo-marker",
    html: `
      <div style="position:relative; width:${size}px; height:${size}px;">
        ${
          active
            ? `<div style="position:absolute; inset:-8px; border-radius:50%; background:${style.ring}; animation: pinPulse 1.4s ease-out infinite;"></div>`
            : ""
        }
        <div style="
          position:relative;
          width:${size}px;
          height:${size}px;
          border-radius:50%;
          overflow:hidden;
          border:3px solid ${active ? style.color : "#ffffff"};
          box-shadow:0 6px 16px rgba(13,44,92,0.35), 0 0 0 2px ${style.color}22;
          transition: border-color .2s ease, box-shadow .2s ease;
          background:#fff;
          cursor:pointer;
        ">
          <img src="${place.thumb}" style="width:100%; height:100%; object-fit:cover; display:block;" />
        </div>
        <div style="
          position:absolute;
          bottom:-4px;
          left:50%;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid ${active ? style.color : "#ffffff"};
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.15));
        "></div>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 4)],
  });
};

// MOCK DATA — structură gata de înlocuit 1:1 cu un fetch() către un API/CMS
// (ex: const { data: PLACES } = useQuery(['places'], fetchPlaces))
const PLACES: Place[] = [
  {
    id: 1,
    title: "Vila Casa Esy",
    category: "pensiune",
    lat: 44.0654,
    lng: 28.6432,
    thumb:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&q=80",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80",
    desc: "Punctul tău de pornire spre vacanța ideală.",
    rating: 5,
  },
  {
    id: 2,
    title: "Plaja Eforie Nord",
    category: "plaja",
    lat: 44.0631,
    lng: 28.6461,
    thumb:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
    desc: "Nisip fin, șezlonguri și acces lin în mare.",
    badge: "5 min pe jos",
    rating: 4.6,
  },
  {
    id: 3,
    title: "Taverna Pescarilor",
    category: "restaurant",
    lat: 44.0668,
    lng: 28.6418,
    thumb:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&q=80",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80",
    desc: "Pește proaspăt și fructe de mare de la Marea Neagră.",
    badge: "10% Reducere Oaspeți",
    rating: 4.8,
  },
  {
    id: 4,
    title: "Lacul Techirghiol",
    category: "atractie",
    lat: 44.0508,
    lng: 28.6215,
    thumb:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=100&q=80",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80",
    desc: "Tratamente naturale cu nămol sapropelic.",
    rating: 4.5,
  },
  {
    id: 5,
    title: "Farmacia Catena 24/7",
    category: "util",
    lat: 44.0645,
    lng: 28.6405,
    thumb:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&q=80",
    img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80",
    desc: "Deschisă non-stop în sezon.",
    rating: 4.2,
  },
];

function Stars({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="text-[11px]"
          style={{ color: i < Math.round(rating) ? "#c69a3f" : "#e5e0d5" }}
        >
          ★
        </span>
      ))}
      <span className="text-[10px] text-zinc-500 ml-1 font-medium">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function InteractiveMap() {
  const markerRefs = useRef<Record<number, LeafletMarker | null>>({});
  const mapRef = useRef<LeafletMap | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Selectează un loc: calculăm offset-ul necesar în PIXELI (nu în grade
  // lat/lng, care variază cu zoom-ul), mutăm harta cu flyTo, apoi deschidem
  // popup-ul abia după ce animația chiar s-a terminat (evenimentul moveend).
  // Așa evităm coliziunea dintre panInside/autoPan și flyTo, care se
  // anulau reciproc și lăsau harta "înțepenită" fără să focalizeze pinul.
  const selectPlace = (place: Place) => {
    setActiveId(place.id);
    const map = mapRef.current;

    if (!map) return;

    const targetZoom = Math.max(map.getZoom(), 15);
    const targetPoint = map.project([place.lat, place.lng], targetZoom);
    // urcăm centrul hărții cu ~170px, ca pinul să ajungă spre partea de jos
    // a cadrului, iar popup-ul (care se deschide deasupra lui) să încapă tot
    const shiftedPoint = targetPoint.subtract([0, 170]);
    const shiftedLatLng = map.unproject(shiftedPoint, targetZoom);

    map.once("moveend", () => {
      markerRefs.current[place.id]?.openPopup();
    });

    map.flyTo(shiftedLatLng, targetZoom, { duration: 0.5 });
  };

  const closeAll = () => {
    setActiveId(null);
    Object.values(markerRefs.current).forEach((m) => m?.closePopup());
  };

  return (
    <section className="relative py-24 md:py-32 px-5 md:px-10 overflow-hidden font-sans bg-white">
      {/* accent auriu sus, în stilul paginilor Contact / Camere */}
      <div className="absolute top-0 left-0 w-full h-px bg-[#e8e2d5]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-[#c69a3f] to-transparent" />

      <div className="max-w-[1280px] mx-auto relative">
        <div className="text-center mb-12">
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5 inline-flex items-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            HARTA ZONEI
            <span className="w-8 h-px bg-[#c69a3f]/60" />
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4rem)] font-normal text-[#0d2c5c] leading-[1.15] tracking-[-0.01em]">
            Ghidul Zonei <em className="italic text-[#c69a3f]">Eforie Nord</em>
          </h2>
          <p className="max-w-[560px] mx-auto mt-5 text-[15px] leading-relaxed text-[#0d2c5c]/70 font-light">
            Descoperă Vila Casa Esy și tot ce te așteaptă în jur — de la plaje
            cu nisip fin, la restaurante cu specific local și punctele de
            interes care fac din Eforie Nord o destinație aparte.
          </p>
        </div>


        <div className="relative rounded-[28px] p-[2px] bg-gradient-to-br from-[#c69a3f] via-[#e8d5a8] to-[#0d2c5c] shadow-2xl">
          <div className="h-[580px] w-full rounded-[26px] overflow-hidden relative z-0">
            <MapContainer
              center={[44.0621, 28.6321]}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <MapResizeFix />
              <ClickAwayHandler onClickAway={closeAll} />
              {/* 100% gratuit, fără API key — tile-uri OpenStreetMap */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {PLACES.map((place) => (
                <Marker
                  key={place.id}
                  position={[place.lat, place.lng]}
                  icon={createPhotoIcon(place, activeId === place.id)}
                  bubblingMouseEvents={false}
                  ref={(el) => {
                    markerRefs.current[place.id] = el;
                  }}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e.originalEvent);
                      selectPlace(place);
                    },
                  }}
                >
                  <Popup
                    closeButton={false}
                    autoPan={false}
                    keepInView={false}
                    maxWidth={260}
                    minWidth={230}
                    offset={[0, -6]}
                    eventHandlers={{
                      remove: () =>
                        setActiveId((cur) => (cur === place.id ? null : cur)),
                    }}
                  >
                    <div className="w-[230px] max-w-[calc(100vw-40px)] overflow-hidden rounded-xl">
                      <div className="relative h-28 w-full">
                        <img
                          src={place.img}
                          alt={place.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                        {place.badge && (
                          <span className="absolute top-2 right-2 bg-[#c69a3f] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow">
                            {place.badge}
                          </span>
                        )}
                        <h4 className="absolute bottom-2 left-3 right-3 text-white font-['Cormorant_Garamond',serif] font-semibold text-lg leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {place.title}
                        </h4>
                      </div>
                      <div className="p-4 bg-white">
                        {place.rating && <Stars rating={place.rating} />}
                        <p className="font-['Cormorant_Garamond',serif] text-[15px] text-[#0d2c5c]/80 italic my-2.5 leading-snug">
                          {place.desc}
                        </p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#ffffff" }}
                          className="group relative flex items-center justify-center gap-1.5 overflow-hidden text-center bg-gradient-to-r from-[#c69a3f] to-[#dab660] !text-white text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-[0.2em] no-underline shadow-[0_4px_14px_rgba(198,154,63,0.45)] transition-transform hover:scale-[1.02]"
                        >
                          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-out" />
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="relative"
                            style={{ color: "#ffffff" }}
                          >
                            <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span
                            className="relative"
                            style={{ color: "#ffffff" }}
                          >
                            Deschide în GPS
                          </span>
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="text-center mt-10 max-w-[560px] mx-auto">
          <p className="text-[15px] leading-relaxed text-white/70 font-light">
            Fiecare locație de pe hartă a fost aleasă cu grijă de echipa
            noastră, pentru ca timpul petrecut la Vila Casa Esy să fie cât mai
            plăcut — de la plaja liniștită de dimineață, la o cină cu fructe de
            mare seara, până la o plimbare relaxantă spre malul lacului. Nu ești
            sigur de unde să începi?{" "}
            <a
              href="#contact"
              className="text-[#c69a3f] font-medium hover:text-[#dab660] transition-colors underline underline-offset-4 decoration-[#c69a3f]/40"
            >
              Recepția noastră e disponibilă 24/7
            </a>{" "}
            și te poate ghida pas cu pas prin tot ce oferă Eforie Nord.
          </p>
        </div>
      </div>

      {/* tranziție simplă spre footer, fără val (nu se potrivea cu fundalul de dedesubt) */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c69a3f]/40 to-transparent" />

      <style>{`
        @keyframes pinPulse {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(13,44,92,0.25);
        }
        .leaflet-popup-content { margin: 0; width: auto !important; }
        .leaflet-popup-tip { display: none; }
        .custom-photo-marker { background: transparent; border: none; }
        .leaflet-marker-icon,
        .leaflet-popup {
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
