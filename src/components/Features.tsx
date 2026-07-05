const items = [
  {
    no: "01",
    title: "Piscină & Plajă",
    desc: "Piscină exterioară cu vedere la mare și acces direct la plajă privată, la doar 150 de metri.",
  },
  {
    no: "02",
    title: "Restaurant Gourmet",
    desc: "Bucătărie internațională și preparate locale, gătite zilnic cu ingrediente proaspete de la producătorii din zonă.",
  },
  {
    no: "03",
    title: "Evenimente",
    desc: "Săli luminoase pentru conferințe, nunți și evenimente private memorabile, cu planificare inclusă.",
  },
  {
    no: "04",
    title: "WiFi Premium",
    desc: "Conexiune de mare viteză în toate camerele și spațiile comune — pentru că vacanța nu înseamnă deconectare totală.",
  },
  {
    no: "05",
    title: "Parcare Gratuită",
    desc: "Parcare supravegheată video, inclusă în prețul sejurului. Liniște din clipa în care ai ajuns.",
  },
  {
    no: "06",
    title: "Fitness & Wellness",
    desc: "Sală de fitness echipată modern și servicii de masaj la cerere, pentru dimineți care încep cum vrei tu.",
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
        <div className="mb-14 md:mb-20">
          <p className="eyebrow mb-3 flex items-center gap-3">
            <span className="gold-rule" />
            Tot ce ai nevoie
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2
              className="text-[clamp(2.2rem,4vw,3.2rem)] font-normal text-[var(--navy-900)] leading-[1.1]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Facilitățile <em className="italic text-[var(--gold-500)]">noastre</em>
            </h2>
            <p className="text-[var(--ink-700)] text-[15px] leading-[1.7] max-w-[420px] md:text-right">
              Fiecare detaliu e gândit ca tu să nu te gândești la nimic.
              De la plajă la masaj, totul e la îndemână.
            </p>
          </div>
        </div>

        {/* Editorial list — no cards, no icons, just numbered prose */}
        <div className="border-t border-[var(--mist-100)]">
          {items.map(({ no, title, desc }) => (
            <article
              key={no}
              className="group grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_1fr] gap-4 md:gap-10 items-start py-7 md:py-9 border-b border-[var(--mist-100)] transition-colors duration-300 hover:bg-[var(--mist-50)]/40"
            >
              <span
                className="font-serif text-[var(--gold-500)] text-[15px] tracking-[0.1em] pt-1.5 md:pt-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {no}
              </span>
              <h3
                className="text-[clamp(1.4rem,2vw,1.8rem)] text-[var(--navy-900)] leading-tight m-0"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {title}
              </h3>
              <p className="col-span-2 md:col-span-1 text-[var(--ink-700)] leading-[1.7] text-[14.5px] m-0 max-w-[460px]">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
