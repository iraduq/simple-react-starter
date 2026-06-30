import { Search, Users } from "lucide-react";
import { useState } from "react";
import DatePicker from "./DatePicker";

const today = new Date().toISOString().split("T")[0];

export default function Hero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const handleCheckIn = (val: string) => {
    setCheckIn(val);
    if (checkOut && val >= checkOut) setCheckOut("");
  };

  return (
    <section
      className="relative flex items-center justify-center h-[780px] pb-20 bg-cover bg-center"
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

      <div className="relative z-[2] flex flex-col items-center text-center px-5 max-w-[800px]">
        <p className="flex items-center gap-[15px] text-[#c69a3f] font-sans text-xs font-semibold tracking-[3px] uppercase mb-5">
          <span className="inline-block w-10 h-px bg-[#c69a3f]/50" />
          EXPERIENȚE DE NEUITAT LA MARE
          <span className="inline-block w-10 h-px bg-[#c69a3f]/50" />
        </p>

        <h1 className="text-white font-['Cormorant_Garamond',serif] text-[clamp(3rem,6vw,5rem)] font-normal leading-[1.1] mb-6 [text-shadow:0_4px_20px_rgba(0,0,0,0.3)]">
          Descoperă{" "}
          <em className="not-italic italic text-[#c69a3f]">Liniștea</em>
          <br />
          Mării Negre
        </h1>

        <p className="max-w-[600px] mx-auto mb-10 leading-[1.7] text-[1.15rem] font-light text-white/90 [text-shadow:0_2px_10px_rgba(0,0,0,0.2)]">
          Vila Casa Esy — refugiul tău perfect pe malul mării. Camere rafinate,
          priveliști superbe și ospitalitate caldă la fiecare pas.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center w-full sm:w-auto">
          <a
            href="#camere"
            className="w-full sm:w-auto max-w-[320px] inline-flex justify-center items-center gap-2.5 px-9 py-4 rounded-[10px] font-sans text-[13px] font-bold tracking-[0.12em] uppercase border border-[#0d2c5c] bg-[#0d2c5c] text-white shadow-[0_4px_15px_rgba(13,44,92,0.18)] transition-all duration-300 hover:bg-[#c69a3f] hover:text-[#0d2c5c] hover:border-[#c69a3f] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(198,154,63,0.3)]"
          >
            Rezervă acum →
          </a>
          <a
            href="#descopera"
            className="group w-full sm:w-auto max-w-[320px] inline-flex justify-center items-center gap-2.5 px-9 py-4 rounded-[10px] font-sans text-[13px] font-bold tracking-[0.12em] uppercase border border-white/50 text-white bg-transparent transition-all duration-300 hover:border-white hover:bg-white/[0.08] hover:-translate-y-0.5"
          >
            Serviciile noastre{" "}
            <span className="inline-block transition-transform duration-300 group-hover:translate-y-[3px]">
              →
            </span>
          </a>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="absolute md:bottom-[-32px] bottom-auto md:static-none left-1/2 md:left-1/2 -translate-x-1/2 z-20 bg-white rounded-2xl md:rounded-[14px] shadow-[0_2px_8px_rgba(13,44,92,0.06),0_20px_60px_rgba(13,44,92,0.16)] flex flex-col md:flex-row items-stretch w-[calc(100vw-32px)] md:w-[min(960px,calc(100vw-48px))] border border-[#e1e8f0] static md:absolute -mt-5 md:mt-0 mx-4 md:mx-0">
        <DatePicker
          label="Check-in"
          value={checkIn}
          minDate={today}
          onChange={handleCheckIn}
        />

        <div className="hidden md:block w-px bg-[#e1e8f0] my-3.5" />

        <DatePicker
          label="Check-out"
          value={checkOut}
          minDate={checkIn || today}
          onChange={setCheckOut}
        />

        <div className="hidden md:block w-px bg-[#e1e8f0] my-3.5" />

        <div className="flex-none md:w-[200px] flex flex-col justify-center px-6 py-4.5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-[#1a1a1a] mb-1.5 select-none">
            <Users size={11} className="text-[#c69a3f] shrink-0" />
            Persoane
          </span>
          <div className="flex items-center gap-3 mt-0.5">
            <button
              type="button"
              disabled={guests <= 1}
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="w-7 h-7 rounded-full border-[1.5px] border-[#e1e8f0] bg-transparent flex items-center justify-center text-base leading-none text-[#3c4043] shrink-0 transition-all duration-200 hover:not-disabled:border-[#c69a3f] hover:not-disabled:text-[#c69a3f] hover:not-disabled:bg-[#f3e6c4] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="text-sm font-medium text-[#1a1a1a] whitespace-nowrap min-w-[80px]">
              {guests} {guests === 1 ? "persoană" : "persoane"}
            </span>
            <button
              type="button"
              disabled={guests >= 6}
              onClick={() => setGuests((g) => Math.min(6, g + 1))}
              className="w-7 h-7 rounded-full border-[1.5px] border-[#e1e8f0] bg-transparent flex items-center justify-center text-base leading-none text-[#3c4043] shrink-0 transition-all duration-200 hover:not-disabled:border-[#c69a3f] hover:not-disabled:text-[#c69a3f] hover:not-disabled:bg-[#f3e6c4] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 bg-[#c69a3f] text-white border-none rounded-xl md:rounded-[10px] px-7 py-4 md:py-0 font-sans text-[13px] font-semibold tracking-wide whitespace-nowrap shrink-0 md:mx-2 md:my-2 w-full md:w-auto transition-all duration-200 hover:bg-[#b8882e] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(198,154,63,0.32)]"
        >
          <Search size={15} />
          Verifică disponibilitate
        </button>
      </div>
    </section>
  );
}
