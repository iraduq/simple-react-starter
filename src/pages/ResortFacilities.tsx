import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Umbrella,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Dumbbell,
  Car,
  Clock,
  Check,
  ArrowRight,
} from "lucide-react";

export interface ResortFacilityItem {
  slug: string;
  title: string;
  eyebrow: string;
  schedule: string;
  accessLabel: string;
  summary: string;
  highlights: string[];
  ctaLabel: string;
  ctaLink: string;
  image: string;
  icon: typeof Umbrella;
}

export const RESORT_FACILITIES: ResortFacilityItem[] = [
  {
    slug: "plaja-privata",
    title: "Plajă privată",
    eyebrow: "Linia 1 la Marea Neagră · Nisip Fin",
    schedule: "Zilnic 07:00 – 21:00",
    accessLabel: "Acces exclusiv pentru oaspeții cazați",
    summary:
      "Plaja privată Vila Casa Esy este rezervată exclusiv oaspeților cazați și oferă o zonă liniștită cu nisip fin, vedere directă spre răsărit și acces rapid din grădina vilei.",
    highlights: [
      "Zonă privată rezervată exclusiv oaspeților cu sejur activ în Vila Casa Esy",
      "Prosoape de plajă din bumbac egiptean oferite gratuit zilnic",
      "Atmosferă intimă și relaxantă pe malul Mării Negre",
      "Acces rapid către terasa restaurantului și camere",
    ],
    ctaLabel: "Vezi Camerele Disponibile",
    ctaLink: "/camere",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    icon: Umbrella,
  },
  {
    slug: "piscina-infinity",
    title: "Piscină infinity",
    eyebrow: "Vedere Panoramică spre Orizontul Mării",
    schedule: "Zilnic 08:00 – 22:00 (Apă încălzită 28°C)",
    accessLabel: "Acces gratuit pentru toți oaspeții cazați",
    summary:
      "Piscina infinity cu margine de sticlă creează iluzia contopirii cu Marea Neagră. Apa este tratată prin electroliză salină blândă cu pielea și menținută la o temperatură constantă de 28°C pe tot parcursul sezonului.",
    highlights: [
      "Zonă de hidromasaj cervical și terasă de relaxare cu vedere spre mare",
      "Iluminat arhitectural subacvatic pentru seri relaxante pe terasă",
      "Serviciu Pool Bar cu cocktailuri artizanale și fresh-uri",
      "Secțiune dedicată cu adâncime redusă pentru familii cu copii",
    ],
    ctaLabel: "Vezi Camerele cu Vedere la Mare",
    ctaLink: "/camere",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85",
    icon: Waves,
  },
  {
    slug: "spa-wellness",
    title: "Spa & Wellness",
    eyebrow: "Sanctuar de Relaxare & Terapii Marine",
    schedule: "Zilnic 09:00 – 21:00",
    accessLabel: "Acces Saună & Hammam inclus în sejur",
    summary:
      "Centrul Spa & Wellness al Vilei Casa Esy îmbină ritualurile thalasso specifice litoralului cu sauna finlandeză panoramică, baia de aburi cu eucalipt (Hammam), fântâna de gheață și camerele de masaj în cuplu.",
    highlights: [
      "Saună uscată finlandeză din lemn de cedru și Hammam cu aromaterapie",
      "Masaje de relaxare, deep-tissue și tratamente faciale organice",
      "Zonă Quiet Lounge cu ceaiuri infuzate, fructe proaspete și apă alcalină",
      "Programări rapide din cameră sau la recepție",
    ],
    ctaLabel: "Rezervă un Sejur Relaxant",
    ctaLink: "/camere",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    icon: Sparkles,
  },
  {
    slug: "restaurant-bar",
    title: "Restaurant & Bar",
    eyebrow: "Gastronomie Mediteraneană & Room Service Live",
    schedule: "Mic Dejun 07:30–10:30 · À la Carte 12:00–23:30",
    accessLabel: "Room Service în Cameră disponibil",
    summary:
      "Restaurantul nostru cu terasă pe malul mării servește pește sălbatic din Marea Neagră, fructe de mare proaspete, paste artizanale și deserturi fine, completate de o selecție de vinuri dobrogene și internaționale.",
    highlights: [
      "Mic dejun bufet & à la carte cu produse locale, cafea de specialitate și prosecco",
      "Comandă online din Meniul Digital direct în camera ta activă",
      "Preparate gătite live și sincronizate în timp real cu bucătăria (KDS)",
      "Opțiuni vegetariene, fără gluten și meniuri dedicate pentru copii",
    ],
    ctaLabel: "Explorează Meniul & Comandă Online",
    ctaLink: "/places",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",
    icon: UtensilsCrossed,
  },
  {
    slug: "sala-fitness",
    title: "Sală de fitness",
    eyebrow: "Antrenament Cardio & Forță cu Vedere spre Grădină",
    schedule: "Zilnic 06:00 – 23:00 (Acces cu PIN Smart Lock)",
    accessLabel: "Acces gratuit pe baza codului PIN al camerei",
    summary:
      "Sala de fitness este echipată cu aparatură profesională Technogym de ultimă generație: benzi de alergare conectate, biciclete eliptice, stații multifuncționale, greutăți libere și zonă dedicată pentru yoga & pilates.",
    highlights: [
      "Acces automat la ușă folosind același cod PIN Smart Lock primit la Self Check-In",
      "Climatizare cu filtrare HEPA, prosoape reci și stație de hidratare gratuită",
      "Echipamente cardio cu ecrane multimedia și trasee virtuale",
      "Sesiuni private de antrenament sau stretching pe plajă la răsărit",
    ],
    ctaLabel: "Descoperă Camerele cu Smart Lock",
    ctaLink: "/camere",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",
    icon: Dumbbell,
  },
  {
    slug: "parcare-gratuita",
    title: "Parcare gratuită",
    eyebrow: "Parcare Privată Supravegheată 24/7 & Stații EV",
    schedule: "Non-stop 24/7 (Acces cu Barieră Automată)",
    accessLabel: "1 loc garantat gratuit / cameră rezervată",
    summary:
      "Oaspeții Vilei Casa Esy beneficiază de parcare privată gratuită în incinta proprietății, monitorizată video 24/7 și iluminată nocturn, dotată inclusiv cu stații Type 2 pentru încărcarea autoturismelor electrice și hibride.",
    highlights: [
      "Loc de parcare garantat pe toată durata sejurului fără costuri suplimentare",
      "Supraveghere video CCTV 24/7 în conformitate cu normele GDPR de securitate",
      "Stații de încărcare rapidă AC 22kW pentru mașini electrice (EV)",
      "Acces direct către recepție și lifturile către camere",
    ],
    ctaLabel: "Contact & Direcții Rutiere",
    ctaLink: "/contact",
    image:
      "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=85",
    icon: Car,
  },
];

