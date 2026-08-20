import { CalendarDays, Moon, Search, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import DatePicker from "./DatePicker";

const today = new Date().toISOString().split("T")[0];

export default function Hero() {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut + "T00:00:00").getTime() -
              new Date(checkIn + "T00:00:00").getTime()) /
              86400000,
          ),
        )
      : 0;

  const search = () => {
    const qs = new URLSearchParams();
    if (checkIn) qs.set("check_in", checkIn);
    if (checkOut) qs.set("check_out", checkOut);
    qs.set("adults", String(guests));
    navigate(`/disponibilitate?${qs.toString()}`);
  };

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (checkOut && val >= checkOut) setCheckOut("");
  };

  return (
    <div className="relative w-full overflow-visible">
      {/* SECTION HERO — Am crescut h-ul și am adăugat pb-40 pentru a face loc bării + valului sub ea */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[620px] pb-24 sm:min-h-[720px] sm:pb-32 md:min-h-[820px] md:pb-40 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(13,44,92,0.4) 0%, rgba(13,44,92,0.85) 100%), url(https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)",
        }}
      >
        {/* OVERLAY CINEMATIC */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(circle at center, rgba(13,44,92,0.65) 0%, rgba(13,44,92,0.3) 100%)",
          }}
        />

        {/* TEXT ȘI BUTOANE MAIN */}
        <div className="relative z-[2] flex flex-col items-center text-center px-4 sm:px-5 max-w-[820px] mt-auto mb-8 md:mb-12">
          <p className="flex items-center justify-center gap-2.5 sm:gap-[15px] text-[#c69a3f] font-sans text-[9.5px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.22em] uppercase mb-4 sm:mb-5 text-center">
            <span className="hidden sm:inline-block w-10 h-px bg-[#c69a3f] shrink-0" />
            EXPERIENȚE DE NEUITAT LA MARE
            <span className="hidden sm:inline-block w-10 h-px bg-[#c69a3f] shrink-0" />
          </p>

          <h1 className="text-white font-['Cormorant_Garamond',serif] text-[clamp(2.4rem,8.5vw,5.5rem)] font-normal leading-[1.08] tracking-[-0.01em] mb-6 [text-shadow:0_4px_24px_rgba(0,0,0,0.35)]">
            Descoperă{" "}
            <em className="not-italic italic text-[#c69a3f]">Liniștea</em>
            <br />
            Mării Negre
          </h1>

          <p className="max-w-[620px] mx-auto mb-8 md:mb-10 leading-[1.7] text-[0.98rem] sm:text-[1.1rem] font-light text-white/95 [text-shadow:0_2px_10px_rgba(0,0,0,0.25)]">
            Vila Casa Esy — refugiul tău perfect pe malul mării. Camere
            rafinate, priveliști superbe și ospitalitate caldă la fiecare pas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center w-full sm:w-auto">
            <a
              href="#camere"
              className="w-full sm:w-auto max-w-[320px] inline-flex justify-center items-center gap-2.5 px-6 sm:px-9 py-3.5 sm:py-4 rounded-[12px] font-sans text-[12px] sm:text-[13px] font-bold tracking-[0.12em] uppercase border border-[#c69a3f] bg-gradient-to-br from-[#d8ae52] to-[#b8882e] text-[#0d2c5c] transition-all duration-300 hover:shadow-[0_14px_28px_-10px_rgba(198,154,63,0.55)] hover:-translate-y-px"
            >
              Rezervă acum →
            </a>
            <a
              href="#descopera"
              className="w-full sm:w-auto max-w-[320px] inline-flex justify-center items-center gap-2.5 px-6 sm:px-9 py-3.5 sm:py-4 rounded-[12px] font-sans text-[12px] sm:text-[13px] font-bold tracking-[0.12em] uppercase border border-white/70 text-white bg-transparent transition-all duration-300 hover:bg-white/[0.12] hover:border-white"
            >
              Serviciile noastre →
            </a>
          </div>
        </div>

        {/* CONTAINER BARA DE CĂUTARE */}
        <div className="relative z-20 w-[calc(100%-24px)] sm:w-[calc(100%-32px)] md:w-[min(1010px,calc(100vw-48px))] mx-3 sm:mx-4 md:mx-0 mb-6">
          <div className="rounded-[16px] sm:rounded-[18px] bg-white p-1.5 sm:p-2 shadow-[0_20px_50px_-18px_rgba(13,44,92,0.45)]">
            <div className="flex flex-col md:flex-row items-stretch overflow-visible">
              <DatePicker
                label="Check-in"
                icon={<CalendarDays size={12} className="text-[#c69a3f] shrink-0" />}
                hint="Sosire"
                value={checkIn}
                minDate={today}
                onChange={handleCheckIn}
              />

              <div className="hidden md:flex items-center">
                <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#dbe4f0] to-transparent" />
              </div>
              <div className="md:hidden h-px mx-5 bg-[#eef2f7]" />

              <DatePicker
                label="Check-out"
                icon={<CalendarDays size={12} className="text-[#c69a3f] shrink-0" />}
                hint="Plecare"
                value={checkOut}
                minDate={checkIn || today}
                onChange={setCheckOut}
              />

              <div className="hidden md:flex items-center">
                <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#dbe4f0] to-transparent" />
              </div>
              <div className="md:hidden h-px mx-5 bg-[#eef2f7]" />

              <div className="flex-none md:w-[214px] flex flex-col justify-center px-5 py-4 rounded-[14px] transition-colors duration-200 hover:bg-[#f7f9fc]">
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#0d2c5c] mb-2 select-none">
                  <Users size={12} className="text-[#c69a3f] shrink-0" />
                  Persoane
                </span>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-label="Scade numărul de persoane"
                    disabled={guests <= 1}
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-full border border-[#e1e8f0] bg-white flex items-center justify-center text-base text-[#0d2c5c] shrink-0 transition-all duration-200 hover:border-[#c69a3f] hover:text-[#c69a3f] hover:shadow-[0_2px_8px_rgba(198,154,63,0.25)] disabled:opacity-30 disabled:hover:border-[#e1e8f0] disabled:hover:text-[#0d2c5c] disabled:hover:shadow-none"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium text-[#1a1a1a] whitespace-nowrap tabular-nums">
                    {guests} {guests === 1 ? "persoană" : "persoane"}
                  </span>
                  <button
                    type="button"
                    aria-label="Crește numărul de persoane"
                    disabled={guests >= 6}
                    onClick={() => setGuests((g) => Math.min(6, g + 1))}
                    className="w-8 h-8 rounded-full border border-[#e1e8f0] bg-white flex items-center justify-center text-base text-[#0d2c5c] shrink-0 transition-all duration-200 hover:border-[#c69a3f] hover:text-[#c69a3f] hover:shadow-[0_2px_8px_rgba(198,154,63,0.25)] disabled:opacity-30 disabled:hover:border-[#e1e8f0] disabled:hover:text-[#0d2c5c] disabled:hover:shadow-none"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-2 md:p-2 flex">
                <button
                  type="button"
                  onClick={search}
                  className="group/search relative inline-flex flex-1 items-center justify-center gap-2 rounded-[13px] bg-gradient-to-br from-[#d8ae52] to-[#b8882e] px-5 sm:px-7 py-3.5 sm:py-4 md:py-0 md:min-h-[64px] font-sans text-[13px] font-bold tracking-[0.08em] uppercase text-white whitespace-nowrap shrink-0 w-full md:w-auto transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(198,154,63,0.9)] hover:shadow-[0_14px_28px_-10px_rgba(198,154,63,0.95)] hover:-translate-y-px"
                >
                  <Search size={15} className="transition-transform duration-300 group-hover/search:scale-110" />
                  Verifică
                </button>
              </div>
            </div>
          </div>

          {/* SUMAR SEJUR */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11.5px] tracking-[0.04em] text-white/85">
            {nights > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25 backdrop-blur-sm">
                <Moon size={11} className="text-[#e6c579]" />
                {nights} {nights === 1 ? "noapte" : "nopți"} · {guests}{" "}
                {guests === 1 ? "persoană" : "persoane"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Moon size={11} className="text-[#e6c579]" />
                Alege datele pentru a vedea tarifele
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-[#e6c579]" />
              Cel mai bun tarif garantat · anulare gratuită 48h
            </span>
          </div>
        </div>


        {/* WAVE DIVIDER — Lipit de fundul absolut al secțiunii, randat frumos sub bara albă */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[80px] md:h-[120px] pointer-events-none z-[3] block"
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
    </div>
  );
}
