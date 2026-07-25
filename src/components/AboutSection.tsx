const stats = [
  { value: "2,400+", label: "Oaspeți fericiți" },
  { value: "12", label: "Ani de experiență" },
  { value: "98%", label: "Satisfacție" },
  { value: "150m", label: "Distanța până la plajă" },
];

export default function AboutSection() {
  return (
    <section
      className="relative py-24 md:py-36 px-5 md:px-10 overflow-hidden font-sans"
      style={{
        background:
          "linear-gradient(to right, rgba(13,44,92,0.92) 0%, rgba(13,44,92,0.98) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Waves top */}
      <svg
        className="absolute -top-px left-0 w-full h-[90px] md:h-[130px] pointer-events-none z-[3] block"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
          fill="#c69a3f"
          opacity="0.35"
        />
        <path
          d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
          fill="#0d2c5c"
          opacity="0.5"
        />
        <path
          d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
          fill="#ffffff"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text Content */}
          <div className="flex flex-col order-2 lg:order-1">
            {/* EYEBROW */}
            <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3.5 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c69a3f]/60" />
              POVESTEA NOASTRĂ
            </p>

            {/* TITLU */}
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.6rem,5vw,4rem)] font-normal text-white mb-8 leading-[1.15] tracking-[-0.01em] drop-shadow-md">
              Ospitalitate cu suflet,
              <br />
              <em className="italic text-[#c69a3f]">la malul mării</em>
            </h2>

            {/* BODY */}
            <p className="font-sans text-white/80 leading-[1.75] text-[15px] mb-5 max-w-lg font-light">
              Vila Casa Esy s-a născut dintr-o dorință simplă: să creăm un loc
              unde oaspeții să se simtă acasă, dar cu lux și rafinament. Situată
              la doar 150 de metri de plajă, vila noastră oferă o evadare
              perfectă din agitația cotidiană.
            </p>

            <p className="font-sans text-white/70 leading-[1.75] text-[15px] mb-12 max-w-lg font-light">
              Fiecare cameră este decorată cu atenție la detalii, iar echipa
              noastră este mereu disponibilă pentru a transforma sejurul tău
              într-o amintire de neprețuit.
            </p>

            {/* STATS */}
            <div className="grid grid-cols-4 w-full max-w-lg mb-16 items-stretch">
              {stats.map(({ value, label }, i) => (
                <div
                  key={label}
                  className={`flex flex-col items-center justify-start text-center px-2 pb-4 border-white/10 ${
                    i !== 0 ? "border-l" : ""
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-['Cormorant_Garamond',serif] italic block text-[clamp(2.4rem,3.6vw,3.2rem)] font-normal text-[#c69a3f] leading-none tracking-[-0.01em] select-none">
                      {value}
                    </span>
                    <span className="font-sans block mt-3 text-[10.5px] text-white/60 uppercase tracking-[0.3em] font-bold">
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* BUTON — same convention as ExperienceCategories CTA */}
            <a
              href="#camere"
              className="group inline-flex items-center gap-[22px] self-start text-white text-xs tracking-[0.25em] uppercase no-underline"
            >
              <span>Descoperă camerele</span>
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#c69a3f]/60 text-base transition-all duration-300 group-hover:bg-[#c69a3f] group-hover:text-[#0d2c5c] group-hover:border-[#c69a3f] group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </div>

          {/* EDITORIAL LUXURY IMAGES COLLAGE */}
          <div className="relative order-1 lg:order-2 h-[520px] md:h-[620px] w-full flex items-center justify-center">
            {/* Imagine Principală */}
            <div className="absolute top-0 left-0 w-[72%] h-[80%] rounded-xl overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.01]">
              <img
                src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop"
                alt="Dormitor rafinat cu vedere la mare"
                className="w-full h-full object-cover block"
              />
            </div>

            {/* Imagine Detalii */}
            <div className="absolute bottom-0 right-0 w-[58%] h-[46%] rounded-xl overflow-hidden shadow-2xl z-10 transition-transform duration-700 hover:scale-[1.02]">
              <img
                src="https://images.pexels.com/photos/1005456/pexels-photo-1005456.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop"
                alt="Apus liniștit pe plaja cu nisip fin"
                className="w-full h-full object-cover block"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inverted waves bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[90px] md:h-[130px] pointer-events-none z-[3] block"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
          fill="#c69a3f"
          opacity="0.35"
        />
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
          fill="#0d2c5c"
          opacity="0.5"
        />
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
          fill="#ffffff"
        />
      </svg>
    </section>
  );
}
