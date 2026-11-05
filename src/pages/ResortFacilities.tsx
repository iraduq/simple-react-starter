import { useEffect, useState } from "react";
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
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#0d2c5c] pt-36 pb-28 px-6 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-[#071a33]/90 via-[#0d2c5c]/80 to-[#0d2c5c]" />
        <div className="mx-auto max-w-5xl relative z-10 text-center">
          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[#c69a3f]/60" />
            Experiența Completă · Vila Casa Esy
            <span className="w-8 h-px bg-[#c69a3f]/60" />
          </p>
          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5vw,4.5rem)] font-normal leading-tight">
            Facilități & <em className="italic text-[#c69a3f]">Servicii Exclusive</em>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/85 font-light leading-relaxed">
            De la plaja privată și piscina infinity încălzită, până la centrul Spa,
            restaurantul mediteranean cu Room Service în cameră și accesul digital cu PIN Smart Lock.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[50px] md:h-[75px]"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      {/* Navigare cu subliniere fină + Secțiuni editoriale deschise (fără carduri!) */}
      <section className="mx-auto max-w-6xl px-5 md:px-10 py-14">
        <div className="flex flex-wrap items-center gap-7 border-b border-[#0d2c5c]/15 pb-4 mb-8">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`relative pb-2 text-xs font-bold uppercase tracking-[0.18em] transition cursor-pointer ${
              selectedSlug === "all"
                ? "text-[#0d2c5c]"
                : "text-[#64748b] hover:text-[#0d2c5c]"
            }`}
          >
            Toate Facilitățile
            {selectedSlug === "all" && (
              <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#c69a3f]" />
            )}
          </button>
          {RESORT_FACILITIES.map((f) => {
            const isSelected = selectedSlug === f.slug;
            return (
              <button
                key={f.slug}
                type="button"
                onClick={() => setSearchParams({ item: f.slug })}
                className={`relative pb-2 text-xs font-bold uppercase tracking-[0.18em] transition cursor-pointer ${
                  isSelected
                    ? "text-[#0d2c5c]"
                    : "text-[#64748b] hover:text-[#0d2c5c]"
                }`}
              >
                {f.title}
                {isSelected && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#c69a3f]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-[#0d2c5c]/12">
          {RESORT_FACILITIES.map((f, index) => {
            const reversed = index % 2 === 1;
            return (
              <section
                id={`facility-${f.slug}`}
                key={f.slug}
                className="py-16 md:py-24 first:pt-8 last:pb-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                  <div
                    className={`lg:col-span-6 ${
                      reversed ? "lg:order-2" : ""
                    }`}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f1f5f9]">
                      <img
                        src={f.image}
                        alt={f.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>

                  <div
                    className={`lg:col-span-6 ${
                      reversed ? "lg:order-1" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c69a3f] mb-3">
                      <span className="h-px w-8 bg-[#c69a3f]" />
                      <span>{f.eyebrow}</span>
                    </div>

                    <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,3.6vw,3.4rem)] font-normal leading-[1.08] text-[#0d2c5c] mb-4">
                      {f.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0d2c5c]/80 pb-5 border-b border-[#0d2c5c]/12 mb-5">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} className="text-[#c69a3f]" />
                        {f.schedule}
                      </span>
                      <span className="mx-3 text-[#c69a3f]">·</span>
                      <span>{f.accessLabel}</span>
                    </div>

                    <p className="text-[15.5px] leading-[1.85] text-[#475569] font-light mb-6">
                      {f.summary}
                    </p>

                    <ul className="space-y-2.5 mb-8">
                      {f.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2.5 text-[14px] text-[#243b5e]"
                        >
                          <Check size={16} className="shrink-0 text-[#c69a3f] mt-1" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={f.ctaLink}
                      className="inline-flex items-center gap-2 border-b-2 border-[#0d2c5c] pb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0d2c5c] hover:text-[#c69a3f] hover:border-[#c69a3f] transition no-underline"
                    >
                      {f.ctaLabel}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
