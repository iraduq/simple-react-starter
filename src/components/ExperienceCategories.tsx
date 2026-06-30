const categories = {
  plaja: {
    title: "Plajă",
    label: "Infinit Albastru",
    img: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop",
  },
  nautice: {
    title: "Sporturi Nautice",
    label: "Adrenalină pe valuri",
    img: "https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop",
  },
  gastro: {
    title: "Gastronomie",
    label: "Arome ale Mării",
    img: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  },
  spa: {
    title: "Spa & Infinity",
    label: "Echilibru",
    img: "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  },
  apus: {
    title: "Apusuri",
    label: "Spectacol Magic",
    img: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
  },
};

const tileBase =
  "group relative overflow-hidden cursor-pointer bg-[#0d2c5c] isolate shadow-[0_1px_2px_rgba(7,18,40,0.06),0_18px_48px_-18px_rgba(7,18,40,0.28)] transition-[transform,box-shadow] duration-[600ms] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(7,18,40,0.1),0_32px_68px_-22px_rgba(7,18,40,0.45)] max-[760px]:col-span-1 max-[760px]:row-span-1";

const tileImg =
  "absolute inset-0 w-full h-full object-cover block scale-[1.06] transition-[transform,filter] duration-[1200ms] group-hover:scale-100";

export default function ExperienceCategories() {
  // FIX: Schimbat din [] în {} pentru destructurarea corectă a unui obiect
  const { plaja, nautice, spa, gastro, apus } = categories;

  return (
    <section
      id="descopera"
      className="py-[72px] px-5 md:py-24 md:px-10 pb-[60px] md:pb-20 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #f7f4ee 0%, #ffffff 55%)",
      }}
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5">
            DESCOPERĂ · MAMAIA
          </p>
          <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4rem)] font-normal text-[#1a1a1a] leading-[1.15] tracking-[-0.01em]">
            Experiențe care te{" "}
            <em className="italic text-[#c69a3f]">Inspiră</em>
          </h2>
          <span
            className="block w-14 h-0.5 mx-auto mt-5 border-0"
            style={{
              background: "linear-gradient(90deg, #c69a3f, transparent)",
            }}
          />
          <p className="max-w-[520px] mx-auto mt-5 text-[15px] text-[#3c4043] leading-[1.75]">
            De la plaje cu nisip fin la gastronomie rafinată — Casa Esy este
            locul de unde vacanța ta ideală la Marea Neagră începe.
          </p>
        </div>

        <div className="grid grid-cols-12 auto-rows-[280px] md:auto-rows-[200px] lg:auto-rows-[240px] gap-[18px] md:gap-4 lg:gap-[22px] max-[760px]:grid-cols-1">
          {/* 1 · Plajă — Grand Arch */}
          <article
            className={`${tileBase} col-span-4 row-span-2 rounded-t-[999px] rounded-b-lg max-[760px]:rounded-t-[200px] max-[760px]:rounded-b-xl`}
          >
            <img
              src={plaja.img}
              alt={plaja.title}
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
                01
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] tracking-[0.01em] m-0">
                {plaja.title}
              </h3>
              {/* FIX: Înlocuit .desc cu .label deoarece .desc nu exista în obiect */}
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch] mx-auto">
                {plaja.label}
              </p>
            </div>
          </article>

          {/* 2 · Sporturi Nautice — Soft rect */}
          <article
            className={`${tileBase} col-span-4 row-span-1 rounded-[18px]`}
          >
            <img
              src={nautice.img}
              alt={nautice.title}
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
                {nautice.title}
              </h3>
              <span className="block w-0 h-px bg-[#c69a3f] mt-3.5 mx-auto transition-[width] duration-500 group-hover:w-16" />
              <p className="inline-block mt-3.5 text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase mb-0">
                {nautice.label}
              </p>
            </div>
          </article>

          {/* 3 · Spa — Circle */}
          <article
            className={`${tileBase} col-span-4 row-span-1 rounded-full border-4 border-[#fdfcf9] shadow-[0_2px_6px_rgba(7,18,40,0.08),0_26px_60px_-18px_rgba(7,18,40,0.35)] max-[760px]:aspect-square max-[760px]:h-auto`}
          >
            <img
              src={spa.img}
              alt={spa.title}
              loading="lazy"
              className={tileImg}
            />
            <div className="absolute inset-0 pointer-events-none z-[1] bg-[rgba(7,18,40,0.18)] transition-colors duration-500 group-hover:bg-transparent" />
            <div className="absolute z-[2] inset-0 m-auto w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full bg-white/90 backdrop-blur-[6px] flex flex-col items-center justify-center text-center p-5 scale-100 opacity-100 md:scale-[0.85] md:opacity-0 transition-[transform,opacity] duration-500 md:group-hover:scale-100 md:group-hover:opacity-100">
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[1.4rem] text-[#0d2c5c] m-0 leading-[1.15]">
                {spa.title}
              </h3>
              <span className="block mt-2.5 text-[#c69a3f] text-[10px] tracking-[0.3em] uppercase">
                {spa.label}
              </span>
            </div>
          </article>

          {/* 4 · Gastronomie — Wave */}
          <article
            className={`${tileBase} col-span-5 row-span-1 rounded-[80px_20px_80px_20px]`}
          >
            <img
              src={gastro.img}
              alt={gastro.title}
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
                04
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] m-0">
                {gastro.title}
              </h3>
              {/* FIX: Înlocuit .desc cu .label */}
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch]">
                {gastro.label}
              </p>
            </div>
          </article>

          {/* 5 · Apusuri — Inverted arch */}
          <article
            className={`${tileBase} col-span-3 row-span-1 rounded-b-[999px] rounded-t-lg max-[760px]:rounded-b-[200px] max-[760px]:rounded-t-xl`}
          >
            <img
              src={apus.img}
              alt={apus.title}
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
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] m-0">
                {apus.title}
              </h3>
              <span className="inline-block mt-3.5 text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase">
                {apus.label}
              </span>
            </div>
          </article>
        </div>

        <div className="mt-[72px] text-center">
          <a
            href="#camere"
            className="group inline-flex items-center gap-[22px] text-[#0d2c5c] text-xs tracking-[0.25em] uppercase no-underline"
          >
            <span>Vezi toate experiențele</span>
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[rgba(7,18,40,0.15)] text-base transition-all duration-300 group-hover:bg-[#0d2c5c] group-hover:text-white group-hover:border-[#0d2c5c] group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
