import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  "group relative overflow-hidden cursor-pointer bg-[#0d2c5c] isolate shadow-[0_10px_30px_-10px_rgba(7,18,40,0.2)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(7,18,40,0.35)] h-[380px] sm:h-[420px] md:h-auto rounded-[32px]";

const tileImg =
  "absolute inset-0 w-full h-full object-cover block scale-105 transition-transform duration-[1200ms] group-hover:scale-100";

export default function Features() {
  const navigate = useNavigate();
  const { piscina, restaurant, wellness, evenimente, facilitati } = facilities;

  return (
    <section
      id="descopera-facilitati"
      className="relative py-20 px-5 md:py-28 md:px-10 overflow-hidden bg-white"
    >
      {/* ── OBIECTE MARITIME PE FUNDAL ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] opacity-[0.03] md:opacity-[0.06]"
          style={{ animation: "spin 180s linear infinite" }}
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#122F5B"
              strokeWidth="2"
              strokeDasharray="4 6"
            />
            <circle cx="100" cy="100" r="65" stroke="#122F5B" strokeWidth="1" />
            <circle cx="100" cy="100" r="50" stroke="#122F5B" strokeWidth="3" />
            <path
              d="M100 10 L115 85 L190 100 L115 115 L100 190 L85 115 L10 100 L85 85 Z"
              fill="#122F5B"
              fillOpacity="0.2"
            />
          </svg>
        </div>
      </div>

      {/* ── CONȚINUTUL PRINCIPAL ── */}
      <div className="relative max-w-[1280px] mx-auto z-10">
        <div className="relative text-center mb-16 md:mb-20">
          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3">
            TOT CE AI NEVOIE · CASA ESY
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5vw,4.2rem)] font-normal text-[#0d2c5c] leading-[1.1] tracking-[-0.01em]">
            Facilitățile <em className="italic text-[#c69a3f]">Noastre</em>
          </h2>
          <span
            className="block w-14 h-0.5 mx-auto mt-4 border-0"
            style={{
              background: "linear-gradient(90deg, #c69a3f, transparent)",
            }}
          />
          <p className="max-w-[540px] mx-auto mt-4 text-[15px] text-[#5a6b85] font-light leading-[1.75]">
            Fiecare detaliu este gândit pentru confortul tău — de la piscina cu
            vedere la mare la bucătăria gourmet și spațiile de wellness.
          </p>
        </div>

        {/* Grid Bento adaptat perfect pentru mobil și desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:auto-rows-[220px] lg:auto-rows-[250px] gap-6 md:gap-5 lg:gap-6">
          {/* 1 · Piscină & Plajă */}
          <article
            className={`${tileBase} md:col-span-4 md:row-span-2 md:rounded-t-[100px] md:rounded-b-[32px]`}
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
                  "linear-gradient(to top, rgba(13,44,92,0.92) 0%, rgba(13,44,92,0.3) 50%, transparent 80%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 bottom-8 text-center px-6">
              <span className="block text-[#c69a3f] text-[10px] tracking-[0.3em] uppercase mb-2 font-bold">
                {piscina.num}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[2rem] md:text-[2.2rem] leading-[1.1] tracking-[-0.01em] mb-2">
                {piscina.title}
              </h3>
              <p className="text-[13.5px] leading-[1.6] text-white/85 font-light max-w-[32ch] mx-auto">
                {piscina.desc}
              </p>
            </div>
          </article>

          {/* 2 · Restaurant Gourmet */}
          <article className={`${tileBase} md:col-span-4 md:row-span-1`}>
            <img
              src={restaurant.img}
              alt={restaurant.title}
              loading="lazy"
              className={`${tileImg} opacity-60 group-hover:opacity-40`}
            />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(13,44,92,0.4), rgba(13,44,92,0.8))",
              }}
            />
            <div className="absolute z-[2] text-white font-sans inset-0 flex flex-col items-center justify-center text-center p-6">
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[2rem] md:text-[2.2rem] leading-[1.1] mb-2">
                {restaurant.title}
              </h3>
              <span className="block w-12 h-px bg-[#c69a3f] my-2 transition-all duration-500 group-hover:w-20" />
              <p className="inline-block text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase font-bold m-0">
                {restaurant.label}
              </p>
            </div>
          </article>

          {/* 3 · Fitness & Wellness */}
          <article
            className={`${tileBase} md:col-span-4 md:row-span-1 md:rounded-full border-[6px] border-[#f8fafd] shadow-lg`}
          >
            <img
              src={wellness.img}
              alt={wellness.title}
              loading="lazy"
              className={tileImg}
            />
            <div className="absolute inset-0 pointer-events-none z-[1] bg-[rgba(13,44,92,0.3)] transition-colors duration-500 group-hover:bg-[rgba(13,44,92,0.1)]" />
            <div className="absolute z-[2] inset-0 m-auto w-[220px] h-[220px] md:w-[210px] md:h-[210px] rounded-full bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 shadow-2xl md:scale-90 md:opacity-0 transition-all duration-500 md:group-hover:scale-100 md:group-hover:opacity-100">
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[1.6rem] text-[#0d2c5c] leading-[1.15] mb-1.5">
                {wellness.title}
              </h3>
              <span className="text-[#c69a3f] text-[10px] tracking-[0.25em] uppercase font-bold">
                {wellness.label}
              </span>
            </div>
          </article>

          {/* 4 · Sală de Evenimente */}
          <article
            className={`${tileBase} md:col-span-5 md:row-span-1 md:rounded-[60px_20px_60px_20px]`}
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
                  "linear-gradient(to top, rgba(13,44,92,0.9) 0%, rgba(13,44,92,0.3) 50%, transparent 80%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 bottom-6 text-left px-6 md:px-10">
              <span className="block text-[#c69a3f] text-[10px] tracking-[0.3em] uppercase mb-1.5 font-bold">
                {evenimente.num}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[1.9rem] md:text-[2.1rem] leading-[1.1] mb-1.5">
                {evenimente.title}
              </h3>
              <p className="text-[13px] leading-[1.5] text-white/80 font-light max-w-[32ch] m-0">
                {evenimente.desc}
              </p>
            </div>
          </article>

          {/* 5 · WiFi & Parcare 24/7 */}
          <article
            className={`${tileBase} md:col-span-3 md:row-span-1 md:rounded-b-[100px] md:rounded-t-[32px]`}
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
                  "linear-gradient(to bottom, rgba(13,44,92,0.85) 0%, rgba(13,44,92,0.2) 60%, transparent 90%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 top-6 text-center px-5">
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[1.6rem] md:text-[1.8rem] leading-[1.1] mb-1">
                {facilitati.title}
              </h3>
              <span className="inline-block text-[#c69a3f] text-[10px] tracking-[0.25em] uppercase font-bold">
                {facilitati.label}
              </span>
            </div>
          </article>
        </div>

        {/* Buton Navigare Jos - Funcțional */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate("/disponibilitate")}
            className="group inline-flex items-center gap-4 text-[#0d2c5c] text-xs tracking-[0.25em] uppercase bg-transparent border-none cursor-pointer font-bold"
          >
            <span>Descoperă camerele noastre</span>
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[rgba(13,44,92,0.2)] text-base transition-all duration-300 group-hover:bg-[#0d2c5c] group-hover:text-white group-hover:border-[#0d2c5c] shadow-sm"
              aria-hidden="true"
            >
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
