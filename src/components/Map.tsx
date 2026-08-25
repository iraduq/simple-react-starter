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
import { motion } from "framer-motion";

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
  thumb: string;
  img: string;
  desc: string;
  badge?: string;
  rating?: number;
}

const CATEGORY_STYLE: Record<PlaceCategory, { color: string; ring: string }> = {
  pensiune: { color: "#c69a3f", ring: "rgba(198,154,63,0.35)" },
  plaja: { color: "#2f8fb0", ring: "rgba(47,143,176,0.35)" },
  restaurant: { color: "#b0532f", ring: "rgba(176,83,47,0.35)" },
  atractie: { color: "#3f7a4f", ring: "rgba(63,122,79,0.35)" },
  util: { color: "#ffffff", ring: "rgba(255,255,255,0.35)" }, // schimbat pt vizibilitate pe navy
};

// 🌟 Pin custom redesenat pentru efectul de Bounce + Glow + Umbră
const createPhotoIcon = (place: Place, active: boolean) => {
  const style = CATEGORY_STYLE[place.category];
  const size = place.category === "pensiune" ? 56 : 46;

  // Generăm un delay random pentru ca, dacă ai 10 pini, să nu sară toți robotic în același timp
  const animDelay = (Math.random() * 1.5).toFixed(2);

  return L.divIcon({
    className: "custom-photo-marker",
    html: `
      <div style="position:relative; width:${size}px; height:${size}px;">
        
        <!-- 1. Umbră dedesubt (se micșorează când pinul sare) -->
        <div style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: ${size * 0.5}px;
          height: 6px;
          background: rgba(0,0,0,0.5);
          border-radius: 50%;
          filter: blur(3px);
          animation: shadowBounce 2s infinite ease-in-out;
          animation-delay: ${animDelay}s;
        "></div>

        <!-- 2. Corpul Pinului (sare în sus și în jos) -->
        <div style="
          position:relative;
          width: 100%;
          height: 100%;
          animation: pinBounce 2s infinite ease-in-out;
          animation-delay: ${animDelay}s;
        ">
          
          <!-- Efectul de Glow/Pulsare din spate -->
          <div style="
            position:absolute; 
            inset:-5px; 
            border-radius:50%; 
            background:${style.color}; 
            opacity: 0.5;
            animation: pinPulse 2s ease-out infinite;
            animation-delay: ${animDelay}s;
          "></div>

          <!-- Cercul principal cu imaginea -->
          <div style="
            position:relative;
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            overflow:hidden;
            border:3px solid ${active ? style.color : "#ffffff"};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: border-color .3s ease;
            background:#fff;
            cursor:pointer;
            z-index: 10;
          ">
            <img src="${place.thumb}" style="width:100%; height:100%; object-fit:cover; display:block;" />
          </div>

          <!-- Vârful pin-ului (Triunghiul de jos) -->
          <div style="
            position:absolute;
            bottom:-6px;
            left:50%;
            transform:translateX(-50%);
            width:0;
            height:0;
            border-left:7px solid transparent;
            border-right:7px solid transparent;
            border-top:9px solid ${active ? style.color : "#ffffff"};
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
            transition: border-top-color .3s ease;
            z-index: 9;
          "></div>

        </div>
      </div>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 15)], // Ridicat ușor ca să nu acopere pin-ul când sare
  });
};

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

  const selectPlace = (place: Place) => {
    setActiveId(place.id);
    const map = mapRef.current;
    if (!map) return;

    const targetZoom = Math.max(map.getZoom(), 15);
    const targetPoint = map.project([place.lat, place.lng], targetZoom);
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
    <section className="relative bg-[#0d2c5c] py-24 md:py-32 px-5 md:px-10 overflow-hidden font-sans">
      {/* ── BACKGROUND MAP TEXTURE (Puncte aurii subtile) ── */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(198,154,63,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── AMBIENT BACKGROUND ORBS (Sfere de lumină pulsante) ── */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--gold)]/10 rounded-full blur-[120px] animate-[pulse_7s_ease-in-out_infinite] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-[#1e4d8c]/30 rounded-full blur-[130px] animate-[pulse_9s_ease-in-out_infinite_reverse] pointer-events-none z-0" />

      {/* ── TRANZIȚIE SUS: Val alb ── */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[40px] md:h-[70px] rotate-180"
        >
          <path
            d="M0,120 C200,80 400,20 600,60 C800,100 1000,40 1200,80 L1200,120 L0,120 Z"
            className="fill-white"
          />
        </svg>
      </div>

      {/* ── ELEMENTE NAUTICE STÂNGA JOS (Busolă / Radar rotativ) ── */}
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute left-[-5%] top-[20%] w-[400px] h-[400px] text-[var(--gold)] opacity-[0.07] pointer-events-none z-0 hidden md:block"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          strokeDasharray="4 4"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="28"
          stroke="currentColor"
          strokeWidth="0.2"
          fill="none"
        />
        <path
          d="M50 2 L50 98 M2 50 L98 50"
          stroke="currentColor"
          strokeWidth="0.5"
        />
        <path
          d="M16 16 L84 84 M16 84 L84 16"
          stroke="currentColor"
          strokeWidth="0.2"
          strokeDasharray="2 2"
        />
      </motion.svg>

      {/* ── COORDONATE GEOGRAFICE SUS DREAPTA ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-[12%] right-[5%] flex-col items-end text-[var(--gold)] opacity-30 pointer-events-none z-0 hidden lg:flex"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] tracking-[0.4em] font-light uppercase">
            Lat 44.0621° N
          </span>
          <span className="w-6 h-px bg-[var(--gold)]" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.4em] font-light uppercase">
            Lng 28.6321° E
          </span>
          <span className="w-12 h-px bg-[var(--gold)]" />
        </div>
      </motion.div>

      {/* ── ROZA VÂNTURILOR (N, S, E, V) JOS DREAPTA ── */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-5%] right-[-5%] w-[350px] h-[350px] text-[var(--gold)] opacity-[0.08] pointer-events-none z-0 hidden md:block"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="100"
            cy="100"
            r="98"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="5 5"
          />
          <path
            d="M100 2 L100 198 M2 100 L198 100"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <path
            d="M30 30 L170 170 M30 170 L170 30"
            stroke="currentColor"
            strokeWidth="0.2"
            strokeDasharray="2 4"
          />
          <text
            x="100"
            y="16"
            textAnchor="middle"
            fill="currentColor"
            fontSize="12"
            letterSpacing="1"
            fontFamily="sans-serif"
          >
            N
          </text>
          <text
            x="100"
            y="192"
            textAnchor="middle"
            fill="currentColor"
            fontSize="12"
            letterSpacing="1"
            fontFamily="sans-serif"
          >
            S
          </text>
          <text
            x="188"
            y="104"
            textAnchor="middle"
            fill="currentColor"
            fontSize="12"
            letterSpacing="1"
            fontFamily="sans-serif"
          >
            E
          </text>
          <text
            x="12"
            y="104"
            textAnchor="middle"
            fill="currentColor"
            fontSize="12"
            letterSpacing="1"
            fontFamily="sans-serif"
          >
            V
          </text>
        </svg>
      </motion.div>

      {/* ── BACKGROUND WATERMARK DECORATIV ── */}
      <svg
        className="absolute -right-32 top-[40%] w-[600px] h-[600px] text-[#c69a3f] opacity-[0.04] pointer-events-none animate-[spin_120s_linear_infinite_reverse] z-0"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 C55 20 80 45 100 50 C80 55 55 80 50 100 C45 80 20 55 0 50 C20 45 45 20 50 0 Z" />
        <path
          d="M50 15 C52 25 75 48 85 50 C75 52 52 75 50 85 C48 75 25 52 15 50 C25 48 48 25 50 15 Z"
          opacity="0.5"
        />
      </svg>

      <div className="max-w-[1280px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5 inline-flex items-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            HARTA ZONEI
            <span className="w-8 h-px bg-[#c69a3f]/60" />
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4rem)] font-normal text-white leading-[1.15] tracking-[-0.01em]">
            Ghidul Zonei <em className="italic text-[#c69a3f]">Eforie Nord</em>
          </h2>
          <p className="max-w-[560px] mx-auto mt-5 text-[15px] leading-relaxed text-white/80 font-light">
            Descoperă Vila Casa Esy și tot ce te așteaptă în jur — de la plaje
            cu nisip fin, la restaurante cu specific local și punctele de
            interes care fac din Eforie Nord o destinație aparte.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[28px] p-[2px] bg-gradient-to-br from-[#c69a3f] via-white/10 to-[#1e4d8c] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]"
        >
          {/* Glare effect peste border-ul hărții */}
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10" />

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
                    <div className="w-[230px] max-w-[calc(100vw-40px)] overflow-hidden rounded-xl bg-white shadow-xl">
                      <div className="relative h-28 w-full">
                        <img
                          src={place.img}
                          alt={place.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d2c5c] via-[#0d2c5c]/50 to-transparent" />
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
                        <p className="font-['Cormorant_Garamond',serif] text-[15px] text-[#0d2c5c]/80 italic my-2.5 leading-snug m-0">
                          {place.desc}
                        </p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#ffffff" }}
                          className="group relative flex items-center justify-center gap-1.5 overflow-hidden text-center bg-[#0d2c5c] !text-white text-[10px] font-bold mt-3 py-2.5 rounded-lg uppercase tracking-[0.2em] no-underline shadow-[0_4px_14px_rgba(13,44,92,0.3)] transition-all hover:bg-[#1e4d8c]"
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="relative"
                          >
                            <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="relative">Deschide GPS</span>
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12 max-w-[560px] mx-auto"
        >
          <p className="text-[15px] leading-relaxed text-white/70 font-light">
            Fiecare locație de pe hartă a fost aleasă cu grijă de echipa
            noastră, pentru ca timpul petrecut la Vila Casa Esy să fie cât mai
            plăcut. Nu ești sigur de unde să începi?{" "}
            <a
              href="#contact"
              className="text-[#c69a3f] font-medium hover:text-[#e8d5a8] transition-colors underline underline-offset-4 decoration-[#c69a3f]/40"
            >
              Recepția noastră e disponibilă 24/7
            </a>{" "}
            și te poate ghida pas cu pas prin tot ce oferă Eforie Nord.
          </p>
        </motion.div>
      </div>

      {/* ── CSS PENTRU ANIMAȚIA PINURILOR DE PE HARTĂ ── */}
      <style>{`
        @keyframes pinBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shadowBounce {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          50% { transform: translateX(-50%) scale(0.5); opacity: 0.15; }
        }
        @keyframes pinPulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          background: transparent;
          box-shadow: none;
        }
        .leaflet-popup-content { margin: 0; width: auto !important; }
        .leaflet-popup-tip { display: none; }
        .custom-photo-marker { background: transparent; border: none; outline: none; }
        .leaflet-marker-icon,
        .leaflet-popup {
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
