const facilities = [
  {
    number: "01",
    title: "Piscină & Plajă",
    label: "Vedere la mare",
    desc: "Piscină exterioară și acces direct la plajă privată.",
    img: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop",
  },
  {
    number: "02",
    title: "Restaurant Gourmet",
    label: "Bucătărie de autor",
    desc: "Preparate internaționale și locale, ingrediente proaspete.",
    img: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop",
  },
  {
    number: "03",
    title: "Sala de Evenimente",
    label: "Momente memorabile",
    desc: "Spațiu elegant pentru nunți, conferințe și celebrări private.",
    img: "https://images.pexels.com/photos/265947/pexels-photo-265947.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop",
  },
  {
    number: "04",
    title: "WiFi Premium",
    label: "Mereu conectat",
    desc: "Internet de mare viteză în toate zonele hotelului și camere.",
    img: "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop",
  },
  {
    number: "05",
    title: "Parcare Gratuită",
    label: "Supravegheată 24/7",
    desc: "Inclusă în prețul sejurului, cu monitorizare video.",
    img: "https://images.pexels.com/photos/1719606/pexels-photo-1719606.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop",
  },
  {
    number: "06",
    title: "Fitness & Wellness",
    label: "Corp și minte",
    desc: "Sală modernă, saună și zonă de relaxare pentru oportunitate completă.",
    img: "https://images.pexels.com/photos/374589/pexels-photo-374589.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop",
  },
];

export default function Features() {
  return (
    <section
      id="descopera-facilitati"
      className="relative py-[72px] px-5 md:py-24 md:px-10 bg-[#f7f5f0] overflow-hidden"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {facilities.map((f) => (
            <article
              key={f.number}
              className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(7,18,40,0.08),0_12px_32px_-16px_rgba(7,18,40,0.18)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_2px_6px_rgba(7,18,40,0.1),0_28px_56px_-20px_rgba(7,18,40,0.35)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={f.img}
                  alt={f.title}
                  loading="lazy"
                  className="w-full h-full object-cover block scale-105 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(7,18,40,0.55) 0%, rgba(7,18,40,0.05) 55%, transparent 80%)",
                  }}
                />
                <span className="absolute top-4 left-4 font-sans text-[11px] font-semibold tracking-[0.25em] text-white/90 bg-[#0d2c5c]/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {f.number}
                </span>
              </div>

              <div className="flex flex-col flex-1 px-6 pt-6 pb-7">
                <span className="font-sans text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c69a3f] mb-2.5">
                  {f.label}
                </span>
                <h3 className="font-['Cormorant_Garamond',serif] font-normal text-[1.7rem] leading-[1.15] text-[#1a1a1a] m-0">
                  {f.title}
                </h3>
                <span className="block w-9 h-px bg-[#c69a3f]/40 mt-4 mb-4 transition-all duration-500 group-hover:w-16 group-hover:bg-[#c69a3f]" />
                <p className="text-[13.5px] leading-[1.65] text-[#5a5f63] m-0">
                  {f.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-[64px] text-center">
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
