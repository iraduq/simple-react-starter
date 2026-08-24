import { motion } from "framer-motion";

const stats = [
  { value: "2,400+", label: "Oaspeți fericiți" },
  { value: "12", label: "Ani de experiență" },
  { value: "98%", label: "Satisfacție" },
  { value: "150m", label: "Distanța până la plajă" },
];

export default function AboutSection() {
  return (
    <section className="relative bg-white py-24 md:py-32 px-5 md:px-10 overflow-hidden font-sans">
      {/* Accent subtil sus */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 bg-[var(--gold)]/60"
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col order-2 lg:order-1"
          >
            <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--gold)] mb-4 flex items-center gap-3">
              <span className="w-8 h-px bg-[var(--gold)]/60" />
              Povestea noastră
            </p>

            <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,4.5vw,3.6rem)] font-normal text-[var(--text-primary)] leading-[1.1] tracking-[-0.01em] mb-6">
              Ospitalitate cu suflet,{" "}
              <em className="italic text-[var(--gold)]">la malul mării</em>
            </h2>

            <span
              className="mb-7 flex items-center gap-3"
              aria-hidden="true"
            >
              <span className="h-px w-12 bg-[var(--gold)]/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[var(--gold)]" />
              <span className="h-px w-20 bg-[var(--gold)]/25" />
            </span>

            <p className="font-sans text-[var(--text-secondary)] leading-[1.85] text-[15px] mb-5 max-w-lg font-light">
              Vila Casa Esy s-a născut dintr-o dorință simplă: să creăm un loc
              unde oaspeții să se simtă acasă, dar cu lux și rafinament. Situată
              la doar 150 de metri de plajă, vila noastră oferă o evadare
              perfectă din agitația cotidiană.
            </p>

            <p className="font-sans text-[var(--text-secondary)] leading-[1.85] text-[15px] mb-10 max-w-lg font-light">
              Fiecare cameră este decorată cu atenție la detalii, iar echipa
              noastră este mereu disponibilă pentru a transforma sejurul tău
              într-o amintire de neprețuit.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-lg mb-12">
              {stats.map(({ value, label }, i) => (
                <div
                  key={label}
                  className={`flex flex-col text-center px-2 py-2 ${
                    i !== 0 ? "sm:border-l border-[var(--border-light)]" : ""
                  }`}
                >
                  <span className="font-['Cormorant_Garamond',serif] text-[clamp(1.8rem,3vw,2.4rem)] font-normal text-[var(--gold)] leading-none">
                    {value}
                  </span>
                  <span className="font-sans mt-3 text-[10px] text-[#8595aa] uppercase tracking-[0.24em] font-bold">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="#camere"
              className="group inline-flex items-center gap-[22px] self-start text-[#0d2c5c] text-[11px] tracking-[0.25em] uppercase no-underline font-bold"
            >
              <span>Descoperă camerele</span>
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#0d2c5c]/20 text-base transition-all duration-300 group-hover:bg-[var(--gold)] group-hover:text-[#0d2c5c] group-hover:border-[var(--gold)] group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </a>
          </motion.div>

          {/* Collage — pe alb, fără fundal navy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative order-1 lg:order-2 h-[480px] md:h-[600px] w-full"
          >
            {/* Rama aurie decorativă */}
            <span
              aria-hidden="true"
              className="absolute top-8 right-4 w-[68%] h-[78%] border border-[var(--gold)]/40 rounded-xl"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-8 left-4 w-[52%] h-[42%] border border-[#0d2c5c]/15 rounded-xl"
            />

            {/* Imagine principală */}
            <div className="absolute top-0 left-0 w-[72%] h-[78%] rounded-xl overflow-hidden shadow-[0_28px_60px_-20px_rgba(13,44,92,0.32)] transition-transform duration-700 hover:scale-[1.01]">
              <img
                src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop"
                alt="Dormitor rafinat cu vedere la mare"
                className="w-full h-full object-cover block"
              />
            </div>

            {/* Imagine detaliu */}
            <div className="absolute bottom-0 right-0 w-[58%] h-[46%] rounded-xl overflow-hidden shadow-[0_28px_60px_-20px_rgba(13,44,92,0.32)] z-10 transition-transform duration-700 hover:scale-[1.02]">
              <img
                src="https://images.pexels.com/photos/1005456/pexels-photo-1005456.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop"
                alt="Apus liniștit pe plaja cu nisip fin"
                className="w-full h-full object-cover block"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Accent auriu jos */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-32 bg-[var(--gold)]/60"
      />
    </section>
  );
}
