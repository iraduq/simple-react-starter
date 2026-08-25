import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function ExperienceCategories() {
  const { plaja, nautice, spa, gastro, apus } = categories;

  return (
    <section
      id="descopera"
      className="relative py-[72px] px-5 md:py-24 md:px-10 pb-[60px] md:pb-20 overflow-hidden bg-white z-10"
    >
      {/* ── AMBIENT BACKGROUND ORBS ── */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-[var(--gold)]/5 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-[600px] h-[600px] bg-[#0d2c5c]/5 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite_reverse] pointer-events-none" />

      {/* ── OBIECTE MARITIME WATERMARK (EXPERIENȚE) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* 1. Velier (Sailing Boat) - Stânga Sus */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[2%] left-[2%] w-[250px] h-[250px] opacity-[0.04] md:opacity-[0.05]"
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            stroke="#122F5B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Catargul principal */}
            <path d="M100 20 L100 155" />

            {/* Pânza din față (Dreapta) */}
            <path d="M100 30 Q160 80 150 145 L100 145 Z" />

            {/* Pânza din spate (Stânga) */}
            <path d="M90 45 Q35 90 50 145 L90 145 Z" />

            {/* Corpul bărcii */}
            <path d="M30 155 L170 155 L140 180 L60 180 Z" />

            {/* Steagul din vârf */}
            <path d="M100 20 L125 30 L100 40 Z" fill="#122F5B" />

            {/* Valuri subtile la bază */}
            <path
              d="M20 170 Q35 160 50 170 T80 170 T110 170 T140 170 T170 170 T200 170"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
          </svg>
        </motion.div>

        {/* 2. Stea de mare (Starfish) - Dreapta Jos */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-5%] right-[2%] w-[300px] h-[300px] opacity-[0.03] md:opacity-[0.04]"
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            stroke="#122F5B"
            strokeWidth="5"
            strokeLinejoin="round"
          >
            <polygon points="100,20 120,80 180,80 130,120 150,180 100,140 50,180 70,120 20,80 80,80" />
            <circle cx="100" cy="100" r="15" />
            <circle cx="100" cy="55" r="3" />
            <circle cx="145" cy="85" r="3" />
            <circle cx="125" cy="140" r="3" />
            <circle cx="75" cy="140" r="3" />
            <circle cx="55" cy="85" r="3" />
          </svg>
        </motion.div>

        {/* 4. Valuri și Soare (Sun & Sunset) - Stânga Jos */}
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[0.3%] left-[10%] w-[220px] h-[220px] opacity-[0.04] md:opacity-[0.05]"
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            stroke="#122F5B"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Soarele */}
            <circle cx="100" cy="90" r="40" strokeWidth="4" />
            {/* Linii orizontale de valuri */}
            <path d="M30 130 L170 130" />
            <path d="M50 150 L150 150" />
            <path d="M70 170 L130 170" />
            {/* Păsări (Pescăruși) */}
            <path d="M30 60 Q40 50 50 60 Q60 50 70 60" strokeWidth="3" />
            <path d="M130 40 Q140 30 150 40 Q160 30 170 40" strokeWidth="3" />
          </svg>
        </motion.div>
      </div>

      <div className="relative max-w-[1280px] mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative text-center mb-16"
        >
          <motion.svg
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-24 md:w-32 h-auto opacity-15 hidden md:block"
            viewBox="0 0 120 80"
            fill="none"
          >
            <svg
              viewBox="0 0 200 200"
              fill="none"
              stroke="#122F5B"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M75 180 L125 180 L115 60 L85 60 Z" />
              <path d="M80 60 L120 60 L120 40 L80 40 Z" />
              <path d="M80 40 Q100 10 120 40 Z" />
              <path d="M70 180 L130 180" strokeWidth="6" />
              <path
                d="M90 60 L90 180 M110 60 L110 180"
                strokeWidth="2"
                strokeDasharray="10 10"
              />
              {/* Raze de lumină */}
              <path
                d="M125 50 L190 30 M125 50 L190 70"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <path
                d="M75 50 L10 30 M75 50 L10 70"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>
          </motion.svg>

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
        </motion.div>

        {/* ── GRILA BENTO ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-12 auto-rows-[280px] md:auto-rows-[200px] lg:auto-rows-[240px] gap-[18px] md:gap-4 lg:gap-[22px] max-[760px]:grid-cols-1"
        >
          {/* 1 · Plajă — Grand Arch */}
          <motion.article
            variants={itemVariants}
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
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch] mx-auto">
                {plaja.label}
              </p>
            </div>
          </motion.article>

          {/* 2 · Sporturi Nautice — Soft rect */}
          <motion.article
            variants={itemVariants}
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
          </motion.article>

          {/* 3 · Spa — Circle */}
          <motion.article
            variants={itemVariants}
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
          </motion.article>

          {/* 4 · Gastronomie — Wave */}
          <motion.article
            variants={itemVariants}
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
              <p className="text-[13px] leading-[1.55] text-white/80 mt-2.5 mb-0 max-w-[32ch]">
                {gastro.label}
              </p>
            </div>
          </motion.article>

          {/* 5 · Apusuri — Inverted arch */}
          <motion.article
            variants={itemVariants}
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
          </motion.article>
        </motion.div>

        {/* Buton cu intrare ușoară */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-[72px] text-center relative z-20"
        >
          <a
            href="#camere"
            className="group inline-flex items-center gap-[22px] text-[#0d2c5c] text-xs tracking-[0.25em] uppercase no-underline font-semibold"
          >
            <span>Vezi toate experiențele</span>
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[rgba(7,18,40,0.15)] text-base transition-all duration-300 group-hover:bg-[var(--gold)] group-hover:text-white group-hover:border-[var(--gold)] group-hover:translate-x-1 group-hover:shadow-[0_4px_14px_rgba(198,154,63,0.3)]"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
