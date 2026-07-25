import {
  Save as Waves,
  UtensilsCrossed,
  PartyPopper,
  Wifi,
  Car,
  Dumbbell,
} from "lucide-react";

const items = [
  {
    icon: Waves,
    number: "01",
    title: "Piscină & Plajă",
    desc: "Piscină exterioară cu vedere la mare și acces direct la plajă privată.",
    image:
      "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop",
  },
  {
    icon: UtensilsCrossed,
    number: "02",
    title: "Restaurant Gourmet",
    desc: "Bucătărie internațională și preparate locale gătite cu ingrediente proaspete.",
    image:
      "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop",
  },
  {
    icon: PartyPopper,
    number: "03",
    title: "Evenimente",
    desc: "Săli moderne pentru conferințe, nunți și evenimente private memorabile.",
    image:
      "https://images.pexels.com/photos/265947/pexels-photo-265947.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop",
  },
  {
    icon: Wifi,
    number: "04",
    title: "WiFi Premium",
    desc: "Conexiune de mare viteză în toate camerele și spațiile comune.",
    image:
      "https://images.pexels.com/photos/271643/pexels-photo-271643.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop",
  },
  {
    icon: Car,
    number: "05",
    title: "Parcare Gratuită",
    desc: "Parcare supravegheată video, inclusă în prețul sejurului.",
    image:
      "https://images.pexels.com/photos/1719606/pexels-photo-1719606.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop",
  },
  {
    icon: Dumbbell,
    number: "06",
    title: "Fitness & Wellness",
    desc: "Sală de fitness echipată modern și servicii de masaj la cerere.",
    image:
      "https://images.pexels.com/photos/374589/pexels-photo-374589.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop",
  },
];

export default function Features() {
  return (
    <section
      id="descopera-facilitati"
      className="py-[60px] px-5 md:py-[100px] md:px-10 bg-white"
    >
      <div className="text-center mb-14 md:mb-16">
        <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5 flex items-center justify-center gap-3">
          <span className="w-8 h-px bg-[#c69a3f]/50" />
          Tot ce ai nevoie
          <span className="w-8 h-px bg-[#c69a3f]/50" />
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,4vw,3.2rem)] font-normal text-[#0d2c5c] leading-[1.15]">
          Facilitățile <em className="italic text-[#c69a3f]">Noastre</em>
        </h2>
      </div>

      <div className="max-w-[1320px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {items.map(({ icon: Icon, number, title, desc, image }) => (
          <article
            key={title}
            className="group relative h-[380px] md:h-[420px] rounded-[16px] overflow-hidden cursor-default shadow-[0_10px_30px_rgba(13,44,92,0.12)] transition-shadow duration-500 hover:shadow-[0_24px_60px_rgba(13,44,92,0.3)]"
          >
            {/* Background image */}
            <img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
            />

            {/* Gradient overlay — darker at bottom for text legibility, deepens on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d2c5c]/95 via-[#0d2c5c]/40 to-[#0d2c5c]/10 transition-all duration-500 group-hover:from-[#0d2c5c]/98 group-hover:via-[#0d2c5c]/55" />

            {/* Thin gold border on hover */}
            <div className="absolute inset-0 rounded-[16px] border border-white/0 transition-colors duration-500 group-hover:border-[#c69a3f]/50 pointer-events-none" />

            {/* Number — top left, editorial */}
            <span className="absolute top-6 left-6 font-['Cormorant_Garamond',serif] text-white/40 text-3xl font-light tracking-widest transition-colors duration-500 group-hover:text-[#c69a3f]/70">
              {number}
            </span>

            {/* Icon badge — top right */}
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all duration-500 group-hover:bg-[#c69a3f] group-hover:border-[#c69a3f] group-hover:text-[#0d2c5c] group-hover:rotate-[360deg]">
              <Icon size={20} strokeWidth={1.5} />
            </div>

            {/* Content — bottom, slides up slightly on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-7 transition-transform duration-500 group-hover:-translate-y-1">
              <span className="block w-8 h-px bg-[#c69a3f] mb-4 transition-all duration-500 group-hover:w-14" />
              <h3 className="font-['Cormorant_Garamond',serif] text-[26px] text-white mb-2 tracking-[0.02em] leading-[1.2]">
                {title}
              </h3>
              <p className="text-white/75 leading-[1.65] text-[13.5px] m-0">
                {desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
