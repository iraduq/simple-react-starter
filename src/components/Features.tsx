import { ArrowUpRight, Waves, UtensilsCrossed, CalendarHeart, Wifi, Car, Sparkles } from "lucide-react";

const features = [
  {
    no: "01",
    title: "Piscină & Plajă",
    desc: "Piscină exterioară cu vedere la mare și acces direct la plajă privată, la doar 150 de metri de vilă.",
    img: "https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "La 150 m",
    icon: Waves,
  },
  {
    no: "02",
    title: "Restaurant Gourmet",
    desc: "Bucătărie internațională și preparate locale, gătite zilnic cu ingrediente proaspete de la producătorii din zonă.",
    img: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "Mic dejun inclus",
    icon: UtensilsCrossed,
  },
  {
    no: "03",
    title: "Evenimente & Conferințe",
    desc: "Săli luminoase pentru conferințe, nunți și evenimente private memorabile, cu planificare și catering incluse.",
    img: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "Până la 120 persoane",
    icon: CalendarHeart,
  },
  {
    no: "04",
    title: "WiFi Premium",
    desc: "Conexiune de mare viteză în toate camerele și spațiile comune — pentru că vacanța nu înseamnă deconectare totală.",
    img: "https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "1 Gb/s gratuit",
    icon: Wifi,
  },
  {
    no: "05",
    title: "Parcare Supravegheată",
    desc: "Parcare cu cameră video, inclusă în prețul sejurului. Liniște din clipa în care ai ajuns.",
    img: "https://images.pexels.com/photos/2660031/pexels-photo-2660031.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "Inclus în preț",
    icon: Car,
  },
  {
    no: "06",
    title: "Fitness & Wellness",
    desc: "Sală de fitness echipată modern și servicii de masaj la cerere, pentru dimineți care încep cum vrei tu.",
    img: "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop",
    tag: "Masaj la cerere",
    icon: Sparkles,
  },
];

export default function Features() {
  return (
    <section
      id="descopera-facilitati"
      className="relative py-[110px] md:py-[140px] px-5 md:px-10 overflow-hidden bg-[#fafbfc]"
    >
      {/* Top wave — cut out from the navy section above into white */}
      <svg
        className="absolute -top-px left-0 w-full h-[80px] md:h-[120px] pointer-events-none z-[3] block"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
          fill="#c69a3f"
          opacity="0.28"
        />
        <path
          d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
          fill="#0b2650"
          opacity="0.55"
        />
        <path
          d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
          fill="#fafbfc"
        />
      </svg>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle at 15% 25%, rgba(198,154,63,0.12) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(13,44,92,0.10) 0%, transparent 55%)",
        }}
      />

      {/* Faint compass rose watermark */}
      <div
        aria-hidden="true"
        className="absolute right-[-120px] top-1/2 -translate-y-1/2 w-[520px] h-[520px] pointer-events-none opacity-[0.04]"
        style={{
          background:
            "radial-gradient(circle, transparent 48%, #0d2c5c 48.5%, #0d2c5c 49%, transparent 49.5%), radial-gradient(circle, transparent 32%, #0d2c5c 32.5%, #0d2c5c 33%, transparent 33.5%), conic-gradient(from 0deg, #0d2c5c 0deg 2deg, transparent 2deg 90deg, #0d2c5c 90deg 92deg, transparent 92deg 180deg, #0d2c5c 180deg 182deg, transparent 182deg 270deg, #0d2c5c 270deg 272deg, transparent 272deg 360deg)",
          borderRadius: "50%",
        }}
      />

      <div className="relative max-w-[1320px] mx-auto">
        {/* Header */}
        <div className="mb-14 md:mb-20 max-w-[720px] text-center mx-auto">
          <p className="eyebrow mb-4 flex items-center justify-center gap-3 text-[#0d2c5c]/70">
            <span className="gold-rule" />
            Tot ce ai nevoie
            <span className="gold-rule" />
          </p>
          <h2
            className="text-[clamp(2.4rem,4.4vw,3.6rem)] font-normal text-[#0d2c5c] leading-[1.1] mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Facilitățile <em className="italic text-[var(--gold-500)]">noastre</em>
          </h2>
          <p className="text-[#0d2c5c]/65 text-[15px] leading-[1.8] m-0 max-w-[560px] mx-auto">
            Fiecare detaliu e gândit ca tu să nu te gândești la nimic. De la
            plajă la masaj, de la prima cafea dimineața până la ultimul pahar
            de vin pe terasă — totul e la îndemână.
          </p>
        </div>

        {/* Editorial card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.no}
                className="group relative rounded-[14px] overflow-hidden border border-[#0d2c5c]/8 bg-white shadow-[0_10px_40px_rgba(13,44,92,0.08)] transition-all duration-500 hover:-translate-y-1 hover:border-[#c69a3f]/40 hover:shadow-[0_18px_50px_rgba(13,44,92,0.14)]"
              >
                {/* Image with subtle navy tint */}
                <div className="relative h-[240px] overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.title}
                    loading="lazy"
                    className="w-full h-full object-cover block transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(13,44,92,0.10) 0%, rgba(13,44,92,0.35) 55%, rgba(11,38,80,0.72) 100%)",
                    }}
                  />
                  {/* Number monogram */}
                  <span
                    className="absolute top-4 left-5 text-[46px] leading-none text-white/85 [text-shadow:0_2px_16px_rgba(0,0,0,0.4)]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {f.no}
                  </span>
                  {/* Tag pill */}
                  <span className="absolute top-5 right-5 bg-[#c69a3f] text-[#0d2c5c] text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-full shadow-[0_4px_14px_rgba(198,154,63,0.35)]">
                    {f.tag}
                  </span>
                  {/* Icon medallion */}
                  <span className="absolute bottom-4 left-5 w-11 h-11 rounded-full border border-[#c69a3f]/60 bg-white/20 backdrop-blur-sm flex items-center justify-center text-[#c69a3f] transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                    <Icon size={19} strokeWidth={1.6} />
                  </span>
                </div>

                {/* Body */}
                <div className="relative px-6 pt-6 pb-7">
                  <h3
                    className="text-[1.55rem] text-[#0d2c5c] leading-[1.15] mb-3 m-0"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {f.title}
                  </h3>
                  <span className="block w-8 h-px bg-[#c69a3f] opacity-70 mb-4" />
                  <p className="text-[#0d2c5c]/70 leading-[1.7] text-[14px] m-0 mb-5">
                    {f.desc}
                  </p>
                  <a
                    href="#rezerva"
                    className="inline-flex items-center gap-1.5 text-[#c69a3f] text-[11px] font-bold tracking-[0.16em] uppercase transition-all duration-300 group-hover:gap-3"
                  >
                    Descoperă
                    <ArrowUpRight size={13} strokeWidth={2.2} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Bottom mirrored wave — flows into next white section */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[80px] md:h-[120px] pointer-events-none z-[3] block"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
          fill="#c69a3f"
          opacity="0.28"
        />
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
          fill="#0d2c5c"
          opacity="0.55"
        />
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
          fill="#fafbfc"
        />
      </svg>
    </section>
  );
}
