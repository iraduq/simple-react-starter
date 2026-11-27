import { motion } from "framer-motion";
import type { RefObject } from "react";

interface RoomsHeroProps {
  revealed: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export default function RoomsHero({ revealed, videoRef }: RoomsHeroProps) {
  const emerge = {
    hidden: { opacity: 0, scale: 0.55, y: 30, filter: "blur(18px)" },
    visible: (custom: number = 0) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.1,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: custom,
      },
    }),
  };

  return (
    <section className="relative bg-[#0d2c5c] overflow-hidden pt-28 sm:pt-36 md:pt-48 pb-28 md:pb-40 z-10">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          className="h-full w-full object-cover saturate-50 contrast-110 brightness-100"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />
        <div className="absolute inset-0 bg-[#0b2146]/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/40 to-[#0d2c5c]/95" />
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#c69a3f]/10 blur-[100px] z-[1]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -right-32 w-[520px] h-[520px] rounded-full bg-[#1e4d8c]/30 blur-[100px] z-[1]"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-10 text-center [perspective:1200px]">
        <motion.p
          variants={emerge}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          custom={0}
          className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--gold)] mb-3 sm:mb-4 flex items-center justify-center gap-3"
        >
          <span className="w-6 sm:w-8 h-px bg-[var(--gold)]/60" />
          Cazare · Vila Casa Esy
          <span className="w-6 sm:w-8 h-px bg-[var(--gold)]/60" />
        </motion.p>

        <motion.h1
          variants={emerge}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          custom={0.15}
          className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5.5vw,5.2rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-4 sm:mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]"
        >
          Camerele noastre, <br className="hidden md:block" />
          <em className="italic text-[var(--gold)]">gândite pentru odihnă</em>
        </motion.h1>

        <motion.span
          variants={emerge}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          custom={0.3}
          className="my-3 hidden sm:flex items-center justify-center gap-3"
          aria-hidden="true"
        >
          <span className="h-px w-14 bg-[var(--gold)]/50" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[var(--gold)]" />
          <span className="h-px w-14 bg-[var(--gold)]/50" />
        </motion.span>

        <motion.p
          variants={emerge}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          custom={0.4}
          className="max-w-[620px] mx-auto text-[14px] sm:text-[17px] text-white/90 leading-[1.6] sm:leading-[1.85] font-light"
        >
          De la camere luminoase cu vedere la grădină, până la suite cu terasă
          privată. Răsfoiește opțiunile noastre și alege refugiul perfect
          pentru sejurul tău.
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px] md:h-[80px]">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}
