import { Users, Calendar, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "./Toast";
import DatePicker from "./DatePicker";

const today = new Date().toISOString().split("T")[0];

// Cât timp rămâne textul complet ascuns înainte să "iasă" din spate (ms)
const REVEAL_DELAY = 1600;

export default function Hero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!guestsOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!guestsRef.current?.contains(e.target as Node)) setGuestsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [guestsOpen]);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), REVEAL_DELAY);
    return () => clearTimeout(t);
  }, []);

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (checkOut && val >= checkOut) setCheckOut("");
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!checkIn || !checkOut) {
      toast("Selectează datele de check-in și check-out.", "warning");
      return;
    }
    if (checkOut <= checkIn) {
      toast("Check-out trebuie să fie după check-in.", "warning");
      return;
    }
    const params = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      adults: String(adults),
      children: String(children),
    });
    navigate(`/disponibilitate?${params.toString()}`);
  };

  const emerge = {
    hidden: {
      opacity: 0,
      scale: 0.55,
      y: 30,
      filter: "blur(18px)",
    },
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
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationId: number;

    const checkLoop = () => {
      // Verificăm timpul de 60 de ori pe secundă
      if (video.duration && video.currentTime >= video.duration - 0.05) {
        // Dăm înapoi 2 secunde fix înainte să se termine
        video.currentTime = video.duration - 0.5;
      }
      animationId = requestAnimationFrame(checkLoop);
    };

    const handlePlay = () => {
      animationId = requestAnimationFrame(checkLoop);
    };

    const handlePause = () => {
      cancelAnimationFrame(animationId);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      cancelAnimationFrame(animationId);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  return (
    <section id="hero" className="relative bg-[#0d2c5c] overflow-hidden">
      {/* ── VIDEO DE FUNDAL & FILTRE CROMATICE (Adaptate la albastrul marin) ── */}
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
        {/* 1. Strat pentru a "vopsi" clipul cu nuanța brandului */}
        <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />

        {/* 2. Strat pentru a adânci culoarea, păstrând albastrul marin bogat */}
        <div className="absolute inset-0 bg-[#0b2146]/40 mix-blend-multiply" />

        {/* 3. Gradient tot din albastrul brandului pentru a asigura lizibilitatea perfectă la extremități */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2c5c]/95 via-[#0d2c5c]/40 to-[#0d2c5c]/95" />
      </div>

      {/* Ornamente aurii/albastre ambientale */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#c69a3f]/10 blur-[100px] z-[1]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -right-32 w-[520px] h-[520px] rounded-full bg-[#1e4d8c]/30 blur-[100px] z-[1]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-22 sm:pt-36 md:pt-48 pb-16 md:pb-32">
        <div className="text-center [perspective:1200px]">
          <motion.p
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0}
            className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--gold)] mb-2 sm:mb-4 flex items-center justify-center gap-3"
          >
            <span className="w-6 sm:w-8 h-px bg-[var(--gold)]/60" />
            Experiențe la Marea Neagră
            <span className="w-6 sm:w-8 h-px bg-[var(--gold)]/60" />
          </motion.p>

          <motion.h1
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.15}
            className="font-['Cormorant_Garamond',serif] text-[clamp(2.2rem,5vw,5rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-3 sm:mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]"
          >
            Descoperă <em className="italic text-[var(--gold)]">liniștea</em>
            <br className="hidden md:block" /> Mării Negre
          </motion.h1>

          <motion.span
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.3}
            className="my-2 hidden sm:flex items-center justify-center gap-3"
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
            className="max-w-[620px] mx-auto text-[13.5px] sm:text-[16px] text-white/90 leading-[1.6] sm:leading-[1.85] font-light hidden sm:block"
          >
            Vila Casa Esy — refugiul tău pe malul mării. Camere rafinate,
            priveliști liniștitoare și ospitalitate caldă la fiecare pas.
          </motion.p>
        </div>

        {/* BARA DE CĂUTARE NOUĂ (Glassmorphism & Wave Button Gold) */}
        <motion.div
          variants={emerge}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          custom={0.7}
          className="relative z-30 max-w-[950px] mx-auto mt-6 sm:mt-10 mb-4 w-full"
        >
          <form
            onSubmit={handleSearch}
            className="flex w-full flex-col lg:flex-row items-stretch rounded-[20px] bg-white/90 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
          >
            <DatePicker
              label={
                <>
                  <Calendar
                    size={10}
                    className="inline mr-1 text-[#c69a3f] -mt-0.5"
                  />{" "}
                  Check-in
                </>
              }
              value={checkIn}
              onChange={handleCheckIn}
              minDate={today}
              variant="bar"
            />

            <DatePicker
              label={
                <>
                  <Calendar
                    size={10}
                    className="inline mr-1 text-[#c69a3f] -mt-0.5"
                  />{" "}
                  Check-out
                </>
              }
              value={checkOut}
              onChange={setCheckOut}
              minDate={checkIn || today}
              variant="bar"
            />

            {/* OASPEȚI Dropdown */}
            <div
              ref={guestsRef}
              className="relative flex-1 flex flex-col justify-center px-6 py-4 lg:py-0"
            >
              <button
                type="button"
                onClick={() => setGuestsOpen((o) => !o)}
                className="font-sans text-left w-full leading-[1.3] transition-colors duration-150 bg-transparent border-none p-0 text-sm"
              >
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-1.5 select-none">
                  <Users
                    size={10}
                    className="inline mr-1 text-[#c69a3f] -mt-0.5"
                  />
                  Oaspeți
                </span>
                <span
                  className={
                    guestsOpen
                      ? "text-[#0d2c5c] block truncate font-medium"
                      : "text-[#3c4043] block truncate"
                  }
                >
                  {adults} {adults === 1 ? "adult" : "adulți"}
                  {children > 0 &&
                    ` · ${children} ${children === 1 ? "copil" : "copii"}`}
                </span>
              </button>

              {guestsOpen && (
                <div className="absolute left-0 right-0 md:left-auto md:right-0 md:w-[280px] top-[calc(100%+12px)] z-30 rounded-[20px] border border-[#e1e8f0] bg-white p-5 shadow-[0_15px_40px_rgba(13,44,92,0.15)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-semibold text-[#0d2c5c]">
                      Adulți
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={() => setAdults((g) => Math.max(1, g - 1))}
                        className="w-7 h-7 rounded-full border border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[#c69a3f] hover:bg-[#c69a3f]/5"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-[#0d2c5c] w-5 text-center">
                        {adults}
                      </span>
                      <button
                        type="button"
                        disabled={adults >= 6}
                        onClick={() => setAdults((g) => Math.min(6, g + 1))}
                        className="w-7 h-7 rounded-full border border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[#c69a3f] hover:bg-[#c69a3f]/5"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#eef2f7] flex items-start justify-between gap-3">
                    <span className="text-[12px] font-semibold text-[#0d2c5c]">
                      Copii
                      <span className="mt-1 block text-[10px] font-normal leading-snug text-[#8595aa]">
                        Până la 12 ani.
                      </span>
                    </span>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={() => setChildren((g) => Math.max(0, g - 1))}
                        className="w-7 h-7 rounded-full border border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[#c69a3f] hover:bg-[#c69a3f]/5"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold text-[#0d2c5c] w-5 text-center">
                        {children}
                      </span>
                      <button
                        type="button"
                        disabled={children >= 4}
                        onClick={() => setChildren((g) => Math.min(4, g + 1))}
                        className="w-7 h-7 rounded-full border border-[#e1e8f0] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[#c69a3f] hover:bg-[#c69a3f]/5"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTONUL WAVY - PREMIUM GOLD */}
            <button
              type="submit"
              className="group relative flex min-h-[60px] lg:min-h-[72px] min-w-[140px] lg:min-w-[170px] items-center justify-center overflow-hidden rounded-b-[20px] lg:rounded-none lg:rounded-r-[20px] shrink-0"
            >
              {/* SVG Val doar pe Desktop */}
              <svg
                className="absolute inset-0 h-full w-full text-[#c69a3f] drop-shadow-[-6px_0_15px_rgba(198,154,63,0.2)] transition-colors duration-300 group-hover:text-[#b58933] hidden lg:block"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  fill="currentColor"
                  d="M15,0 L100,0 L100,100 L5,100 C20,70 20,30 15,0 Z"
                />
              </svg>

              {/* Fallback pentru mobil */}
              <div className="absolute inset-0 bg-[#c69a3f] transition-colors duration-300 group-hover:bg-[#b58933] lg:hidden" />

              {/* Efect de luciu (shine) la trecerea cu mouse-ul */}
              <span className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[700ms] ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />

              {/* Conținutul butonului */}
              <span className="relative z-10 flex items-center gap-2 lg:pl-3 text-[13px] font-bold uppercase tracking-[0.18em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
                <Search
                  size={16}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 group-hover:scale-110"
                />{" "}
                Caută
              </span>
            </button>
          </form>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          variants={emerge}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          custom={0.85}
          className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10.5px] font-semibold tracking-[0.18em] uppercase text-white/80"
        >
          <span className="group flex items-center gap-2 cursor-default">
            <span className="block h-1 w-1 rotate-45 bg-[#c69a3f] shadow-[0_0_8px_rgba(198,154,63,0.7)] transition-transform duration-300 group-hover:scale-150" />
            <span className="drop-shadow-md transition-colors duration-300 group-hover:text-white">
              150 m de plajă
            </span>
          </span>

          <span className="group flex items-center gap-2 cursor-default">
            <span className="block h-1 w-1 rotate-45 bg-[#c69a3f] shadow-[0_0_8px_rgba(198,154,63,0.7)] transition-transform duration-300 group-hover:scale-150" />
            <span className="drop-shadow-md transition-colors duration-300 group-hover:text-white">
              Rezervare directă
            </span>
          </span>

          <span className="group flex items-center gap-2 cursor-default">
            <span className="block h-1 w-1 rotate-45 bg-[#c69a3f] shadow-[0_0_8px_rgba(198,154,63,0.7)] transition-transform duration-300 group-hover:scale-150" />
            <span className="drop-shadow-md transition-colors duration-300 group-hover:text-white">
              Check-in prietenos
            </span>
          </span>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none translate-y-[1px]">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[30px] md:h-[50px]"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.43,121.22,201.2,112.5,242.47,107.45,283.47,84.14,321.39,56.44Z"
            className="fill-white"
          ></path>
        </svg>
      </div>
    </section>
  );
}
