import { ArrowUpRight } from "lucide-react";

const features = [
  {
    no: "01",
    title: "Piscină & Plajă",
    desc: "Piscină exterioară cu vedere la mare și acces direct la plajă privată, la doar 150 de metri de vilă.",
    img: "https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "La 150 m",
  },
  {
    no: "02",
    title: "Restaurant Gourmet",
    desc: "Bucătărie internațională și preparate locale, gătite zilnic cu ingrediente proaspete de la producătorii din zonă.",
    img: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "Mic dejun inclus",
  },
  {
    no: "03",
    title: "Evenimente & Conferințe",
    desc: "Săli luminoase pentru conferințe, nunți și evenimente private memorabile, cu planificare și catering incluse.",
    img: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "Până la 120 persoane",
  },
  {
    no: "04",
    title: "WiFi Premium",
    desc: "Conexiune de mare viteză în toate camerele și spațiile comune — pentru că vacanța nu înseamnă deconectare totală.",
    img: "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "1 Gb/s gratuit",
  },
  {
    no: "05",
    title: "Parcare Supravegheată",
    desc: "Parcare cu cameră video, inclusă în prețul sejurului. Liniște din clipa în care ai ajuns.",
    img: "https://images.pexels.com/photos/2660031/pexels-photo-2660031.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "Inclus în preț",
  },
  {
    no: "06",
    title: "Fitness & Wellness",
    desc: "Sală de fitness echipată modern și servicii de masaj la cerere, pentru dimineți care încep cum vrei tu.",
    img: "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "Masaj la cerere",
  },
];

export default function Features() {
  return (
    <section
      id="descopera-facilitati"
      className="py-[72px] px-5 md:py-28 md:px-10 bg-white"
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Header */}
        <div className="mb-14 md:mb-20 max-w-[640px]">
          <p className="eyebrow mb-3 flex items-center gap-3">
            <span className="gold-rule" />
            Tot ce ai nevoie
          </p>
          <h2
            className="text-[clamp(2.2rem,4vw,3.2rem)] font-normal text-[var(--navy-900)] leading-[1.1] mb-5"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Facilitățile <em className="italic text-[var(--gold-500)]">noastre</em>
          </h2>
          <p className="text-[var(--ink-700)] text-[15px] leading-[1.7] m-0">
            Fiecare detaliu e gândit ca tu să nu te gândești la nimic. De la
            plajă la masaj, de la prima cafea dimineața până la ultimul pahar
            de vin pe terasă — totul e la îndemână.
          </p>
        </div>

        {/* Editorial mosaic — alternating image side, asymmetric */}
        <div className="flex flex-col gap-16 md:gap-24">
          {features.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <article
                key={f.no}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-14 items-center"
              >
                {/* Image */}
                <div
                  className={`relative rounded-[14px] overflow-hidden shadow-[0_10px_40px_rgba(13,44,92,0.12)] ${
                    flip ? "md:order-2" : ""
                  }`}
                >
                  <img
                    src={f.img}
                    alt={f.title}
                    loading="lazy"
                    className="w-full h-[340px] md:h-[440px] object-cover block transition-transform duration-[600ms] ease-out hover:scale-[1.04]"
                  />
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[var(--navy-900)] text-[10.5px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full">
                    {f.tag}
                  </span>
                </div>

                {/* Text */}
                <div className={flip ? "md:order-1 md:pr-4" : "md:pl-4"}>
                  <span
                    className="block text-[var(--gold-500)] text-[13px] tracking-[0.18em] mb-4"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {f.no}
                  </span>
                  <h3
                    className="text-[clamp(1.7rem,2.6vw,2.4rem)] text-[var(--navy-900)] leading-[1.1] mb-4 m-0"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {f.title}
                  </h3>
                  <span className="block w-10 h-px bg-[var(--gold-500)] opacity-50 mb-5" />
                  <p className="text-[var(--ink-700)] leading-[1.75] text-[15px] m-0 max-w-[440px] mb-6">
                    {f.desc}
                  </p>
                  <a
                    href="#rezerva"
                    className="inline-flex items-center gap-1.5 text-[var(--navy-900)] text-[12px] font-bold tracking-[0.12em] uppercase border-b border-[var(--gold-500)] pb-1 transition-colors duration-200 hover:text-[var(--gold-500)]"
                  >
                    Descoperă
                    <ArrowUpRight size={14} strokeWidth={2} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
