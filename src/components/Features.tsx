import { ArrowRight } from "lucide-react";

const facilities = {
  piscina: {
    num: "01",
    title: "Piscină & Plajă",
    label: "Răsfăț la Marea Neagră",
    desc: "Piscină exterioară și acces direct la plajă privată, la doar 150m distanță.",
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
  },
  restaurant: {
    num: "02",
    title: "Restaurant Gourmet",
    label: "Arome Locale",
    desc: "Bucătărie de autor cu preparate internaționale și pește proaspăt.",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  wellness: {
    num: "03",
    title: "Fitness & Wellness",
    label: "Echilibru & Vitalitate",
    desc: "Sală modernă, saună finlandeză și zonă de relaxare.",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
  },
  evenimente: {
    num: "04",
    title: "Sală de Evenimente",
    label: "Momente Memorabile",
    desc: "Spațiu elegant pentru nunți, conferințe și celebrări private.",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80",
  },
  facilitati: {
    num: "05",
    title: "WiFi & Parcare 24/7",
    label: "Confort Absolut",
    desc: "Internet de mare viteză și parcare privată supravegheată video.",
    img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
  },
};

const tileBase =
  "group relative overflow-hidden cursor-pointer bg-[#0d2c5c] isolate shadow-[0_1px_2px_rgba(7,18,40,0.06),0_18px_48px_-18px_rgba(7,18,40,0.28)] transition-[transform,box-shadow] duration-[600ms] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(7,18,40,0.1),0_32px_68px_-22px_rgba(7,18,40,0.45)] max-[760px]:col-span-1 max-[760px]:row-span-1";

const tileImg =
  "absolute inset-0 w-full h-full object-cover block scale-[1.06] transition-[transform,filter] duration-[1200ms] group-hover:scale-100";

export default function Features() {
  const { piscina, restaurant, wellness, evenimente, facilitati } = facilities;

  return (
    <section
      id="descopera-facilitati"
      className="relative py-[72px] px-5 md:py-24 md:px-10 pb-[60px] md:pb-20 overflow-hidden bg-white"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header Secțiune cu Valuri Decorative */}
        <div className="relative text-center mb-16">
          <svg
            className="absolute left-0 top-1/2 -translate-y-1/2 w-24 md:w-32 h-auto opacity-15 hidden md:block"
            viewBox="0 0 120 80"
            fill="none"
          >
            <path
              d="M10 40 Q30 20, 50 40 T90 40"
              stroke="#1e4d8c"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M5 50 Q25 30, 45 50 T85 50"
              stroke="#0d2c5c"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M15 60 Q35 40, 55 60 T95 60"
              stroke="#1e4d8c"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          <svg
            className="absolute right-0 top-1/2 -translate-y-1/2 w-24 md:w-32 h-auto opacity-15 hidden md:block"
            viewBox="0 0 120 80"
            fill="none"
          >
            <path
              d="M30 40 Q50 20, 70 40 T110 40"
              stroke="#1e4d8c"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M35 50 Q55 30, 75 50 T115 50"
              stroke="#0d2c5c"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M25 60 Q45 40, 65 60 T105 60"
              stroke="#1e4d8c"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
            TOT CE AI NEVOIE · CASA ESY
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4rem)] font-normal text-[#1a1a1a] leading-[1.15] tracking-[-0.01em]">
            Facilitățile <em className="italic text-[#c69a3f]">Noastre</em>
          </h2>
          <span
            className="block w-14 h-0.5 mx-auto mt-5 border-0"
            style={{
              background: "linear-gradient(90deg, #c69a3f, transparent)",
            }}
          />
          <p className="max-w-[520px] mx-auto mt-5 text-[15px] text-[#3c4043] leading-[1.75]">
            Fiecare detaliu este gândit pentru confortul tău — de la piscina cu
            vedere la mare la bucătăria gourmet și spațiile de wellness.
          </p>
        </div>

        {/* Grid Editorial Bento Forme Geometrice */}
        <div className="grid grid-cols-12 auto-rows-[280px] md:auto-rows-[200px] lg:auto-rows-[240px] gap-[18px] md:gap-4 lg:gap-[22px] max-[760px]:grid-cols-1">
          {/* 1 · Piscină & Plajă — Grand Arch */}
          <article
            className={`${tileBase} col-span-4 row-span-2 rounded-t-[999px] rounded-b-lg max-[760px]:rounded-t-[200px] max-[760px]:rounded-b-xl`}
          >
            <img
              src={piscina.img}
              alt={piscina.title}
              loading="lazy"
              className={tileImg}
            />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,18,40,0.85) 0%, rgba(7,18,40,0.25) 45%, transparent 70%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 bottom-9 text-center px-7">
              <span className="block text-[#c69a3f] text-[10px] tracking-[0.3em] uppercase mb-2.5">
                {piscina.num}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] tracking-[0.01em] m-0">
                {piscina.title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch] mx-auto">
                {piscina.desc}
              </p>
            </div>
          </article>

          {/* 2 · Restaurant Gourmet — Soft Rect */}
          <article
            className={`${tileBase} col-span-4 row-span-1 rounded-[18px]`}
          >
            <img
              src={restaurant.img}
              alt={restaurant.title}
              loading="lazy"
              className={`${tileImg} opacity-55 group-hover:opacity-40`}
            />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(7,18,40,0.35), rgba(7,18,40,0.65))",
              }}
            />
            <div className="absolute z-[2] text-white font-sans inset-0 flex flex-col items-center justify-center text-center p-6">
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] m-0">
                {restaurant.title}
              </h3>
              <span className="block w-0 h-px bg-[#c69a3f] mt-3.5 mx-auto transition-[width] duration-500 group-hover:w-16" />
              <p className="inline-block mt-3.5 text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase mb-0">
                {restaurant.label}
              </p>
            </div>
          </article>

          {/* 3 · Fitness & Wellness — Circle / Hover Card */}
          <article
            className={`${tileBase} col-span-4 row-span-1 rounded-full border-4 border-[#fdfcf9] shadow-[0_2px_6px_rgba(7,18,40,0.08),0_26px_60px_-18px_rgba(7,18,40,0.35)] max-[760px]:aspect-square max-[760px]:h-auto`}
          >
            <img
              src={wellness.img}
              alt={wellness.title}
              loading="lazy"
              className={tileImg}
            />
            <div className="absolute inset-0 pointer-events-none z-[1] bg-[rgba(7,18,40,0.18)] transition-colors duration-500 group-hover:bg-transparent" />
            <div className="absolute z-[2] inset-0 m-auto w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full bg-white/90 backdrop-blur-[6px] flex flex-col items-center justify-center text-center p-5 scale-100 opacity-100 md:scale-[0.85] md:opacity-0 transition-[transform,opacity] duration-500 md:group-hover:scale-100 md:group-hover:opacity-100">
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[1.4rem] text-[#0d2c5c] m-0 leading-[1.15]">
                {wellness.title}
              </h3>
              <span className="block mt-2.5 text-[#c69a3f] text-[10px] tracking-[0.3em] uppercase">
                {wellness.label}
              </span>
            </div>
          </article>

          {/* 4 · Sală de Evenimente — Wave Shapes */}
          <article
            className={`${tileBase} col-span-5 row-span-1 rounded-[80px_20px_80px_20px]`}
          >
            <img
              src={evenimente.img}
              alt={evenimente.title}
              loading="lazy"
              className={tileImg}
            />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,18,40,0.85) 0%, rgba(7,18,40,0.25) 45%, transparent 70%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 bottom-8 text-left px-11">
              <span className="block text-[#c69a3f] text-[10px] tracking-[0.3em] uppercase mb-2.5">
                {evenimente.num}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] m-0">
                {evenimente.title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch]">
                {evenimente.desc}
              </p>
            </div>
          </article>

          {/* 5 · WiFi & Parcare 24/7 — Inverted Arch */}
          <article
            className={`${tileBase} col-span-3 row-span-1 rounded-b-[999px] rounded-t-lg max-[760px]:rounded-b-[200px] max-[760px]:rounded-t-xl`}
          >
            <img
              src={facilitati.img}
              alt={facilitati.title}
              loading="lazy"
              className={tileImg}
            />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(7,18,40,0.55) 0%, rgba(7,18,40,0.05) 55%, transparent 80%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 top-10 text-center px-[22px]">
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.4rem,1.8vw,1.9rem)] leading-[1.1] m-0">
                {facilitati.title}
              </h3>
              <span className="inline-block mt-3.5 text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase">
                {facilitati.label}
              </span>
            </div>
          </article>
        </div>

        {/* Buton Navigare Jos */}
        <div className="mt-[72px] text-center">
          <a
            href="#camere"
            className="group inline-flex items-center gap-[22px] text-[#0d2c5c] text-xs tracking-[0.25em] uppercase no-underline font-semibold"
          >
            <span>Descoperă camerele noastre</span>
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[rgba(7,18,40,0.15)] text-base transition-all duration-300 group-hover:bg-[#0d2c5c] group-hover:text-white group-hover:border-[#0d2c5c]"
              aria-hidden="true"
            >
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
