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
  CheckCircle2,
  ArrowRight,
  KeyRound,
  ShieldCheck,
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
    <div className="min-h-screen bg-[#f9fafc] text-[#0d2c5c]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071a33] via-[#0d2c5c] to-[#133b73] pt-36 pb-20 px-6 text-white">
        <div className="mx-auto max-w-6xl relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c69a3f]/40 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#e6b85c]">
            <Sparkles size={13} /> Experiența Completă Vila Casa Esy · Mamaia
          </span>
          <h1 className="mt-4 font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,4.2rem)] font-bold leading-tight">
            Facilități Premium & Servicii Exclusive
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/80 leading-relaxed">
            De la plaja privată și piscina infinity încălzită, până la centrul Spa,
            restaurantul mediteranean cu Room Service în cameră și accesul digital cu PIN Smart Lock.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedSlug === "all"
                  ? "bg-[#c69a3f] text-[#0d2c5c] shadow-lg"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Toate Facilitățile (6)
            </button>
            {RESORT_FACILITIES.map((f) => {
              const Icon = f.icon;
              const isSelected = selectedSlug === f.slug;
              return (
                <button
                  key={f.slug}
                  type="button"
                  onClick={() => setSearchParams({ item: f.slug })}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? "bg-[#c69a3f] text-[#0d2c5c] shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Icon size={14} />
                  {f.title}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities Cards */}
      <section className="mx-auto max-w-6xl px-5 py-14 space-y-10">
        {RESORT_FACILITIES.map((f, index) => {
          const Icon = f.icon;
          const highlighted = selectedSlug === f.slug;
          const reversed = index % 2 === 1;
          return (
            <article
              id={`facility-${f.slug}`}
              key={f.slug}
              className={`grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white overflow-hidden border transition-all duration-300 ${
                highlighted
                  ? "border-[#c69a3f] ring-4 ring-[#c69a3f]/20 shadow-2xl"
                  : "border-[#e1e8f0] shadow-[0_12px_36px_rgba(13,44,92,0.06)]"
              }`}
            >
              <div
                className={`relative lg:col-span-5 min-h-[280px] bg-[#0d2c5c] overflow-hidden ${
                  reversed ? "lg:order-2" : ""
                }`}
              >
                <img
                  src={f.image}
                  alt={f.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a33]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md px-3 py-1 text-xs font-semibold">
                    <Clock size={13} className="text-[#e6b85c]" />
                    {f.schedule}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#c69a3f] text-[#0d2c5c] px-3 py-1 text-[11px] font-extrabold">
                    {f.accessLabel}
                  </span>
                </div>
              </div>

              <div className={`lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between ${reversed ? "lg:order-1" : ""}`}>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fdf8ec] border border-[#c69a3f]/30 text-[#c69a3f]">
                      <Icon size={20} />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c69a3f]">
                      {f.eyebrow}
                    </span>
                  </div>

                  <h2 className="mt-3 font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#0d2c5c]">
                    {f.title}
                  </h2>

                  <p className="mt-3 text-[14.5px] leading-relaxed text-[#4f6280]">{f.summary}</p>

                  <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {f.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 rounded-xl bg-[#f8fafc] border border-[#eef2f7] p-3 text-xs font-medium text-[#243b5e]"
                      >
                        <CheckCircle2 size={15} className="shrink-0 text-[#c69a3f] mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-5 border-t border-[#eef2f7] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-[#6b7c99]">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#0d2c5c]">
                      <KeyRound size={14} className="text-[#c69a3f]" /> Integrat cu PIN-ul Camerei
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#0d2c5c]">
                      <ShieldCheck size={14} className="text-emerald-600" /> Standard 5 Stele
                    </span>
                  </div>

                  <Link
                    to={f.ctaLink}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0d2c5c] hover:bg-[#c69a3f] text-white hover:text-[#0d2c5c] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition no-underline"
                  >
                    {f.ctaLabel}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
