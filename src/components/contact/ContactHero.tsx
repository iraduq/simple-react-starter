import { type RefObject } from "react";

interface ContactHeroProps {
  videoRef: RefObject<HTMLVideoElement | null>;
}

export default function ContactHero({ videoRef }: ContactHeroProps) {
  return (
    <section className="relative bg-[#0d2c5c] overflow-hidden pt-28 sm:pt-36 md:pt-44 pb-28 md:pb-36 z-10">
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          className="h-full w-full object-cover saturate-50 contrast-110 brightness-100"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />
        <div className="absolute inset-0 bg-[#0b2146]/45 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/45 to-[#0d2c5c]/95" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-10 text-center">
        <p className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#c69a3f] mb-3 sm:mb-4 flex items-center justify-center gap-3">
          <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
          Contact · Vila Casa Esy
          <span className="w-6 sm:w-8 h-px bg-[#c69a3f]/60" />
        </p>

        <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.5rem,5.5vw,4.8rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-4 sm:mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]">
          Hai să vorbim despre <em className="italic text-[#c69a3f]">sejurul tău</em>
        </h1>

        <span className="my-3 hidden sm:flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-14 bg-[#c69a3f]/50" />
          <span className="h-1.5 w-1.5 rotate-45 bg-[#c69a3f]" />
          <span className="h-px w-14 bg-[#c69a3f]/50" />
        </span>

        <p className="max-w-[600px] mx-auto text-[14px] sm:text-[17px] text-white/90 leading-[1.65] sm:leading-[1.85] font-light">
          Fie că ai o întrebare despre disponibilitate, vrei recomandări locale sau dorești să organizezi un moment special — echipa noastră este aici să îți răspundă cu drag.
        </p>
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
