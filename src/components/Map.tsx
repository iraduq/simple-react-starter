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
          transform: translateY(${active ? "-4px" : "0"}) scale(${active ? 1.08 : 1});
          transition: all .2s ease;
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

  // Selectează un loc: centrează harta pe punct (ușor coborât, ca popup-ul
  // de deasupra pinului să încapă complet în cadru) și deschide popup-ul.
  const selectPlace = (place: Place) => {
    setActiveId(place.id);
    const map = mapRef.current;
    if (map) {
      const targetZoom = Math.max(map.getZoom(), 15);
      // decalăm centrul spre sud, ca pinul să ajungă în partea de jos
      // a hărții și popup-ul (care se deschide deasupra) să aibă loc
      const latOffset = 0.0035;
      map.flyTo([place.lat - latOffset, place.lng], targetZoom, {
        duration: 0.6,
      });
    }
    setTimeout(() => markerRefs.current[place.id]?.openPopup(), 350);
  };

  const closeAll = () => {
    setActiveId(null);
    Object.values(markerRefs.current).forEach((m) => m?.closePopup());
  };

  return (
    <section className="relative py-20 px-5 bg-[#fdfcf9] overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#c69a3f]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full bg-[#0d2c5c]/10 blur-[110px]" />

      <div className="max-w-[1280px] mx-auto relative">
        <div className="text-center mb-10">
          <p className="text-[#c69a3f] text-xs font-bold tracking-[0.25em] uppercase mb-3">
            Harta Zonei
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl font-normal text-[#1a1a1a]">
            Ghidul Zonei <em className="italic text-[#c69a3f]">Eforie Nord</em>
          </h2>
          <div className="w-16 h-[2px] bg-[#c69a3f] mx-auto mt-5" />
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
                  ref={(el) => {
                    markerRefs.current[place.id] = el;
                  }}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e);
                      selectPlace(place);
                    },
                  }}
                >
                  <Popup
                    closeButton={false}
                    autoPan={true}
                    autoPanPaddingTopLeft={[20, 260]}
                    autoPanPaddingBottomRight={[20, 20]}
                    offset={[0, -6]}
                    eventHandlers={{
                      remove: () =>
                        setActiveId((cur) => (cur === place.id ? null : cur)),
                    }}
                  >
                    <div className="w-[230px] overflow-hidden rounded-xl">
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
                      <div className="p-3 bg-white">
                        {place.rating && <Stars rating={place.rating} />}
                        <p className="text-xs text-zinc-600 my-2 leading-relaxed">
                          {place.desc}
                        </p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-center bg-[#0d2c5c] hover:bg-[#0a2249] transition-colors text-white text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider no-underline"
                        >
                          Deschide în GPS
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

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
      `}</style>
    </section>
  );
}
