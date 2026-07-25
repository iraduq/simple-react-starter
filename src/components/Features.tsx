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
      className="relative py-[72px] px-5 md:py-24 md:px-10 bg-white overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto">
      <div className="relative text-center mb-16">
        <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
          TOT CE AI NEVOIE
        </p>
        <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4rem)] font-normal text-[#1a1a1a] leading-[1.15] tracking-[-0.01em]">
          Facilitățile <em className="italic text-[#c69a3f]">Noastre</em>
        </h2>
        <span
          className="block w-14 h-0.5 mx-auto mt-5 border-0"
          style={{ background: "linear-gradient(90deg, #c69a3f, transparent)" }}
        />
        <p className="max-w-[520px] mx-auto mt-5 text-[15px] text-[#3c4043] leading-[1.75]">
          Fiecare detaliu este gândit pentru confortul tău — de la piscina cu
          vedere la mare la bucătăria gourmet și spațiile de wellness.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px] md:gap-4 lg:gap-[22px]">
        {items.map(({ icon: Icon, number, title, desc, image }) => (
          <article
            key={title}
            className="group relative h-[380px] md:h-[420px] rounded-[18px] overflow-hidden cursor-default bg-[#0d2c5c] isolate shadow-[0_1px_2px_rgba(7,18,40,0.06),0_18px_48px_-18px_rgba(7,18,40,0.28)] transition-[transform,box-shadow] duration-[600ms] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(7,18,40,0.1),0_32px_68px_-22px_rgba(7,18,40,0.45)]"
          >
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover block scale-[1.06] transition-[transform,filter] duration-[1200ms] group-hover:scale-100"
            />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,18,40,0.85) 0%, rgba(7,18,40,0.25) 45%, transparent 70%)",
              }}
            />
            <div className="absolute top-6 right-6 z-[2] w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center transition-all duration-500 group-hover:bg-[#c69a3f] group-hover:border-[#c69a3f] group-hover:text-[#0d2c5c]">
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <div className="absolute z-[2] text-white font-sans left-0 right-0 bottom-8 text-left px-7">
              <span className="block text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase mb-2.5">
                {number}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] tracking-[0.01em] m-0">
                {title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch]">
                {desc}
              </p>
            </div>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
