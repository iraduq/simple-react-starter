import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Maximize,
  BedDouble,
  Waves,
  Wifi,
  Coffee,
  Bath,
  Star,
} from "lucide-react";
import Footer from "../components/Footer";

type Room = {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  reviews: number;
  guests: number;
  size: string;
  bed: string;
  badge?: string;
  description: string;
  amenities: string[];
  images: string[];
};

const px = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop`;

const rooms: Room[] = [
  {
    id: 1,
    category: "Deluxe",
    title: "Cameră Deluxe Vista Mare",
    subtitle: "Etaj 3 · vedere panoramică la Marea Neagră",
    price: 320,
    rating: 4.9,
    reviews: 48,
    guests: 2,
    size: "32 m²",
    bed: "Pat king-size",
    badge: "Cel mai ales",
    description:
      "Lumina dimineții intră direct din larg, iar balconul privat devine locul preferat pentru cafeaua de la răsărit.",
    amenities: ["Balcon cu vedere la mare", "Wi-Fi fibră", "Mini-bar inclus", "Baie cu cadă"],
    images: [px("271624"), px("164595"), px("279746"), px("1743229")],
  },
  {
    id: 2,
    category: "Suită",
    title: "Suită Prezidențială",
    subtitle: "Etaj 5 · terasă privată de 20 m²",
    price: 680,
    rating: 5.0,
    reviews: 31,
    guests: 4,
    size: "68 m²",
    bed: "Pat king-size + canapea extensibilă",
    badge: "Premium",
    description:
      "Cel mai rafinat spațiu al vilei: living separat, terasă cu șezlonguri și priveliște neîntreruptă către orizont.",
    amenities: ["Terasă privată", "Living separat", "Jacuzzi", "Check-in prioritar"],
    images: [px("1743229"), px("1329711"), px("1457842"), px("271624")],
  },
  {
    id: 3,
    category: "Standard",
    title: "Cameră Standard Confort",
    subtitle: "Etaj 1–2 · deschidere spre grădină",
    price: 180,
    rating: 4.7,
    reviews: 62,
    guests: 2,
    size: "24 m²",
    bed: "Pat matrimonial",
    description:
      "Simplitate caldă, textile naturale și liniștea grădinii interioare — perfectă pentru sejururi scurte.",
    amenities: ["Vedere la grădină", "Wi-Fi fibră", "Aer condiționat", "Mic dejun opțional"],
    images: [px("164595"), px("279746"), px("1329711")],
  },
  {
    id: 4,
    category: "Apartament",
    title: "Apartament Familial",
    subtitle: "Etaj 2 · zonă liniștită, două dormitoare",
    price: 490,
    rating: 4.8,
    reviews: 27,
    guests: 5,
    size: "54 m²",
    bed: "2 dormitoare separate",
    badge: "Recomandat familii",
    description:
      "Spațiu generos pentru familii, cu bucătărie utilată și o zonă de zi în care toată lumea încape confortabil.",
    amenities: ["Bucătărie utilată", "Două băi", "Pătuț la cerere", "Zonă de joacă aproape"],
    images: [px("1457842"), px("271624"), px("164595"), px("1005456")],
  },
  {
    id: 5,
    category: "Deluxe",
    title: "Cameră Deluxe Grădină",
    subtitle: "Parter · acces direct în grădină",
    price: 290,
    rating: 4.8,
    reviews: 39,
    guests: 2,
    size: "30 m²",
    bed: "Pat king-size",
    description:
      "Ușile glisante se deschid direct spre grădina cu pini — dimineți răcoroase și seri lungi sub felinare.",
    amenities: ["Acces direct grădină", "Terasă proprie", "Wi-Fi fibră", "Duș walk-in"],
    images: [px("279746"), px("1005456"), px("271624")],
  },
  {
    id: 6,
    category: "Suită",
    title: "Suită Junior Mare",
    subtitle: "Etaj 4 · panoramă spre faleză",
    price: 520,
    rating: 4.9,
    reviews: 22,
    guests: 3,
    size: "45 m²",
    bed: "Pat king-size + fotoliu pat",
    badge: "Nou",
    description:
      "Un colț de lectură lângă fereastra înaltă, cu faleza desfășurată dedesubt și marea în fundal.",
    amenities: ["Colț de lectură", "Cafetieră premium", "Halate & papuci", "Late check-out"],
    images: [px("1329711"), px("1743229"), px("1457842")],
  },
];

const tabs = ["Toate", "Standard", "Deluxe", "Suită", "Apartament"];

const amenityIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("mare") || l.includes("grădin") || l.includes("teras")) return Waves;
  if (l.includes("wi-fi")) return Wifi;
  if (l.includes("baie") || l.includes("duș") || l.includes("jacuzzi") || l.includes("băi"))
    return Bath;
  return Coffee;
};

function RoomGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string;
}) {
  const [index, setIndex] = useState(0);
  const go = (dir: number) =>
    setIndex((i) => (i + dir + images.length) % images.length);

  return (
    <div className="group/gal relative h-[300px] md:h-full min-h-[340px] overflow-hidden">
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${alt} – imaginea ${i + 1}`}
            loading="lazy"
            className="w-full h-full object-cover shrink-0"
          />
        ))}
      </div>

      {/* gradient bottom for dots legibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d2c5c]/60 to-transparent" />

      <button
        type="button"
        aria-label="Imaginea anterioară"
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/40 bg-[#0d2c5c]/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/gal:opacity-100 md:-translate-x-2 md:group-hover/gal:translate-x-0 transition-all duration-300 hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] max-md:opacity-100"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Imaginea următoare"
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-white/40 bg-[#0d2c5c]/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover/gal:opacity-100 md:translate-x-2 md:group-hover/gal:translate-x-0 transition-all duration-300 hover:bg-[#c69a3f] hover:border-[#c69a3f] hover:text-[#0d2c5c] max-md:opacity-100"
      >
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Mergi la imaginea ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              i === index ? "w-7 bg-[#c69a3f]" : "w-3 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {badge && (
        <span className="absolute top-4 left-4 bg-[#c69a3f] text-[#0d2c5c] text-[10.5px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-full">
          {badge}
        </span>
      )}

      <span className="absolute top-4 right-4 text-[10.5px] font-bold tracking-[0.14em] uppercase text-white/90 bg-[#0d2c5c]/45 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}

export default function Rooms() {
  const [activeTab, setActiveTab] = useState("Toate");
  const filtered =
    activeTab === "Toate" ? rooms : rooms.filter((r) => r.category === activeTab);

  return (
    <div className="text-[#1a1a1a]">
      {/* ── HERO ── */}
      <section
        className="relative flex items-end min-h-[52vh] md:min-h-[62vh] px-5 md:px-10 pb-28 md:pb-36 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(13,44,92,0.55) 0%, rgba(13,44,92,0.9) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5 flex items-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            CAZARE · VILA CASA ESY
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5.5vw,4.4rem)] font-normal text-white leading-[1.12] mb-6 drop-shadow-md">
            Camerele noastre,
            <br />
            <em className="italic text-[#c69a3f]">gândite pentru odihnă</em>
          </h1>
          <p className="font-sans text-white/80 text-[15px] leading-[1.75] font-light max-w-xl">
            Șase tipuri de spații, de la camere luminoase cu vedere la grădină până
            la suita prezidențială cu terasă privată. Fiecare cu propria poveste.
          </p>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full h-[80px] md:h-[120px] pointer-events-none z-[3] block"
          viewBox="0 0 1440 130"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
            fill="#c69a3f"
            opacity="0.35"
          />
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
            fill="#0d2c5c"
            opacity="0.5"
          />
          <path
            transform="translate(0, 130) scale(1, -1)"
            d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
            fill="#ffffff"
          />
        </svg>
      </section>

      {/* ── LISTĂ CAMERE ── */}
      <section className="bg-white py-[60px] md:py-[90px] px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
                Alege-ți spațiul
              </p>
              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.15]">
                Disponibile acum
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full border text-[12.5px] font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-[#0d2c5c] text-white border-[#0d2c5c]"
                      : "border-[#e1e8f0] text-[#3c4043] hover:border-[#0d2c5c] hover:text-[#0d2c5c] hover:bg-[#e6efff]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {filtered.map((room, idx) => (
              <article
                key={room.id}
                className="group grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-[#e1e8f0] bg-white transition-all duration-500 hover:shadow-[0_18px_60px_rgba(13,44,92,0.16)]"
              >
                <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                  <RoomGallery images={room.images} alt={room.title} badge={room.badge} />
                </div>

                <div className="flex flex-col justify-center p-7 md:p-12">
                  <div className="flex items-center justify-between mb-4 gap-4">
                    <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f]">
                      {room.category}
                    </p>
                    <div className="flex items-center gap-1 text-[12.5px] font-semibold">
                      <Star size={13} fill="#c69a3f" color="#c69a3f" />
                      {room.rating}
                      <span className="font-normal text-[#8595aa]">
                        ({room.reviews})
                      </span>
                    </div>
                  </div>

                  <h3 className="font-['Cormorant_Garamond',serif] text-[clamp(1.7rem,2.4vw,2.3rem)] font-normal leading-[1.2] mb-2">
                    {room.title}
                  </h3>
                  <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#8595aa] mb-5">
                    {room.subtitle}
                  </p>

                  <p className="font-sans text-[15px] leading-[1.75] font-light text-[#3d4f6b] mb-7">
                    {room.description}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-7">
                    {[
                      { Icon: Users, label: `${room.guests} persoane` },
                      { Icon: Maximize, label: room.size },
                      { Icon: BedDouble, label: room.bed },
                    ].map(({ Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center text-center gap-2.5 py-4 px-2 rounded-xl bg-white border border-[#e1e8f0] transition-colors duration-300 hover:border-[#c69a3f]/50"
                      >
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0d2c5c]/[0.05] border border-[#c69a3f]/30">
                          <Icon size={15} strokeWidth={1.6} className="text-[#c69a3f]" />
                        </span>
                        <span className="font-sans text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#3d4f6b] leading-tight">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <ul className="flex flex-wrap gap-2 mb-8">
                    {room.amenities.map((a) => {
                      const Icon = amenityIcon(a);
                      return (
                        <li
                          key={a}
                          className="flex items-center gap-2 font-sans text-[12.5px] font-light text-[#3d4f6b] rounded-full border border-[#e1e8f0] bg-[#f6f9fd] px-3.5 py-1.5"
                        >
                          <Icon size={13} strokeWidth={1.6} className="text-[#c69a3f] shrink-0" />
                          {a}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex items-center justify-between gap-6 pt-6 border-t border-[#e1e8f0] flex-wrap">
                    <div className="flex flex-col">
                      <span className="font-sans text-[10px] font-bold tracking-[0.18em] uppercase text-[#8595aa] mb-1.5">
                        De la
                      </span>
                      <span className="flex items-baseline gap-1.5">
                        <span className="font-sans text-[26px] font-bold leading-none tracking-[-0.02em] text-[#0d2c5c]">
                          {room.price}
                        </span>
                        <span className="font-sans text-[12px] font-semibold tracking-[0.08em] uppercase text-[#0d2c5c]">
                          lei
                        </span>
                        <span className="font-sans text-[12px] font-light text-[#8595aa]">
                          / noapte
                        </span>
                      </span>
                    </div>

                    <a
                      href="#rezerva"
                      className="group/cta inline-flex items-center gap-[18px] text-[#0d2c5c] text-xs tracking-[0.25em] uppercase no-underline"
                    >
                      <span>Rezervă acum</span>
                      <span
                        className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#0d2c5c]/30 text-base transition-all duration-300 group-hover/cta:bg-[#c69a3f] group-hover/cta:text-white group-hover/cta:border-[#c69a3f] group-hover/cta:translate-x-1"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </a>
                  </div>
                </div>

              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
