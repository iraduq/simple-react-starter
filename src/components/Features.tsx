import {
  Save as Waves,
  UtensilsCrossed,
  CalendarHeart,
  Wifi,
  Car,
  Dumbbell,
  ArrowRight,
} from "lucide-react";

const facilities = [
  {
    icon: Waves,
    title: "Piscină & Plajă",
    desc: "Piscină exterioară și acces direct la plajă privată, la doar 150m distanță.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant Gourmet",
    desc: "Bucătărie de autor cu preparate internaționale și locale proaspete.",
  },
  {
    icon: CalendarHeart,
    title: "Sală de Evenimente",
    desc: "Spațiu elegant pentru nunți, conferințe și celebrări private memorabile.",
  },
  {
    icon: Wifi,
    title: "WiFi Premium",
    desc: "Internet de mare viteză în toate zonele hotelului și în camere.",
  },
  {
    icon: Car,
    title: "Parcare Gratuită",
    desc: "Inclusă în prețul sejurului, securizată și supravegheată video 24/7.",
  },
  {
    icon: Dumbbell,
    title: "Fitness & Wellness",
    desc: "Sală modernă, saună și zonă de relaxare pentru un sejur complet.",
  },
];

export default function Features() {
  return (
    <section
      id="descopera-facilitati"
      className="relative py-24 md:py-32 px-5 md:px-10 bg-white overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header Secțiune */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 md:mb-28">
          <div className="max-w-2xl">
            <p className="font-sans text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-[#c69a3f] mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c69a3f]/60" />
              Tot ce ai nevoie
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-4xl md:text-5xl lg:text-6xl font-normal text-zinc-900 leading-tight">
              Facilitățile <em className="italic text-[#c69a3f]">Noastre</em>
            </h2>
          </div>

          <p className="max-w-md text-base md:text-lg text-zinc-500 leading-relaxed font-light pb-2">
            Fiecare detaliu este gândit pentru confortul tău — de la piscina cu
            vedere la mare la bucătăria gourmet și spațiile de wellness.
          </p>
        </div>

        {/* Grid Editorial (Fără Carduri) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 md:gap-y-24">
          {facilities.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group flex flex-col items-start">
              {/* Icon simplu, fără cutie */}
              <div className="mb-6 transform transition-transform duration-500 group-hover:-translate-y-2">
                <Icon size={38} className="text-[#c69a3f]" strokeWidth={1} />
              </div>

              {/* Text */}
              <h3 className="font-['Cormorant_Garamond',serif] text-2xl md:text-3xl font-normal text-zinc-900 leading-snug mb-4">
                {title}
              </h3>
              <p className="text-sm md:text-base text-zinc-500 leading-relaxed font-light m-0 max-w-[90%]">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Buton / Link */}
        <div className="mt-20 md:mt-28 border-t border-zinc-100 pt-10 flex justify-center">
          <a
            href="#camere"
            className="group inline-flex items-center gap-4 text-zinc-900 text-xs md:text-sm font-bold tracking-[0.2em] uppercase no-underline transition-colors hover:text-[#c69a3f]"
          >
            <span>Descoperă mai multe</span>
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-zinc-200 transition-all duration-500 group-hover:bg-[#c69a3f] group-hover:text-white group-hover:border-[#c69a3f]">
              <ArrowRight
                size={18}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
