import { Search, Users, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DatePicker from "./DatePicker";
import { useToast } from "./Toast";

const today = new Date().toISOString().split("T")[0];

export default function Hero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
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

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (checkOut && val >= checkOut) setCheckOut("");
  };

  const handleSearch = () => {
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

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Linie subtilă sus */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--border-light)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[var(--gold)]" />

      {/* Ornamente aurii ambientale */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#c69a3f]/8 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -right-32 w-[520px] h-[520px] rounded-full bg-[#0d2c5c]/6 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 pt-24 md:pt-32 pb-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-[var(--gold)] mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-[var(--gold)]/60" />
            Experiențe la Marea Neagră
            <span className="w-8 h-px bg-[var(--gold)]/60" />
          </p>

          <h1 className="font-['Cormorant_Garamond',serif] text-[clamp(2.8rem,6vw,5rem)] font-normal text-[var(--text-primary)] leading-[1.05] tracking-[-0.015em] mb-6">
            Descoperă{" "}
            <em className="italic text-[var(--gold)]">liniștea</em>
            <br className="hidden md:block" /> Mării Negre
          </h1>

          {/* Diamond divider */}
          <span
            className="mt-2 mb-6 flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <span className="h-px w-14 bg-[var(--gold)]/40" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[var(--gold)]" />
            <span className="h-px w-14 bg-[var(--gold)]/40" />
          </span>

          <p className="max-w-[620px] mx-auto text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] font-light">
            Vila Casa Esy — refugiul tău pe malul mării. Camere rafinate,
            priveliști liniștitoare și ospitalitate caldă la fiecare pas.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
            <a
              href="#camere"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#c69a3f] to-[#b3862f] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] shadow-[0_12px_30px_-14px_rgba(198,154,63,0.9)] transition-all duration-200 hover:from-[#0d2c5c] hover:to-[#12386f] hover:text-white hover:-translate-y-0.5"
            >
              Rezervă acum
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>
            <a
              href="#descopera"
              className="inline-flex items-center gap-2 rounded-full border border-[#0d2c5c]/20 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d2c5c] transition-all duration-200 hover:border-[#0d2c5c] hover:bg-[#f0f5fc] hover:-translate-y-0.5"
            >
              Serviciile noastre
            </a>
          </div>
        </motion.div>

        {/* BARA DE CĂUTARE — pill, alungită, pe fundal alb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 mt-14 mx-auto bg-white rounded-2xl md:rounded-full border border-[var(--border-light)] shadow-[0_2px_8px_rgba(13,44,92,0.05),0_28px_60px_-30px_rgba(13,44,92,0.28)] flex flex-col md:flex-row md:items-center w-full max-w-[1120px] md:pl-2 md:pr-2 md:py-2"
        >
          <DatePicker
            label="Check-in"
            value={checkIn}
            minDate={today}
            onChange={handleCheckIn}
          />

          <div className="hidden md:block w-px self-stretch bg-[var(--border-light)] my-1" />

          <DatePicker
            label="Check-out"
            value={checkOut}
            minDate={checkIn || today}
            onChange={setCheckOut}
          />

          <div className="hidden md:block w-px self-stretch bg-[var(--border-light)] my-1" />

          {/* OASPEȚI */}
          <div ref={guestsRef} className="relative flex-1 md:max-w-[240px]">
            <button
              type="button"
              onClick={() => setGuestsOpen((o) => !o)}
              className="w-full text-left px-6 py-3.5 rounded-2xl md:rounded-full transition-colors hover:bg-[#f9fafc]"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-[#0d2c5c]">
                <Users size={11} className="text-[var(--gold)] shrink-0" />
                Oaspeți
              </span>
              <span className="mt-0.5 block text-[13.5px] font-medium text-[#3c4043]">
                {adults} {adults === 1 ? "adult" : "adulți"}
                {children > 0 &&
                  ` · ${children} ${children === 1 ? "copil" : "copii"}`}
              </span>
            </button>

            {guestsOpen && (
              <div className="absolute left-0 right-0 md:left-auto md:right-0 md:w-[300px] top-[calc(100%+10px)] z-30 rounded-2xl border border-[var(--border-light)] bg-white p-4 shadow-[0_18px_44px_rgba(13,44,92,0.18)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-[#0d2c5c]">
                    Adulți
                  </span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults((g) => Math.max(1, g - 1))}
                      className="w-7 h-7 rounded-full border-[1.5px] border-[var(--border-light)] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[var(--gold)]"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-[#0d2c5c] w-4 text-center">
                      {adults}
                    </span>
                    <button
                      type="button"
                      disabled={adults >= 6}
                      onClick={() => setAdults((g) => Math.min(6, g + 1))}
                      className="w-7 h-7 rounded-full border-[1.5px] border-[var(--border-light)] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[var(--gold)]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <span className="text-[12px] font-semibold text-[#0d2c5c]">
                    Copii
                    <span className="mt-0.5 block text-[10.5px] font-normal leading-snug text-[#8595aa]">
                      Până la 12 ani inclusiv. De la 13 ani se consideră adult.
                    </span>
                  </span>
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren((g) => Math.max(0, g - 1))}
                      className="w-7 h-7 rounded-full border-[1.5px] border-[var(--border-light)] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[var(--gold)]"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-[#0d2c5c] w-4 text-center">
                      {children}
                    </span>
                    <button
                      type="button"
                      disabled={children >= 4}
                      onClick={() => setChildren((g) => Math.min(4, g + 1))}
                      className="w-7 h-7 rounded-full border-[1.5px] border-[var(--border-light)] flex items-center justify-center text-sm text-[#3c4043] disabled:opacity-30 hover:border-[var(--gold)]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c69a3f] to-[#b3862f] text-[#0d2c5c] border-none rounded-xl md:rounded-full px-7 py-3.5 font-sans text-[12px] font-bold tracking-[0.14em] uppercase whitespace-nowrap shrink-0 m-2 md:m-0 md:ml-1 w-[calc(100%-16px)] md:w-auto shadow-[0_10px_24px_-12px_rgba(198,154,63,0.9)] transition-all duration-200 hover:from-[#0d2c5c] hover:to-[#12386f] hover:text-white"
          >
            <Search size={15} />
            Verifică disponibilitate
          </button>
        </motion.div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#8595aa]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> 150 m
            de plajă
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />{" "}
            Rezervare directă · fără comisioane
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />{" "}
            Check-in prietenos
          </span>
        </div>
      </div>

      {/* Accent auriu jos */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-40 bg-[var(--gold)]/60"
      />
    </section>
  );
}
