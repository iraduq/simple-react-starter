import {
  Umbrella,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Dumbbell,
  Car,
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
