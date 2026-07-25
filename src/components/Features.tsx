import { Save as Waves, UtensilsCrossed, CalendarHeart, Wifi, Car, Dumbbell, ArrowRight } from "lucide-react";

const facilities = [
  {
    icon: Waves,
    title: "Piscună & Plajă",
    desc: "Piscină exterioară și acces direct la plajă privată, la doar 150m.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant Gourmet",
    desc: "Bucătărie de autor cu preparate internaționale și locale proaspete.",
  },
  {
    icon: CalendarHeart,
    title: "Sala de Evenimente",
    desc: "Spațiu elegant pentru nunți, conferințe și celebrări private.",
  },
  {
    icon: Wifi,
    title: "WiFi Premium",
    desc: "Internet de mare viteză în toate zonele hotelului și camere.",
  },
  {
    icon: Car,
    title: "Parcare Gratuită",
    desc: "Inclusă în prețul sejurului, supravegheată video 24/7.",
  },
  {
    icon: Dumbbell,
    title: "Fitness & Wellness",
    desc: "Sală modernă, saună și zonă de relaxare pentru o sejur complet.",
  },
];

export default function Features() {
  return (
    <section
      id="descopera-facilitati"
      className="relative py-20 md:py-28 px-5 md:px-10 bg-[#0d2c5c] overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-14">
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
            TOT CE AI NEVOIE
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4rem)] font-normal text-white leading-[1.15] tracking-[-0.01em]">
            Facilitățile <em className="italic text-[#c69a3f]">Noastre</em>
          </h2>
          <p className="max-w-[520px] mx-auto mt-5 text-[15px] text-white/70 leading-[1.75] font-light">
            Fiecare detaliu este gândit pentru confortul tău — de la piscina
            cu vedere la mare la bucătăria gourmet și spațiile de wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {facilities.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-[#0d2c5c] p-8 md:p-10 transition-colors duration-300 hover:bg-[#11386e]"
            >
              <div className="w-14 h-14 rounded-full border border-[#c69a3f]/40 flex items-center justify-center mb-6 transition-all duration-300 group-hover:border-[#c69a3f] group-hover:bg-[#c69a3f]/10">
                <Icon size={24} className="text-[#c69a3f]" strokeWidth={1.5} />
              </div>
              <h3 className="font-['Cormorant_Garamond',serif] text-[1.6rem] font-normal text-white leading-[1.2] mb-3">
                {title}
              </h3>
              <p className="text-[14px] text-white/65 leading-[1.7] font-light m-0">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="#camere"
            className="group inline-flex items-center gap-3 text-white text-xs tracking-[0.25em] uppercase no-underline"
          >
            <span>Vezi toate facilitățile</span>
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/30 transition-all duration-300 group-hover:bg-[#c69a3f] group-hover:text-[#0d2c5c] group-hover:border-[#c69a3f] group-hover:translate-x-1">
              <ArrowRight size={16} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