export default function ResortFacilities() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("item") || "all";
  const [selectedSlug, setSelectedSlug] = useState<string>(activeSlug);

  useEffect(() => {
    const item = searchParams.get("item");
    if (item) {
      setSelectedSlug(item);
      const el = document.getElementById(`facility-${item}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 120);
      }
    } else {
      setSelectedSlug("all");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white text-[#0d2c5c]">
      {/* Hero Header matching Rooms.tsx & Places.tsx */}
      <section className="relative bg-[#0d2c5c] overflow-hidden pt-28 sm:pt-36 md:pt-48 pb-28 md:pb-36 z-10 text-white">
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-poster.jpg"
            className="h-full w-full object-cover saturate-50 contrast-110 brightness-100"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />
          <div className="absolute inset-0 bg-[#0b2146]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/45 to-[#0d2c5c]/95" />
        </div>

        <div className="mx-auto max-w-5xl relative z-10 px-4 sm:px-6 md:px-10 text-center">
          <p className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 sm:mb-4 flex items-center justify-center gap-3">
            <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
            Experiența Completă · Vila Casa Esy
            <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5.5vw,5rem)] font-normal leading-[1.06] tracking-[-0.015em] mb-4 sm:mb-6">
            Facilități & <em className="italic text-[#c69a3f]">Servicii Exclusive</em>
          </h1>
          <span
            className="my-3 hidden sm:flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <span className="h-px w-14 bg-[#c69a3f]/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
            <span className="h-px w-14 bg-[#c69a3f]/50" />
          </span>
          <p className="mx-auto max-w-2xl text-[14px] sm:text-[17px] text-white/90 leading-[1.6] sm:leading-[1.85] font-light">
            De la plaja privată și piscina infinity încălzită, până la centrul Spa,
            restaurantul mediteranean cu Room Service în cameră și accesul digital cu PIN Smart Lock.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[50px] md:h-[80px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-10 py-16 md:py-24">
        {/* Filter Pills matching Rooms.tsx & Places.tsx */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-20">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`px-5 py-2.5 rounded-full border text-[11.5px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer ${
              selectedSlug === "all"
                ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
                : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
            }`}
          >
            Toate Facilitățile
          </button>
          {RESORT_FACILITIES.map((f) => {
            const Icon = f.icon;
            const isSelected = selectedSlug === f.slug;
            return (
              <button
                key={f.slug}
                type="button"
                onClick={() => setSearchParams({ item: f.slug })}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-[11.5px] font-bold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0d2c5c] text-white border-[#0d2c5c] shadow-sm"
                    : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#0d2c5c] hover:text-[#0d2c5c]"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-[#e6b85c]" : "text-[#0d2c5c]"} />
                {f.title}
              </button>
            );
          })}
        </div>

        {/* Open Showcase Sections without boxy cards */}
        <div className="space-y-24 md:space-y-32">
          {RESORT_FACILITIES.map((f, index) => {
            const reversed = index % 2 === 1;
            const organicRadius = reversed
              ? "rounded-[90px_30px_90px_30px]"
              : "rounded-[30px_90px_30px_90px]";

            return (
              <div
                id={`facility-${f.slug}`}
                key={f.slug}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center"
              >
                <div
                  className={`relative lg:col-span-6 ${
                    reversed ? "lg:order-2" : ""
                  }`}
                >
                  <div
                    className={`hidden sm:block absolute -bottom-5 ${
                      reversed ? "-left-5" : "-right-5"
                    } w-[92%] h-[92%] bg-[#fdf8ec] border border-[#c69a3f]/30 ${organicRadius} -z-10`}
                  />

                  <div
                    className={`absolute -top-6 ${
                      reversed ? "right-6" : "left-6"
                    } z-20 w-16 h-16 rounded-full bg-[#0d2c5c] text-[#e6b85c] border-4 border-white shadow-[0_12px_30px_rgba(13,44,92,0.25)] flex items-center justify-center font-['Cormorant_Garamond',serif] text-2xl italic`}
                  >
                    0{index + 1}
                  </div>

                  <div
                    className={`relative h-[340px] sm:h-[440px] w-full overflow-hidden bg-[#0d2c5c] shadow-[0_25px_60px_-20px_rgba(13,44,92,0.3)] ${organicRadius}`}
                  >
                    <img
                      src={f.image}
                      alt={f.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-105"
                    />
                  </div>
                </div>

                <div
                  className={`lg:col-span-6 flex flex-col items-start ${
                    reversed ? "lg:order-1" : ""
                  }`}
                >
                  <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
                    <span className="w-10 h-px bg-[#c69a3f]" />
                    {f.eyebrow}
                  </p>

                  <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.3rem,4vw,3.6rem)] font-normal leading-[1.06] text-[#0d2c5c] mb-4">
                    {f.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0d2c5c] py-3.5 border-y border-[#0d2c5c]/12 w-full mb-5">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} className="text-[#c69a3f]" />
                      {f.schedule}
                    </span>
                    <span className="mx-3 text-[#c69a3f]">·</span>
                    <span>{f.accessLabel}</span>
                  </div>

                  <p className="text-[15.5px] leading-[1.85] text-[#334155] font-light mb-6">
                    {f.summary}
                  </p>

                  <ul className="space-y-2.5 mb-8">
                    {f.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-3 text-[14.5px] text-[#1e293b]"
                      >
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0d2c5c]/10 text-[#0d2c5c]">
                          <Check size={12} strokeWidth={2.5} />
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={f.ctaLink}
                    className="group inline-flex items-center gap-4 bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] text-[11.5px] tracking-[0.2em] uppercase font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-[0_12px_30px_-10px_rgba(13,44,92,0.35)] no-underline"
                  >
                    <span>{f.ctaLabel}</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
