import { Award, Users, Sunset, Save as Waves } from "lucide-react";

const stats = [
  { icon: Users, value: "2,400+", label: "Oaspeți fericiți" },
  { icon: Award, value: "12", label: "Ani de experiență" },
  { icon: Sunset, value: "98%", label: "Satisfacție" },
  { icon: Waves, value: "150m", label: "Distanța până la plajă" },
];

export default function AboutSection() {
  return (
    <section
      className="relative py-[72px] px-5 md:py-24 md:px-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(to right, rgba(13,44,92,0.85) 0%, rgba(13,44,92,0.95) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Waves "cut out" of the image at the top — matches the previous section's background */}
      <svg
        className="absolute -top-px left-0 w-full h-[90px] md:h-[130px] pointer-events-none z-[3] block"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* back wave — subtle gold silhouette peeking behind */}
        <path
          d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
          fill="#c69a3f"
          opacity="0.35"
        />
        {/* mid wave — deeper navy tone */}
        <path
          d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
          fill="#0d2c5c"
          opacity="0.5"
        />
        {/* front wave — matches the previous section background so waves appear carved out of the photo */}
        <path
          d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
          fill="#ffffff"
        />
      </svg>

      {/* Radial overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 30% 50%, rgba(30,77,140,0.3) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="flex flex-col order-2 lg:order-1">
            <p className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-[#c69a3f] mb-3 flex items-center gap-3">
              <span className="w-8 h-px bg-[#c69a3f]/50" />
              Povestea noastră
            </p>
            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,4vw,3.2rem)] font-normal text-white mb-7 leading-[1.15] [text-shadow:0_2px_20px_rgba(0,0,0,0.2)]">
              Ospitalitate cu suflet,
              <br />
              <em className="italic text-[#c69a3f]">la malul mării</em>
            </h2>

            <p className="text-white/80 leading-[1.8] text-[15px] mb-5 max-w-[480px]">
              Vila Casa Esy s-a născut dintr-o dorință simplă: să creăm un loc unde
              oaspeții să se simtă acasă, dar cu lux și rafinament. Situată la doar
              150 de metri de plajă, vila noastră oferă o evadare perfectă din
              agitația cotidiană.
            </p>

            <p className="text-white/70 leading-[1.8] text-[15px] mb-8 max-w-[480px]">
              Fiecare cameră este decorată cu atenție la detalii, iar echipa noastră
              este mereu disponibilă pentru a transforma sejurul tău într-o amintire
              de neprețuit.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div className="w-11 h-11 rounded-full bg-[#c69a3f]/20 text-[#c69a3f] flex items-center justify-center mb-3">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <strong className="block font-['Cormorant_Garamond',serif] text-[26px] font-semibold text-white leading-none">
                    {value}
                  </strong>
                  <span className="block text-[10px] text-white/60 mt-1.5 uppercase tracking-[0.1em]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="#camere"
              className="inline-flex items-center gap-2.5 self-start px-8 py-4 bg-[#c69a3f] text-[#0d2c5c] rounded-[10px] text-[13px] font-bold tracking-[0.12em] uppercase shadow-[0_4px_15px_rgba(198,154,63,0.25)] transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(198,154,63,0.35)]"
            >
              Descoperă camerele
              <span>→</span>
            </a>
          </div>

          {/* Images */}
          <div className="relative flex gap-4 order-1 lg:order-2">
            <div className="flex-1 rounded-[14px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
              <img
                src="https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=700&h=900&fit=crop"
                alt="Vila Casa Esy"
                className="w-full h-[320px] lg:h-[480px] object-cover block"
              />
            </div>
            <div className="hidden lg:block w-[180px] shrink-0 rounded-[14px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.25)] relative self-end">
              <img
                src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
                alt="Piscina vilei"
                className="w-full h-[260px] object-cover block"
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-[#0d2c5c] rounded-[10px] px-5 py-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] whitespace-nowrap">
                <span className="block font-['Cormorant_Garamond',serif] text-[36px] font-semibold leading-none text-[#c69a3f]">
                  12
                </span>
                <span className="text-[10px] tracking-[0.12em] uppercase text-[#0d2c5c]/70 font-semibold">
                  ani de excelență
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inverted waves at bottom — mirror of top, flowing into white section */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[90px] md:h-[130px] pointer-events-none z-[3] block"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* back wave — gold silhouette peeking above */}
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 70 C1260 100, 1080 55, 900 75 S540 110, 360 78 S120 50, 0 82 Z"
          fill="#c69a3f"
          opacity="0.35"
        />
        {/* mid wave — deeper navy tone */}
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 55 C1260 90, 1080 40, 900 62 S540 100, 360 65 S120 35, 0 68 Z"
          fill="#0d2c5c"
          opacity="0.5"
        />
        {/* front wave — white, blends into the next section */}
        <path
          transform="translate(0, 130) scale(1, -1)"
          d="M0 0 L1440 0 L1440 45 C1260 80, 1080 28, 900 52 S540 92, 360 55 S120 22, 0 58 Z"
          fill="#ffffff"
        />
      </svg>
    </section>
  );
}
