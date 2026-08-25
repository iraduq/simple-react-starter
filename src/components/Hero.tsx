import { Users, ArrowRight, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "./Toast";

const today = new Date().toISOString().split("T")[0];

// Cât timp rămâne textul complet ascuns înainte să "iasă" din spate (ms)
const REVEAL_DELAY = 1600;

// Input-uri reduse în padding și text size pt a părea mai fine
const inputCls =
  "w-full rounded-xl border-none bg-transparent px-2 py-1 text-[14px] font-semibold text-[#0d2c5c] outline-none ring-0 cursor-pointer";
const labelCls =
  "mb-0.5 block text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8595aa]";

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
        ease: [0.16, 1, 0.3, 1],
        delay: custom,
      },
    }),
  };

  return (
    <section id="hero" className="relative bg-[#050b16] overflow-hidden">
      {/* ── VIDEO DE FUNDAL & FILTRE CROMATICE ── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          className="h-full w-full object-cover saturate-50 contrast-125 brightness-[0.85]"
        >
          <source src="../../public/hero-bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-[#0d2c5c]/70 mix-blend-color" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050b16]/95 via-[#0d2c5c]/40 to-[#050b16]/95" />
        <div className="absolute inset-0 bg-[#050b16]/30 mix-blend-multiply" />
      </div>

      {/* Ornamente aurii ambientale */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#c69a3f]/10 blur-3xl z-[1]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -right-32 w-[520px] h-[520px] rounded-full bg-[#0d2c5c]/20 blur-3xl z-[1]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 pt-40 md:pt-48 pb-24 md:pb-32">
        <div className="text-center [perspective:1200px]">
          <motion.p
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0}
            className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--gold)] mb-4 flex items-center justify-center gap-3"
          >
            <span className="w-8 h-px bg-[var(--gold)]/60" />
            Experiențe la Marea Neagră
            <span className="w-8 h-px bg-[var(--gold)]/60" />
          </motion.p>

          <motion.h1
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.15}
            className="font-['Cormorant_Garamond',serif] text-[clamp(2.8rem,6vw,5rem)] font-normal text-white leading-[1.05] tracking-[-0.015em] mb-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.35)]"
          >
            Descoperă <em className="italic text-[var(--gold)]">liniștea</em>
            <br className="hidden md:block" /> Mării Negre
          </motion.h1>

          <motion.span
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.3}
            className="mt-2 mb-6 flex items-center justify-center gap-3"
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
            className="max-w-[620px] mx-auto text-[15px] md:text-[16px] text-white/85 leading-[1.85] font-light"
          >
            Vila Casa Esy — refugiul tău pe malul mării. Camere rafinate,
            priveliști liniștitoare și ospitalitate caldă la fiecare pas.
          </motion.p>

          <motion.div
            variants={emerge}
            initial="hidden"
            animate={revealed ? "visible" : "hidden"}
            custom={0.55}
            className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center"
          >
            <a
              href="#descopera"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:border-white hover:bg-white/10 hover:-translate-y-0.5"
            >
              Serviciile noastre
            </a>
          </motion.div>
        </div>

        {/* BARA DE CĂUTARE PREMIUM (Zveltă & Mai fină) */}
        <motion.div
          variants={emerge}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          custom={0.7}
          className="relative z-30 max-w-[1000px] mx-auto mt-10 mb-6 w-full"
        >
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-[20px] md:rounded-full shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-white/20 p-2 md:p-3 flex flex-col md:flex-row gap-2 items-stretch md:items-center"
          >
            <div className="flex flex-1 flex-col md:flex-row gap-2 bg-[#f8fafd] border border-[#e1e8f0] rounded-[16px] md:rounded-full p-1.5">
              {/* Check-in */}
              <label className="flex-1 flex flex-col px-4 py-1.5 hover:bg-white rounded-[14px] md:rounded-full transition-colors relative cursor-pointer group">
                <span className={labelCls}>
                  <Calendar
                    size={10}
                    className="inline mr-1 text-[#c69a3f] -mt-0.5"
                  />{" "}
                  Check-in
                </span>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => handleCheckIn(e.target.value)}
                  className={inputCls}
                  required
                />
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-[#e1e8f0]" />
              </label>

              {/* Check-out */}
              <label className="flex-1 flex flex-col px-4 py-1.5 hover:bg-white rounded-[14px] md:rounded-full transition-colors relative cursor-pointer group">
                <span className={labelCls}>
                  <Calendar
                    size={10}
                    className="inline mr-1 text-[#c69a3f] -mt-0.5"
                  />{" "}
                  Check-out
                </span>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={inputCls}
                  required
                />
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-[#e1e8f0]" />
              </label>

              {/* OASPEȚI Dropdown */}
              <div
                ref={guestsRef}
                className="relative flex-[1.1] md:max-w-[240px]"
              >
                <button
                  type="button"
                  onClick={() => setGuestsOpen((o) => !o)}
                  className="w-full h-full text-left flex flex-col px-4 py-1.5 hover:bg-white rounded-[14px] md:rounded-full transition-colors relative cursor-pointer"
                >
                  <span className={labelCls}>
                    <Users
                      size={10}
                      className="inline mr-1 text-[#c69a3f] -mt-0.5"
                    />{" "}
                    Oaspeți
                  </span>
                  <span className={`${inputCls} block truncate !px-2`}>
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
            </div>

            {/* Submit Button - Slimmer */}
            <button
              type="submit"
              className="group md:w-auto w-full inline-flex items-center justify-center gap-2 rounded-[16px] md:rounded-full bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-8 py-3.5 md:h-14 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0d2c5c] shadow-[0_6px_16px_-6px_rgba(198,154,63,0.8)] transition-all hover:shadow-[0_10px_20px_-6px_rgba(198,154,63,0.9)] hover:-translate-y-0.5 shrink-0"
            >
              Caută
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </form>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          variants={emerge}
          initial="hidden"
          animate={revealed ? "visible" : "hidden"}
          custom={0.85}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10.5px] font-semibold tracking-[0.18em] uppercase text-white/75"
        >
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[var(--gold)]" /> 150 m de
            plajă
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[var(--gold)]" /> Rezervare
            directă
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[var(--gold)]" /> Check-in
            prietenos
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
