import { motion } from "framer-motion";

const stats = [
  { value: "2,400+", label: "Oaspeți fericiți" },
  { value: "12", label: "Ani de experiență" },
  { value: "98%", label: "Satisfacție" },
  { value: "150m", label: "Distanța până la plajă" },
];

export default function AboutSection() {
  return (
    <section className="relative bg-[radial-gradient(ellipse_at_top_left,_rgba(28,77,143,0.5),_transparent_70%)] bg-[#0d2c5c] py-24 md:py-32 px-5 md:px-10 overflow-hidden font-sans">
      {/* ── TRANZIȚIE SUS: Val alb care coboară din secțiunea anterioară ── */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[40px] md:h-[70px] rotate-180"
        >
          <path
            d="M0,120 C200,80 400,20 600,60 C800,100 1000,40 1200,80 L1200,120 L0,120 Z"
            className="fill-white"
          />
        </svg>
      </div>

      {/* Fir aurit subtil care coboară */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 mt-[-1px]">
        <span className="w-2 h-2 rotate-45 border border-[#c69a3f] bg-white absolute top-0" />
        <span className="w-px h-16 md:h-24 bg-gradient-to-b from-[#c69a3f]/80 to-transparent" />
      </div>

      {/* ── BACKGROUND WATERMARK (SVG Uriaș Decorativ) ── */}
      <svg
        className="absolute -left-32 top-10 w-[600px] h-[600px] text-[#c69a3f] opacity-[0.04] pointer-events-none animate-[spin_120s_linear_infinite]"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 0 C55 20 80 45 100 50 C80 55 55 80 50 100 C45 80 20 55 0 50 C20 45 45 20 50 0 Z" />
        <path
          d="M50 15 C52 25 75 48 85 50 C75 52 52 75 50 85 C48 75 25 52 15 50 C25 48 48 25 50 15 Z"
          opacity="0.5"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-6">
          {/* ── BLOCUL STÂNGA: Titlu + Imagine (pe mobil) + Descriere ── */}
          <div className="flex flex-col text-center lg:text-left items-center lg:items-start">
            {/* 1. Subtitlu & Titlu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
            >
              <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-4 flex items-center justify-center lg:justify-start gap-3">
                <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#c69a3f] hidden lg:inline-block" />
                Povestea noastră
              </p>

              <h2 className="font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,5vw,4.2rem)] font-normal text-white leading-[1.05] tracking-[-0.01em] mb-6">
                Ospitalitate cu suflet, <br />
                <em className="italic text-[#c69a3f]">la malul mării</em>
              </h2>
            </motion.div>

            {/* 2. Colajul Foto (Vizibil DOAR pe mobil, exact între titlu și descriere) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.9,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="relative h-[380px] sm:h-[460px] md:h-[540px] lg:hidden w-full my-8"
            >
              {/* Floating Badge Mobil */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -left-2 top-1/4 z-30 w-24 h-24 bg-[#0d2c5c] rounded-full flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.3)] border-[4px] border-[#1e4d8c]"
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-[#c69a3f] overflow-visible"
                >
                  <path
                    id="circlePathMob"
                    d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                    fill="none"
                  />
                  <text
                    className="text-[12.5px] font-bold uppercase tracking-[0.25em]"
                    fill="currentColor"
                  >
                    <textPath href="#circlePathMob" startOffset="0%">
                      • 12 ANI DE EXCELENȚĂ • CASA ESY
                    </textPath>
                  </text>
                </svg>
                <div className="absolute text-white text-xl">★</div>
              </motion.div>

              <div className="absolute top-4 right-0 w-[80%] h-[90%] bg-[#12386f] rounded-[30px_80px_30px_80px] -z-10" />

              <div className="absolute top-0 right-4 w-[75%] h-[75%] rounded-[25px_60px_25px_60px] overflow-hidden shadow-xl border border-white/10">
                <img
                  src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop"
                  alt="Dormitor rafinat"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute bottom-4 left-4 w-[55%] h-[42%] rounded-2xl overflow-hidden border-[4px] border-[#0d2c5c] shadow-xl z-20">
                <img
                  src="https://images.pexels.com/photos/1005456/pexels-photo-1005456.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop"
                  alt="Apus liniștit"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* 3. Paragraf descriere */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-sans text-white/80 leading-[1.85] text-[15.5px] mb-8 max-w-lg font-light"
            >
              Vila Casa Esy s-a născut dintr-o dorință simplă: să creăm un loc
              unde oaspeții să se simtă acasă, dar cu lux și rafinament. Situată
              la doar 150 de metri de plajă, vila noastră oferă o evadare
              perfectă din agitația cotidiană.
            </motion.p>

            {/* 4. Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-lg my-6 py-6 border-y border-white/10">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="flex flex-col text-center lg:text-left"
                >
                  <span className="font-sans text-[1.5rem] sm:text-[1.75rem] font-normal text-white leading-none mb-1.5">
                    {value}
                  </span>
                  <span className="font-sans text-[8.5px] text-[#c69a3f] uppercase tracking-[0.2em] font-bold">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* 5. Buton CTA */}
            <a
              href="#camere"
              className="group inline-flex items-center justify-center gap-3 bg-[#c69a3f] border border-[#c69a3f] text-white text-[11px] tracking-[0.2em] uppercase font-bold py-4 px-8 rounded-full hover:bg-white hover:border-white hover:text-[#0d2c5c] transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(198,154,63,0.3)] hover:shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)] mt-4"
            >
              Descoperă camerele
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>

          {/* ── COLOANA DREAPTA PE DESKTOP (Ascunsă pe mobil, vizibilă doar pe ecrane mari) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="relative hidden lg:block h-[640px] w-full"
          >
            {/* FLOATING BADGE (Insignă rotativă Desktop) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -left-12 top-1/4 z-30 w-36 h-36 bg-[#0d2c5c] rounded-full flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.3)] border-[4px] border-[#1e4d8c]"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-[#c69a3f] overflow-visible"
              >
                <path
                  id="circlePathDesk"
                  d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                  fill="none"
                />
                <text
                  className="text-[12.5px] font-bold uppercase tracking-[0.25em]"
                  fill="currentColor"
                >
                  <textPath href="#circlePathDesk" startOffset="0%">
                    • 12 ANI DE EXCELENȚĂ • CASA ESY
                  </textPath>
                </text>
              </svg>
              <div className="absolute text-white text-xl">★</div>
            </motion.div>

            {/* Fundal decupat organic */}
            <div className="absolute top-4 right-0 w-[80%] h-[90%] bg-[#12386f] rounded-[40px_100px_40px_100px] -z-10" />

            {/* Imagine principală */}
            <div className="absolute top-0 right-4 w-[75%] h-[75%] rounded-[30px_80px_30px_80px] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] border border-white/10">
              <img
                src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop"
                alt="Dormitor rafinat"
                className="w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-110"
              />
            </div>

            {/* Imagine detaliu (Parallax/Suprapusă) */}
            <motion.div
              initial={{ y: 40 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="absolute bottom-6 left-10 w-[55%] h-[42%] rounded-3xl overflow-hidden border-[6px] border-[#0d2c5c] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] z-20"
            >
              <img
                src="https://images.pexels.com/photos/1005456/pexels-photo-1005456.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop"
                alt="Apus liniștit"
                className="w-full h-full object-cover transition-transform duration-[1.5s] hover:scale-110"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── TRANZIȚIE JOS: Val alb care urcă peste secțiunea bleumarin ── */}
      <div className="absolute bottom-[-1px] left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[60px] md:h-[90px]"
        >
          <path
            d="M0,120 C200,80 400,20 600,60 C800,100 1000,40 1200,80 L1200,120 L0,120 Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}
