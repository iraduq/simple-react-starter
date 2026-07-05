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
    img: "https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100",
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
      className="relative py-[110px] md:py-[150px] px-5 md:px-10 overflow-hidden bg-white"
    >
      {/* Faint corner ornaments in gold — editorial mark, not decoration */}
      <div
        aria-hidden="true"
        className="absolute top-16 left-10 hidden md:block w-[1px] h-[70px] bg-gradient-to-b from-transparent via-[#c69a3f]/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute top-16 right-10 hidden md:block w-[1px] h-[70px] bg-gradient-to-b from-transparent via-[#c69a3f]/60 to-transparent"
      />

      <div className="relative max-w-[1320px] mx-auto">
        {/* Header */}
        <div className="mb-16 md:mb-24 grid md:grid-cols-12 items-end gap-8">
          <div className="md:col-span-7">
            <p className="eyebrow mb-5 flex items-center gap-3 text-[#0d2c5c]/70">
              <span className="gold-rule" />
              Tot ce ai nevoie · La îndemână
            </p>
            <h2
              className="text-[clamp(2.6rem,5vw,4.2rem)] font-normal text-[#0d2c5c] leading-[1.02] tracking-[-0.01em] m-0"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Facilitățile
              <br />
              <em className="italic text-[var(--gold-500)]">noastre</em>
              <span className="inline-block align-middle ml-4 w-16 h-px bg-[#c69a3f]" />
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-[#0d2c5c]/65 text-[15px] leading-[1.85] m-0 md:pl-8 md:border-l md:border-[#0d2c5c]/10">
              Fiecare detaliu e gândit ca tu să nu te gândești la nimic.
              De la plajă la masaj, de la prima cafea dimineața până la
              ultimul pahar de vin pe terasă — totul e la îndemână.
            </p>
          </div>
        </div>

        {/* Bento editorial grid: featured card + 5 companions */}
        <div className="grid grid-cols-1 md:grid-cols-6 auto-rows-[240px] md:auto-rows-[210px] gap-5 md:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            // Feature: first card spans 3 cols x 2 rows (tall image left)
            // Second: 3 cols x 1 row (wide banner)
            // 3,4: 3 cols x 1 row each
            // 5,6: 3 cols x 1 row each
            const layout = [
              "md:col-span-3 md:row-span-2",
              "md:col-span-3 md:row-span-1",
              "md:col-span-3 md:row-span-1",
              "md:col-span-2 md:row-span-1",
              "md:col-span-2 md:row-span-1",
              "md:col-span-2 md:row-span-1",
            ][i];
            const isHero = i === 0;
            const isBanner = i === 1 || i === 2;
            return (
              <article
                key={f.no}
                className={`group relative overflow-hidden rounded-[6px] border border-[#0d2c5c]/8 bg-white shadow-[0_1px_2px_rgba(13,44,92,0.04)] transition-all duration-700 hover:border-[#c69a3f]/50 hover:shadow-[0_24px_60px_-20px_rgba(13,44,92,0.35)] ${layout}`}
              >
                {/* Background image */}
                <img
                  src={f.img}
                  alt={f.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                />
                {/* Dark editorial gradient */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background: isHero
                      ? "linear-gradient(180deg, rgba(13,44,92,0.15) 0%, rgba(13,44,92,0.55) 55%, rgba(8,26,58,0.92) 100%)"
                      : "linear-gradient(180deg, rgba(13,44,92,0.25) 0%, rgba(13,44,92,0.55) 50%, rgba(8,26,58,0.88) 100%)",
                  }}
                />
                {/* Gold hairline frame appearing on hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-3 border border-[#c69a3f]/0 rounded-[3px] transition-all duration-500 group-hover:inset-2 group-hover:border-[#c69a3f]/40"
                />

                {/* Top row: number + tag */}
                <div className="absolute top-4 md:top-5 left-5 right-5 flex items-start justify-between z-[2]">
                  <span
                    className={`text-white/85 leading-none ${
                      isHero ? "text-[64px] md:text-[84px]" : "text-[38px] md:text-[46px]"
                    }`}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    <span className="text-[#c69a3f]">·</span>
                    {f.no}
                  </span>
                  <span className="mt-2 bg-white/95 text-[#0d2c5c] text-[9.5px] font-bold tracking-[0.16em] uppercase px-2.5 py-1.5 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
                    {f.tag}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-[2]">
                  <div className="flex items-end gap-4">
                    <span
                      className={`shrink-0 rounded-full border border-[#c69a3f]/70 bg-[#0d2c5c]/40 backdrop-blur-md flex items-center justify-center text-[#c69a3f] transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110 ${
                        isHero ? "w-14 h-14" : "w-11 h-11"
                      }`}
                    >
                      <Icon size={isHero ? 22 : 18} strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-white leading-[1.1] m-0 ${
                          isHero
                            ? "text-[1.9rem] md:text-[2.3rem]"
                            : isBanner
                            ? "text-[1.5rem] md:text-[1.7rem]"
                            : "text-[1.25rem] md:text-[1.35rem]"
                        }`}
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {f.title}
                      </h3>
                      {(isHero || isBanner) && (
                        <p className="text-white/75 text-[13px] leading-[1.65] m-0 mt-2 max-w-[46ch]">
                          {f.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reveal action on hover */}
                  <div className="mt-4 flex items-center gap-3 opacity-0 -translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="h-px flex-1 bg-gradient-to-r from-[#c69a3f]/70 to-transparent" />
                    <a
                      href="#rezerva"
                      className="inline-flex items-center gap-1.5 text-[#c69a3f] text-[10.5px] font-bold tracking-[0.18em] uppercase"
                    >
                      Descoperă
                      <ArrowUpRight size={13} strokeWidth={2.2} />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer signature line */}
        <div className="mt-16 md:mt-20 flex items-center justify-center gap-4 text-[#0d2c5c]/55 text-[11px] tracking-[0.28em] uppercase">
          <span className="w-14 h-px bg-[#c69a3f]/50" />
          <span>Curated · Discreet · Al Tău</span>
          <span className="w-14 h-px bg-[#c69a3f]/50" />
        </div>
      </div>
    </section>
  );
}
