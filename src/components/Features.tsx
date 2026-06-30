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
    title: "Piscină & Plajă",
    desc: "Piscină exterioară cu vedere la mare și acces direct la plajă privată.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant Gourmet",
    desc: "Bucătărie internațională și preparate locale gătite cu ingrediente proaspete.",
  },
  {
    icon: PartyPopper,
    title: "Evenimente",
    desc: "Săli moderne pentru conferințe, nunți și evenimente private memorabile.",
  },
  {
    icon: Wifi,
    title: "WiFi Premium",
    desc: "Conexiune de mare viteză în toate camerele și spațiile comune.",
  },
  {
    icon: Car,
    title: "Parcare Gratuită",
    desc: "Parcare supravegheată video, inclusă în prețul sejurului.",
  },
  {
    icon: Dumbbell,
    title: "Fitness & Wellness",
    desc: "Sală de fitness echipată modern și servicii de masaj la cerere.",
  },
];

export default function Features() {
  return (
    <section id="descopera-facilitati" className="py-[60px] px-5 md:py-[90px] md:px-10 bg-white">
      <div className="text-center mb-12">
        <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
          Tot ce ai nevoie
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a1a1a] leading-[1.15]">
          Facilitățile Noastre
        </h2>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {items.map(({ icon: Icon, title, desc }) => (
          <article
            key={title}
            className="group text-center py-10 px-7 bg-[#f4f7fb] border border-[#e1e8f0] rounded-[10px] transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(13,44,92,0.14)] hover:bg-white"
          >
            <div className="w-14 h-14 rounded-full bg-[#e6efff] text-[#1e4d8c] flex items-center justify-center mx-auto mb-5 transition-colors duration-200 group-hover:bg-[#1e4d8c] group-hover:text-white">
              <Icon size={26} strokeWidth={1.5} />
            </div>
            <h3 className="font-['Cormorant_Garamond',serif] text-xl mb-2.5 text-[#0d2c5c] tracking-[0.04em]">
              {title}
            </h3>
            <p className="text-[#3c4043] leading-[1.65] text-sm m-0">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
