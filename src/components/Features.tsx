const facilities = {
  piscina: {
    number: "01",
    title: "Piscină & Plajă",
    label: "Vedere la mare",
    desc: "Piscină exterioară și acces direct la plajă privată.",
    img: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&fit=crop",
  },
  restaurant: {
    number: "02",
    title: "Restaurant Gourmet",
    label: "Bucătărie de autor",
    desc: "Preparate internaționale și locale, ingrediente proaspete.",
    img: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop",
  },
  evenimente: {
    number: "03",
    title: "Evenimente",
    label: "Momente memorabile",
    img: "https://images.pexels.com/photos/265947/pexels-photo-265947.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&fit=crop",
  },
  wifi: {
    number: "04",
    title: "WiFi Premium",
    label: "Mereu conectat",
    img: "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop",
  },
  parcare: {
    number: "05",
    title: "Parcare Gratuită",
    label: "Supravegheată 24/7",
    desc: "Inclusă în prețul sejurului, cu monitorizare video.",
    img: "https://images.pexels.com/photos/1719606/pexels-photo-1719606.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop",
  },
  fitness: {
    number: "06",
    title: "Fitness & Wellness",
    label: "Corp și minte",
    img: "https://images.pexels.com/photos/374589/pexels-photo-374589.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
  },
};

const tileBase =
  "group relative overflow-hidden cursor-default bg-[#0d2c5c] isolate shadow-[0_1px_2px_rgba(7,18,40,0.06),0_18px_48px_-18px_rgba(7,18,40,0.28)] transition-[transform,box-shadow] duration-[600ms] hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(7,18,40,0.1),0_32px_68px_-22px_rgba(7,18,40,0.45)] max-[760px]:col-span-1 max-[760px]:row-span-1";

const tileImg =
  "absolute inset-0 w-full h-full object-cover block scale-[1.06] transition-[transform,filter] duration-[1200ms] group-hover:scale-100";

export default function Features() {
  const { piscina, restaurant, evenimente, wifi, parcare, fitness } =
    facilities;

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
            style={{
              background: "linear-gradient(90deg, #c69a3f, transparent)",
            }}
          />
          <p className="max-w-[520px] mx-auto mt-5 text-[15px] text-[#3c4043] leading-[1.75]">
            Fiecare detaliu este gândit pentru confortul tău — de la piscina
            cu vedere la mare la bucătăria gourmet și spațiile de wellness.
          </p>
        </div>

        <div className="grid grid-cols-12 auto-rows-[280px] md:auto-rows-[200px] lg:auto-rows-[240px] gap-[18px] md:gap-4 lg:gap-[22px] max-[760px]:grid-cols-1">
          {/* 01 · Piscină — Grand Arch (tall) */}
          <article
            className={`${tileBase} col-span-4 row-span-2 rounded-t-[999px] rounded-b-lg max-[760px]:rounded-t-[200px] max-[760px]:rounded-b-xl`}
          >
            <img src={piscina.img} alt={piscina.title} loading="lazy" className={tileImg} />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,18,40,0.85) 0%, rgba(7,18,40,0.25) 45%, transparent 70%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 bottom-9 text-center px-7">
              <span className="block text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase mb-2.5">
                {piscina.number}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] tracking-[0.01em] m-0">
                {piscina.title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch] mx-auto">
                {piscina.desc}
              </p>
            </div>
          </article>

          {/* 02 · Restaurant — Wave */}
          <article
            className={`${tileBase} col-span-5 row-span-1 rounded-[80px_20px_80px_20px]`}
          >
            <img src={restaurant.img} alt={restaurant.title} loading="lazy" className={tileImg} />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,18,40,0.85) 0%, rgba(7,18,40,0.25) 45%, transparent 70%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 bottom-8 text-left px-11">
              <span className="block text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase mb-2.5">
                {restaurant.number}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] m-0">
                {restaurant.title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch]">
                {restaurant.desc}
              </p>
            </div>
          </article>

          {/* 03 · Evenimente — Circle */}
          <article
            className={`${tileBase} col-span-3 row-span-1 rounded-full border-4 border-[#fdfcf9] shadow-[0_2px_6px_rgba(7,18,40,0.08),0_26px_60px_-18px_rgba(7,18,40,0.35)] max-[760px]:aspect-square max-[760px]:h-auto`}
          >
            <img src={evenimente.img} alt={evenimente.title} loading="lazy" className={tileImg} />
            <div className="absolute inset-0 pointer-events-none z-[1] bg-[rgba(7,18,40,0.35)] transition-colors duration-500 group-hover:bg-[rgba(7,18,40,0.1)]" />
            <div className="absolute z-[2] inset-0 flex flex-col items-center justify-center text-center p-5 text-white">
              <span className="block text-[#c69a3f] text-[10px] tracking-[0.3em] uppercase mb-2">
                {evenimente.number}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[1.35rem] m-0 leading-[1.15]">
                {evenimente.title}
              </h3>
            </div>
          </article>

          {/* 04 · WiFi — Soft rect (label-forward) */}
          <article
            className={`${tileBase} col-span-4 row-span-1 rounded-[18px]`}
          >
            <img
              src={wifi.img}
              alt={wifi.title}
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
                {wifi.title}
              </h3>
              <span className="block w-0 h-px bg-[#c69a3f] mt-3.5 mx-auto transition-[width] duration-500 group-hover:w-16" />
              <p className="inline-block mt-3.5 text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase mb-0">
                {wifi.label}
              </p>
            </div>
          </article>

          {/* 05 · Parcare — Wave alt */}
          <article
            className={`${tileBase} col-span-5 row-span-1 rounded-[20px_80px_20px_80px]`}
          >
            <img src={parcare.img} alt={parcare.title} loading="lazy" className={tileImg} />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(to top, rgba(7,18,40,0.85) 0%, rgba(7,18,40,0.25) 45%, transparent 70%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 bottom-8 text-right px-11">
              <span className="block text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase mb-2.5">
                {parcare.number}
              </span>
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] m-0">
                {parcare.title}
              </h3>
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 ml-auto max-w-[32ch]">
                {parcare.desc}
              </p>
            </div>
          </article>

          {/* 06 · Fitness — Inverted arch (wide) */}
          <article
            className={`${tileBase} col-span-7 row-span-1 rounded-b-[999px] rounded-t-lg max-[760px]:rounded-b-[200px] max-[760px]:rounded-t-xl`}
          >
            <img src={fitness.img} alt={fitness.title} loading="lazy" className={tileImg} />
            <div
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(7,18,40,0.55) 0%, rgba(7,18,40,0.05) 55%, transparent 80%)",
              }}
            />
            <div className="absolute z-[2] text-white font-sans left-0 right-0 top-10 text-center px-[22px]">
              <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.1] m-0">
                {fitness.title}
              </h3>
              <span className="inline-block mt-3.5 text-[#c69a3f] text-[10.5px] tracking-[0.3em] uppercase">
                {fitness.label}
              </span>
            </div>
          </article>
        </div>

        <div className="mt-[72px] text-center">
          <a
            href="#camere"
            className="group inline-flex items-center gap-[22px] text-[#0d2c5c] text-xs tracking-[0.25em] uppercase no-underline"
          >
            <span>Vezi toate facilitățile</span>
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
